'use server';

import { auth } from '@workspace/auth';
import { APP_NAME } from '@workspace/common/app';
import { TicketPriority, prisma } from '@workspace/database/client';
import { sendSupportTicketCreatedEmail } from '@workspace/email/send-support-ticket-created-email';
import { routes } from '@workspace/routes';

import { createTicketSchema, type CreateTicketInput } from '~/schemas/create-ticket-schema';

// Environment variables for support email configuration
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? 'support@example.com';
const SUPPORT_EMAIL_INBOUND = process.env.SUPPORT_EMAIL_INBOUND ?? 'support@support.example.com';
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN ?? 'example.com';

type CreateTicketResult = {
  success: true;
  ticketId: string;
} | {
  success: false;
  error: string;
};

export async function createSupportTicket(
  input: CreateTicketInput
): Promise<CreateTicketResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: 'You must be logged in to create a ticket' };
    }

    // Validate input
    const validated = createTicketSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { subject, message, priority } = validated.data;

    // Get user's organization
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      include: { organization: true },
      orderBy: { createdAt: 'asc' }
    });

    if (!membership?.organization) {
      return { success: false, error: 'No organization found' };
    }

    // Create the ticket and first message in a transaction
    const ticket = await prisma.$transaction(async (tx) => {
      // Create the ticket
      const newTicket = await tx.supportTicket.create({
        data: {
          organizationId: membership.organization.id,
          userId: session.user.id,
          subject,
          priority: priority as TicketPriority
        }
      });

      // Generate Message-ID for email threading
      const messageId = `ticket-${newTicket.id}-msg-initial@${EMAIL_DOMAIN}`;

      // Create the first message
      await tx.supportTicketMessage.create({
        data: {
          ticketId: newTicket.id,
          userId: session.user.id,
          isStaff: false,
          message,
          messageId
        }
      });

      return newTicket;
    });

    // Send notification email to support team
    const ticketUrl = routes.marketing.account.supportTicket(ticket.id);

    try {
      await sendSupportTicketCreatedEmail({
        appName: APP_NAME,
        ticketNumber: ticket.ticketNumber,
        customerName: session.user.name || 'Customer',
        customerEmail: session.user.email || 'unknown@example.com',
        subject,
        message,
        priority,
        ticketUrl,
        recipient: SUPPORT_EMAIL,
        replyTo: SUPPORT_EMAIL_INBOUND,
        messageId: `ticket-${ticket.id}-msg-initial@${EMAIL_DOMAIN}`
      });
    } catch (emailError) {
      console.error('[CREATE TICKET] Failed to send notification email:', emailError);
      // Don't fail the ticket creation if email fails
    }

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error('[CREATE TICKET] Error creating ticket:', error);
    return { success: false, error: 'Failed to create ticket' };
  }
}
