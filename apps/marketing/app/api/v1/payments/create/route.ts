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

    // Normalize email to prevent duplicate customers from case differences
    const normalizedEmail = body.customer_email.toLowerCase().trim();

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

    // Normalize domain for license lookup (same as license register endpoint)
    const normalizedDomain = siteUrl
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase();

    // Look up license by domain activation
    // Find any active license that has this domain activated
    const domainActivation = await prisma.licenseDomainActivation.findFirst({
      where: {
        domain: normalizedDomain,
      },
      include: {
        license: true,
      },
    });

    // Determine fee based on license status
    // 0% fee if license is active and not expired
    // 2% fee otherwise
    let hasValidLicense = false;
    if (domainActivation?.license) {
      const license = domainActivation.license;
      const now = new Date();
      // License is valid if: active, not deleted, and not expired
      hasValidLicense = license.active &&
        license.deletedAt === null &&
        license.expiresAt > now;
    }

    const feePercentage = hasValidLicense ? 0 : 2;
    const applicationFeeAmount = Math.round((body.amount * feePercentage) / 100);

    const stripeAccountId = body.stripe_account_id;

    const planType = hasValidLicense ? 'pro' : 'free';

    console.log(
      `[Payment Proxy] Creating PaymentIntent for ${siteUrl} - Amount: $${body.amount / 100}, Fee: ${feePercentage}% (${planType}), Fee Amount: $${applicationFeeAmount / 100}, Connected Account: ${stripeAccountId}`
    );

    // ============================================================
    // STEP 1: Create or find PLATFORM customer (no stripeAccount header)
    // The PaymentMethod must be attached to a platform customer before cloning
    // ============================================================
    let platformCustomer: Stripe.Customer;

    // Search for existing platform customer by normalized email
    const existingPlatformCustomers = await stripe.customers.list({
      email: normalizedEmail,
      limit: 10, // Get more results in case of duplicates, use the most recent
    });

    // Filter to exact email match (case-insensitive) and non-deleted customers
    const matchingPlatformCustomers = existingPlatformCustomers.data.filter(
      (c) => c.email?.toLowerCase() === normalizedEmail && !c.deleted
    );

    if (matchingPlatformCustomers.length > 0) {
      // Use the most recently created customer (first in list, as Stripe returns newest first)
      platformCustomer = matchingPlatformCustomers[0];
      console.log(`[Payment Proxy] Found existing platform customer: ${platformCustomer.id} (${matchingPlatformCustomers.length} total matches)`);
    } else {
      platformCustomer = await stripe.customers.create({
        email: normalizedEmail,
        name: body.customer_name || undefined,
        metadata: {
          site_url: siteUrl,
          source: 'pixeldev-stripe-deposits',
        },
      });
      console.log(`[Payment Proxy] Created new platform customer: ${platformCustomer.id}`);
    }

    // ============================================================
    // STEP 2: Attach PaymentMethod to platform customer
    // This is required before the PM can be cloned to connected accounts
    // ============================================================
    try {
      await stripe.paymentMethods.attach(body.payment_method_id, {
        customer: platformCustomer.id,
      });
      console.log(
        `[Payment Proxy] Attached payment method ${body.payment_method_id} to platform customer ${platformCustomer.id}`
      );
    } catch (attachError: unknown) {
      // PM might already be attached - that's OK
      if (attachError instanceof Stripe.errors.StripeError && attachError.code === 'resource_already_exists') {
        console.log(
          `[Payment Proxy] Payment method ${body.payment_method_id} already attached to a customer`
        );
      } else {
        console.error('[Payment Proxy] Failed to attach payment method to platform customer:', attachError);
        throw attachError;
      }
    }

    // ============================================================
    // STEP 3: Clone PaymentMethod to connected account
    // Using customer + payment_method params as per Stripe docs
    // ============================================================
    let clonedPaymentMethod: Stripe.PaymentMethod;

    try {
      clonedPaymentMethod = await stripe.paymentMethods.create(
        {
          customer: platformCustomer.id,
          payment_method: body.payment_method_id,
        },
        { stripeAccount: stripeAccountId }
      );
      console.log(
        `[Payment Proxy] Cloned payment method ${body.payment_method_id} -> ${clonedPaymentMethod.id} on connected account`
      );
    } catch (cloneError) {
      console.error('[Payment Proxy] Failed to clone payment method:', cloneError);
      throw cloneError;
    }

    // ============================================================
    // STEP 4: Create or find customer on CONNECTED account
    // ============================================================
    let connectedCustomer: Stripe.Customer;

    // Search for existing connected customer by normalized email
    const existingConnectedCustomers = await stripe.customers.list(
      {
        email: normalizedEmail,
        limit: 10, // Get more results in case of duplicates
      },
      { stripeAccount: stripeAccountId }
    );

    // Filter to exact email match (case-insensitive) and non-deleted customers
    const matchingConnectedCustomers = existingConnectedCustomers.data.filter(
      (c) => c.email?.toLowerCase() === normalizedEmail && !c.deleted
    );

    if (matchingConnectedCustomers.length > 0) {
      // Use the most recently created customer
      connectedCustomer = matchingConnectedCustomers[0];
      console.log(`[Payment Proxy] Found existing customer on connected account: ${connectedCustomer.id} (${matchingConnectedCustomers.length} total matches)`);

      // Attach the cloned payment method to the existing customer
      try {
        await stripe.paymentMethods.attach(
          clonedPaymentMethod.id,
          { customer: connectedCustomer.id },
          { stripeAccount: stripeAccountId }
        );
        console.log(
          `[Payment Proxy] Attached cloned PM ${clonedPaymentMethod.id} to existing connected customer ${connectedCustomer.id}`
        );
      } catch (attachError: unknown) {
        // PM might already be attached to this customer - that's OK
        if (attachError instanceof Stripe.errors.StripeError && attachError.code === 'resource_already_exists') {
          console.log(`[Payment Proxy] Cloned PM ${clonedPaymentMethod.id} already attached to connected customer`);
        } else {
          throw attachError;
        }
      }

      // Update default payment method
      await stripe.customers.update(
        connectedCustomer.id,
        {
          invoice_settings: {
            default_payment_method: clonedPaymentMethod.id,
          },
        },
        { stripeAccount: stripeAccountId }
      );
    } else {
      // Create new customer with the cloned payment method already attached
      connectedCustomer = await stripe.customers.create(
        {
          email: normalizedEmail,
          name: body.customer_name || undefined,
          payment_method: clonedPaymentMethod.id,
          invoice_settings: {
            default_payment_method: clonedPaymentMethod.id,
          },
          metadata: {
            platform_customer_id: platformCustomer.id,
            site_url: siteUrl,
            wp_order_id: body.order_id.toString(),
          },
        },
        { stripeAccount: stripeAccountId }
      );
      console.log(`[Payment Proxy] Created new customer on connected account: ${connectedCustomer.id}`);
    }

    // ============================================================
    // STEP 5: Create PaymentIntent ON THE CONNECTED ACCOUNT (direct charge)
    // ============================================================
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: body.amount,
      currency: body.currency.toLowerCase(),
      customer: connectedCustomer.id,
      payment_method: clonedPaymentMethod.id,
      // Don't confirm - let frontend handle it (required for 3D Secure with WooCommerce Blocks)
      confirm: false,
      // CRITICAL: Save payment method for future subscription use (off_session charges)
      setup_future_usage: 'off_session',
      metadata: {
        site_url: siteUrl,
        wp_order_id: body.order_id.toString(),
        payment_type: body.payment_type,
        fee_percentage: feePercentage.toString(),
        platform_customer_id: platformCustomer.id,
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
      customer_id: connectedCustomer.id, // Customer ID on connected account for subscriptions
      payment_method_id: clonedPaymentMethod.id, // Cloned PM on connected account
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
