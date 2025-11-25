import crypto from 'crypto';
import { prisma } from '@workspace/database/client';

/**
 * Verification result for plugin signature
 */
export interface PluginVerificationResult {
  success: true;
  siteUrl: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    billingCustomerId: string | null;
    stripeAccountId: string | null;
  };
}

export interface PluginVerificationError {
  success: false;
  error: string;
  statusCode: number;
}

/**
 * Verify HMAC signature from WordPress plugin requests
 *
 * Expected headers:
 * - X-Plugin-Signature: HMAC-SHA256 signature
 * - X-Site-URL: WordPress site URL
 * - X-Timestamp: Request timestamp
 *
 * @param request - Next.js Request object
 * @param body - Request body (for signature verification)
 * @param requireOrganization - Whether to require organization to exist (default: true)
 * @returns Verification result with organization context or error
 */
export async function verifyPluginSignature(
  request: Request,
  body: unknown = null,
  requireOrganization: boolean = true
): Promise<PluginVerificationResult | PluginVerificationError> {
  // Get secret key from environment
  const secretKey = process.env.PIXELDEV_PLUGIN_SECRET_KEY;
  if (!secretKey) {
    console.error('PIXELDEV_PLUGIN_SECRET_KEY not configured');
    return {
      success: false,
      error: 'Server configuration error',
      statusCode: 500,
    };
  }

  // Extract headers
  const signature = request.headers.get('X-Plugin-Signature');
  const siteUrl = request.headers.get('X-Site-URL');
  const timestamp = request.headers.get('X-Timestamp');

  // Validate required headers
  if (!signature) {
    return {
      success: false,
      error: 'Missing X-Plugin-Signature header',
      statusCode: 401,
    };
  }

  if (!siteUrl) {
    return {
      success: false,
      error: 'Missing X-Site-URL header',
      statusCode: 401,
    };
  }

  if (!timestamp) {
    return {
      success: false,
      error: 'Missing X-Timestamp header',
      statusCode: 401,
    };
  }

  // Validate timestamp (reject requests older than 5 minutes)
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(currentTime - requestTime);

  if (timeDiff > 300) {
    // 5 minutes
    return {
      success: false,
      error: 'Request timestamp expired',
      statusCode: 401,
    };
  }

  // Generate expected signature
  const bodyString = body ? JSON.stringify(body) : '';
  const dataToSign = `${siteUrl}:${timestamp}:${bodyString}`;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(dataToSign)
    .digest('hex');

  console.log('[Signature Debug] Data to sign:', dataToSign);
  console.log('[Signature Debug] Expected signature:', expectedSignature);
  console.log('[Signature Debug] Received signature:', signature);

  // Compare signatures (constant-time comparison)
  const signatureValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!signatureValid) {
    console.warn(`[Signature Error] Invalid signature from site: ${siteUrl}`);
    console.warn('[Signature Error] Expected:', expectedSignature);
    console.warn('[Signature Error] Received:', signature);
    return {
      success: false,
      error: 'Invalid signature',
      statusCode: 403,
    };
  }

  // Find organization by site URL (optional for some endpoints)
  if (!requireOrganization) {
    // Skip organization lookup for endpoints that don't need it
    return {
      success: true,
      siteUrl: siteUrl.replace(/\/$/, ''),
      organizationId: '',
      organization: {
        id: '',
        name: '',
        billingCustomerId: null,
        stripeAccountId: null,
      },
    };
  }

  try {
    // Normalize site URL (remove trailing slash)
    const normalizedSiteUrl = siteUrl.replace(/\/$/, '');

    const organization = await prisma.organization.findFirst({
      where: {
        siteUrl: normalizedSiteUrl,
      },
      select: {
        id: true,
        name: true,
        billingCustomerId: true,
        stripeAccountId: true,
      },
    });

    if (!organization) {
      console.warn(`No organization found for site URL: ${siteUrl}`);
      return {
        success: false,
        error: 'Site not registered',
        statusCode: 404,
      };
    }

    return {
      success: true,
      siteUrl: normalizedSiteUrl,
      organizationId: organization.id,
      organization: {
        id: organization.id,
        name: organization.name,
        billingCustomerId: organization.billingCustomerId,
        stripeAccountId: organization.stripeAccountId,
      },
    };
  } catch (error) {
    console.error('Database error during plugin verification:', error);
    return {
      success: false,
      error: 'Internal server error',
      statusCode: 500,
    };
  }
}
