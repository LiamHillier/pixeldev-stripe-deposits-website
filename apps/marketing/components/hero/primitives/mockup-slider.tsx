import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

export type MockupSliderProps = React.ComponentPropsWithoutRef<'div'> & {
  value?: number;
  max?: number;
};

export function MockupSlider({
  className,
  value = 50,
  max = 100,
  ...props
}: MockupSliderProps): React.JSX.Element {
  const percentage = (value / max) * 100;

  return (
    <div
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      {...props}
    >
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute h-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        className="absolute block h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
}
