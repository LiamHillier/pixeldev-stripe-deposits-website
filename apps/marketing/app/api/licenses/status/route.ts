import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@workspace/database/client';

type StatusRequest = {
  licenseKey: string;
};

type StatusResponse = {
  valid: boolean;
  licenseKey: string;
  status: 'active' | 'expired' | 'paused' | 'canceled' | 'invalid';
  expiresAt: string | null;
  renewalDate: string | null;
  subscriptionStatus: string | null;
  activatedDomain: string | null;
  activatedDomains: string[];
  maxDomains: number;
  slotsRemaining: number;
  activationCount: number;
  canActivate: boolean;
  message: string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<StatusResponse>> {
  try {
    const body: StatusRequest = await request.json();
    const { licenseKey } = body;

    if (!licenseKey) {
      return NextResponse.json(
        {
          valid: false,
          licenseKey: '',
          status: 'invalid',
          expiresAt: null,
          renewalDate: null,
          subscriptionStatus: null,
          activatedDomain: null,
          activatedDomains: [],
          maxDomains: 0,
          slotsRemaining: 0,
          activationCount: 0,
          canActivate: false,
          message: 'License key is required'
        },
        { status: 400 }
      );
    }

    // Find license with subscription data and activations
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        subscription: true,
        domainActivations: true,
        organization: {
          include: {
            subscriptions: {
              where: { active: true },
              take: 1
            }
          }
        }
      }
    });

    if (!license) {
      return NextResponse.json(
        {
          valid: false,
          licenseKey,
          status: 'invalid',
          expiresAt: null,
          renewalDate: null,
          subscriptionStatus: null,
          activatedDomain: null,
          activatedDomains: [],
          maxDomains: 0,
          slotsRemaining: 0,
          activationCount: 0,
          canActivate: false,
          message: 'Invalid license key'
        },
        { status: 404 }
      );
    }

    // Determine license status
    const now = new Date();
    const isExpired = license.expiresAt < now;
    const isDeleted = license.deletedAt !== null;
    const subscriptionStatus = license.subscription?.status ?? null;
    const isPaused = subscriptionStatus === 'paused';
    const hasActiveSubscription = license.organization.subscriptions.length > 0;

    const activatedDomains = license.domainActivations.map((a) => a.domain);
    const slotsRemaining = Math.max(0, license.maxDomains - activatedDomains.length);

    let status: StatusResponse['status'];
    let message: string;
    let canActivate = false;

    if (isDeleted) {
      status = 'canceled';
      message = 'License has been canceled';
    } else if (isExpired) {
      status = 'expired';
      message = 'License has expired';
    } else if (isPaused) {
      status = 'paused';
      message = 'Subscription is paused';
    } else if (!hasActiveSubscription) {
      status = 'canceled';
      message = 'No active subscription';
    } else {
      status = 'active';
      message = 'License is valid and active';
      canActivate = slotsRemaining > 0;
    }

    return NextResponse.json(
      {
        valid: status === 'active',
        licenseKey,
        status,
        expiresAt: license.expiresAt.toISOString(),
        renewalDate: license.subscription?.periodEndsAt.toISOString() ?? null,
        subscriptionStatus,
        activatedDomain: activatedDomains[0] ?? null,
        activatedDomains,
        maxDomains: license.maxDomains,
        slotsRemaining,
        activationCount: activatedDomains.length,
        canActivate,
        message
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('License status error:', error);
    return NextResponse.json(
      {
        valid: false,
        licenseKey: '',
        status: 'invalid',
        expiresAt: null,
        renewalDate: null,
        subscriptionStatus: null,
        activatedDomain: null,
        activatedDomains: [],
        maxDomains: 0,
        slotsRemaining: 0,
        activationCount: 0,
        canActivate: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
