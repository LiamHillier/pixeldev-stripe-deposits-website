'use client';

import * as React from 'react';
import { SendIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';

import { replyToTicket } from '~/actions/support/reply-to-ticket';

type ReplyToTicketFormProps = {
  ticketId: string;
};

export function ReplyToTicketForm({
  ticketId
}: ReplyToTicketFormProps): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await replyToTicket(ticketId, { message });

      if (result.success) {
        setSuccess(true);
        setMessage('');
        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert>
          <CheckCircleIcon className="size-[18px] shrink-0" />
          <AlertDescription>
            Your reply has been sent. The support team will be notified.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-[18px] shrink-0" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Textarea
        placeholder="Type your reply here..."
        className="min-h-[100px]"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        minLength={1}
        maxLength={5000}
        disabled={isSubmitting}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <SendIcon className="mr-2 size-4" />
          {isSubmitting ? 'Sending...' : 'Send Reply'}
        </Button>
      </div>
    </form>
  );
}
