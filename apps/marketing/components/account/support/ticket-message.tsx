import * as React from 'react';
import Image from 'next/image';
import type { SupportTicketMessage, User } from '@prisma/client';
import { UserIcon, LifeBuoyIcon } from 'lucide-react';

import { getTicketAttachmentUrl } from '@workspace/routes';
import { cn } from '@workspace/ui/lib/utils';

import type { TicketAttachment } from '~/data/get-support-ticket-details';

type TicketMessageProps = {
  message: SupportTicketMessage & {
    user: User | null;
    attachments: TicketAttachment[];
  };
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export function TicketMessage({
  message
}: TicketMessageProps): React.JSX.Element {
  const isStaff = message.isStaff;
  const author = isStaff ? 'Support Team' : message.user?.name || 'You';

  return (
    <div
      className={cn(
        'flex gap-3',
        isStaff ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          isStaff
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
        )}
      >
        {isStaff ? (
          <LifeBuoyIcon className="size-4" />
        ) : (
          <UserIcon className="size-4" />
        )}
      </div>

      <div className={cn('flex-1 space-y-1', isStaff ? 'text-left' : 'text-right')}>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              'font-medium',
              isStaff ? 'text-blue-600 dark:text-blue-400' : ''
            )}
          >
            {author}
          </span>
          <span className="text-muted-foreground">
            {formatDate(message.createdAt)}
          </span>
        </div>
        <div
          className={cn(
            'rounded-lg p-3 inline-block max-w-[85%]',
            isStaff
              ? 'bg-blue-50 text-gray-900 dark:bg-blue-950 dark:text-gray-100'
              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
          {message.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={getTicketAttachmentUrl(attachment.id, attachment.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <Image
                    src={getTicketAttachmentUrl(attachment.id, attachment.hash)}
                    alt={attachment.filename}
                    width={200}
                    height={150}
                    className="object-cover max-h-[150px] w-auto"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
