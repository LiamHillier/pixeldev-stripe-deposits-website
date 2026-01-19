import { Prisma, prisma } from '@workspace/database/client';
import type { LicenseActivityType } from '@workspace/database/client';

export type CreateLicenseActivityParams = {
  licenseId: string;
  actionType: LicenseActivityType;
  domain?: string | null;
  ipAddress?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function createLicenseActivity(
  params: CreateLicenseActivityParams
): Promise<void> {
  await prisma.licenseActivity.create({
    data: {
      licenseId: params.licenseId,
      actionType: params.actionType,
      domain: params.domain ?? null,
      ipAddress: params.ipAddress ?? null,
      metadata: params.metadata ?? Prisma.JsonNull
    }
  });
}

export async function createLicenseActivities(
  activities: CreateLicenseActivityParams[]
): Promise<void> {
  if (activities.length === 0) return;

  await prisma.licenseActivity.createMany({
    data: activities.map((params) => ({
      licenseId: params.licenseId,
      actionType: params.actionType,
      domain: params.domain ?? null,
      ipAddress: params.ipAddress ?? null,
      metadata: params.metadata ?? Prisma.JsonNull
    }))
  });
}
