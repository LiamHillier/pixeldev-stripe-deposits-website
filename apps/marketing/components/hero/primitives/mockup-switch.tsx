import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

export type MockupSwitchProps = React.ComponentPropsWithoutRef<'div'> & {
  checked?: boolean;
};

export function MockupSwitch({
  className,
  checked = false,
  ...props
}: MockupSwitchProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'inline-flex h-4 w-7 shrink-0 items-center rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-primary' : 'bg-input',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'pointer-events-none block h-3 w-3 rounded-full bg-background shadow-lg ring-0 transition-transform',
          checked ? 'translate-x-3' : 'translate-x-0'
        )}
      />
    </div>
  );
}
