'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@workspace/auth';
import { APP_NAME } from '@workspace/common/app';
import { prisma } from '@workspace/database/client';
import { sendSupportTicketUserReplyEmail } from '@workspace/email/send-support-ticket-user-reply-email';
import { routes } from '@workspace/routes';

import { replyTicketSchema, type ReplyTicketInput } from '~/schemas/reply-ticket-schema';

// Environment variables for support email configuration
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? 'support@example.com';
const SUPPORT_EMAIL_INBOUND = process.env.SUPPORT_EMAIL_INBOUND ?? 'support@support.example.com';
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN ?? 'example.com';

type ReplyTicketResult = {
  success: true;
} | {
  success: false;
  error: string;
};

export async function replyToTicket(
  ticketId: string,
  input: ReplyTicketInput
): Promise<ReplyTicketResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: 'You must be logged in to reply' };
    }

    // Validate input
    const validated = replyTicketSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { message } = validated.data;

    // Find the ticket and verify ownership
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1
        }
      }
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    // Check if ticket can be replied to
    if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
      return { success: false, error: 'Cannot reply to a closed or resolved ticket' };
    }

    // Generate Message-ID for email threading
    const messageId = `ticket-${ticket.id}-msg-${Date.now()}@${EMAIL_DOMAIN}`;

    // Create the reply message and update ticket status
    await prisma.$transaction(async (tx) => {
      // Create the message
      await tx.supportTicketMessage.create({
        data: {
          ticketId: ticket.id,
          userId: session.user.id,
          isStaff: false,
          message,
          messageId
        }
      });

      // Update ticket status to IN_PROGRESS (staff needs to respond)
      await tx.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: new Date()
        }
      });
    });

    // Send notification email to support team
    const ticketUrl = routes.marketing.account.supportTicket(ticket.id);
    const firstMessageId = ticket.messages[0]?.messageId;

    try {
      await sendSupportTicketUserReplyEmail({
        appName: APP_NAME,
        ticketNumber: ticket.ticketNumber,
        customerName: session.user.name || 'Customer',
        customerEmail: session.user.email || 'unknown@example.com',
        subject: ticket.subject,
        message,
        ticketUrl,
        recipient: SUPPORT_EMAIL,
        replyTo: SUPPORT_EMAIL_INBOUND,
        messageId,
        inReplyTo: firstMessageId || undefined
      });
    } catch (emailError) {
      console.error('[REPLY TICKET] Failed to send notification email:', emailError);
      // Don't fail the reply if email fails
    }

    // Revalidate the ticket page
    revalidatePath(routes.marketing.account.supportTicket(ticketId));

    return { success: true };
  } catch (error) {
    console.error('[REPLY TICKET] Error replying to ticket:', error);
    return { success: false, error: 'Failed to send reply' };
  }
}
