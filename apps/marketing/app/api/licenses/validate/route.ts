import { NextRequest, NextResponse } from 'next/server';

import { LicenseActivityType, prisma } from '@workspace/database/client';

type ValidateRequest = {
  licenseKey: string;
  domain: string;
};

type ValidateResponse = {
  valid: boolean;
  active?: boolean;
  expiresAt?: string;
  activatedDomain?: string | null;
  activatedDomains?: string[];
  activationCount?: number;
  maxDomains?: number;
  slotsRemaining?: number;
  message?: string;
};

function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? null;
}

function normalizeDomain(d: string): string {
  return d
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ValidateResponse>> {
  try {
    const body: ValidateRequest = await request.json();
    const { licenseKey, domain } = body;

    if (!licenseKey || !domain) {
      return NextResponse.json(
        {
          valid: false,
          message: 'License key and domain are required'
        },
        { status: 400 }
      );
    }

    // Find the license with activations
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: { domainActivations: true }
    });

    if (!license) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Invalid license key'
        },
        { status: 404 }
      );
    }

    // Check if license has been soft-deleted (subscription cancelled)
    if (license.deletedAt !== null) {
      return NextResponse.json(
        {
          valid: false,
          active: false,
          message: 'License has been deactivated'
        },
        { status: 200 }
      );
    }

    // Check if license is expired
    const now = new Date();
    if (license.expiresAt < now) {
      return NextResponse.json(
        {
          valid: false,
          active: false,
          expiresAt: license.expiresAt.toISOString(),
          message: 'License has expired'
        },
        { status: 200 }
      );
    }

    // Check if license is active (synced from Stripe subscription status)
    if (!license.active) {
      return NextResponse.json(
        {
          valid: false,
          active: false,
          message: 'License is not active'
        },
        { status: 200 }
      );
    }

    const normalizedDomain = normalizeDomain(domain);
    const activatedDomains = license.domainActivations.map((a) => a.domain);

    // Check if this domain is already activated
    const isActivated = activatedDomains.some(
      (d) => normalizeDomain(d) === normalizedDomain
    );

    if (isActivated) {
      // Domain is activated - return success
      return NextResponse.json(
        {
          valid: true,
          active: license.active,
          expiresAt: license.expiresAt.toISOString(),
          activatedDomain: normalizedDomain,
          activatedDomains,
          activationCount: activatedDomains.length,
          maxDomains: license.maxDomains,
          slotsRemaining: Math.max(0, license.maxDomains - activatedDomains.length),
          message: 'License is valid'
        },
        { status: 200 }
      );
    }

    // Domain not activated - check if we can auto-activate
    const canActivate = activatedDomains.length < license.maxDomains;

    if (!canActivate) {
      return NextResponse.json(
        {
          valid: false,
          active: false,
          activatedDomain: activatedDomains[0] ?? null,
          activatedDomains,
          maxDomains: license.maxDomains,
          slotsRemaining: 0,
          message: `License activation limit reached. Currently activated on: ${activatedDomains.join(', ')}`
        },
        { status: 200 }
      );
    }

    // Auto-activate on this domain
    const clientIP = getClientIP(request);

    const updatedLicense = await prisma.$transaction(async (tx) => {
      // Create domain activation
      await tx.licenseDomainActivation.create({
        data: {
          licenseId: license.id,
          domain: normalizedDomain,
          ipAddress: clientIP
        }
      });

      // Update legacy fields and activation count
      const updated = await tx.license.update({
        where: { id: license.id },
        data: {
          activatedDomain: normalizedDomain,
          activatedAt: now,
          activationCount: { increment: 1 }
        },
        include: { domainActivations: true }
      });

      // Create activity record
      await tx.licenseActivity.create({
        data: {
          licenseId: license.id,
          actionType: LicenseActivityType.ACTIVATE,
          domain: normalizedDomain,
          ipAddress: clientIP,
          metadata: { source: 'api_validation' }
        }
      });

      return updated;
    });

    const newActivatedDomains = updatedLicense.domainActivations.map(
      (a) => a.domain
    );

    return NextResponse.json(
      {
        valid: true,
        active: true,
        expiresAt: license.expiresAt.toISOString(),
        activatedDomain: normalizedDomain,
        activatedDomains: newActivatedDomains,
        activationCount: newActivatedDomains.length,
        maxDomains: license.maxDomains,
        slotsRemaining: Math.max(0, license.maxDomains - newActivatedDomains.length),
        message: 'License activated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json(
      {
        valid: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
