export type EmailPayload = {
  recipient: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  messageId?: string;
  inReplyTo?: string;
};

export type EmailProvider = {
  sendEmail(payload: EmailPayload): Promise<unknown>;
};
