'use client';

import * as React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

const orderTotal = 500;
const depositPercent = 20;
const paymentCount = 3;

export function PaymentPlanCard(): React.JSX.Element {
  const [paymentOption, setPaymentOption] = React.useState<'full' | 'plan'>(
    'full'
  );

  const deposit = orderTotal * (depositPercent / 100);
  const remaining = orderTotal - deposit;
  const installmentAmount = remaining / paymentCount;

  const today = new Date();
  const installments = Array.from({ length: paymentCount }, (_, i) => ({
    date: addMonths(today, i + 1),
    amount: installmentAmount
  }));

  return (
    <Card className="not-prose my-6">
      <CardContent className="pt-6">
        <h3 className="text-base font-semibold mb-4">
          How would you like to pay?
        </h3>

        <div className="space-y-3">
          {/* Pay in Full Option */}
          <label
            className={cn(
              'flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all',
              paymentOption === 'full'
                ? 'border-blue-500 shadow-[0_0_0_1px_rgb(37,99,235)]'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <div
              className={cn(
                'h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center shrink-0',
                paymentOption === 'full'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-muted-foreground/50'
              )}
            >
              {paymentOption === 'full' && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
            <input
              type="radio"
              name="payment_option"
              value="full"
              checked={paymentOption === 'full'}
              onChange={() => setPaymentOption('full')}
              className="sr-only"
            />
            <div className="flex-1 flex items-center justify-between">
              <span className="font-semibold">Pay in Full</span>
              <span className="font-semibold">{formatCurrency(orderTotal)}</span>
            </div>
          </label>

          {/* Payment Plan Option */}
          <label
            className={cn(
              'flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all',
              paymentOption === 'plan'
                ? 'border-blue-500 shadow-[0_0_0_1px_rgb(37,99,235)]'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <div
              className={cn(
                'h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center shrink-0',
                paymentOption === 'plan'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-muted-foreground/50'
              )}
            >
              {paymentOption === 'plan' && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
            <input
              type="radio"
              name="payment_option"
              value="plan"
              checked={paymentOption === 'plan'}
              onChange={() => setPaymentOption('plan')}
              className="sr-only"
            />
            <div className="flex-1">
              <span className="font-semibold">Furniture Payment Plan</span>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(deposit)} deposit + {paymentCount} payments
              </div>
            </div>
          </label>
        </div>

        {/* Payment Plan Summary */}
        {paymentOption === 'plan' && (
          <div className="mt-4 rounded-lg border bg-[#f9fafb] dark:bg-muted/30 p-4 space-y-4">
            <h4 className="font-semibold text-sm">Payment Plan Summary</h4>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit Today:</span>
                <span className="font-semibold">{formatCurrency(deposit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Remaining Payments:
                </span>
                <span className="font-semibold">
                  {paymentCount} monthly installments
                </span>
              </div>
            </div>

            <ul className="space-y-1.5 text-sm">
              {installments.map((installment, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {formatDate(installment.date)}:
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(installment.amount)}
                  </span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground pt-2 border-t">
              Payments will be automatically deducted from your payment method
              on the scheduled dates.
            </p>
          </div>
        )}

        {/* Due Today Notice */}
        {paymentOption === 'plan' && (
          <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Due Today
              </span>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                {formatCurrency(deposit)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
