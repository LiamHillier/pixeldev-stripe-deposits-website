import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/stripe-oauth/callback
 *
 * Stripe OAuth callback proxy endpoint.
 *
 * This endpoint receives OAuth callbacks from Stripe and redirects them
 * back to the originating WordPress site. This allows WordPress sites
 * (even local development sites like DDEV) to complete OAuth flows without
 * needing to register each site's callback URL in Stripe.
 *
 * Flow:
 * 1. WordPress plugin initiates OAuth with state containing return URL
 * 2. Stripe redirects here after user authorization
 * 3. This endpoint redirects to the WordPress site with the OAuth code
 *
 * Query Parameters from Stripe:
 * - code: The authorization code (on success)
 * - state: Contains the encoded return URL for the WordPress site
 * - error: Error type (on failure)
 * - error_description: Human-readable error message (on failure)
 */
export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;

  // Extract Stripe OAuth response parameters
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Log incoming request for debugging
  console.log('[OAuth Callback] Received callback:', {
    hasCode: !!code,
    state: state,
    error: error,
    fullUrl: request.nextUrl.toString(),
  });

  // The state parameter should contain the WordPress site's callback URL
  // Supported formats:
  // 1. base64(JSON({ return_url: "https://site.com/..." }))
  // 2. base64(JSON({ return_url: "https://site.com/...", nonce: "..." }))
  // 3. Plain URL (legacy/simple format)
  if (!state) {
    console.error('[OAuth Callback] Missing state parameter');
    return NextResponse.json(
      { error: 'Missing state parameter. OAuth flow may have been tampered with.' },
      { status: 400 }
    );
  }

  let returnUrl: string;

  try {
    // First, try to decode as base64 JSON
    let decoded: string;
    try {
      decoded = Buffer.from(state, 'base64').toString('utf-8');
    } catch {
      // Not base64, might be a plain URL or URL-encoded
      decoded = decodeURIComponent(state);
    }

    console.log('[OAuth Callback] Decoded state:', decoded);

    // Try to parse as JSON
    try {
      const stateData = JSON.parse(decoded);
      returnUrl = stateData.return_url || stateData.returnUrl || stateData.redirect_uri;

      if (!returnUrl) {
        throw new Error('return_url not found in state JSON');
      }
    } catch {
      // Not JSON - treat the decoded value as a direct URL
      // Check if it looks like a URL
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        returnUrl = decoded;
      } else {
        // Try treating original state as URL
        if (state.startsWith('http://') || state.startsWith('https://')) {
          returnUrl = state;
        } else {
          throw new Error('State is not a valid URL or JSON object');
        }
      }
    }

    // Validate the return URL is a valid URL
    const parsedUrl = new URL(returnUrl);

    // Security: Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol in return URL');
    }

    console.log('[OAuth Callback] Parsed return URL:', returnUrl);
  } catch (err) {
    console.error('[OAuth Callback] Invalid state parameter:', err, 'Raw state:', state);
    return NextResponse.json(
      {
        error: 'Invalid state parameter. Unable to determine return destination.',
        debug: {
          rawState: state,
          hint: 'State should be base64(JSON({return_url: "https://..."})) or a plain URL'
        }
      },
      { status: 400 }
    );
  }

  // Build the redirect URL with OAuth response parameters
  const redirectUrl = new URL(returnUrl);

  // Always pass through the original state for CSRF verification
  redirectUrl.searchParams.set('state', state);

  if (error) {
    // Forward error to WordPress
    redirectUrl.searchParams.set('error', error);
    if (errorDescription) {
      redirectUrl.searchParams.set('error_description', errorDescription);
    }
    console.log(`[OAuth Callback] Redirecting error to: ${redirectUrl.toString()}`);
  } else if (code) {
    // Forward authorization code to WordPress
    redirectUrl.searchParams.set('code', code);
    console.log(`[OAuth Callback] Redirecting success to: ${redirectUrl.toString()}`);
  } else {
    // No code or error - unexpected response from Stripe
    console.error('[OAuth Callback] No code or error in Stripe response');
    return NextResponse.json(
      { error: 'Invalid OAuth response from Stripe' },
      { status: 400 }
    );
  }

  // Redirect back to the WordPress site
  return NextResponse.redirect(redirectUrl.toString());
}
