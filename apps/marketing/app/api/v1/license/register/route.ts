import { NextResponse } from 'next/server';
import { prisma } from '@workspace/database/client';
import { inMemoryRateLimiter } from '@workspace/rate-limit/in-memory';
import { verifyPluginSignature } from '../../_lib/verify-plugin-signature';

/**
 * Rate limiter: 10 requests per minute per site
 */
const rateLimiter = inMemoryRateLimiter({
  intervalInMs: 60000, // 1 minute
});

/**
 * License Registration Request Body
 */
interface LicenseRegisterRequest {
  license_key: string;
  email: string;
  site_url: string;
  action: 'activate' | 'deactivate' | 'check';
}

/**
 * POST /api/v1/license/register
 *
 * Registers or updates license status for a site.
 * Plugin calls this when user activates/deactivates license.
 *
 * For now, accepts any non-empty license key as valid.
 * In production, this would validate against your license server (EDD, etc.)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Parse request body
    const body = (await request.json()) as LicenseRegisterRequest;

    // Verify plugin signature (don't require organization in DB)
    const verification = await verifyPluginSignature(request, body, false);

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.statusCode }
      );
    }

    const { siteUrl } = verification;

    // Rate limiting (10 requests/minute per site)
    const rateCheck = rateLimiter.check(10, `license:${siteUrl}`);
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
    if (!body.license_key && body.action !== 'deactivate') {
      return NextResponse.json(
        { error: 'Missing license_key' },
        { status: 400 }
      );
    }

    if (!body.action) {
      return NextResponse.json(
        { error: 'Missing action' },
        { status: 400 }
      );
    }

    console.log(
      `[License] ${body.action} request for ${siteUrl} - Key: ${body.license_key?.substring(0, 8)}...`
    );

    // Find or create organization by site URL
    let organization = await prisma.organization.findFirst({
      where: { siteUrl },
    });

    if (!organization) {
      // Create organization if it doesn't exist
      // Use site URL domain as slug and name
      const url = new URL(siteUrl);
      const slug = url.hostname.replace(/\./g, '-').toLowerCase();

      organization = await prisma.organization.create({
        data: {
          slug: `plugin-${slug}-${Date.now()}`,
          name: url.hostname,
          siteUrl,
        },
      });

      console.log(`[License] Created organization for ${siteUrl}: ${organization.id}`);
    }

    // Handle different actions
    if (body.action === 'deactivate') {
      // Deactivate license
      await prisma.organization.update({
        where: { id: organization.id },
        data: {
          licenseStatus: null,
          licenseExpiresAt: null,
          // Keep licenseKey and licenseEmail for reference
        },
      });

      console.log(`[License] Deactivated license for ${siteUrl}`);

      return NextResponse.json({
        success: true,
        status: 'inactive',
        expires_at: null,
      });
    }

    if (body.action === 'check') {
      // Return current status
      return NextResponse.json({
        success: true,
        status: organization.licenseStatus || 'inactive',
        expires_at: organization.licenseExpiresAt?.toISOString() || null,
      });
    }

    // Action is 'activate'
    // Validate license key
    // For now, accept any non-empty key as valid
    // In production, call your EDD/license server here
    const isValidKey = body.license_key && body.license_key.length >= 8;

    if (!isValidKey) {
      return NextResponse.json({
        success: true,
        status: 'invalid',
        expires_at: null,
      });
    }

    // Calculate expiration (1 year from now for valid licenses)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Update organization with license info
    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        licenseKey: body.license_key,
        licenseEmail: body.email || null,
        licenseStatus: 'active',
        licenseExpiresAt: expiresAt,
      },
    });

    console.log(
      `[License] Activated license for ${siteUrl} - Expires: ${expiresAt.toISOString()}`
    );

    return NextResponse.json({
      success: true,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    });
  } catch (error: unknown) {
    console.error('[License] Error processing license request:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
