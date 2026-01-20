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
    question: `What does ${APP_NAME} do?`,
    answer: `${APP_NAME} is a WooCommerce plugin that lets you accept deposit payments and create automated payment plans. Customers pay a deposit at checkout, and the remaining balance is automatically charged according to your schedule—whether that's fixed installments, event-date-based payments, or due-by-date schedules.`
  },
  {
    question: 'How is this different from Afterpay or Klarna?',
    answer: `Unlike BNPL services that charge 4-8% per transaction and control your payment terms, ${APP_NAME} uses your existing Stripe account at standard processing rates (typically 2.9% + 30¢). You keep full control over deposit amounts, payment schedules, and which products or customers qualify for payment plans.`
  },
  {
    question: 'What payment methods are supported?',
    answer: `${APP_NAME} supports all payment methods available through Stripe, including credit/debit cards, ACH bank transfers, and Stripe Link for faster checkout. ACH transfers offer lower processing fees, making them ideal for high-value purchases.`
  },
  {
    question: 'What schedule types are available?',
    answer: `Three schedule types are available: Fixed Installments (split payments into equal amounts over time), Event Date-Based (schedule payments relative to a booking or event date), and Due-By-Date (set specific dates for each payment). Each can be customized to fit your business model.`
  },
  {
    question: 'How do conditions work?',
    answer: `Conditions let you target which carts, products, or customers see deposit options. With 20+ condition types, you can require deposits only for orders over a certain amount, specific product categories, customer roles, geographic regions, or time-based rules. Combine multiple conditions with AND/OR logic for precise targeting.`
  },
  {
    question: 'What happens if a payment fails?',
    answer: `Stripe automatically retries failed payments and sends reminder emails to customers. You get full visibility into payment statuses through the admin dashboard, and can track which payments succeeded, failed, or are pending retry.`
  }
];

export function FAQ(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="text-center lg:text-left">
            <h2 className="mb-2.5 text-3xl font-semibold md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-6 hidden text-muted-foreground md:block lg:max-w-[75%]">
              Haven't found what you're looking for? Try{' '}
              <Link
                href={routes.marketing.Contact}
                className="font-normal text-inherit underline hover:text-foreground"
              >
                contacting
              </Link>{' '}
              us, we are glad to help.
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
