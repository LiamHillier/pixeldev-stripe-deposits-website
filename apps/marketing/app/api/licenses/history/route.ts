import { NextResponse } from 'next/server';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';

import { getUserOrganization } from '~/data/get-user-organization';

type ActivityHistoryItem = {
  action: string;
  domain: string | null;
  occurredAt: string;
  ipAddress: string | null;
};

type HistoryResponse = {
  licenseKey: string;
  activationCount: number;
  maxDomains: number;
  currentDomains: string[];
  history: ActivityHistoryItem[];
};

export async function GET(): Promise<
  NextResponse<HistoryResponse | { error: string }>
> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const organization = await getUserOrganization();

  if (!organization) {
    return NextResponse.json({ error: 'No organization' }, { status: 404 });
  }

  const license = await prisma.license.findFirst({
    where: { organizationId: organization.id },
    include: {
      domainActivations: {
        orderBy: { activatedAt: 'asc' }
      },
      activities: {
        orderBy: { occurredAt: 'desc' },
        take: 50
      }
    }
  });

  if (!license) {
    return NextResponse.json({ error: 'No license found' }, { status: 404 });
  }

  return NextResponse.json({
    licenseKey: license.licenseKey,
    activationCount: license.domainActivations.length,
    maxDomains: license.maxDomains,
    currentDomains: license.domainActivations.map((a) => a.domain),
    history: license.activities.map((a) => ({
      action: a.actionType,
      domain: a.domain,
      occurredAt: a.occurredAt.toISOString(),
      ipAddress: a.ipAddress
    }))
  });
}
