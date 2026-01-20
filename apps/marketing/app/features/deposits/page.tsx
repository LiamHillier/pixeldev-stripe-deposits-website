import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CalendarIcon,
  CheckCircle2Icon,
  PercentIcon,
  ShoppingCartIcon,
  TicketIcon,
  TruckIcon
} from 'lucide-react';

import { APP_NAME } from '@workspace/common/app';
import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';
import { CTA } from '~/components/sections/cta';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Deposit Payments'),
  description:
    'Accept deposit payments on your WooCommerce store with Stripe. Configure deposit amounts, use cases for tours, events, and custom products.'
};

const USE_CASES = [
  {
    icon: <TicketIcon className="size-6 shrink-0" />,
    title: 'Tours & Activities',
    description:
      'Secure bookings with deposits and collect final payments before the tour date. Perfect for day trips, multi-day adventures, and guided experiences.'
  },
  {
    icon: <CalendarIcon className="size-6 shrink-0" />,
    title: 'Events & Venues',
    description:
      'Lock in event bookings with non-refundable deposits. Schedule remaining payments around event milestones like tastings, rehearsals, or setup dates.'
  },
  {
    icon: <TruckIcon className="size-6 shrink-0" />,
    title: 'Custom & Made-to-Order',
    description:
      'Collect deposits before starting custom work. Use payment schedules to collect at design approval, production start, and delivery.'
  },
  {
    icon: <ShoppingCartIcon className="size-6 shrink-0" />,
    title: 'High-Value Products',
    description:
      'Make expensive items accessible with payment plans. Reduce cart abandonment by offering flexible payment options without BNPL fees.'
  }
];

const FEATURES = [
  'Fixed amount or percentage deposits',
  'Configurable per product or globally',
  'Works with WooCommerce Subscriptions',
  'Supports variable products',
  'Automatic balance calculations',
  'Deposit-only checkout option'
];

export default function DepositsPage(): React.JSX.Element {
  return (
    <>
      <GridSection>
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Accept Deposit Payments
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Let customers pay a deposit at checkout and complete the balance
              later. {APP_NAME} gives you complete control over deposit amounts,
              payment timing, and which products qualify.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href={routes.marketing.GetStarted}
                className={cn(buttonVariants({ variant: 'default' }), 'rounded-xl')}
              >
                Get Started Free
              </Link>
              <Link
                href={routes.marketing.Docs}
                className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl')}
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </GridSection>

      <GridSection>
        <div className="container py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold">
                Flexible Deposit Configuration
              </h2>
              <p className="mt-4 text-muted-foreground">
                Set deposits as a fixed amount or percentage of the order total.
                Configure different deposit rules for different products,
                categories, or customer types.
              </p>
              <ul className="mt-8 space-y-4">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2Icon className="size-5 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center rounded-xl border bg-muted/50 p-8">
              <div className="w-full max-w-sm space-y-4">
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Deposit Type</span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Percentage
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Deposit Amount</span>
                    <div className="flex items-center gap-1">
                      <PercentIcon className="size-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">25</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <div className="text-sm font-medium">Order Preview</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product Total</span>
                      <span>$800.00</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>Deposit Due Today</span>
                      <span className="font-semibold">$200.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance Due Later</span>
                      <span>$600.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GridSection>

      <GridSection className="bg-muted/30">
        <div className="container py-20">
          <h2 className="text-center text-3xl font-semibold">
            Perfect for These Use Cases
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            {APP_NAME} is built for WooCommerce stores selling high-value
            products, services, and experiences where deposits make sense.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((useCase) => (
              <div
                key={useCase.title}
                className="rounded-xl border bg-background p-6"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-muted">
                  {useCase.icon}
                </div>
                <h3 className="text-lg font-semibold">{useCase.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GridSection>

      <CTA />
    </>
  );
}
