import 'server-only';

import type { License, LicenseDomainActivation } from '@prisma/client';

import { prisma } from '@workspace/database/client';

import { getUserOrganization } from './get-user-organization';

export type LicenseWithActivations = License & {
  domainActivations: LicenseDomainActivation[];
};

export async function getUserLicenses(): Promise<LicenseWithActivations[]> {
  const organization = await getUserOrganization();

  if (!organization) {
    return [];
  }

  const licenses = await prisma.license.findMany({
    where: {
      organizationId: organization.id,
      deletedAt: null // Exclude soft-deleted licenses
    },
    include: {
      domainActivations: {
        orderBy: { activatedAt: 'asc' }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return licenses;
}
