'use client';

import * as React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

interface ConditionType {
  value: string;
  label: string;
  category: string;
  operators: { value: string; label: string }[];
  valueType: 'number' | 'select' | 'checkbox' | 'text';
  options?: { value: string; label: string }[];
}

const conditionTypes: ConditionType[] = [
  {
    value: 'cart_total',
    label: 'Cart Total',
    category: 'Cart',
    operators: [
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' },
      { value: 'equals', label: 'Equals' },
      { value: 'between', label: 'Between' }
    ],
    valueType: 'number'
  },
  {
    value: 'cart_item_count',
    label: 'Cart Item Count',
    category: 'Cart',
    operators: [
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' },
      { value: 'equals', label: 'Equals' }
    ],
    valueType: 'number'
  },
  {
    value: 'product_category',
    label: 'Product Category',
    category: 'Product',
    operators: [
      { value: 'in_any', label: 'Contains Any' },
      { value: 'not_in', label: 'Does Not Contain' }
    ],
    valueType: 'checkbox',
    options: [
      { value: 'furniture', label: 'Furniture' },
      { value: 'electronics', label: 'Electronics' },
      { value: 'events', label: 'Events' },
      { value: 'courses', label: 'Courses' }
    ]
  },
  {
    value: 'user_role',
    label: 'Customer Role',
    category: 'Customer',
    operators: [
      { value: 'in_any', label: 'Is Any Of' },
      { value: 'not_in', label: 'Is Not' }
    ],
    valueType: 'select',
    options: [
      { value: 'customer', label: 'Customer' },
      { value: 'subscriber', label: 'Subscriber' },
      { value: 'wholesale', label: 'Wholesale' },
      { value: 'vip', label: 'VIP' }
    ]
  },
  {
    value: 'customer_order_count',
    label: 'Customer Order Count',
    category: 'Customer',
    operators: [
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' },
      { value: 'equals', label: 'Equals' }
    ],
    valueType: 'number'
  },
  {
    value: 'day_of_week',
    label: 'Day of Week',
    category: 'Date/Time',
    operators: [{ value: 'in_any', label: 'Is' }],
    valueType: 'checkbox',
    options: [
      { value: '1', label: 'Monday' },
      { value: '2', label: 'Tuesday' },
      { value: '3', label: 'Wednesday' },
      { value: '4', label: 'Thursday' },
      { value: '5', label: 'Friday' },
      { value: '6', label: 'Saturday' },
      { value: '0', label: 'Sunday' }
    ]
  }
];

