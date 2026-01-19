import { createHash } from 'crypto';

import { NextRequest } from 'next/server';

import { APP_NAME } from '@workspace/common/app';
import { prisma } from '@workspace/database/client';
import { sendSupportTicketMessageEmail } from '@workspace/email/send-support-ticket-message-email';
import { sendSupportTicketUserReplyEmail } from '@workspace/email/send-support-ticket-user-reply-email';
import { routes } from '@workspace/routes';

// Environment variables for support email configuration
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? 'support@example.com';
const SUPPORT_EMAIL_INBOUND = process.env.SUPPORT_EMAIL_INBOUND ?? 'support@support.example.com';
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN ?? 'example.com';

// Postmark attachment type
type PostmarkAttachment = {
  Name: string;
  Content: string; // base64 encoded
  ContentLength: number;
  ContentType: string;
  ContentID?: string; // For inline images (cid: references)
};

// Postmark inbound webhook payload type
type PostmarkInboundPayload = {
  From: string;
  FromName: string;
  Subject: string;
  TextBody: string;
  HtmlBody: string;
  StrippedTextReply?: string; // Postmark's auto-stripped reply (no quoted content)
  MessageID: string;
  Headers: Array<{ Name: string; Value: string }>;
  To: string;
  Cc?: string;
  Bcc?: string;
  Date: string;
  Attachments?: PostmarkAttachment[];
};

