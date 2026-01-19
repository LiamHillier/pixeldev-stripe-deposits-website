import { render } from '@react-email/render';

import { EmailProvider } from './provider';
import {
  SupportTicketMessageEmail,
  type SupportTicketMessageEmailProps
} from './templates/support-ticket-message-email';

export async function sendSupportTicketMessageEmail(
  input: SupportTicketMessageEmailProps & {
    recipient: string;
    replyTo?: string;
    messageId?: string;
    inReplyTo?: string;
  }
): Promise<void> {
  const component = SupportTicketMessageEmail(input);
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
