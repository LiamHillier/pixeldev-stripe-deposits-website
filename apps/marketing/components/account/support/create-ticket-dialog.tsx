'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, AlertCircleIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { routes } from '@workspace/routes';

import { createSupportTicket } from '~/actions/support/create-support-ticket';

export function CreateTicketDialog(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [priority, setPriority] = React.useState<
    'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  >('NORMAL');
  const router = useRouter();

  const handleSubmit = async (
    e: React.FormEvent
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createSupportTicket({
        subject,
        message,
        priority
      });

      if (result.success) {
        setSubject('');
        setMessage('');
        setPriority('NORMAL');
        setOpen(false);
        router.push(routes.marketing.account.supportTicket(result.ticketId));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create support ticket'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 size-4" />
          New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            Submit a support request. Our team will respond via email and you
            can track the conversation here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-[18px] shrink-0" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              minLength={5}
              maxLength={255}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) =>
                setPriority(value as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT')
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Please provide details about your issue or question"
              className="min-h-[150px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              maxLength={5000}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
