'use client';

import * as React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

import { APP_NAME } from '@workspace/common/app';
import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';
import { Marquee } from '~/components/fragments/marquee';

const DATA = [
  {
    name: 'Carlos Rivera',
    role: 'Owner at Coastal Adventures Tours',
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
    description: (
      <p>
        {APP_NAME} transformed our booking process.{' '}
        <strong>
          We went from losing 30% of bookings to cart abandonment to converting 85% with deposit options.
        </strong>{' '}
        The event-date scheduling is perfect for our multi-day tours.
      </p>
    )
  },
  {
    name: 'Jennifer Walsh',
    role: 'Events Director at Riverside Venue',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
    description: (
      <p>
        Managing wedding deposits used to be a nightmare of spreadsheets and manual follow-ups.{' '}
        <strong>Now everything is automated—we save 10+ hours per week on payment management.</strong>{' '}
        The customer portal is a huge hit with our couples.
      </p>
    )
  },
  {
    name: 'Michael Torres',
    role: 'Owner at Heritage Furniture Co.',
    img: 'https://randomuser.me/api/portraits/men/67.jpg',
    description: (
      <p>
        Custom furniture orders require deposits, but BNPL services were eating our margins.{' '}
        <strong>
          Switching to {APP_NAME} saved us over $15,000 in fees last year.
        </strong>{' '}
        The condition rules let us offer deposits only on orders over $500.
      </p>
    )
  },
  {
    name: 'Amanda Chen',
    role: 'Wedding Photographer',
    img: 'https://randomuser.me/api/portraits/women/28.jpg',
    description: (
      <p>
        {APP_NAME} handles my 50% booking deposit and final payment before the wedding date automatically.{' '}
        <strong>
          No more awkward payment conversations with clients.
        </strong>{' '}
        The automated reminders mean I always get paid on time.
      </p>
    )
  },
  {
    name: 'David Larsson',
    role: 'Manager at Summit Outdoor Gear',
    img: 'https://randomuser.me/api/portraits/men/52.jpg',
    description: (
      <p>
        High-end camping and climbing gear means high cart values.{' '}
        <strong>
          Offering payment plans increased our average order value by 40%.
        </strong>{' '}
        ACH support is great for customers who want to avoid credit card interest.
      </p>
    )
  },
  {
    name: 'Rachel Morrison',
    role: 'Owner at Artisan Workshop Studio',
    img: 'https://randomuser.me/api/portraits/women/63.jpg',
    description: (
      <p>
        My custom woodworking classes need deposits to reserve spots and cover materials.{' '}
        <strong>
          The product category conditions let me require deposits only for workshop bookings.
        </strong>{' '}
        Setup took less than an hour.
      </p>
    )
  },
  {
    name: 'Marcus Thompson',
    role: 'Owner at Thompson Fine Jewelry',
    img: 'https://randomuser.me/api/portraits/men/22.jpg',
    description: (
      <p>
        Custom engagement rings often run $5,000+. Customers love being able to put down 30% and pay the rest over time.{' '}
        <strong>
          Our conversion rate on custom pieces jumped 60% after adding payment plans.
        </strong>{' '}
        Worth every penny.
      </p>
    )
  },
  {
    name: 'Sarah Mitchell',
    role: 'Director at Wanderlust Travel Co.',
    img: 'https://randomuser.me/api/portraits/women/33.jpg',
    description: (
      <p>
        Group travel packages can be $3,000-10,000 per person. {APP_NAME} lets us collect deposits at booking and final payment 30 days before departure.{' '}
        <strong>
          We've eliminated the spreadsheet chaos completely.
        </strong>
      </p>
    )
  },
  {
    name: 'James Park',
    role: 'Owner at Harmony Music Store',
    img: 'https://randomuser.me/api/portraits/men/75.jpg',
    description: (
      <p>
        High-end guitars and keyboards aren't impulse purchases.{' '}
        <strong>
          Offering 4-payment plans helped us compete with big box stores while keeping our margins intact.
        </strong>{' '}
        The Stripe integration was seamless.
      </p>
    )
  },
  {
    name: 'Lisa Hernandez',
    role: 'Owner at Bella Catering',
    img: 'https://randomuser.me/api/portraits/women/55.jpg',
    description: (
      <p>
        Catering deposits used to require manual invoicing and constant follow-ups.{' '}
        <strong>
          Now clients book online, pay their deposit, and get automatic reminders for the balance.
        </strong>{' '}
        Game changer for event season.
      </p>
    )
  },
  {
    name: 'Robert Williams',
    role: 'Breeder at Golden Valley Kennels',
    img: 'https://randomuser.me/api/portraits/men/41.jpg',
    description: (
      <p>
        Puppy deposits secure spots in upcoming litters. {APP_NAME} handles the waiting list deposits and final payments perfectly.{' '}
        <strong>
          The customer portal lets families track their payment schedule easily.
        </strong>
      </p>
    )
  },
  {
    name: 'Nicole Foster',
    role: 'Manager at Iron Peak Fitness Equipment',
    img: 'https://randomuser.me/api/portraits/women/71.jpg',
    description: (
      <p>
        Commercial gym equipment runs $2,000-15,000 per piece.{' '}
        <strong>
          Payment plans opened up a whole new customer segment—home gym builders who couldn't afford everything upfront.
        </strong>{' '}
        Revenue is up 35%.
      </p>
    )
  },
  {
    name: 'Thomas Bradley',
    role: 'Owner at Bradley Home Renovations',
    img: 'https://randomuser.me/api/portraits/men/36.jpg',
    description: (
      <p>
        Kitchen and bath remodels need structured payment schedules—deposit, mid-project, and completion.{' '}
        <strong>
          {APP_NAME} automated what used to take hours of manual invoicing each week.
        </strong>{' '}
        Clients love the transparency.
      </p>
    )
  },
  {
    name: 'Emily Watson',
    role: 'Gallery Director at Modern Art Collective',
    img: 'https://randomuser.me/api/portraits/women/17.jpg',
    description: (
      <p>
        Art collectors often need time to arrange funds for significant pieces.{' '}
        <strong>
          Offering discreet payment plans has helped us close sales on works over $10,000 that would have otherwise walked.
        </strong>
      </p>
    )
  },
  {
    name: 'Kevin O\'Brien',
    role: 'Owner at Lakeside Boat Sales',
    img: 'https://randomuser.me/api/portraits/men/59.jpg',
    description: (
      <p>
        Boat deposits hold inventory during the buying process.{' '}
        <strong>
          The due-by-date scheduling lets us align payments with marine survey and sea trial milestones.
        </strong>{' '}
        Much better than our old paper system.
      </p>
    )
  },
  {
    name: 'Diana Cruz',
    role: 'Owner at Elite Tutoring Academy',
    img: 'https://randomuser.me/api/portraits/women/82.jpg',
    description: (
      <p>
        Semester-long tutoring packages are easier to sell with payment plans.{' '}
        <strong>
          Parents appreciate splitting $2,400 into 4 monthly payments instead of paying upfront.
        </strong>{' '}
        Enrollment increased 45% this year.
      </p>
    )
  },
  {
    name: 'Brian Foster',
    role: 'Owner at Crystal Clear Pools',
    img: 'https://randomuser.me/api/portraits/men/84.jpg',
    description: (
      <p>
        Pool installations are $40,000+ projects. We collect deposits at contract signing, then payments at excavation, plumbing, and completion.{' '}
        <strong>
          {APP_NAME} handles the whole schedule automatically.
        </strong>{' '}
        No more chasing payments.
      </p>
    )
  }
];

