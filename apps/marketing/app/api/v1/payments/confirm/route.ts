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
 * Payment Intent Confirmation Request Body
 */
interface ConfirmPaymentIntentRequest {
  payment_intent_id: string;
  payment_method_id: string;
  site_url: string;
  stripe_account_id: string; // Connected account ID from plugin
  return_url: string; // For 3DS redirects
}

/**
 * POST /api/v1/payments/confirm
 *
 * Confirms a Stripe PaymentIntent.
 * For 3DS cards, returns next_action_redirect_url.
 * For regular cards, confirms immediately.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Parse request body
    const body = (await request.json()) as ConfirmPaymentIntentRequest;

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
    const rateCheck = rateLimiter.check(100, `payment-confirm:${siteUrl}`);
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
    if (!body.payment_intent_id) {
      return NextResponse.json(
        { error: 'Missing payment_intent_id' },
        { status: 400 }
      );
    }

    if (!body.payment_method_id) {
      return NextResponse.json(
        { error: 'Missing payment_method_id' },
        { status: 400 }
      );
    }

    if (!body.stripe_account_id) {
      return NextResponse.json(
        { error: 'Missing stripe_account_id' },
        { status: 400 }
      );
    }

    if (!body.return_url) {
      return NextResponse.json(
        { error: 'Missing return_url' },
        { status: 400 }
      );
    }

    // Initialize Stripe with the platform account (for Connect)
    const stripeSecretKey = process.env.STRIPE_CONNECT_CLIENT_SECRET || process.env.BILLING_STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error('[Payment Confirm] STRIPE_CONNECT_CLIENT_SECRET not configured');
      return NextResponse.json(
        { error: 'Stripe not configured on server' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
    });

    console.log(`[Payment Confirm] Confirming PaymentIntent: ${body.payment_intent_id}`);
    console.log(`[Payment Confirm] Connected Account: ${body.stripe_account_id}`);

    // Confirm the PaymentIntent ON THE CONNECTED ACCOUNT
    // PaymentIntent was created on the connected account (direct charge), so must be confirmed there too
    const paymentIntent = await stripe.paymentIntents.confirm(
      body.payment_intent_id,
      {
        payment_method: body.payment_method_id,
        return_url: body.return_url,
      },
      { stripeAccount: body.stripe_account_id } // ON CONNECTED ACCOUNT
    );

    console.log(`[Payment Confirm] PaymentIntent confirmed with status: ${paymentIntent.status}`);

    // Check if 3DS authentication is required
    if (paymentIntent.status === 'requires_action' && paymentIntent.next_action?.type === 'redirect_to_url') {
      return NextResponse.json({
        success: true,
        status: 'requires_action',
        next_action_redirect_url: paymentIntent.next_action.redirect_to_url?.url,
      });
    }

    // Payment succeeded or in another state
    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
    });
  } catch (error: unknown) {
    console.error('[Payment Confirm] Error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}
