'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Slider } from '@workspace/ui/components/slider';
import { Switch } from '@workspace/ui/components/switch';
import { cn } from '@workspace/ui/lib/utils';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function DepositCalculator(): React.JSX.Element {
  const [orderTotal, setOrderTotal] = React.useState(500);
  const [depositType, setDepositType] = React.useState<'percentage' | 'fixed'>(
    'percentage'
  );
  const [depositPercentage, setDepositPercentage] = React.useState(20);
  const [depositFixed, setDepositFixed] = React.useState(100);
  const [paymentCount, setPaymentCount] = React.useState('4');

  const deposit =
    depositType === 'percentage'
      ? orderTotal * (depositPercentage / 100)
      : Math.min(depositFixed, orderTotal);

  const remaining = Math.max(0, orderTotal - deposit);
  const installmentAmount = remaining / parseInt(paymentCount, 10);

  return (
    <Card className="not-prose my-6">
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="order-total">Order Total</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="order-total"
                  type="number"
                  min={0}
                  step={50}
                  value={orderTotal}
                  onChange={(e) =>
                    setOrderTotal(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="deposit-type">Deposit Type</Label>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-sm',
                      depositType === 'percentage'
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    Percentage
                  </span>
                  <Switch
                    id="deposit-type"
                    checked={depositType === 'fixed'}
                    onCheckedChange={(checked) =>
                      setDepositType(checked ? 'fixed' : 'percentage')
                    }
                  />
                  <span
                    className={cn(
                      'text-sm',
                      depositType === 'fixed'
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    Fixed
                  </span>
                </div>
              </div>

              {depositType === 'percentage' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Deposit Percentage
                    </span>
                    <Badge variant="secondary">{depositPercentage}%</Badge>
                  </div>
                  <Slider
                    value={[depositPercentage]}
                    onValueChange={([value]) => setDepositPercentage(value)}
                    min={5}
                    max={50}
                    step={5}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="deposit-fixed">Fixed Deposit Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="deposit-fixed"
                      type="number"
                      min={0}
                      step={25}
                      value={depositFixed}
                      onChange={(e) =>
                        setDepositFixed(
                          Math.max(0, parseFloat(e.target.value) || 0)
                        )
                      }
                      className="pl-7"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-count">Number of Payments</Label>
              <Select value={paymentCount} onValueChange={setPaymentCount}>
                <SelectTrigger id="payment-count" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 payments</SelectItem>
                  <SelectItem value="4">4 payments</SelectItem>
                  <SelectItem value="6">6 payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Order Total
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(orderTotal)}
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-primary">Due Today</div>
                    <div className="text-xs text-muted-foreground">
                      {depositType === 'percentage'
                        ? `${depositPercentage}% deposit`
                        : 'Fixed deposit'}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(deposit)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Each Installment</div>
                    <div className="text-xs text-muted-foreground">
                      {paymentCount} payments
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    {formatCurrency(installmentAmount)}
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="rounded-md bg-background p-3 text-center text-sm">
                <span className="text-muted-foreground">Remaining: </span>
                <span className="font-medium">{formatCurrency(remaining)}</span>
                <span className="text-muted-foreground"> split into </span>
                <span className="font-medium">{paymentCount}</span>
                <span className="text-muted-foreground"> payments</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
