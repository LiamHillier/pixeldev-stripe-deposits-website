'use client';

import * as React from 'react';
import { CalendarIcon, CheckIcon } from 'lucide-react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@workspace/ui/components/tabs';
import { cn } from '@workspace/ui/lib/utils';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

type ScheduleType = 'fixed' | 'acf-date' | 'due-by';

interface Payment {
  number: number;
  date: Date;
  amount: number;
  isDeposit?: boolean;
}

function calculateFixedSchedule(
  orderTotal: number,
  depositPercent: number,
  paymentCount: number,
  intervalMonths: number
): Payment[] {
  const deposit = orderTotal * (depositPercent / 100);
  const remaining = orderTotal - deposit;
  const installmentAmount = remaining / paymentCount;
  const today = new Date();

  const payments: Payment[] = [
    { number: 0, date: today, amount: deposit, isDeposit: true }
  ];

  for (let i = 0; i < paymentCount; i++) {
    payments.push({
      number: i + 1,
      date: addMonths(today, intervalMonths * (i + 1)),
      amount: installmentAmount
    });
  }

  return payments;
}

function calculateAcfDateSchedule(
  orderTotal: number,
  depositPercent: number,
  eventDate: Date,
  intervalMonths: number
): Payment[] {
  const deposit = orderTotal * (depositPercent / 100);
  const remaining = orderTotal - deposit;
  const today = new Date();

  const dueDate = addMonths(eventDate, -1);
  let current = new Date(today);
  const paymentDates: Date[] = [];

  while (current < dueDate) {
    current = addMonths(current, intervalMonths);
    if (current < dueDate) {
      paymentDates.push(new Date(current));
    }
  }

  const paymentCount = Math.max(1, paymentDates.length);
  const installmentAmount = remaining / paymentCount;

  const payments: Payment[] = [
    { number: 0, date: today, amount: deposit, isDeposit: true }
  ];

  paymentDates.forEach((date, i) => {
    payments.push({
      number: i + 1,
      date,
      amount: installmentAmount
    });
  });

  if (paymentDates.length === 0) {
    payments.push({
      number: 1,
      date: addMonths(today, 1),
      amount: remaining
    });
  }

  return payments;
}

function calculateDueBySchedule(
  orderTotal: number,
  depositPercent: number,
  dueDate: Date,
  intervalMonths: number
): Payment[] {
  const deposit = orderTotal * (depositPercent / 100);
  const remaining = orderTotal - deposit;
  const today = new Date();

  let current = new Date(today);
  const paymentDates: Date[] = [];

  while (current < dueDate) {
    current = addMonths(current, intervalMonths);
    if (current <= dueDate) {
      paymentDates.push(new Date(current));
    }
  }

  const paymentCount = Math.max(1, paymentDates.length);
  const installmentAmount = remaining / paymentCount;

  const payments: Payment[] = [
    { number: 0, date: today, amount: deposit, isDeposit: true }
  ];

  paymentDates.forEach((date, i) => {
    payments.push({
      number: i + 1,
      date,
      amount: installmentAmount
    });
  });

  return payments;
}

function ScheduleTimeline({
  payments,
  highlightDate
}: {
  payments: Payment[];
  highlightDate?: Date;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      {payments.map((payment, index) => (
        <div key={index} className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0',
              payment.isDeposit
                ? 'bg-primary text-primary-foreground'
                : 'border bg-background'
            )}
          >
            {payment.isDeposit ? (
              <CheckIcon className="h-3.5 w-3.5" />
            ) : (
              payment.number
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {payment.isDeposit ? 'Deposit' : `Payment ${payment.number}`}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(payment.date)}
            </div>
          </div>
          <div
            className={cn(
              'text-sm font-medium shrink-0',
              payment.isDeposit && 'text-primary'
            )}
          >
            {formatCurrency(payment.amount)}
          </div>
        </div>
      ))}

      {highlightDate && (
        <div className="flex items-center gap-3 pt-2 border-t mt-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0">
            <CalendarIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-amber-700 dark:text-amber-400 truncate">
              Target Date
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(highlightDate)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SchedulePreview(): React.JSX.Element {
  const [scheduleType, setScheduleType] = React.useState<ScheduleType>('fixed');
  const [paymentCount, setPaymentCount] = React.useState('4');
  const [intervalMonths, setIntervalMonths] = React.useState('1');

  const orderTotal = 500;
  const depositPercent = 20;

  const today = new Date();
  const eventDate = addMonths(today, 6);
  const dueDate = addMonths(today, 5);

  const payments = React.useMemo(() => {
    switch (scheduleType) {
      case 'fixed':
        return calculateFixedSchedule(
          orderTotal,
          depositPercent,
          parseInt(paymentCount, 10),
          parseInt(intervalMonths, 10)
        );
      case 'acf-date':
        return calculateAcfDateSchedule(
          orderTotal,
          depositPercent,
          eventDate,
          parseInt(intervalMonths, 10)
        );
      case 'due-by':
        return calculateDueBySchedule(
          orderTotal,
          depositPercent,
          dueDate,
          parseInt(intervalMonths, 10)
        );
      default:
        return [];
    }
  }, [scheduleType, paymentCount, intervalMonths]);

  return (
    <Card className="not-prose my-6">
      <CardContent className="pt-6">
        <Tabs
          value={scheduleType}
          onValueChange={(v) => setScheduleType(v as ScheduleType)}
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="fixed">Fixed</TabsTrigger>
            <TabsTrigger value="acf-date">ACF Date</TabsTrigger>
            <TabsTrigger value="due-by">Due By</TabsTrigger>
          </TabsList>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <TabsContent value="fixed" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Set a specific number of payments with regular intervals.
                </p>
                <div className="space-y-2">
                  <Label>Number of Payments</Label>
                  <Select value={paymentCount} onValueChange={setPaymentCount}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 payments</SelectItem>
                      <SelectItem value="4">4 payments</SelectItem>
                      <SelectItem value="6">6 payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="acf-date" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Payments calculated to finish before a product&apos;s date
                  field (e.g., event date). Example uses {formatDate(eventDate)}{' '}
                  as the event date.
                </p>
              </TabsContent>

              <TabsContent value="due-by" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">
                  All payments must complete by a specific deadline. Example
                  uses {formatDate(dueDate)} as the due date.
                </p>
              </TabsContent>

              <div className="space-y-2">
                <Label>Payment Interval</Label>
                <Select
                  value={intervalMonths}
                  onValueChange={setIntervalMonths}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Monthly</SelectItem>
                    <SelectItem value="2">Every 2 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md bg-muted/50 p-3 text-sm">
                <span className="text-muted-foreground">Order: </span>
                <span className="font-medium">{formatCurrency(orderTotal)}</span>
                <span className="text-muted-foreground"> with </span>
                <span className="font-medium">{depositPercent}%</span>
                <span className="text-muted-foreground"> deposit</span>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Payment Schedule
              </div>
              <ScheduleTimeline
                payments={payments}
                highlightDate={
                  scheduleType === 'acf-date'
                    ? eventDate
                    : scheduleType === 'due-by'
                      ? dueDate
                      : undefined
                }
              />
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
