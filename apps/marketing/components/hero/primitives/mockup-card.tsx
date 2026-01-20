import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

export type MockupCardProps = React.ComponentPropsWithoutRef<'div'>;

export function MockupCard({
  className,
  children,
  ...props
}: MockupCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type MockupCardHeaderProps = React.ComponentPropsWithoutRef<'div'>;

export function MockupCardHeader({
  className,
  children,
  ...props
}: MockupCardHeaderProps): React.JSX.Element {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type MockupCardTitleProps = React.ComponentPropsWithoutRef<'h3'>;

export function MockupCardTitle({
  className,
  children,
  ...props
}: MockupCardTitleProps): React.JSX.Element {
  return (
    <h3
      className={cn('text-sm font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export type MockupCardDescriptionProps = React.ComponentPropsWithoutRef<'p'>;

export function MockupCardDescription({
  className,
  children,
  ...props
}: MockupCardDescriptionProps): React.JSX.Element {
  return (
    <p
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export type MockupCardContentProps = React.ComponentPropsWithoutRef<'div'>;

export function MockupCardContent({
  className,
  children,
  ...props
}: MockupCardContentProps): React.JSX.Element {
  return (
    <div
      className={cn('p-4 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type MockupCardFooterProps = React.ComponentPropsWithoutRef<'div'>;

export function MockupCardFooter({
  className,
  children,
  ...props
}: MockupCardFooterProps): React.JSX.Element {
  return (
    <div
      className={cn('flex items-center p-4 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}
