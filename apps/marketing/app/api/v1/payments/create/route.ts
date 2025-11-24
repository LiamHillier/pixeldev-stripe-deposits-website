import { NextResponse } from 'next/server';
import { prisma } from '@workspace/database/client';
import { inMemoryRateLimiter } from '@workspace/rate-limit/in-memory';
import { verifyPluginSignature } from '../../_lib/verify-plugin-signature';
import Stripe from 'stripe';

/**
 * Rate limiter: 100 requests per minute per site
 */
const rateLimiter = inMemoryRateLimiter({
  intervalInMs: 60000, // 1 minute
});

/**
 * Payment Intent Creation Request Body
 */
interface CreatePaymentIntentRequest {
  order_id: number;
  amount: number; // Amount in cents
  currency: string;
  customer_email: string;
  payment_method_id: string;
  payment_type: 'full' | 'deposit';
  site_url: string;
}

/**
 * POST /api/v1/payments/create
 *
 * Creates a Stripe PaymentIntent with conditional application fees based on tenant plan.
 *
 * Free tier: 2% application fee
 * Pro tier: 0% application fee
 *
 * The plugin receives client_secret and confirms payment via Stripe.js
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Parse request body
    const body = (await request.json()) as CreatePaymentIntentRequest;

    // Verify plugin signature
    const verification = await verifyPluginSignature(request, body);

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.statusCode }
      );
    }

    const { organizationId, siteUrl, organization } = verification;

    // Rate limiting (100 requests/minute per site)
    const rateCheck = rateLimiter.check(100, `payment:${siteUrl}`);
    if (rateCheck.isRateLimited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retry_after: 60, // 1 minute in seconds
        },
        { status: 429 }
      );
    }

    // Validate required fields
    if (!body.amount || body.amount < 50) {
      // Stripe minimum is $0.50
      return NextResponse.json(
        { error: 'Invalid amount (minimum $0.50)' },
        { status: 400 }
      );
    }

    if (!body.currency) {
      return NextResponse.json(
        { error: 'Missing currency' },
        { status: 400 }
      );
    }

    if (!body.customer_email) {
      return NextResponse.json(
        { error: 'Missing customer_email' },
        { status: 400 }
      );
    }

    if (!body.payment_method_id) {
      return NextResponse.json(
        { error: 'Missing payment_method_id' },
        { status: 400 }
      );
    }

    if (!body.order_id) {
      return NextResponse.json(
        { error: 'Missing order_id' },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripeSecretKey = process.env.BILLING_STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('BILLING_STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    // Detect tenant plan (free vs pro)
    const subscriptions = await prisma.subscription.findMany({
      where: {
        organizationId: organizationId,
        active: true,
        status: {
          in: ['active', 'trialing'],
        },
      },
      include: {
        items: true,
      },
    });

    const orders = await prisma.order.findMany({
      where: {
        organizationId: organizationId,
        status: 'completed',
      },
      include: {
        items: true,
      },
    });

    // Check if user has pro or lifetime subscription/purchase
    const hasProSubscription = subscriptions.some((sub: { items: Array<{ productId: string }> }) =>
      sub.items.some(
        (item: { productId: string }) => item.productId === 'pro' || item.productId === 'lifetime'
      )
    );

    const hasProPurchase = orders.some((order: { items: Array<{ productId: string }> }) =>
      order.items.some(
        (item: { productId: string }) => item.productId === 'pro' || item.productId === 'lifetime'
      )
    );

    const isPro = hasProSubscription || hasProPurchase;

    // Calculate application fee
    const feePercentage = isPro ? 0 : 2; // 0% for pro, 2% for free
    const applicationFeeAmount = Math.round((body.amount * feePercentage) / 100);

    console.log(
      `[Payment Proxy] Creating PaymentIntent for ${siteUrl} - Amount: $${body.amount / 100}, Fee: ${feePercentage}%, Fee Amount: $${applicationFeeAmount / 100}, Plan: ${isPro ? 'PRO' : 'FREE'}`
    );

    // Get or create Stripe customer
    let stripeCustomer: Stripe.Customer;

    const existingCustomers = await stripe.customers.list({
      email: body.customer_email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      stripeCustomer = existingCustomers.data[0];
    } else {
      stripeCustomer = await stripe.customers.create({
        email: body.customer_email,
        metadata: {
          organization_id: organizationId,
          site_url: siteUrl,
          wp_order_id: body.order_id.toString(),
        },
      });
    }

    // Check if organization has Stripe Connect account
    const stripeAccountId = organization.stripeAccountId;

    if (!stripeAccountId) {
      console.error(
        `Organization ${organizationId} has no Stripe Connect account`
      );
      return NextResponse.json(
        {
          error:
            'Stripe account not connected. Please connect your Stripe account in the plugin settings.',
        },
        { status: 400 }
      );
    }

    // Create PaymentIntent with conditional fee
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: body.amount,
      currency: body.currency.toLowerCase(),
      customer: stripeCustomer.id,
      payment_method: body.payment_method_id,
      // Do NOT confirm here - let the plugin confirm via Stripe.js
      confirm: false,
      // Route payment to connected account
      transfer_data: {
        destination: stripeAccountId,
      },
      metadata: {
        organization_id: organizationId,
        site_url: siteUrl,
        wp_order_id: body.order_id.toString(),
        payment_type: body.payment_type,
        fee_percentage: feePercentage.toString(),
        plan_type: isPro ? 'pro' : 'free',
      },
    };

    // Only add application fee if > 0 (free users)
    if (applicationFeeAmount > 0) {
      paymentIntentParams.application_fee_amount = applicationFeeAmount;
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams
    );

    console.log(
      `[Payment Proxy] PaymentIntent created: ${paymentIntent.id} for ${siteUrl}`
    );

    // Return client_secret to plugin
    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      fee: {
        percentage: feePercentage,
        amount: applicationFeeAmount,
        plan_type: isPro ? 'pro' : 'free',
      },
    });
  } catch (error: unknown) {
    console.error('[Payment Proxy] Error creating PaymentIntent:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
