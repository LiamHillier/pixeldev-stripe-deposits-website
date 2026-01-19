import * as React from 'react';
import Link from 'next/link';
import { MessageSquareIcon, ClockIcon } from 'lucide-react';
import type { SupportTicket } from '@prisma/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { routes } from '@workspace/routes';
import { cn } from '@workspace/ui/lib/utils';

type SupportTicketCardProps = {
  ticket: SupportTicket & {
    _count: {
      messages: number;
    };
  };
};

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
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
};

export function SupportTicketCard({
  ticket
}: SupportTicketCardProps): React.JSX.Element {
  return (
    <Link href={routes.marketing.account.supportTicket(ticket.id)}>
      <Card className="transition-colors hover:bg-accent cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                #{ticket.ticketNumber} {ticket.subject}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <ClockIcon className="size-3" />
                Updated {formatDate(ticket.updatedAt)}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={cn('text-xs', statusColors[ticket.status])}>
                {formatStatus(ticket.status)}
              </Badge>
              {ticket.priority !== 'NORMAL' && (
                <Badge
                  className={cn('text-xs', priorityColors[ticket.priority])}
                >
                  {ticket.priority}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquareIcon className="size-4" />
            <span>
              {ticket._count.messages} message
              {ticket._count.messages !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
