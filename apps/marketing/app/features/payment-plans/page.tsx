import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CalendarClockIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  RepeatIcon
} from 'lucide-react';

import { APP_NAME } from '@workspace/common/app';
import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';
import { CTA } from '~/components/sections/cta';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Payment Schedules'),
  description:
    'Create automated WooCommerce payment plans with 3 schedule types. Fixed installments, event-based, and due-by-date schedules for flexible payment collection.'
};

const SCHEDULE_TYPES = [
  {
    icon: <RepeatIcon className="size-6 shrink-0" />,
    title: 'Fixed Installments',
    description:
      'Split the remaining balance into equal payments over a set number of installments. Perfect for spreading costs over weeks or months.',
    example: '4 payments of $150 every 2 weeks'
  },
  {
    icon: <CalendarDaysIcon className="size-6 shrink-0" />,
    title: 'Event Date-Based',
    description:
      'Schedule payments relative to a booking or event date. Collect final payment 7 days before the event, 50% at 30 days, etc.',
    example: '50% at booking, 50% 14 days before event'
  },
  {
    icon: <CalendarClockIcon className="size-6 shrink-0" />,
    title: 'Due-By-Date',
    description:
      'Set specific calendar dates for each payment. Ideal for seasonal businesses or when you need precise payment timing.',
    example: 'Balance due on Dec 1, Jan 1, Feb 1'
  }
];

const FEATURES = [
  'Automatic payment collection via Stripe',
  'Email reminders before payments due',
  'Retry failed payments automatically',
  'Customer portal for payment management',
  'Admin dashboard for oversight',
  'Detailed payment history tracking'
];

export default function PaymentPlansPage(): React.JSX.Element {
  return (
    <>
      <GridSection>
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Automated Payment Schedules
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Create payment plans that work for your business. {APP_NAME}{' '}
              automatically collects payments on schedule, sends reminders, and
              handles failed payments—so you can focus on your business.
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
          <h2 className="text-center text-3xl font-semibold">
            3 Flexible Schedule Types
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Choose the schedule type that fits your business model. Mix and
            match across different products or customer segments.
          </p>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {SCHEDULE_TYPES.map((schedule) => (
              <div
                key={schedule.title}
                className="rounded-xl border bg-background p-6"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-muted">
                  {schedule.icon}
                </div>
                <h3 className="text-xl font-semibold">{schedule.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {schedule.description}
                </p>
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Example:
                  </span>
                  <p className="mt-1 text-sm font-medium">{schedule.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GridSection>

      <GridSection className="bg-muted/30">
        <div className="container py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold">
                Set It and Forget It
              </h2>
              <p className="mt-4 text-muted-foreground">
                Once configured, {APP_NAME} handles everything automatically.
                Payments are collected on schedule, customers receive reminders,
                and you get notified of any issues.
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
            <div className="flex items-center justify-center rounded-xl border bg-background p-8">
              <div className="w-full max-w-sm space-y-3">
                <div className="text-sm font-medium">Payment Schedule</div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        1
                      </div>
                      <div>
                        <div className="text-sm font-medium">Deposit</div>
                        <div className="text-xs text-muted-foreground">
                          Due at checkout
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-primary">$200</div>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full border text-xs font-medium">
                        2
                      </div>
                      <div>
                        <div className="text-sm font-medium">Payment 2</div>
                        <div className="text-xs text-muted-foreground">
                          Due in 14 days
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">$200</div>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full border text-xs font-medium">
                        3
                      </div>
                      <div>
                        <div className="text-sm font-medium">Payment 3</div>
                        <div className="text-xs text-muted-foreground">
                          Due in 28 days
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">$200</div>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full border text-xs font-medium">
                        4
                      </div>
                      <div>
                        <div className="text-sm font-medium">Final Payment</div>
                        <div className="text-xs text-muted-foreground">
                          Due in 42 days
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">$200</div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-muted p-3 text-center">
                  <span className="text-sm text-muted-foreground">Total: </span>
                  <span className="font-semibold">$800.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GridSection>

      <CTA />
    </>
  );
}
