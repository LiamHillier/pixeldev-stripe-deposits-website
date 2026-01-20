import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@workspace/ui/lib/utils';

const mockupBadgeVariants = cva(
  'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500/15 text-green-600 dark:text-green-400',
        warning: 'border-transparent bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
        info: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export type MockupBadgeProps = React.ComponentPropsWithoutRef<'span'> &
  VariantProps<typeof mockupBadgeVariants>;

export function MockupBadge({
  className,
  variant,
  children,
  ...props
}: MockupBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(mockupBadgeVariants({ variant, className }))}
      {...props}
    >
      {children}
    </span>
  );
}
