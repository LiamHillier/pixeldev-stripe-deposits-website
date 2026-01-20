'use client';

import * as React from 'react';
import {
  ShoppingCartIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  LockIcon
} from 'lucide-react';
import { motion } from 'motion/react';

import {
  MockupCard,
  MockupCardHeader,
  MockupCardTitle,
  MockupCardContent,
  MockupButton,
  MockupBadge,
  MockupInput,
  MockupLabel
} from '../primitives';
import { FeatureTooltip } from '../tooltip/feature-tooltip';
import { tooltipContent } from '../tooltip/tooltip-content';

const mockCheckoutData = {
  items: [
    { name: 'Custom Oak Dining Table', price: '$1,200.00', quantity: 1 },
    { name: 'Matching Chair Set (4)', price: '$600.00', quantity: 1 }
  ],
  subtotal: '$1,800.00',
  shipping: '$0.00',
  total: '$1,800.00',
  deposit: '$540.00',
  depositPercent: '30%',
  installments: [
    { number: 1, amount: '$420.00', date: 'Feb 15, 2025' },
    { number: 2, amount: '$420.00', date: 'Mar 15, 2025' },
    { number: 3, amount: '$420.00', date: 'Apr 15, 2025' }
  ]
};

function OrderSummary(): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Order Summary</div>
      <div className="space-y-2">
        {mockCheckoutData.items.map((item, index) => (
          <div key={index} className="flex items-start justify-between text-xs">
            <div className="flex-1">
              <span className="text-foreground">{item.name}</span>
              <span className="text-muted-foreground"> x{item.quantity}</span>
            </div>
            <span className="font-medium">{item.price}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{mockCheckoutData.subtotal}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Shipping</span>
          <span>{mockCheckoutData.shipping}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold pt-1 border-t">
          <span>Total</span>
          <span>{mockCheckoutData.total}</span>
        </div>
      </div>
    </div>
  );
}

function PaymentPlanOption(): React.JSX.Element {
  return (
    <FeatureTooltip
      title={tooltipContent.checkout.paymentPlanOption.title}
      description={tooltipContent.checkout.paymentPlanOption.description}
      indicatorPosition="top-right"
    >
      <div className="rounded-lg border-2 border-primary bg-primary/5 p-3">
        <div className="flex items-start gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckIcon className="h-3 w-3" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pay with Payment Plan</span>
              <MockupBadge variant="info">30% Deposit</MockupBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              Pay {mockCheckoutData.deposit} today, then 3 monthly payments of $420.00
            </p>
          </div>
        </div>
      </div>
    </FeatureTooltip>
  );
}

function PaymentSchedulePreview(): React.JSX.Element {
  return (
    <FeatureTooltip
      title={tooltipContent.checkout.schedulePreview.title}
      description={tooltipContent.checkout.schedulePreview.description}
      indicatorPosition="top-right"
    >
      <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium">
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          Payment Schedule
        </div>

        <div className="space-y-2">
          <FeatureTooltip
            title={tooltipContent.checkout.depositPayment.title}
            description={tooltipContent.checkout.depositPayment.description}
            showIndicator={false}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                1
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">Deposit</div>
                <div className="text-[10px] text-muted-foreground">Due today at checkout</div>
              </div>
              <div className="text-xs font-semibold text-primary">{mockCheckoutData.deposit}</div>
            </div>
          </FeatureTooltip>

          {mockCheckoutData.installments.map((installment, index) => (
            <div key={installment.number} className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-background text-[10px] font-medium">
                {installment.number + 1}
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">Payment {installment.number}</div>
                <div className="text-[10px] text-muted-foreground">{installment.date}</div>
              </div>
              <div className="text-xs font-medium">{installment.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </FeatureTooltip>
  );
}

function PaymentForm(): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
        Payment Details
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <MockupLabel className="text-xs">Card Number</MockupLabel>
          <MockupInput value="4242 4242 4242 4242" className="font-mono" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <MockupLabel className="text-xs">Expiry</MockupLabel>
            <MockupInput value="12/26" />
          </div>
          <div className="space-y-1.5">
            <MockupLabel className="text-xs">CVC</MockupLabel>
            <MockupInput value="***" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutMockup(): React.JSX.Element {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MockupCard className="overflow-hidden h-full">
          <MockupCardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
              <MockupCardTitle>Checkout</MockupCardTitle>
            </div>
          </MockupCardHeader>
          <MockupCardContent className="p-4 space-y-4">
            <OrderSummary />

            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-3">Payment Option</div>
              <div className="space-y-2">
                <div className="rounded-lg border p-3 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2" />
                    <span className="text-sm">Pay in Full - {mockCheckoutData.total}</span>
                  </div>
                </div>
                <PaymentPlanOption />
              </div>
            </div>
          </MockupCardContent>
        </MockupCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="space-y-4"
      >
        <MockupCard>
          <MockupCardContent className="p-4 space-y-4">
            <PaymentSchedulePreview />
            <PaymentForm />

            <FeatureTooltip
              title={tooltipContent.checkout.placeOrder.title}
              description={tooltipContent.checkout.placeOrder.description}
              indicatorPosition="top-left"
            >
              <MockupButton className="w-full h-10">
                <LockIcon className="h-3.5 w-3.5" />
                Pay {mockCheckoutData.deposit} Deposit
                <ChevronRightIcon className="h-3.5 w-3.5 ml-auto" />
              </MockupButton>
            </FeatureTooltip>

            <p className="text-[10px] text-center text-muted-foreground">
              Secure checkout powered by Stripe. Your card will be saved for future payments.
            </p>
          </MockupCardContent>
        </MockupCard>
      </motion.div>
    </div>
  );
}
