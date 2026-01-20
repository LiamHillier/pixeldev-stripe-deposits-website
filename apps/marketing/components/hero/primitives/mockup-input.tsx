import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

export type MockupInputProps = React.ComponentPropsWithoutRef<'div'> & {
  value?: string;
  placeholder?: string;
};

export function MockupInput({
  className,
  value,
  placeholder,
  ...props
}: MockupInputProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex h-8 w-full rounded-md border bg-background px-3 py-1.5 text-xs ring-offset-background',
        'text-foreground',
        !value && placeholder && 'text-muted-foreground',
        className
      )}
      {...props}
    >
      <span className="truncate">{value || placeholder}</span>
    </div>
  );
}

export type MockupLabelProps = React.ComponentPropsWithoutRef<'label'>;

export function MockupLabel({
  className,
  children,
  ...props
}: MockupLabelProps): React.JSX.Element {
  return (
    <label
      className={cn('text-xs font-medium leading-none', className)}
      {...props}
    >
      {children}
    </label>
  );
}
