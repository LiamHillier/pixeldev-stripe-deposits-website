import { keys } from '../keys';
import {
  createBillingConfig,
  PriceInterval,
  PriceModel,
  PriceType
} from './schema';

enum Feature {
  UnlimitedPlans = 'Unlimited payment plans',
  AllConditionTypes = '20+ condition types',
  AllScheduleTypes = 'All schedule types',
  StripeIntegration = 'Direct Stripe integration',
  CustomerPortal = 'Customer payment portal',
  AutomaticRetries = 'Automatic payment retries',
  EmailNotifications = 'Email notifications',
  PrioritySupport = 'Priority email support',
  WebhookIntegration = 'Webhook integration'
}

const allFeatures = [
  Feature.UnlimitedPlans,
  Feature.AllConditionTypes,
  Feature.AllScheduleTypes,
  Feature.StripeIntegration,
  Feature.CustomerPortal,
  Feature.AutomaticRetries,
  Feature.EmailNotifications,
  Feature.PrioritySupport,
  Feature.WebhookIntegration
];

const currency = 'USD';

export const billingConfig = createBillingConfig({
  products: [
    {
      id: 'free',
      name: 'Free',
      description: 'Get started with a 2% transaction fee.',
      label: 'Get started',
      isFree: true,
      transactionFee: 2,
      features: allFeatures,
      plans: [
        {
          id: 'plan-free-year',
          displayIntervals: [PriceInterval.Year],
          prices: [
            {
              id: 'price-free-year-id',
              interval: PriceInterval.Year,
              type: PriceType.Recurring,
              model: PriceModel.Flat,
              cost: 0,
              currency
            }
          ]
        }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Reduced fees for growing stores.',
      label: 'Get started',
      transactionFee: 1,
      features: allFeatures,
      plans: [
        {
          id: 'plan-pro-year',
          displayIntervals: [PriceInterval.Year],
          prices: [
            {
              id:
                keys().NEXT_PUBLIC_BILLING_PRICE_PRO_YEAR_ID ||
                'price-pro-year-id',
              interval: PriceInterval.Year,
              type: PriceType.Recurring,
              model: PriceModel.Flat,
              cost: 99,
              currency
            }
          ]
        }
      ]
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Zero fees for established stores.',
      label: 'Get started',
      recommended: true,
      transactionFee: 0,
      features: allFeatures,
      plans: [
        {
          id: 'plan-business-year',
          displayIntervals: [PriceInterval.Year],
          prices: [
            {
              id:
                keys().NEXT_PUBLIC_BILLING_PRICE_BUSINESS_YEAR_ID ||
                'price-business-year-id',
              interval: PriceInterval.Year,
              type: PriceType.Recurring,
              model: PriceModel.Flat,
              cost: 199,
              currency
            }
          ]
        }
      ]
    }
  ]
});

export const billingConfigDisplayIntervals = Array.from(
  new Set(
    billingConfig.products
      .filter((product) => !product.hidden)
      .flatMap((product) =>
        product.plans.flatMap((plan) => plan.displayIntervals)
      )
      .filter(Boolean)
  )
) as PriceInterval[];
