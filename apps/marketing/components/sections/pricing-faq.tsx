import * as React from 'react';
import Link from 'next/link';

import { APP_NAME } from '@workspace/common/app';
import { routes } from '@workspace/routes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';

import { GridSection } from '~/components/fragments/grid-section';

const DATA = [
  {
    question: `What plans does ${APP_NAME} offer?`,
    answer: (
      <div>
        We offer three plans designed for different business sizes:
        <br />
        <ul className="mt-2 list-disc pl-5">
          <li>
            <strong>Free:</strong> $0/year with a 2% transaction fee - perfect
            for testing or low volume stores
          </li>
          <li>
            <strong>Pro:</strong> $99/year with a 1% transaction fee - ideal for
            small stores
          </li>
          <li>
            <strong>Business:</strong> $199/year with 0% transaction fee - best
            for growing stores with higher volume
          </li>
        </ul>
      </div>
    )
  },
  {
    question: "What's the transaction fee?",
    answer: (
      <div>
        The transaction fee is a percentage of each payment processed through
        your payment plans:
        <ul className="mt-2 list-disc pl-5">
          <li>
            <strong>Free plan:</strong> 2% per transaction
          </li>
          <li>
            <strong>Pro plan:</strong> 1% per transaction
          </li>
          <li>
            <strong>Business plan:</strong> 0% per transaction
          </li>
        </ul>
        <p className="mt-2">
          This fee is separate from Stripe's standard processing fees.
        </p>
      </div>
    )
  },
  {
    question: 'When should I upgrade?',
    answer: (
      <div>
        Here's a quick break-even calculation:
        <ul className="mt-2 list-disc pl-5">
          <li>
            <strong>Free → Pro ($99/year):</strong> Worth it if you process more
            than ~$10,000/year (1% savings on $10k = $100)
          </li>
          <li>
            <strong>Pro → Business ($199/year):</strong> Worth it if you process
            more than ~$10,000/year (1% savings on $10k = $100 difference from
            Pro)
          </li>
        </ul>
        <p className="mt-2">
          As your store grows, upgrading saves you money in the long run.
        </p>
      </div>
    )
  },
  {
    question: 'What features are included?',
    answer: (
      <div>
        All plans include the full feature set:
        <ul className="mt-2 list-disc pl-5">
          <li>Unlimited payment plans</li>
          <li>20+ condition types</li>
          <li>All schedule types</li>
          <li>Direct Stripe integration</li>
          <li>Customer payment portal</li>
          <li>Automatic payment retries</li>
          <li>Email notifications</li>
          <li>Priority email support</li>
          <li>Webhook integration</li>
        </ul>
        <p className="mt-2">
          The only difference between plans is the transaction fee.
        </p>
      </div>
    )
  },
  {
    question: 'How does billing work?',
    answer: (
      <p>
        All paid plans are billed yearly. You'll be charged once per year for
        your subscription, and your transaction fees are calculated based on
        your plan's rate.
      </p>
    )
  },
  {
    question: 'Can I switch plans?',
    answer: (
      <p>
        Yes, you can upgrade or downgrade at any time. When you upgrade, you'll
        pay a prorated amount for the remainder of your billing cycle. When you
        downgrade, the change takes effect at the end of your current billing
        period.
      </p>
    )
  },
  {
    question: 'What payment methods are accepted?',
    answer: (
      <p>
        We use Stripe for secure payment processing. You can pay with any major
        credit card (Visa, Mastercard, American Express) or other payment
        methods supported by Stripe in your region.
      </p>
    )
  }
];

export function PricingFAQ(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="text-center lg:text-left">
            <h2 className="mb-2.5 text-3xl font-semibold md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-6 hidden text-muted-foreground md:block lg:max-w-[75%]">
              Have questions about our pricing or plans?{' '}
              <Link
                href={routes.marketing.Contact}
                className="font-normal text-inherit underline hover:text-foreground"
              >
                Contact us
              </Link>{' '}
              - we're here to help you find the perfect fit for your needs.
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-xl flex-col">
            <Accordion
              type="single"
              collapsible
            >
              {DATA.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={index.toString()}
                >
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </GridSection>
  );
}
