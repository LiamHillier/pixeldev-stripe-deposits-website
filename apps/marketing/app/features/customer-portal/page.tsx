import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BellIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  HistoryIcon,
  MailIcon,
  UserIcon
} from 'lucide-react';

import { APP_NAME } from '@workspace/common/app';
import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';
import { CTA } from '~/components/sections/cta';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Customer Portal'),
  description:
    'Customer self-service portal for WooCommerce payment plans. View schedules, payment history, update payment methods, and receive automated reminders.'
};

const PORTAL_FEATURES = [
  {
    icon: <CalendarIcon className="size-6 shrink-0" />,
    title: 'View Payment Schedule',
    description:
      'Customers see their complete payment schedule including past payments, upcoming due dates, and remaining balance at a glance.'
  },
  {
    icon: <HistoryIcon className="size-6 shrink-0" />,
    title: 'Payment History',
    description:
      'Full transaction history with dates, amounts, and payment methods. Customers can download receipts for their records.'
  },
  {
    icon: <CreditCardIcon className="size-6 shrink-0" />,
    title: 'Update Payment Method',
    description:
      'Let customers update their card or bank account before a payment fails. Reduces failed payments and support requests.'
  },
  {
    icon: <BellIcon className="size-6 shrink-0" />,
    title: 'Payment Reminders',
    description:
      'Automated email reminders before payments are due. Configurable timing—3 days, 1 day, or day of payment.'
  }
];

const EMAIL_NOTIFICATIONS = [
  'Payment schedule confirmation',
  'Upcoming payment reminder',
  'Payment successful',
  'Payment failed',
  'Payment method expiring',
  'Schedule completed'
];

const ADMIN_FEATURES = [
  'View all payment plans',
  'Filter by status (active, completed, overdue)',
  'Manual payment processing',
  'Adjust payment schedules',
  'Send manual reminders',
  'Export payment data'
];

export default function CustomerPortalPage(): React.JSX.Element {
  return (
    <>
      <GridSection>
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Customer Self-Service Portal
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Give customers visibility into their payment plans without extra
              support requests. {APP_NAME} adds a payment schedule section to
              the WooCommerce My Account area.
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
            Everything Customers Need
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            A clean, intuitive interface that integrates seamlessly with your
            WooCommerce theme.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PORTAL_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-background p-6"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-muted">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
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
                Automated Email Notifications
              </h2>
              <p className="mt-4 text-muted-foreground">
                Keep customers informed at every step. All emails are
                customizable and match your WooCommerce email template.
              </p>
              <ul className="mt-8 space-y-4">
                {EMAIL_NOTIFICATIONS.map((notification) => (
                  <li key={notification} className="flex items-center gap-3">
                    <MailIcon className="size-5 shrink-0 text-primary" />
                    <span>{notification}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <BellIcon className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Payment Reminder</div>
                    <div className="text-xs text-muted-foreground">
                      From: Your Store
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium">Hi Sarah,</p>
                  <p className="mt-2 text-muted-foreground">
                    Your payment of <strong>$200.00</strong> for Order #1234 is
                    due in 3 days.
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    We'll automatically charge your card ending in 4242.
                  </p>
                  <div className="mt-4">
                    <span className="inline-block rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      View Payment Schedule
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GridSection>

      <GridSection>
        <div className="container py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="rounded-xl border bg-background p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Payment Plans</h3>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    12 Active
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <UserIcon className="size-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Order #1234</div>
                        <div className="text-xs text-muted-foreground">
                          Sarah Johnson
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">
                        $400 / $800
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2 of 4 paid
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <UserIcon className="size-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Order #1235</div>
                        <div className="text-xs text-muted-foreground">
                          Mike Chen
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">
                        $250 / $500
                      </div>
                      <div className="text-xs text-muted-foreground">
                        1 of 2 paid
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-amber-500/50 bg-amber-50 p-3 dark:bg-amber-950/20">
                    <div className="flex items-center gap-3">
                      <UserIcon className="size-5 text-amber-600" />
                      <div>
                        <div className="text-sm font-medium">Order #1236</div>
                        <div className="text-xs text-muted-foreground">
                          Emma Wilson
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-amber-600">
                        Overdue
                      </div>
                      <div className="text-xs text-muted-foreground">
                        $150 due
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-semibold">
                Admin Dashboard
              </h2>
              <p className="mt-4 text-muted-foreground">
                Full visibility into all payment plans from your WooCommerce
                admin. Filter, search, and manage payment schedules without
                leaving WordPress.
              </p>
              <ul className="mt-8 space-y-4">
                {ADMIN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2Icon className="size-5 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </GridSection>

      <CTA />
    </>
  );
}
