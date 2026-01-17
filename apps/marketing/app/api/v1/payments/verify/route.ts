import { NextResponse } from 'next/server';
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
 * Payment Intent Verification Request Body
 */
interface VerifyPaymentIntentRequest {
  payment_intent_id: string;
  site_url: string;
  stripe_account_id: string; // Connected account ID from plugin
}

/**
 * POST /api/v1/payments/verify
 *
 * Retrieves and verifies the status of a Stripe PaymentIntent.
 * Used after 3DS redirect to check if payment succeeded.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Parse request body
    const body = (await request.json()) as VerifyPaymentIntentRequest;

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
    const rateCheck = rateLimiter.check(100, `payment-verify:${siteUrl}`);
    if (rateCheck.isRateLimited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retry_after: 60,
        },
        { status: 429 }
      );
    }

    // Validate required fields
    if (!body.payment_intent_id) {
      return NextResponse.json(
        { error: 'Missing payment_intent_id' },
        { status: 400 }
      );
    }

    // Initialize Stripe with the platform account
    const stripeSecretKey = process.env.STRIPE_CONNECT_CLIENT_SECRET || process.env.BILLING_STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error('[Payment Verify] STRIPE_CONNECT_CLIENT_SECRET not configured');
      return NextResponse.json(
        { error: 'Stripe not configured on server' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
    });

    console.log(`[Payment Verify] Retrieving PaymentIntent: ${body.payment_intent_id}`);
    console.log(`[Payment Verify] Connected Account: ${body.stripe_account_id}`);

    // Retrieve the PaymentIntent FROM THE CONNECTED ACCOUNT
    // PaymentIntent was created on the connected account (direct charge)
    const paymentIntent = await stripe.paymentIntents.retrieve(
      body.payment_intent_id,
      undefined,
      { stripeAccount: body.stripe_account_id } // ON CONNECTED ACCOUNT
    );

    console.log(`[Payment Verify] PaymentIntent status: ${paymentIntent.status}`);

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
    });
  } catch (error: unknown) {
    console.error('[Payment Verify] Error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
