import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BoxIcon,
  CalendarIcon,
  CheckCircle2Icon,
  GlobeIcon,
  ShoppingCartIcon,
  TagIcon,
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
  title: createTitle('Condition Rules'),
  description:
    'Target payment plans with 20+ WooCommerce condition types. Cart, product, customer, geographic, and date/time conditions for precise deposit targeting.'
};

const CONDITION_CATEGORIES = [
  {
    icon: <ShoppingCartIcon className="size-5 shrink-0" />,
    title: 'Cart Conditions',
    conditions: [
      'Cart total (min/max)',
      'Cart item count',
      'Cart weight',
      'Coupon applied',
      'Shipping method'
    ]
  },
  {
    icon: <BoxIcon className="size-5 shrink-0" />,
    title: 'Product Conditions',
    conditions: [
      'Specific products',
      'Product categories',
      'Product tags',
      'Product type',
      'Stock status'
    ]
  },
  {
    icon: <UserIcon className="size-5 shrink-0" />,
    title: 'Customer Conditions',
    conditions: [
      'Customer role',
      'Order history',
      'Total spent',
      'Is logged in',
      'Customer email'
    ]
  },
  {
    icon: <GlobeIcon className="size-5 shrink-0" />,
    title: 'Geographic Conditions',
    conditions: [
      'Billing country',
      'Shipping country',
      'Billing state',
      'Shipping zone',
      'Postal code'
    ]
  },
  {
    icon: <CalendarIcon className="size-5 shrink-0" />,
    title: 'Date & Time Conditions',
    conditions: [
      'Specific dates',
      'Date range',
      'Day of week',
      'Time of day',
      'Before/after date'
    ]
  },
  {
    icon: <TagIcon className="size-5 shrink-0" />,
    title: 'Custom Conditions',
    conditions: [
      'Custom field values',
      'Meta data matching',
      'Booking dates',
      'Event fields',
      'Plugin integrations'
    ]
  }
];

const EXAMPLES = [
  {
    title: 'High-Value Orders Only',
    description: 'Only show deposit option for orders over $500',
    logic: 'Cart total >= $500'
  },
  {
    title: 'Wholesale Customers',
    description: 'Offer payment plans to wholesale customer role',
    logic: 'Customer role = Wholesale'
  },
  {
    title: 'Custom Furniture',
    description: 'Require deposits for made-to-order items',
    logic: 'Product category = Custom'
  },
  {
    title: 'International Orders',
    description: 'Different deposit terms for international shipping',
    logic: 'Shipping country != US'
  }
];

export default function ConditionsPage(): React.JSX.Element {
  return (
    <>
      <GridSection>
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Powerful Condition Rules
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Control exactly when deposits and payment plans are offered with
              20+ condition types. Target by cart value, product type, customer
              segment, location, and more.
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
            20+ Condition Types
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Build complex rules with AND/OR logic. Combine multiple conditions
            to target exactly the right orders for payment plans.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CONDITION_CATEGORIES.map((category) => (
              <div
                key={category.title}
                className="rounded-xl border bg-background p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold">{category.title}</h3>
                </div>
                <ul className="space-y-2">
                  {category.conditions.map((condition) => (
                    <li
                      key={condition}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </GridSection>

      <GridSection className="bg-muted/30">
        <div className="container py-20">
          <h2 className="text-center text-3xl font-semibold">
            Example Configurations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            See how other WooCommerce stores use conditions to target payment
            plans effectively.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {EXAMPLES.map((example) => (
              <div
                key={example.title}
                className="rounded-xl border bg-background p-6"
              >
                <h3 className="text-lg font-semibold">{example.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {example.description}
                </p>
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Condition:
                  </span>
                  <code className="mt-1 block text-sm font-mono">
                    {example.logic}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GridSection>

      <GridSection>
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold">Visual Condition Builder</h2>
            <p className="mt-4 text-muted-foreground">
              No coding required. {APP_NAME} includes a visual condition builder
              that makes it easy to create complex rules. Drag and drop
              conditions, set operators, and preview matches in real-time.
            </p>
            <div className="mt-8 rounded-xl border bg-muted/50 p-8">
              <div className="mx-auto max-w-md space-y-4">
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">IF</span>
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Cart Total
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded border px-2 py-1 text-xs">
                      is greater than
                    </span>
                    <span className="font-mono text-sm">$500</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    AND
                  </span>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">IF</span>
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      Product Category
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded border px-2 py-1 text-xs">
                      is one of
                    </span>
                    <span className="font-mono text-sm">Furniture, Custom</span>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-primary/10 p-3 text-center">
                  <span className="text-sm font-medium text-primary">
                    Then: Require 25% deposit
                  </span>
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
