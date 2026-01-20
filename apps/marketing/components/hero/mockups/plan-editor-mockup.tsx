'use client';

import * as React from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  WalletIcon,
  CalendarIcon,
  SettingsIcon
} from 'lucide-react';
import { motion } from 'motion/react';

import {
  MockupCard,
  MockupCardHeader,
  MockupCardTitle,
  MockupCardContent,
  MockupButton,
  MockupInput,
  MockupSelect,
  MockupSwitch,
  MockupSlider,
  MockupLabel
} from '../primitives';
import { FeatureTooltip } from '../tooltip/feature-tooltip';
import { tooltipContent } from '../tooltip/tooltip-content';
import { mockPlanEditor } from '../data/mock-data';

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
  delay = 0
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
  delay?: number;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-lg border"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="border-t p-4 space-y-4">{children}</div>}
    </motion.div>
  );
}

export function PlanEditorMockup(): React.JSX.Element {
  return (
    <MockupCard className="overflow-hidden">
      <MockupCardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            <MockupCardTitle>Edit Payment Plan</MockupCardTitle>
          </div>
          <div className="flex gap-2">
            <MockupButton variant="outline" size="sm">
              Cancel
            </MockupButton>
            <MockupButton size="sm">Save Changes</MockupButton>
          </div>
        </div>
      </MockupCardHeader>
      <MockupCardContent className="p-4 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <MockupLabel>Plan Name</MockupLabel>
          <MockupInput value={mockPlanEditor.name} />
        </motion.div>

        <CollapsibleSection title="Deposit Settings" icon={WalletIcon} delay={0.1}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FeatureTooltip
                title={tooltipContent.planEditor.depositToggle.title}
                description={tooltipContent.planEditor.depositToggle.description}
                side="right"
                indicatorPosition="right-center"
              >
                <div>
                  <MockupLabel>Collect Deposit</MockupLabel>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Require upfront payment at checkout
                  </p>
                </div>
              </FeatureTooltip>
              <MockupSwitch checked={mockPlanEditor.depositEnabled} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FeatureTooltip
                  title={tooltipContent.planEditor.depositType.title}
                  description={tooltipContent.planEditor.depositType.description}
                  indicatorPosition="right-center"
                >
                  <MockupLabel className="cursor-default">Deposit Type</MockupLabel>
                </FeatureTooltip>
                <MockupSelect value={mockPlanEditor.depositType} />
              </div>
              <div className="space-y-2">
                <FeatureTooltip
                  title={tooltipContent.planEditor.depositAmount.title}
                  description={tooltipContent.planEditor.depositAmount.description}
                  showIndicator={false}
                >
                  <MockupLabel className="cursor-default">Amount</MockupLabel>
                </FeatureTooltip>
                <div className="flex items-center gap-3">
                  <MockupSlider value={mockPlanEditor.depositAmount} max={100} className="flex-1" />
                  <span className="text-xs font-medium w-10 text-right">
                    {mockPlanEditor.depositAmount}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Payment Schedule" icon={CalendarIcon} delay={0.2}>
          <div className="space-y-4">
            <div className="space-y-2">
              <FeatureTooltip
                title={tooltipContent.planEditor.scheduleType.title}
                description={tooltipContent.planEditor.scheduleType.description}
                indicatorPosition="right-center"
              >
                <MockupLabel className="cursor-default">Schedule Type</MockupLabel>
              </FeatureTooltip>
              <MockupSelect value={mockPlanEditor.scheduleType} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FeatureTooltip
                  title={tooltipContent.planEditor.paymentCount.title}
                  description={tooltipContent.planEditor.paymentCount.description}
                  showIndicator={false}
                >
                  <MockupLabel className="cursor-default">Number of Payments</MockupLabel>
                </FeatureTooltip>
                <MockupSelect value={String(mockPlanEditor.paymentCount)} />
              </div>
              <div className="space-y-2">
                <FeatureTooltip
                  title={tooltipContent.planEditor.interval.title}
                  description={tooltipContent.planEditor.interval.description}
                  indicatorPosition="right-center"
                >
                  <MockupLabel className="cursor-default">Interval</MockupLabel>
                </FeatureTooltip>
                <MockupSelect value={mockPlanEditor.interval} />
              </div>
            </div>

            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Preview:</span> 50% deposit at
                checkout, then 3 payments of 16.67% each month
              </p>
            </div>
          </div>
        </CollapsibleSection>
      </MockupCardContent>
    </MockupCard>
  );
}
