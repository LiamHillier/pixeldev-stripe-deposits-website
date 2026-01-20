import * as React from 'react';
import { BanknoteIcon, ShoppingCartIcon, SlidersHorizontalIcon } from 'lucide-react';

import { BlurFade } from '~/components/fragments/blur-fade';
import { GridSection } from '~/components/fragments/grid-section';
import { TextGenerateWithSelectBoxEffect } from '~/components/fragments/text-generate-with-select-box-effect';

const DATA = [
  {
    icon: <BanknoteIcon className="size-5 shrink-0" />,
    title: 'BNPL Services Are Expensive',
    description:
      'Afterpay, Klarna, and Affirm charge 4-8% per transaction. For a $2,000 booking, that\'s $80-160 in fees. Our plugin uses your existing Stripe account at standard rates.'
  },
  {
    icon: <ShoppingCartIcon className="size-5 shrink-0" />,
    title: 'Cart Abandonment on High-Ticket Items',
    description:
      'Customers abandon carts when they can\'t afford the full price upfront. Without deposit options, you lose sales to competitors offering payment flexibility.'
  },
  {
    icon: <SlidersHorizontalIcon className="size-5 shrink-0" />,
    title: 'No Control Over Payment Terms',
    description:
      'Generic BNPL services dictate your payment terms. You can\'t customize schedules around event dates, seasonal needs, or customer segments.'
  }
];

export function Problem(): React.JSX.Element {
  return (
    <GridSection>
      <div className="px-4 py-20 text-center">
        <h2 className="text-3xl font-semibold md:text-5xl">
          <TextGenerateWithSelectBoxEffect words="High-Value Sales Deserve Better Payment Options" />
        </h2>
      </div>
      <div className="grid divide-y border-t border-dashed md:grid-cols-3 md:divide-x md:divide-y-0">
        {DATA.map((statement, index) => (
          <BlurFade
            key={index}
            inView
            delay={0.2 + index * 0.2}
            className="border-dashed px-8 py-12"
          >
            <div className="mb-7 flex size-12 items-center justify-center rounded-2xl border bg-background shadow">
              {statement.icon}
            </div>
            <h3 className="mb-3 text-lg font-semibold">{statement.title}</h3>
            <p className="text-muted-foreground">{statement.description}</p>
          </BlurFade>
        ))}
      </div>
    </GridSection>
  );
}
