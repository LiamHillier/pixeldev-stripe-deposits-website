import * as React from 'react';
import {
  BookIcon,
  BookOpenIcon,
  BoxIcon,
  CalendarIcon,
  CodeIcon,
  CreditCardIcon,
  CuboidIcon,
  FilterIcon,
  LayoutIcon,
  SendHorizonalIcon,
  UserIcon
} from 'lucide-react';

import { baseUrl, routes } from '@workspace/routes';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  XIcon
} from '@workspace/ui/components/brand-icons';

export const MENU_LINKS = [
  {
    title: 'Product',
    items: [
      {
        title: 'Deposit Payments',
        description: 'Accept deposits at checkout',
        icon: <BoxIcon className="size-5 shrink-0" />,
        href: '/features/deposits',
        external: false
      },
      {
        title: 'Payment Schedules',
        description: '3 flexible schedule types',
        icon: <CalendarIcon className="size-5 shrink-0" />,
        href: '/features/payment-plans',
        external: false
      },
      {
        title: 'Condition Rules',
        description: '20+ targeting conditions',
        icon: <FilterIcon className="size-5 shrink-0" />,
        href: '/features/conditions',
        external: false
      },
      {
        title: 'Stripe Integration',
        description: 'Cards, ACH, and Stripe Link',
        icon: <CreditCardIcon className="size-5 shrink-0" />,
        href: '/features/stripe-integration',
        external: false
      },
      {
        title: 'Customer Portal',
        description: 'Self-service payment management',
        icon: <UserIcon className="size-5 shrink-0" />,
        href: '/features/customer-portal',
        external: false
      }
    ]
  },
  {
    title: 'Resources',
    items: [
      {
        title: 'Contact',
        description: 'Reach out for assistance',
        icon: <SendHorizonalIcon className="size-5 shrink-0" />,
        href: routes.marketing.Contact,
        external: false
      },
      {
        title: 'Roadmap',
        description: 'See what is coming next',
        icon: <LayoutIcon className="size-5 shrink-0" />,
        href: routes.marketing.Roadmap,
        external: true
      },
      {
        title: 'Docs',
        description: 'Learn how to use our platform',
        icon: <BookOpenIcon className="size-5 shrink-0" />,
        href: routes.marketing.Docs,
        external: false
      },
      {
        title: 'API Reference',
        description: 'Build integrations with our API',
        icon: <CodeIcon className="size-5 shrink-0" />,
        href: baseUrl.PublicApi,
        external: true
      }
    ]
  },
  {
    title: 'Pricing',
    href: routes.marketing.Pricing,
    external: false
  },
  {
    title: 'Documentation',
    href: routes.marketing.Docs,
    external: false
  },
  {
    title: 'Contact',
    href: routes.marketing.Contact,
    external: false
  }
];

export const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { name: 'Deposit Payments', href: '/features/deposits', external: false },
      { name: 'Payment Schedules', href: '/features/payment-plans', external: false },
      { name: 'Condition Rules', href: '/features/conditions', external: false },
      { name: 'Stripe Integration', href: '/features/stripe-integration', external: false },
      { name: 'Customer Portal', href: '/features/customer-portal', external: false }
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Contact', href: routes.marketing.Contact, external: false },
      { name: 'Docs', href: routes.marketing.Docs, external: false }
    ]
  },
  {
    title: 'Legal',
    links: [
      {
        name: 'Terms of Use',
        href: routes.marketing.TermsOfUse,
        external: false
      },
      {
        name: 'Privacy Policy',
        href: routes.marketing.PrivacyPolicy,
        external: false
      },
      {
        name: 'Cookie Policy',
        href: routes.marketing.CookiePolicy,
        external: false
      }
    ]
  }
];

export const SOCIAL_LINKS = [
  {
    name: 'X (formerly Twitter)',
    href: '~/',
    icon: <XIcon className="size-4 shrink-0" />
  },
  {
    name: 'LinkedIn',
    href: '~/',
    icon: <LinkedInIcon className="size-4 shrink-0" />
  },
  {
    name: 'Facebook',
    href: '~/',
    icon: <FacebookIcon className="size-4 shrink-0" />
  },
  {
    name: 'Instagram',
    href: '~/',
    icon: <InstagramIcon className="size-4 shrink-0" />
  },
  {
    name: 'TikTok',
    href: '~/',
    icon: <TikTokIcon className="size-4 shrink-0" />
  }
];

export const DOCS_LINKS = [
  {
    title: 'Getting Started',
    icon: <CuboidIcon className="size-4 shrink-0 text-muted-foreground" />,
    items: [
      {
        title: 'Introduction',
        href: '/docs',
        items: []
      },
      {
        title: 'Installation',
        href: '/docs/installation',
        items: []
      },
      {
        title: 'Connecting Stripe',
        href: '/docs/connecting-stripe',
        items: []
      }
    ]
  },
  {
    title: 'Configuration',
    icon: <BookIcon className="size-4 shrink-0 text-muted-foreground" />,
    items: [
      {
        title: 'Payment Plans',
        href: '/docs/payment-plans',
        items: []
      },
      {
        title: 'Conditions',
        href: '/docs/conditions',
        items: []
      },
      {
        title: 'Settings',
        href: '/docs/settings',
        items: []
      }
    ]
  },
  {
    title: 'Reference',
    icon: <BookIcon className="size-4 shrink-0 text-muted-foreground" />,
    items: [
      {
        title: 'Checkout Experience',
        href: '/docs/checkout',
        items: []
      },
      {
        title: 'Troubleshooting',
        href: '/docs/troubleshooting',
        items: []
      }
    ]
  }
];
