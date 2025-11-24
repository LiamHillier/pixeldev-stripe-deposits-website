import { NextResponse } from 'next/server';
import { inMemoryRateLimiter } from '@workspace/rate-limit/in-memory';
import { verifyPluginSignature } from '../_lib/verify-plugin-signature';

/**
 * Rate limiter: 10 requests per minute per site
 */
const rateLimiter = inMemoryRateLimiter({
  intervalInMs: 60000, // 1 minute
});

/**
 * OAuth Credentials Request Body
 */
interface CredentialsRequest {
  site_url: string;
  timestamp: number;
}

/**
 * POST /api/v1/stripe-credentials
 *
 * Returns Stripe OAuth credentials (client_id and client_secret) to WordPress plugin.
 *
 * Security:
 * - HMAC signature verification
 * - Rate limiting (10 requests/minute per site)
 * - Timestamp validation (5 minute window)
 *
 * Note: Returns same OAuth app for all users (free and pro).
 * Fee differentiation is handled by payment proxy, not separate OAuth apps.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Parse request body
    const body = (await request.json()) as CredentialsRequest;

    // Verify plugin signature
    const verification = await verifyPluginSignature(request, body);

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.statusCode }
      );
    }

    const { siteUrl } = verification;

    // Rate limiting (10 requests/minute per site)
    const rateCheck = rateLimiter.check(10, `oauth:${siteUrl}`);
    if (rateCheck.isRateLimited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retry_after: 60, // 1 minute in seconds
        },
        { status: 429 }
      );
    }

    // Get OAuth credentials from environment
    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
    const clientSecret = process.env.STRIPE_CONNECT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error(
        'Stripe Connect OAuth credentials not configured in environment'
      );
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log(`[OAuth Credentials] Providing credentials to: ${siteUrl}`);

    // Return OAuth credentials
    return NextResponse.json({
      success: true,
      data: {
        client_id: clientId,
        client_secret: clientSecret,
      },
    });
  } catch (error) {
    console.error('[OAuth Credentials] Error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/stripe-credentials (for backward compatibility)
 *
 * @deprecated Use POST method instead for better security
 */
export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      error: 'GET method deprecated. Use POST with HMAC signature.',
    },
    { status: 405 }
  );
}
