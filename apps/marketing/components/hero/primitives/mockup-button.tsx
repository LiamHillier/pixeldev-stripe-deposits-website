import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@workspace/ui/lib/utils';

const mockupButtonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium transition-colors cursor-default select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border bg-background shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm'
      },
      size: {
        default: 'h-8 px-3',
        sm: 'h-7 px-2.5 text-xs',
        lg: 'h-9 px-4',
        icon: 'h-8 w-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export type MockupButtonProps = React.ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof mockupButtonVariants>;

export function MockupButton({
  className,
  variant,
  size,
  children,
  ...props
}: MockupButtonProps): React.JSX.Element {
  return (
    <div
      className={cn(mockupButtonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </div>
  );
}
