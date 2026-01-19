import { NextResponse } from 'next/server';
import { LicenseActivityType } from '@workspace/database';
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

function normalizeDomain(d: string): string {
  return d
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? null;
}

/**
 * POST /api/v1/license/register
 *
 * Registers or updates license status for a site.
 * Plugin calls this when user activates/deactivates license.
 *
 * Uses the new License model for multi-domain support and activity tracking.
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

    const normalizedDomain = normalizeDomain(siteUrl);
    const clientIP = getClientIP(request);

    // Find license by key (new model)
    const license = await prisma.license.findUnique({
      where: { licenseKey: body.license_key },
      include: { domainActivations: true }
    });

    // Handle different actions
    if (body.action === 'deactivate') {
      if (!license) {
        return NextResponse.json({
          success: true,
          status: 'inactive',
          expires_at: null,
        });
      }

      // Find and remove the domain activation
      const activation = license.domainActivations.find(
        (a) => normalizeDomain(a.domain) === normalizedDomain
      );

      if (activation) {
        await prisma.$transaction(async (tx) => {
          // Delete the domain activation
          await tx.licenseDomainActivation.delete({
            where: { id: activation.id }
          });

          // Get remaining activations
          const remaining = await tx.licenseDomainActivation.findMany({
            where: { licenseId: license.id },
            orderBy: { activatedAt: 'desc' }
          });

          // Update legacy fields
          await tx.license.update({
            where: { id: license.id },
            data: {
              activatedDomain: remaining[0]?.domain ?? null,
              activatedAt: remaining[0]?.activatedAt ?? null
            }
          });

          // Create activity record
          await tx.licenseActivity.create({
            data: {
              licenseId: license.id,
              actionType: LicenseActivityType.DEACTIVATE,
              domain: normalizedDomain,
              ipAddress: clientIP,
              metadata: { source: 'plugin_deactivation' }
            }
          });
        });

        console.log(`[License] Deactivated license for ${siteUrl}`);
      }

      return NextResponse.json({
        success: true,
        status: 'inactive',
        expires_at: null,
      });
    }

    if (body.action === 'check') {
      if (!license) {
        return NextResponse.json({
          success: true,
          status: 'inactive',
          expires_at: null,
        });
      }

      // Check if license is valid
      const now = new Date();
      const isExpired = license.expiresAt < now;
      const isDeleted = license.deletedAt !== null;
      const isActive = license.active && !isExpired && !isDeleted;

      // Check if this domain is activated
      const isActivatedOnDomain = license.domainActivations.some(
        (a) => normalizeDomain(a.domain) === normalizedDomain
      );

      return NextResponse.json({
        success: true,
        status: isActive ? (isActivatedOnDomain ? 'active' : 'not_activated') : (isExpired ? 'expired' : 'inactive'),
        expires_at: license.expiresAt?.toISOString() || null,
        activated_domains: license.domainActivations.map((a) => a.domain),
        max_domains: license.maxDomains,
      });
    }

    // Action is 'activate'
    if (!license) {
      return NextResponse.json({
        success: false,
        status: 'invalid',
        expires_at: null,
        message: 'Invalid license key'
      });
    }

    // Check if license is valid
    const now = new Date();
    if (license.deletedAt !== null) {
      return NextResponse.json({
        success: false,
        status: 'canceled',
        expires_at: null,
        message: 'License has been canceled'
      });
    }

    if (license.expiresAt < now) {
      return NextResponse.json({
        success: false,
        status: 'expired',
        expires_at: license.expiresAt.toISOString(),
        message: 'License has expired'
      });
    }

    if (!license.active) {
      return NextResponse.json({
        success: false,
        status: 'inactive',
        expires_at: license.expiresAt.toISOString(),
        message: 'License is not active'
      });
    }

    // Check if already activated on this domain
    const existingActivation = license.domainActivations.find(
      (a) => normalizeDomain(a.domain) === normalizedDomain
    );

    if (existingActivation) {
      return NextResponse.json({
        success: true,
        status: 'active',
        expires_at: license.expiresAt.toISOString(),
        activated_domains: license.domainActivations.map((a) => a.domain),
        max_domains: license.maxDomains,
      });
    }

    // Check if can activate on more domains
    if (license.domainActivations.length >= license.maxDomains) {
      return NextResponse.json({
        success: false,
        status: 'limit_reached',
        expires_at: license.expiresAt.toISOString(),
        message: `License activation limit reached (${license.maxDomains} domains). Currently activated on: ${license.domainActivations.map((a) => a.domain).join(', ')}`,
        activated_domains: license.domainActivations.map((a) => a.domain),
        max_domains: license.maxDomains,
      });
    }

    // Activate on this domain
    await prisma.$transaction(async (tx) => {
      // Create domain activation
      await tx.licenseDomainActivation.create({
        data: {
          licenseId: license.id,
          domain: normalizedDomain,
          ipAddress: clientIP
        }
      });

      // Update legacy fields and activation count
      await tx.license.update({
        where: { id: license.id },
        data: {
          activatedDomain: normalizedDomain,
          activatedAt: now,
          activationCount: { increment: 1 }
        }
      });

      // Create activity record
      await tx.licenseActivity.create({
        data: {
          licenseId: license.id,
          actionType: LicenseActivityType.ACTIVATE,
          domain: normalizedDomain,
          ipAddress: clientIP,
          metadata: { source: 'plugin_activation' }
        }
      });
    });

    console.log(
      `[License] Activated license for ${siteUrl} - Expires: ${license.expiresAt.toISOString()}`
    );

    // Get updated activations
    const updatedLicense = await prisma.license.findUnique({
      where: { id: license.id },
      include: { domainActivations: true }
    });

    return NextResponse.json({
      success: true,
      status: 'active',
      expires_at: license.expiresAt.toISOString(),
      activated_domains: updatedLicense?.domainActivations.map((a) => a.domain) || [],
      max_domains: license.maxDomains,
    });
  } catch (error: unknown) {
    console.error('[License] Error processing license request:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