export function Testimonials(): React.JSX.Element {
  return (
    <GridSection hideVerticalGridLines>
      <div className="container border-x py-20 md:border-none">
        <h2 className="mb-8 text-center text-3xl font-semibold md:text-5xl lg:text-left">
          Trusted by WooCommerce Store Owners
        </h2>
        <div className="relative mt-6 max-h-[640px] overflow-hidden">
          <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
            {Array(Math.ceil(DATA.length / 3))
              .fill(0)
              .map((_, i) => (
                <Marquee
                  vertical
                  key={i}
                  className={cn({
                    '[--duration:60s]': i === 1,
                    '[--duration:30s]': i === 2,
                    '[--duration:70s]': i === 3
                  })}
                >
                  {DATA.slice(i * 3, (i + 1) * 3).map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: Math.random() * 0.4,
                        duration: 1
                      }}
                      className="mb-4 flex w-full break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl border bg-background p-4 dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
                    >
                      <div className="select-none text-sm font-normal text-muted-foreground">
                        {testimonial.description}
                        <div className="flex flex-row py-1">
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                        </div>
                      </div>
                      <div className="flex w-full select-none items-center justify-start gap-5">
                        <Image
                          width={40}
                          height={40}
                          src={testimonial.img || ''}
                          alt={testimonial.name}
                          className="size-8 rounded-full ring-1 ring-border ring-offset-4"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {testimonial.name}
                          </p>
                          <p className="text-xs font-normal text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </Marquee>
              ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-linear-to-t from-background from-20%" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-linear-to-b from-background from-20%" />
        </div>
      </div>
    </GridSection>
  );
}
