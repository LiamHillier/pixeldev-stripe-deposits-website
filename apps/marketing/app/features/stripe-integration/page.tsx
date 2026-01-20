import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BanknoteIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  LinkIcon,
  ShieldCheckIcon,
  ZapIcon
} from 'lucide-react';

import { APP_NAME } from '@workspace/common/app';
import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';
import { CTA } from '~/components/sections/cta';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Stripe Integration'),
  description:
    'Process WooCommerce payment plans through Stripe. Accept cards, ACH bank transfers, and Stripe Link with lower fees than BNPL services.'
};

const PAYMENT_METHODS = [
  {
    icon: <CreditCardIcon className="size-6 shrink-0" />,
    title: 'Credit & Debit Cards',
    description:
      'Accept all major cards including Visa, Mastercard, American Express, and Discover. Stripe handles PCI compliance so you don\'t have to.',
    fee: '2.9% + 30¢'
  },
  {
    icon: <BanknoteIcon className="size-6 shrink-0" />,
    title: 'ACH Bank Transfers',
    description:
      'Let customers pay directly from their bank account. Lower fees make this ideal for high-value purchases and recurring payments.',
    fee: '0.8% (max $5)'
  },
  {
    icon: <LinkIcon className="size-6 shrink-0" />,
    title: 'Stripe Link',
    description:
      'One-click checkout for returning customers. Stripe Link saves payment details securely for faster future purchases.',
    fee: 'Same as card rates'
  }
];

const COMPARISON = [
  { feature: 'Processing Fee', stripe: '2.9% + 30¢', bnpl: '4-8%' },
  { feature: 'Application Fee', stripe: '0-2%*', bnpl: 'Included in rate' },
  { feature: '$2,000 Order Fee', stripe: '$58.30 - $98.30', bnpl: '$80-160' },
  { feature: 'Payment Terms', stripe: 'You control', bnpl: 'They control' },
  { feature: 'Customer Data', stripe: 'You own it', bnpl: 'Shared/limited' },
  { feature: 'Branding', stripe: 'Your brand', bnpl: 'Their branding' },
  { feature: 'Payout Timing', stripe: '2-day rolling', bnpl: 'Varies' }
];

const FEATURES = [
  'Uses your existing Stripe account',
  'No additional merchant accounts needed',
  'Automatic payment retry on failure',
  'Real-time payment notifications',
  'Stripe Dashboard for all transactions',
  'PCI DSS Level 1 compliant'
];

export default function StripeIntegrationPage(): React.JSX.Element {
  return (
    <>
      <GridSection>
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Powered by Stripe
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              {APP_NAME} uses your existing Stripe account to process payments.
              Accept cards, ACH transfers, and Stripe Link—all at standard
              Stripe rates, not inflated BNPL fees.
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
            Multiple Payment Methods
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Give customers flexibility in how they pay. Support for cards, bank
            transfers, and one-click checkout.
          </p>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.title}
                className="rounded-xl border bg-background p-6"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-muted">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold">{method.title}</h3>
                <p className="mt-2 text-muted-foreground">{method.description}</p>
                <div className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {method.fee}
                </div>
              </div>
            ))}
          </div>
        </div>
      </GridSection>

      <GridSection className="bg-muted/30">
        <div className="container py-20">
          <h2 className="text-center text-3xl font-semibold">
            Compare: Stripe vs BNPL Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            See why using your own Stripe account beats Afterpay, Klarna, and
            other BNPL services.
          </p>
          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-xl border bg-background">
            <div className="grid grid-cols-3 gap-4 border-b bg-muted p-4 text-sm font-medium">
              <div>Feature</div>
              <div className="text-center text-primary">Stripe + {APP_NAME}</div>
              <div className="text-center text-muted-foreground">BNPL Services</div>
            </div>
            {COMPARISON.map((row, index) => (
              <div
                key={row.feature}
                className={cn(
                  'grid grid-cols-3 gap-4 p-4 text-sm',
                  index !== COMPARISON.length - 1 && 'border-b'
                )}
              >
                <div className="font-medium">{row.feature}</div>
                <div className="text-center font-medium text-primary">
                  {row.stripe}
                </div>
                <div className="text-center text-muted-foreground">
                  {row.bnpl}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            *Application fee: Free plan 2%, Pro $99/yr 1%, Business $199/yr 0%
          </p>
        </div>
      </GridSection>

      <GridSection>
        <div className="container py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold">
                Enterprise-Grade Security
              </h2>
              <p className="mt-4 text-muted-foreground">
                Stripe is PCI DSS Level 1 certified—the highest level of
                certification in the payments industry. Your customers' payment
                data is always secure.
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
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border bg-background p-6 text-center">
                  <ShieldCheckIcon className="mx-auto size-10 text-primary" />
                  <div className="mt-3 text-sm font-medium">PCI Compliant</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Level 1 Certified
                  </div>
                </div>
                <div className="rounded-xl border bg-background p-6 text-center">
                  <ZapIcon className="mx-auto size-10 text-primary" />
                  <div className="mt-3 text-sm font-medium">Fast Payouts</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    2-day rolling
                  </div>
                </div>
                <div className="rounded-xl border bg-background p-6 text-center">
                  <CreditCardIcon className="mx-auto size-10 text-primary" />
                  <div className="mt-3 text-sm font-medium">200+ Countries</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Global reach
                  </div>
                </div>
                <div className="rounded-xl border bg-background p-6 text-center">
                  <BanknoteIcon className="mx-auto size-10 text-primary" />
                  <div className="mt-3 text-sm font-medium">135+ Currencies</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Local payments
                  </div>
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
