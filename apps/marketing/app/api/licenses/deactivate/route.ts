import { NextRequest, NextResponse } from 'next/server';

import { LicenseActivityType, prisma } from '@workspace/database/client';

type DeactivateRequest = {
  licenseKey: string;
  domain: string;
};

type DeactivateResponse = {
  success: boolean;
  message: string;
  remainingDomains?: string[];
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
): Promise<NextResponse<DeactivateResponse>> {
  try {
    const body: DeactivateRequest = await request.json();
    const { licenseKey, domain } = body;

    if (!licenseKey || !domain) {
      return NextResponse.json(
        {
          success: false,
          message: 'License key and domain are required'
        },
        { status: 400 }
      );
    }

    const normalizedDomain = normalizeDomain(domain);

    // Find the license with activations
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: { domainActivations: true }
    });

    if (!license) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid license key'
        },
        { status: 404 }
      );
    }

    // Find the activation for this domain
    const activation = license.domainActivations.find(
      (a) => normalizeDomain(a.domain) === normalizedDomain
    );

    if (!activation) {
      const activatedDomains = license.domainActivations.map((a) => a.domain);
      if (activatedDomains.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'License is not activated on any domain'
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: `Domain ${normalizedDomain} is not activated. Currently activated on: ${activatedDomains.join(', ')}`
        },
        { status: 403 }
      );
    }

    const clientIP = getClientIP(request);

    // Use transaction to delete activation and create activity
    const remainingActivations = await prisma.$transaction(async (tx) => {
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
          metadata: { source: 'api_deactivation' }
        }
      });

      return remaining;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'License deactivated successfully',
        remainingDomains: remainingActivations.map((a) => a.domain)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('License deactivation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
