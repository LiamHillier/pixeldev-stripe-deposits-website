'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

const statuses = [
  {
    label: 'Active',
    value: 'active',
    description: 'Payment plan is in progress with upcoming installments',
    className: 'bg-green-500 text-white hover:bg-green-500'
  },
  {
    label: 'Completed',
    value: 'completed',
    description: 'All payments have been successfully collected',
    className: 'bg-blue-500 text-white hover:bg-blue-500'
  },
  {
    label: 'Past Due',
    value: 'past_due',
    description: 'One or more payments were not collected on the scheduled date',
    className: 'bg-orange-500 text-white hover:bg-orange-500'
  },
  {
    label: 'Failed',
    value: 'failed',
    description: 'Payment attempt was declined after all retry attempts',
    className: 'bg-red-500 text-white hover:bg-red-500'
  },
  {
    label: 'Canceled',
    value: 'canceled',
    description: 'Payment plan was manually canceled by admin or customer',
    className: 'bg-red-500 text-white hover:bg-red-500'
  },
  {
    label: 'Paused',
    value: 'paused',
    description: 'Payment plan is temporarily paused and will not collect payments',
    className: 'bg-gray-500 text-white hover:bg-gray-500'
  }
];

export function StatusBadgeDemo(): React.JSX.Element {
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(
    null
  );

  return (
    <Card className="not-prose my-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() =>
                  setSelectedStatus(
                    selectedStatus === status.value ? null : status.value
                  )
                }
                className="cursor-pointer"
              >
                <Badge
                  className={cn(
                    'text-[10px] uppercase font-bold transition-all',
                    status.className,
                    selectedStatus === status.value && 'ring-2 ring-ring ring-offset-2'
                  )}
                >
                  {status.label}
                </Badge>
              </button>
            ))}
          </div>

          <div className="min-h-[3rem] rounded-md bg-muted/50 p-3">
            {selectedStatus ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {statuses.find((s) => s.value === selectedStatus)?.label}:
                </span>{' '}
                {statuses.find((s) => s.value === selectedStatus)?.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click a badge to see its description
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
