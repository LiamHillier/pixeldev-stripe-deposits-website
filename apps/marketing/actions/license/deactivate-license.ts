'use server';

import { revalidatePath } from 'next/cache';

import { LicenseActivityType } from '@workspace/database';
import { prisma } from '@workspace/database/client';
import { routes } from '@workspace/routes';

import { getUserLicenses } from '~/data/get-user-licenses';

type DeactivateResult = {
  success: true;
} | {
  success: false;
  error: string;
};

function normalizeDomain(d: string): string {
  return d
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

export async function deactivateLicense(
  domain?: string
): Promise<DeactivateResult> {
  try {
    const licenses = await getUserLicenses();

    if (licenses.length === 0) {
      return { success: false, error: 'No license found' };
    }

    // For now, work with the first license
    const license = licenses[0]!;

    if (domain) {
      // Deactivate specific domain
      const normalizedDomain = normalizeDomain(domain);

      const activation = license.domainActivations.find(
        (a) => normalizeDomain(a.domain) === normalizedDomain
      );

      if (!activation) {
        return { success: false, error: 'Domain not activated on this license' };
      }

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
            metadata: { source: 'account_deactivation' }
          }
        });
      });
    } else {
      // Deactivate all domains
      const domains = license.domainActivations.map((a) => a.domain);

      await prisma.$transaction(async (tx) => {
        // Delete all domain activations
        await tx.licenseDomainActivation.deleteMany({
          where: { licenseId: license.id }
        });

        // Update legacy fields
        await tx.license.update({
          where: { id: license.id },
          data: {
            activatedDomain: null,
            activatedAt: null
          }
        });

        // Create activity records for each domain
        if (domains.length > 0) {
          await tx.licenseActivity.createMany({
            data: domains.map((d) => ({
              licenseId: license.id,
              actionType: LicenseActivityType.DEACTIVATE,
              domain: d,
              metadata: { source: 'account_deactivation_all' }
            }))
          });
        }
      });
    }

    // Revalidate the license page
    revalidatePath(routes.marketing.account.License);

    return { success: true };
  } catch (error) {
    console.error('[DEACTIVATE LICENSE] Error:', error);
    return { success: false, error: 'Failed to deactivate license' };
  }
}
