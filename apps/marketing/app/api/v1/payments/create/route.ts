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
  customer_name?: string; // Optional customer name
  payment_method_id: string;
  payment_type: 'full' | 'deposit';
  site_url: string;
  stripe_account_id: string; // Connected account ID from plugin
  idempotency_key?: string; // Optional idempotency key to prevent duplicate payments
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

    // Verify plugin signature (don't require organization in DB)
    const verification = await verifyPluginSignature(request, body, false);

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.statusCode }
      );
    }

    const { siteUrl } = verification;

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

    // Validate stripe_account_id
    if (!body.stripe_account_id) {
      return NextResponse.json(
        { error: 'Missing stripe_account_id' },
        { status: 400 }
      );
    }

    // Initialize Stripe with Connect platform key
    const stripeSecretKey = process.env.STRIPE_CONNECT_CLIENT_SECRET;
    if (!stripeSecretKey) {
      console.error('STRIPE_CONNECT_CLIENT_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    // Look up organization by site URL to check license status
    const organization = await prisma.organization.findFirst({
      where: { siteUrl },
      select: {
        licenseStatus: true,
        licenseExpiresAt: true,
      },
    });

    // Determine fee based on license status
    // 0% fee if license is active and not expired
    // 2% fee otherwise
    let hasValidLicense = false;
    if (organization?.licenseStatus === 'active') {
      // Check if license has expired
      if (organization.licenseExpiresAt) {
        hasValidLicense = new Date() < new Date(organization.licenseExpiresAt);
      } else {
        // No expiry date means lifetime license
        hasValidLicense = true;
      }
    }

    const feePercentage = hasValidLicense ? 0 : 2;
    const applicationFeeAmount = Math.round((body.amount * feePercentage) / 100);

    const stripeAccountId = body.stripe_account_id;

    const planType = hasValidLicense ? 'pro' : 'free';

    console.log(
      `[Payment Proxy] Creating PaymentIntent for ${siteUrl} - Amount: $${body.amount / 100}, Fee: ${feePercentage}% (${planType}), Fee Amount: $${applicationFeeAmount / 100}, Connected Account: ${stripeAccountId}`
    );

    // Get or create Stripe customer ON THE CONNECTED ACCOUNT
    // This ensures the customer, payment method, and future subscriptions are all on the same account
    let stripeCustomer: Stripe.Customer;

    const existingCustomers = await stripe.customers.list(
      {
        email: body.customer_email,
        limit: 1,
      },
      { stripeAccount: stripeAccountId } // ON CONNECTED ACCOUNT
    );

    if (existingCustomers.data.length > 0) {
      stripeCustomer = existingCustomers.data[0];
      console.log(`[Payment Proxy] Found existing customer on connected account: ${stripeCustomer.id}`);
    } else {
      stripeCustomer = await stripe.customers.create(
        {
          email: body.customer_email,
          name: body.customer_name || undefined,
          metadata: {
            site_url: siteUrl,
            wp_order_id: body.order_id.toString(),
          },
        },
        { stripeAccount: stripeAccountId } // ON CONNECTED ACCOUNT
      );
      console.log(`[Payment Proxy] Created new customer on connected account: ${stripeCustomer.id}`);
    }

    // Create PaymentIntent ON THE CONNECTED ACCOUNT (direct charge)
    // This allows the payment method to be properly attached to the customer for subscriptions
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: body.amount,
      currency: body.currency.toLowerCase(),
      customer: stripeCustomer.id,
      payment_method: body.payment_method_id,
      // Don't confirm - let frontend handle it (required for 3D Secure with WooCommerce Blocks)
      confirm: false,
      // CRITICAL: Save payment method for future subscription use (off_session charges)
      setup_future_usage: 'off_session',
      metadata: {
        site_url: siteUrl,
        wp_order_id: body.order_id.toString(),
        payment_type: body.payment_type,
        fee_percentage: feePercentage.toString(),
      },
    };

    // Only add application fee if > 0 (free users)
    // Application fees work with direct charges on connected accounts
    if (applicationFeeAmount > 0) {
      paymentIntentParams.application_fee_amount = applicationFeeAmount;
    }

    // Stripe request options - always include connected account
    const stripeRequestOptions: Stripe.RequestOptions = {
      stripeAccount: stripeAccountId, // ON CONNECTED ACCOUNT
    };

    // Add idempotency key if provided to prevent duplicate payments
    if (body.idempotency_key) {
      stripeRequestOptions.idempotencyKey = body.idempotency_key;
      console.log(`[Payment Proxy] Using idempotency key: ${body.idempotency_key.substring(0, 20)}...`);
    }

    // Create PaymentIntent ON THE CONNECTED ACCOUNT
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams,
      stripeRequestOptions
    );

    console.log(
      `[Payment Proxy] PaymentIntent created: ${paymentIntent.id} for ${siteUrl}, status: ${paymentIntent.status} (will be confirmed on frontend)`
    );

    // Return payment details to plugin for frontend confirmation
    // Include customer_id so plugin can store it for subscription creation
    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      customer_id: stripeCustomer.id, // Customer ID on connected account for subscriptions
      status: 'requires_confirmation', // Frontend will confirm
      fee: {
        percentage: feePercentage,
        amount: applicationFeeAmount,
        plan_type: planType,
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
