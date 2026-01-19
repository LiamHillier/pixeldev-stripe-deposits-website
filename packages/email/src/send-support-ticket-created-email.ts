import { render } from '@react-email/render';

import { EmailProvider } from './provider';
import {
  SupportTicketCreatedEmail,
  type SupportTicketCreatedEmailProps
} from './templates/support-ticket-created-email';

export async function sendSupportTicketCreatedEmail(
  input: SupportTicketCreatedEmailProps & {
    recipient: string;
    replyTo?: string;
    messageId?: string;
  }
): Promise<void> {
  const component = SupportTicketCreatedEmail(input);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `[Ticket #${input.ticketNumber}] ${input.subject}`,
    html,
    text,
    replyTo: input.replyTo,
    messageId: input.messageId
  });
}
