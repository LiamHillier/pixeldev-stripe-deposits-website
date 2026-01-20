import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';

export type MockupSelectProps = React.ComponentPropsWithoutRef<'div'> & {
  value?: string;
  placeholder?: string;
};

export function MockupSelect({
  className,
  value,
  placeholder,
  ...props
}: MockupSelectProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex h-8 w-full items-center justify-between rounded-md border bg-background px-3 py-1.5 text-xs',
        !value && placeholder && 'text-muted-foreground',
        className
      )}
      {...props}
    >
      <span className="truncate">{value || placeholder}</span>
      <ChevronDownIcon className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
    </div>
  );
}
