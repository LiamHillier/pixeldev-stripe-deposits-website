import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

export type MockupProgressProps = React.ComponentPropsWithoutRef<'div'> & {
  value?: number;
  max?: number;
};

export function MockupProgress({
  className,
  value = 0,
  max = 100,
  ...props
}: MockupProgressProps): React.JSX.Element {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