interface Condition {
  id: string;
  type: string;
  operator: string;
  value: string | string[] | number | { min: number; max: number };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getConditionType(type: string): ConditionType | undefined {
  return conditionTypes.find((ct) => ct.value === type);
}

function formatValue(condition: Condition): string {
  const condType = getConditionType(condition.type);
  if (!condType) return String(condition.value);

  if (condType.valueType === 'number') {
    if (
      condition.operator === 'between' &&
      typeof condition.value === 'object' &&
      'min' in condition.value
    ) {
      return `$${condition.value.min} and $${condition.value.max}`;
    }
    return condType.value === 'cart_total'
      ? `$${condition.value}`
      : String(condition.value);
  }

  if (
    condType.valueType === 'checkbox' ||
    condType.valueType === 'select'
  ) {
    const values = Array.isArray(condition.value)
      ? condition.value
      : [condition.value];
    return values
      .map((v) => condType.options?.find((o) => o.value === v)?.label || v)
      .join(', ');
  }

  return String(condition.value);
}

function getSummaryText(condition: Condition): string {
  const condType = getConditionType(condition.type);
  if (!condType) return '';

  const operator =
    condType.operators.find((o) => o.value === condition.operator)?.label ||
    condition.operator;
  const value = formatValue(condition);

  return `${condType.label} ${operator.toLowerCase()} ${value}`;
}

function ValueInput({
  condition,
  condType,
  onUpdate
}: {
  condition: Condition;
  condType: ConditionType;
  onUpdate: (value: Condition['value']) => void;
}): React.JSX.Element | null {
  if (condType.valueType === 'number') {
    if (condition.operator === 'between') {
      const rangeValue =
        typeof condition.value === 'object' && 'min' in condition.value
          ? condition.value
          : { min: 0, max: 100 };
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Minimum</Label>
            <Input
              type="number"
              value={rangeValue.min}
              onChange={(e) =>
                onUpdate({ ...rangeValue, min: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Maximum</Label>
            <Input
              type="number"
              value={rangeValue.max}
              onChange={(e) =>
                onUpdate({ ...rangeValue, max: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      );
    }
    return (
      <Input
        type="number"
        value={typeof condition.value === 'number' ? condition.value : ''}
        onChange={(e) => onUpdate(parseFloat(e.target.value) || 0)}
        placeholder="Enter value..."
      />
    );
  }

  if (condType.valueType === 'select') {
    return (
      <Select
        value={String(condition.value)}
        onValueChange={(v) => onUpdate(v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {condType.options?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (condType.valueType === 'checkbox') {
    const selectedValues = Array.isArray(condition.value)
      ? condition.value
      : [];
    return (
      <div className="grid grid-cols-2 gap-2">
        {condType.options?.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(opt.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onUpdate([...selectedValues, opt.value]);
                } else {
                  onUpdate(selectedValues.filter((v) => v !== opt.value));
                }
              }}
              className="rounded border-input"
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  }

  return (
    <Input
      type="text"
      value={String(condition.value)}
      onChange={(e) => onUpdate(e.target.value)}
      placeholder="Enter value..."
    />
  );
}

function ConditionRow({
  condition,
  onUpdate,
  onRemove
}: {
  condition: Condition;
  onUpdate: (condition: Condition) => void;
  onRemove: () => void;
}): React.JSX.Element {
  const condType = getConditionType(condition.type);

  const handleTypeChange = (type: string) => {
    const newCondType = getConditionType(type);
    const defaultValue =
      newCondType?.valueType === 'number'
        ? 0
        : newCondType?.valueType === 'checkbox'
          ? []
          : '';
    onUpdate({
      ...condition,
      type,
      operator: newCondType?.operators[0]?.value || 'equals',
      value: defaultValue
    });
  };

  const groupedTypes: Record<string, ConditionType[]> = {};
  conditionTypes.forEach((ct) => {
    if (!groupedTypes[ct.category]) {
      groupedTypes[ct.category] = [];
    }
    groupedTypes[ct.category].push(ct);
  });

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Condition Type</Label>
            <Select value={condition.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedTypes).map(([category, types]) => (
                  <SelectGroup key={category}>
                    <SelectLabel>{category}</SelectLabel>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Operator</Label>
            <Select
              value={condition.operator}
              onValueChange={(v) => onUpdate({ ...condition, operator: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {condType?.operators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Value</Label>
          {condType && (
            <ValueInput
              condition={condition}
              condType={condType}
              onUpdate={(value) => onUpdate({ ...condition, value })}
            />
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2Icon className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConditionDemo(): React.JSX.Element {
  const [matchType, setMatchType] = React.useState<'all' | 'any'>('all');
  const [conditions, setConditions] = React.useState<Condition[]>([
    {
      id: generateId(),
      type: 'cart_total',
      operator: 'greater_than',
      value: 500
    },
    {
      id: generateId(),
      type: 'product_category',
      operator: 'in_any',
      value: ['furniture']
    }
  ]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: generateId(),
        type: 'cart_total',
        operator: 'greater_than',
        value: 100
      }
    ]);
  };

  const updateCondition = (updated: Condition) => {
    setConditions(conditions.map((c) => (c.id === updated.id ? updated : c)));
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((c) => c.id !== id));
    }
  };

  const summaryParts = conditions.map((c) => getSummaryText(c));
  const summaryText =
    summaryParts.length > 0
      ? summaryParts.join(matchType === 'all' ? ' AND ' : ' OR ')
      : 'No conditions set';

  return (
    <Card className="not-prose my-6">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Match Type</Label>
            <Select
              value={matchType}
              onValueChange={(v) => setMatchType(v as 'all' | 'any')}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Match ALL conditions</SelectItem>
                <SelectItem value="any">Match ANY condition</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {matchType === 'all'
                ? 'All conditions must be true for this plan to apply'
                : 'At least one condition must be true for this plan to apply'}
            </p>
          </div>

          <div className="space-y-4">
            {conditions.map((condition) => (
              <ConditionRow
                key={condition.id}
                condition={condition}
                onUpdate={updateCondition}
                onRemove={() => removeCondition(condition.id)}
              />
            ))}
          </div>

          <Button type="button" variant="secondary" onClick={addCondition}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Condition
          </Button>

          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                This plan applies when:
              </span>{' '}
              {summaryText}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
