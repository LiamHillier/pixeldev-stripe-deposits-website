import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, ClockIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { routes } from '@workspace/routes';
import { cn } from '@workspace/ui/lib/utils';

import { getSupportTicketDetails } from '~/data/get-support-ticket-details';
import { TicketMessage } from '~/components/account/support/ticket-message';
import { ReplyToTicketForm } from '~/components/account/support/reply-to-ticket-form';

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  IN_PROGRESS:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  WAITING_CUSTOMER:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  RESOLVED:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  NORMAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

type PageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function TicketDetailPage({
  params
}: PageProps): Promise<React.JSX.Element> {
  const { ticketId } = await params;
  const ticket = await getSupportTicketDetails(ticketId);

  if (!ticket) {
    notFound();
  }

  const canReply = ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={routes.marketing.account.Support}>
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Ticket #{ticket.ticketNumber}
            </h1>
            <Badge className={cn('text-xs', statusColors[ticket.status])}>
              {formatStatus(ticket.status)}
            </Badge>
            {ticket.priority !== 'NORMAL' && (
              <Badge className={cn('text-xs', priorityColors[ticket.priority])}>
                {ticket.priority}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {ticket.subject}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Information</CardTitle>
          <CardDescription>
            Created {formatDate(ticket.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <ClockIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last updated:</span>
            <span>{formatDate(ticket.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>
            {ticket.messages.length} message
            {ticket.messages.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ticket.messages.map((message) => (
            <TicketMessage key={message.id} message={message} />
          ))}
        </CardContent>
      </Card>

      {canReply && (
        <Card>
          <CardHeader>
            <CardTitle>Reply</CardTitle>
            <CardDescription>
              Send a reply to the support team. They will be notified via email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReplyToTicketForm ticketId={ticket.id} />
          </CardContent>
        </Card>
      )}

      {!canReply && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              This ticket is {ticket.status.toLowerCase()}. You cannot reply to
              closed or resolved tickets.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
