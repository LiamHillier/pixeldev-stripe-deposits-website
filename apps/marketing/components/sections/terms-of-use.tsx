import * as React from 'react';
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  BanknoteIcon,
  DatabaseIcon,
  FileTextIcon,
  KeyIcon,
  ServerIcon,
  ShieldAlertIcon
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

const IMPORTANT_NOTICES = [
  {
    title: 'Stripe Payment Enforcement',
    icon: <BanknoteIcon className="size-4 shrink-0" />,
    content:
      'Stripe does not automatically enforce or guarantee collection of remaining payments. If a scheduled payment fails, Stripe will not pursue the customer for the outstanding balance.'
  },
  {
    title: 'Your Responsibilities',
    icon: <ShieldAlertIcon className="size-4 shrink-0" />,
    content:
      'As the store owner, you are solely responsible for: following up on failed or missed payments, communicating with customers about outstanding balances, and determining appropriate actions for non-payment.'
  },
  {
    title: 'Terms & Conditions Required',
    icon: <FileTextIcon className="size-4 shrink-0" />,
    content:
      'You should create your own Terms & Conditions that clearly outline your payment plan policies, including what happens in case of failed payments. This plugin does not provide legal documentation.'
  }
];

const DATA_CARDS = [
  {
    title: 'Free vs Licensed',
    icon: <KeyIcon className="size-4 shrink-0" />,
    content:
      'The free version includes full functionality but applies a 2% application fee on each payment. A licensed subscription removes this fee entirely—you only pay standard Stripe rates.'
  },
  {
    title: 'Self-Hosted Software',
    icon: <ServerIcon className="size-4 shrink-0" />,
    content:
      'The plugin is installed and runs on your own WordPress server. You are responsible for your hosting environment, security, and server maintenance.'
  },
  {
    title: 'Data Responsibility',
    icon: <DatabaseIcon className="size-4 shrink-0" />,
    content:
      'You are responsible for maintaining and backing up your own data. We do not have access to your servers and are not liable for any data loss.'
  }
];

