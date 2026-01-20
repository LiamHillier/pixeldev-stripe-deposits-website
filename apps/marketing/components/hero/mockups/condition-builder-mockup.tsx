'use client';

import * as React from 'react';
import { PlusIcon, TrashIcon, CircuitBoardIcon, GripVerticalIcon } from 'lucide-react';
import { motion } from 'motion/react';

import {
  MockupCard,
  MockupCardHeader,
  MockupCardTitle,
  MockupCardContent,
  MockupButton,
  MockupSelect,
  MockupBadge
} from '../primitives';
import { FeatureTooltip } from '../tooltip/feature-tooltip';
import { tooltipContent } from '../tooltip/tooltip-content';
import { mockConditions } from '../data/mock-data';

function ConditionRow({
  condition,
  index,
  isLast
}: {
  condition: (typeof mockConditions)[0];
  index: number;
  isLast: boolean;
}): React.JSX.Element {
  const showIndicators = index === 0; // Only show indicators on first row

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <div className="group flex items-center gap-2 rounded-lg border bg-card p-3">
        <div className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground">
          <GripVerticalIcon className="h-4 w-4" />
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <FeatureTooltip
            title={tooltipContent.conditionBuilder.conditionType.title}
            description={tooltipContent.conditionBuilder.conditionType.description}
            showIndicator={showIndicators}
            indicatorPosition="top-right"
          >
            <MockupSelect value={condition.type} className="w-[140px]" />
          </FeatureTooltip>

          <FeatureTooltip
            title={tooltipContent.conditionBuilder.operator.title}
            description={tooltipContent.conditionBuilder.operator.description}
            showIndicator={showIndicators}
            indicatorPosition="top-right"
          >
            <MockupSelect value={condition.operator} className="w-[130px]" />
          </FeatureTooltip>

          <FeatureTooltip
            title={tooltipContent.conditionBuilder.conditionValue.title}
            description={tooltipContent.conditionBuilder.conditionValue.description}
            showIndicator={false}
          >
            <MockupSelect value={condition.value} className="flex-1 min-w-[140px]" />
          </FeatureTooltip>
        </div>

        <MockupButton
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </MockupButton>
      </div>

      {!isLast && (
        <div className="flex items-center gap-2 py-2 pl-6">
          <div className="h-4 w-px bg-border" />
          <FeatureTooltip
            title={tooltipContent.conditionBuilder.matchType.title}
            description={tooltipContent.conditionBuilder.matchType.description}
            showIndicator={index === 0}
            indicatorPosition="top-right"
          >
            <MockupBadge variant="outline" className="text-[10px] uppercase tracking-wide">
              AND
            </MockupBadge>
          </FeatureTooltip>
          <div className="h-4 flex-1 border-t border-dashed" />
        </div>
      )}
    </motion.div>
  );
}

export function ConditionBuilderMockup(): React.JSX.Element {
  return (
    <MockupCard className="overflow-hidden">
      <MockupCardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircuitBoardIcon className="h-4 w-4 text-muted-foreground" />
            <MockupCardTitle>Conditions</MockupCardTitle>
            <MockupBadge variant="secondary">{mockConditions.length} rules</MockupBadge>
          </div>
          <FeatureTooltip
            title={tooltipContent.conditionBuilder.matchType.title}
            description={tooltipContent.conditionBuilder.matchType.description}
            indicatorPosition="top-left"
          >
            <div className="flex items-center gap-1 rounded-md border p-0.5">
              <MockupButton size="sm" className="h-6 px-2 text-[10px]">
                Match ALL
              </MockupButton>
              <MockupButton
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-muted-foreground"
              >
                Match ANY
              </MockupButton>
            </div>
          </FeatureTooltip>
        </div>
      </MockupCardHeader>
      <MockupCardContent className="p-4">
        <div className="space-y-0">
          {mockConditions.map((condition, index) => (
            <ConditionRow
              key={condition.id}
              condition={condition}
              index={index}
              isLast={index === mockConditions.length - 1}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-4"
        >
          <FeatureTooltip
            title={tooltipContent.conditionBuilder.addCondition.title}
            description={tooltipContent.conditionBuilder.addCondition.description}
            showIndicator={false}
          >
            <MockupButton variant="outline" className="w-full border-dashed">
              <PlusIcon className="h-3.5 w-3.5" />
              Add Condition
            </MockupButton>
          </FeatureTooltip>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-4 rounded-md bg-muted/50 p-3"
        >
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">This plan applies when:</span> Cart total
            is greater than $100 AND product is in Furniture or Electronics AND customer role is
            Wholesale
          </p>
        </motion.div>
      </MockupCardContent>
    </MockupCard>
  );
}