// Allowed image content types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Size limits
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_ATTACHMENTS_SIZE = 20 * 1024 * 1024; // 20MB total

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const payload: PostmarkInboundPayload = await request.json();

    console.log('[POSTMARK INBOUND] Received email:', {
      from: payload.From,
      subject: payload.Subject,
      messageId: payload.MessageID
    });

    // Ignore our own outbound notification emails
    // Check the actual Message-ID header in payload.Headers
    const messageIdHeader = payload.Headers.find(
      (h) => h.Name.toLowerCase() === 'message-id'
    );
    const actualMessageId = messageIdHeader?.Value;

    if (actualMessageId?.includes(`@${EMAIL_DOMAIN}`)) {
      console.log('[POSTMARK INBOUND] Ignoring outbound notification email (matched Message-ID header)');
      return Response.json(
        { success: true, ignored: true, reason: 'Outbound notification email' },
        { status: 200 }
      );
    }

    // Also ignore emails from our system's sender address to prevent notification loops
    const senderEmail = payload.From.toLowerCase();
    const fromMatch = senderEmail.match(/<([^>]+)>/) || [null, senderEmail];
    const fromAddress = (fromMatch[1] || senderEmail).trim();

    // Check if this is from our notification system (noreply addresses or system addresses)
    if (
      fromAddress.includes('noreply@') ||
      fromAddress.includes('no-reply@') ||
      (fromAddress.endsWith(`@${EMAIL_DOMAIN}`) && !fromAddress.startsWith('support@'))
    ) {
      console.log('[POSTMARK INBOUND] Ignoring system notification email (matched From address):', fromAddress);
      return Response.json(
        { success: true, ignored: true, reason: 'System notification email' },
        { status: 200 }
      );
    }

    // Extract ticket number from subject: [Ticket #123] ...
    const ticketNumberMatch = payload.Subject.match(/\[Ticket #(\d+)\]/);
    let ticketNumber: number | null = null;

    if (ticketNumberMatch) {
      ticketNumber = parseInt(ticketNumberMatch[1]!, 10);
    }

    // Try to find In-Reply-To header for more reliable matching
    const inReplyToHeader = payload.Headers.find(
      (h) => h.Name.toLowerCase() === 'in-reply-to'
    );
    const inReplyTo = inReplyToHeader?.Value;

    console.log('[POSTMARK INBOUND] Ticket matching:', {
      ticketNumber,
      inReplyTo
    });

    // Find the ticket either by In-Reply-To or ticket number
    let ticket = null;

    if (inReplyTo) {
      // Try to find ticket by matching In-Reply-To with a message's messageId
      const message = await prisma.supportTicketMessage.findFirst({
        where: {
          messageId: inReplyTo
        },
        include: {
          ticket: {
            include: {
              user: true,
              organization: true
            }
          }
        }
      });

      if (message) {
        ticket = message.ticket;
        console.log(
          '[POSTMARK INBOUND] Matched ticket via In-Reply-To:',
          ticket.ticketNumber
        );
      }
    }

    // Fallback to ticket number matching if In-Reply-To didn't work
    if (!ticket && ticketNumber) {
      ticket = await prisma.supportTicket.findFirst({
        where: {
          ticketNumber
        },
        include: {
          user: true,
          organization: true,
          messages: {
            orderBy: {
              createdAt: 'asc'
            },
            take: 1
          }
        }
      });

      if (ticket) {
        console.log(
          '[POSTMARK INBOUND] Matched ticket via ticket number:',
          ticket.ticketNumber
        );
      }
    }

    if (!ticket) {
      console.log(
        '[POSTMARK INBOUND] Could not match email to any ticket - ignoring'
      );
      return Response.json(
        { success: true, ignored: true, reason: 'No matching ticket found' },
        { status: 200 }
      );
    }

    // Determine if sender is support staff
    const isStaff = fromAddress.includes(SUPPORT_EMAIL_INBOUND) ||
                    fromAddress === SUPPORT_EMAIL;

    console.log('[POSTMARK INBOUND] Message details:', {
      isStaff,
      fromAddress,
      ticketId: ticket.id
    });

    // Extract plain text message (strip quoted replies)
    // Prefer Postmark's StrippedTextReply which automatically removes quoted content
    let messageText = payload.StrippedTextReply?.trim() || '';

    // Fallback to manual stripping if StrippedTextReply is empty or not available
    if (!messageText) {
      messageText = payload.TextBody.trim();

      // Try to remove quoted text (common patterns)
      const quotedPatterns = [
        /On .{1,100} wrote:/i, // Gmail style: "On Mon, Dec 16, 2025 at 10:30 AM John wrote:"
        /On .{1,50}, at .{1,30}, .{1,50} wrote:/i, // Apple Mail style
        /-{3,}.*Original Message.*-{3,}/is, // "--- Original Message ---"
        /_{5,}/, // Horizontal line separators (_____)
        /\*{5,}/, // Asterisk separators (*****)
        /From:\s*.+\nSent:\s*.+\nTo:\s*/is, // Outlook style headers
        /From:\s*.+\nDate:\s*.+\nSubject:\s*/is, // Generic email headers
        /^>+ ?.*/m // Lines starting with > (quoted text)
      ];

      for (const pattern of quotedPatterns) {
        const match = messageText.match(pattern);
        if (match && match.index !== undefined && match.index > 0) {
          messageText = messageText.substring(0, match.index).trim();
        }
      }

      // Also remove trailing lines that are just ">" characters
      messageText = messageText.replace(/(\n>+\s*)+$/g, '').trim();
    }

    console.log('[POSTMARK INBOUND] Message extraction:', {
      hasStrippedReply: !!payload.StrippedTextReply,
      originalLength: payload.TextBody.length,
      extractedLength: messageText.length
    });

    if (!messageText) {
      console.error('[POSTMARK INBOUND] Empty message after processing');
      return Response.json({ error: 'Empty message' }, { status: 400 });
    }

    // Generate Message-ID for this inbound message
    const newMessageId = `${payload.MessageID}@postmark`;

    // Create message in database
    const newMessage = await prisma.supportTicketMessage.create({
      data: {
        ticketId: ticket.id,
        userId: isStaff ? null : ticket.userId,
        isStaff,
        message: messageText,
        messageId: newMessageId
      }
    });

    console.log('[POSTMARK INBOUND] Created message:', newMessage.id);

    // Process attachments if present
    if (payload.Attachments && payload.Attachments.length > 0) {
      console.log(
        '[POSTMARK INBOUND] Processing attachments:',
        payload.Attachments.length
      );

      // Filter to allowed image types
      const imageAttachments = payload.Attachments.filter((att) =>
        ALLOWED_IMAGE_TYPES.includes(att.ContentType.toLowerCase())
      );

      console.log(
        '[POSTMARK INBOUND] Image attachments after filtering:',
        imageAttachments.length
      );

      // Calculate total size and validate
      let totalSize = 0;
      const validAttachments: PostmarkAttachment[] = [];

      for (const attachment of imageAttachments) {
        if (attachment.ContentLength > MAX_ATTACHMENT_SIZE) {
          console.log(
            '[POSTMARK INBOUND] Skipping oversized attachment:',
            attachment.Name,
            attachment.ContentLength
          );
          continue;
        }

        if (totalSize + attachment.ContentLength > MAX_TOTAL_ATTACHMENTS_SIZE) {
          console.log(
            '[POSTMARK INBOUND] Skipping attachment due to total size limit:',
            attachment.Name
          );
          continue;
        }

        totalSize += attachment.ContentLength;
        validAttachments.push(attachment);
      }

      console.log(
        '[POSTMARK INBOUND] Valid attachments to store:',
        validAttachments.length,
        'Total size:',
        totalSize
      );

      // Store valid attachments
      for (const attachment of validAttachments) {
        try {
          // Decode base64 content
          const data = Buffer.from(attachment.Content, 'base64');

          // Generate SHA-256 hash for cache busting
          const hash = createHash('sha256').update(data).digest('hex');

          // Clean up contentId (remove angle brackets if present)
          let contentId = attachment.ContentID || null;
          if (contentId) {
            contentId = contentId.replace(/^<|>$/g, '');
          }

          await prisma.supportTicketMessageAttachment.create({
            data: {
              messageId: newMessage.id,
              filename: attachment.Name,
              data,
              contentType: attachment.ContentType,
              contentId,
              size: attachment.ContentLength,
              hash
            }
          });

          console.log(
            '[POSTMARK INBOUND] Stored attachment:',
            attachment.Name,
            'ContentID:',
            contentId
          );
        } catch (attachmentError) {
          console.error(
            '[POSTMARK INBOUND] Failed to store attachment:',
            attachment.Name,
            attachmentError
          );
          // Continue with other attachments
        }
      }
    }

    // Update ticket status based on who replied
    // If staff replied: customer needs to respond (WAITING_CUSTOMER)
    // If customer replied: staff needs to respond (IN_PROGRESS)
    const newStatus = isStaff ? 'WAITING_CUSTOMER' : 'IN_PROGRESS';

    await prisma.supportTicket.update({
      where: {
        id: ticket.id
      },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    console.log('[POSTMARK INBOUND] Updated ticket status to:', newStatus);

    // Send notification email to the appropriate party
    const ticketUrl = routes.marketing.account.supportTicket(ticket.id);
    const firstMessageId =
      'messages' in ticket && Array.isArray(ticket.messages)
        ? ticket.messages[0]?.messageId
        : undefined;

    try {
      if (isStaff) {
        // Staff replied, notify customer
        if (ticket.user.email) {
          await sendSupportTicketMessageEmail({
            appName: APP_NAME,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            message: messageText,
            ticketUrl,
            recipient: ticket.user.email,
            replyTo: SUPPORT_EMAIL_INBOUND,
            messageId: newMessageId,
            inReplyTo: firstMessageId || undefined
          });

          console.log(
            '[POSTMARK INBOUND] Sent notification email to customer:',
            ticket.user.email
          );
        }
      } else {
        // Customer replied, notify support
        await sendSupportTicketUserReplyEmail({
          appName: APP_NAME,
          ticketNumber: ticket.ticketNumber,
          customerName: ticket.user.name || 'Customer',
          customerEmail: ticket.user.email || 'unknown@example.com',
          subject: ticket.subject,
          message: messageText,
          ticketUrl,
          recipient: SUPPORT_EMAIL,
          replyTo: SUPPORT_EMAIL_INBOUND,
          messageId: newMessageId,
          inReplyTo: firstMessageId || undefined
        });

        console.log(
          '[POSTMARK INBOUND] Sent notification email to support'
        );
      }
    } catch (emailError) {
      console.error(
        '[POSTMARK INBOUND] Failed to send notification email:',
        emailError
      );
      // Don't fail the webhook if email notification fails
    }

    return Response.json({ success: true, messageId: newMessage.id });
  } catch (error) {
    console.error('[POSTMARK INBOUND] Error processing inbound email:', error);
    return Response.json(
      {
        error: 'Failed to process inbound email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