const DATA_ACCORDION = [
  {
    title: 'Free vs Licensed Software',
    content: `Payment Plans for Woo is available in two tiers: Free and Licensed. The FREE VERSION includes full plugin functionality but applies an application fee of 2% on each payment processed through the plugin. This fee is in addition to standard Stripe processing fees and is automatically deducted from each transaction. The LICENSED VERSION removes the application fee entirely—you only pay standard Stripe processing rates. By using the free version, you agree to the application fee being applied to all payments. Upgrading to a licensed subscription removes this fee immediately for all future transactions.`
  },
  {
    title: 'License Grant & Restrictions',
    content: `By purchasing a subscription, you are granted a limited, non-exclusive, non-transferable license to use Payment Plans for Woo on the number of sites specified by your license tier. You may not redistribute, resell, sublicense, or provide the plugin to third parties. Reverse engineering, decompiling, or modifying the plugin code is prohibited. Your license is tied to your active subscription status and the specific sites registered to your account.`
  },
  {
    title: 'Subscription & Billing',
    content: `Payment Plans for Woo operates on a recurring subscription model with monthly and yearly billing options. Your subscription will automatically renew at the end of each billing period unless cancelled. Payment is processed securely via Stripe. We reserve the right to change pricing with 30 days notice to existing subscribers. Failed payments may result in suspension of your license until payment is resolved. If your subscription lapses, the plugin will revert to free mode and the application fee will be applied to subsequent payments.`
  },
  {
    title: 'License Expiration & Cancellation',
    content: `When your subscription expires or is cancelled, the plugin will continue to process existing payment plans, but you will not be able to create new payment plans or access updates and support. Your existing data and scheduled payments will remain intact. You may cancel your subscription at any time, and your access will continue until the end of your current billing period. Renewing your subscription will restore full functionality.`
  },
  {
    title: 'Payment Collection Disclaimer',
    content: `THIS PLUGIN IS A TOOL TO FACILITATE PAYMENT PLANS. Payment Plans for Woo and its authors are NOT responsible for payment collection, customer disputes, chargebacks, or any financial losses resulting from unpaid balances. Stripe handles payment processing and automatic retries for failed payments, but does not guarantee collection of outstanding balances. You are solely responsible for establishing and enforcing your own payment policies with your customers. We strongly recommend implementing clear terms and conditions on your store that outline your payment plan policies.`
  },
  {
    title: 'Self-Hosted Software Disclaimer',
    content: `Payment Plans for Woo is a self-hosted WordPress plugin installed on your own server infrastructure. We do not host, manage, or have access to your WordPress installation, database, or any data stored on your servers. You are solely responsible for your server security, WordPress updates, database backups, and overall site maintenance. Plugin compatibility depends on your hosting environment, PHP version, WordPress version, and other installed plugins or themes. We cannot guarantee compatibility with all hosting configurations.`
  },
  {
    title: 'Data & Backup Responsibility',
    content: `You acknowledge that Payment Plans for Woo stores payment schedule data in your WooCommerce database and processes payments through Stripe. YOU ARE SOLELY RESPONSIBLE FOR MAINTAINING REGULAR BACKUPS of your WordPress database and WooCommerce data. We are NOT responsible for any data loss, corruption, or unintended modifications. Before performing significant changes to your store, we strongly recommend creating a complete backup. You accept all risks associated with payment processing and data storage.`
  },
  {
    title: 'Third-Party Services',
    content: `Payment Plans for Woo integrates with Stripe and WooCommerce, which are third-party services with their own terms of service and privacy policies. You must comply with Stripe's Terms of Service and WooCommerce's terms when using this plugin. We are not responsible for changes to Stripe's or WooCommerce's APIs, terms, pricing, or service availability. API changes by these third parties may affect plugin functionality, and while we strive to update the plugin promptly, we cannot guarantee immediate compatibility with all API changes.`
  },
  {
    title: 'Updates & Support',
    content: `An active subscription includes access to plugin updates and customer support. Updates are delivered through the standard WordPress update system and may include bug fixes, security patches, new features, and compatibility improvements. Support is provided via email during business hours. While we aim to respond promptly, response times are not guaranteed. We do not guarantee that all feature requests will be implemented. Critical security updates may be released outside the normal update schedule.`
  },
  {
    title: 'Limitation of Liability',
    content: `THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL PAYMENT PLANS FOR WOO, ITS DEVELOPERS, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH THE USE OR INABILITY TO USE THE SOFTWARE, OR ANY FAILED OR UNCOLLECTED PAYMENTS. OUR MAXIMUM LIABILITY SHALL NOT EXCEED THE TOTAL SUBSCRIPTION FEES PAID BY YOU IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.`
  },
  {
    title: 'Intellectual Property',
    content: `All intellectual property rights in Payment Plans for Woo, including but not limited to the plugin code, design, documentation, branding, and trademarks, are owned by Payment Plans for Woo and its licensors. You retain full ownership of your business data, customer information, order data, and any other data you process through the plugin. By providing feedback, suggestions, or feature requests, you grant us a perpetual, royalty-free license to use such feedback to improve our products.`
  },
  {
    title: 'Termination',
    content: `We reserve the right to terminate or suspend your license immediately, without prior notice, if you breach these terms, engage in fraudulent activity, or use the plugin in a way that harms our services or other users. You may terminate your subscription at any time through your account dashboard or by contacting support. Upon termination, your right to use the plugin ceases, but provisions relating to intellectual property, limitation of liability, and governing law shall survive termination.`
  },
  {
    title: 'Refund Policy',
    content: `We offer a 14-day money-back guarantee for new subscriptions. If you are not satisfied with Payment Plans for Woo within 14 days of your initial purchase, contact us for a full refund. Refund requests made after the 14-day period will be evaluated on a case-by-case basis. Refunds are not available for subscription renewals—please cancel before your renewal date if you do not wish to continue. Refunds are processed to the original payment method and may take 5-10 business days to appear.`
  },
  {
    title: 'Governing Law & Disputes',
    content: `These Terms of Use shall be governed by and construed in accordance with the laws of Australia, without regard to its conflict of law provisions. Any disputes arising out of or relating to these terms or your use of Payment Plans for Woo shall be resolved exclusively in the courts of Australia. You agree to submit to the personal jurisdiction of such courts. Before initiating any legal action, you agree to attempt to resolve disputes through good-faith negotiation by contacting us at support@paymentplansforwoo.com.`
  },
  {
    title: 'Modifications to Terms',
    content: `We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to our website. For material changes, we will make reasonable efforts to notify active subscribers via email. Your continued use of Payment Plans for Woo after changes are posted constitutes your acceptance of the modified terms. We encourage you to review these terms periodically. The "Last Updated" date at the top of this page indicates when these terms were last revised.`
  }
];

export function TermsOfUse(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container space-y-16 py-20">
        <SiteHeading
          badge="Legal"
          title="Terms of Use"
          description="By purchasing, installing, or using Payment Plans for Woo, you agree to be bound by these terms. Please read them carefully to understand your rights and obligations."
        />

        <Alert variant="destructive">
          <AlertTriangleIcon className="size-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription className="mt-2">
            Please read and acknowledge the following before using this plugin.
            This plugin is a tool to facilitate payment plans. You are
            responsible for payment collection and establishing your own terms
            with customers.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-3">
          {IMPORTANT_NOTICES.map((item, index) => (
            <Card
              key={index}
              className="border-destructive/50 bg-destructive/5 dark:bg-destructive/10"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {item.icon}
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert variant="warning">
          <AlertCircleIcon className="size-4" />
          <AlertDescription className="ml-3 inline text-base">
            These terms were last updated on January 2026. We recommend
            reviewing them periodically for any changes.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DATA_CARDS.map((item, index) => (
            <Card
              key={index}
              className="border-none dark:bg-accent/40"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {item.icon}
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Accordion
          type="single"
          collapsible
        >
          {DATA_ACCORDION.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
            >
              <AccordionTrigger className="flex items-center justify-between text-lg font-medium">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div>
          <CardTitle className="text-lg text-primary">
            Contact Information
          </CardTitle>
          <p className="text-sm leading-relaxed">
            For questions about these terms or to report violations, contact us
            at:
            <br />
            <a
              href="mailto:support@paymentplansforwoo.com"
              className="text-blue-500 hover:underline"
            >
              support@paymentplansforwoo.com
            </a>
          </p>
        </div>
      </div>
    </GridSection>
  );
}
