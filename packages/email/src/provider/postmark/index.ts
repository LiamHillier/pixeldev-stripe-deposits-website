import * as postmark from 'postmark';

import { keys } from '../../../keys';
import { type EmailPayload, type EmailProvider } from '../types';

class PostmarkEmailProvider implements EmailProvider {
  private from: string | null = null;
  private client: postmark.ServerClient | null = null;

  private initialize() {
    if (this.client) return;

    const from = keys().EMAIL_FROM;
    if (!from) {
      throw new Error('Missing EMAIL_FROM in environment configuration');
    }

    const serverToken = keys().POSTMARK_SERVER_TOKEN;
    if (!serverToken) {
      throw new Error(
        'Missing POSTMARK_SERVER_TOKEN in environment configuration'
      );
    }

    this.from = from;
    this.client = new postmark.ServerClient(serverToken);
  }

  public async sendEmail(
    payload: EmailPayload
  ): Promise<postmark.Models.MessageSendingResponse> {
    this.initialize();

    const headers: postmark.Models.Header[] = [];
    if (payload.messageId) {
      headers.push({ Name: 'Message-ID', Value: payload.messageId });
    }
    if (payload.inReplyTo) {
      headers.push({ Name: 'In-Reply-To', Value: payload.inReplyTo });
      headers.push({ Name: 'References', Value: payload.inReplyTo });
    }

    const response = await this.client!.sendEmail({
      From: this.from!,
      To: payload.recipient,
      Subject: payload.subject,
      HtmlBody: payload.html,
      TextBody: payload.text,
      ReplyTo: payload.replyTo,
      Headers: headers.length > 0 ? headers : undefined
    });
    if (response.ErrorCode > 0) {
      throw new Error(response.Message);
    }

    return response;
  }
}

export default new PostmarkEmailProvider();
