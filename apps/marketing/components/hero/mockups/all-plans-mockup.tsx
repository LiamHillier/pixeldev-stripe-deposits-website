'use client';

import * as React from 'react';
import { GripVerticalIcon, PlusIcon, MoreHorizontalIcon, LayersIcon } from 'lucide-react';
import { motion } from 'motion/react';

import {
  MockupCard,
  MockupCardHeader,
  MockupCardTitle,
  MockupCardContent,
  MockupButton,
  MockupBadge
} from '../primitives';
import { FeatureTooltip } from '../tooltip/feature-tooltip';
import { tooltipContent } from '../tooltip/tooltip-content';
import { mockPlans } from '../data/mock-data';

function PlanCard({
  plan,
  index
}: {
  plan: (typeof mockPlans)[0];
  index: number;
}): React.JSX.Element {
  const showIndicators = index === 0; // Only show indicators on first card

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <MockupCard className="group relative">
        <MockupCardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground">
                <GripVerticalIcon className="h-4 w-4" />
              </div>
              <div>
                <MockupCardTitle className="text-sm">{plan.name}</MockupCardTitle>
                <div className="mt-1 flex items-center gap-2">
                  <FeatureTooltip
                    title={tooltipContent.allPlans.priority.title}
                    description={tooltipContent.allPlans.priority.description}
                    side="bottom"
                    showIndicator={showIndicators}
                    indicatorPosition="top-right"
                  >
                    <MockupBadge variant="outline" className="text-[10px]">
                      Priority {plan.priority}
                    </MockupBadge>
                  </FeatureTooltip>
                  <span className="text-[10px] text-muted-foreground">
                    {plan.deposit} deposit
                  </span>
                </div>
              </div>
            </div>
            <MockupButton variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontalIcon className="h-3.5 w-3.5" />
            </MockupButton>
          </div>
        </MockupCardHeader>
        <MockupCardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Schedule</span>
              <span>{plan.schedule}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <FeatureTooltip
                title={tooltipContent.allPlans.activeOrders.title}
                description={tooltipContent.allPlans.activeOrders.description}
                side="left"
                showIndicator={showIndicators}
                indicatorPosition="right-center"
              >
                <span className="text-muted-foreground cursor-default">Active Orders</span>
              </FeatureTooltip>
              <MockupBadge variant="info">{plan.activeOrders}</MockupBadge>
            </div>
            <div className="border-t pt-3">
              <FeatureTooltip
                title={tooltipContent.allPlans.conditions.title}
                description={tooltipContent.allPlans.conditions.description}
                side="bottom"
                showIndicator={showIndicators}
                indicatorPosition="top-right"
              >
                <div className="flex flex-wrap gap-1">
                  {plan.conditions.map((condition, i) => (
                    <MockupBadge key={i} variant="secondary" className="text-[10px]">
                      {condition}
                    </MockupBadge>
                  ))}
                </div>
              </FeatureTooltip>
            </div>
          </div>
        </MockupCardContent>
      </MockupCard>
    </motion.div>
  );
}

export function AllPlansMockup(): React.JSX.Element {
  return (
    <MockupCard className="overflow-hidden">
      <MockupCardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayersIcon className="h-4 w-4 text-muted-foreground" />
            <MockupCardTitle>Payment Plans</MockupCardTitle>
            <MockupBadge variant="secondary">{mockPlans.length} plans</MockupBadge>
          </div>
          <FeatureTooltip
            title={tooltipContent.allPlans.addPlan.title}
            description={tooltipContent.allPlans.addPlan.description}
            indicatorPosition="top-left"
          >
            <MockupButton size="sm">
              <PlusIcon className="h-3.5 w-3.5" />
              Add Plan
            </MockupButton>
          </FeatureTooltip>
        </div>
      </MockupCardHeader>
      <MockupCardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mockPlans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>
      </MockupCardContent>
    </MockupCard>
  );
}
