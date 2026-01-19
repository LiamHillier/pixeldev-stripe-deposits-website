import { render } from '@react-email/render';

import { EmailProvider } from './provider';
import {
  SupportTicketUserReplyEmail,
  type SupportTicketUserReplyEmailProps
} from './templates/support-ticket-user-reply-email';

export async function sendSupportTicketUserReplyEmail(
  input: SupportTicketUserReplyEmailProps & {
    recipient: string;
    replyTo?: string;
    messageId?: string;
    inReplyTo?: string;
  }
): Promise<void> {
  const component = SupportTicketUserReplyEmail(input);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `[Ticket #${input.ticketNumber}] ${input.subject}`,
    html,
    text,
    replyTo: input.replyTo,
    messageId: input.messageId,
    inReplyTo: input.inReplyTo
  });
}
