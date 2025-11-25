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
  stripe_account_id: string; // Connected account ID from plugin
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

    // For public plugin: everyone gets 2% fee unless they have a valid license
    // TODO: Implement license validation endpoint
    const feePercentage = 2; // 2% for all users for now
    const applicationFeeAmount = Math.round((body.amount * feePercentage) / 100);

    console.log(
      `[Payment Proxy] Creating PaymentIntent for ${siteUrl} - Amount: $${body.amount / 100}, Fee: ${feePercentage}%, Fee Amount: $${applicationFeeAmount / 100}`
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
          site_url: siteUrl,
          wp_order_id: body.order_id.toString(),
        },
      });
    }

    const stripeAccountId = body.stripe_account_id;

    // Create PaymentIntent with conditional fee
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: body.amount,
      currency: body.currency.toLowerCase(),
      customer: stripeCustomer.id,
      payment_method: body.payment_method_id,
      // Don't confirm - let frontend handle it (required for 3D Secure with WooCommerce Blocks)
      confirm: false,
      // Route payment to connected account
      transfer_data: {
        destination: stripeAccountId,
      },
      metadata: {
        site_url: siteUrl,
        wp_order_id: body.order_id.toString(),
        payment_type: body.payment_type,
        fee_percentage: feePercentage.toString(),
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
      `[Payment Proxy] PaymentIntent created: ${paymentIntent.id} for ${siteUrl}, status: ${paymentIntent.status} (will be confirmed on frontend)`
    );

    // Return payment details to plugin for frontend confirmation
    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      status: 'requires_confirmation', // Frontend will confirm
      fee: {
        percentage: feePercentage,
        amount: applicationFeeAmount,
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
