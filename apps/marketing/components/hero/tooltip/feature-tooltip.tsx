'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@workspace/ui/lib/utils';

type IndicatorPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'
  | 'left-center'
  | 'right-center';

const indicatorPositionClasses: Record<IndicatorPosition, string> = {
  'top-left': '-top-1 -left-1',
  'top-right': '-top-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'top-center': '-top-1 left-1/2 -translate-x-1/2',
  'bottom-center': '-bottom-1 left-1/2 -translate-x-1/2',
  'left-center': 'top-1/2 -left-1 -translate-y-1/2',
  'right-center': 'top-1/2 -right-1 -translate-y-1/2'
};

export type FeatureTooltipProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  showIndicator?: boolean;
  indicatorPosition?: IndicatorPosition;
};

function HotspotIndicator({
  position = 'top-right'
}: {
  position?: IndicatorPosition;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'absolute z-10 flex h-2.5 w-2.5',
        indicatorPositionClasses[position]
      )}
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500/60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm" />
    </span>
  );
}

export function FeatureTooltip({
  title,
  description,
  children,
  side = 'top',
  align = 'center',
  className,
  showIndicator = true,
  indicatorPosition = 'top-right'
}: FeatureTooltipProps): React.JSX.Element {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <div className={cn('relative cursor-default', className)}>
            {children}
            {showIndicator && <HotspotIndicator position={indicatorPosition} />}
          </div>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={8}
            className={cn(
              'z-50 max-w-[280px] rounded-lg border bg-popover px-3 py-2.5 text-popover-foreground shadow-md',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2',
              'data-[side=top]:slide-in-from-bottom-2'
            )}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <TooltipPrimitive.Arrow className="fill-popover" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
