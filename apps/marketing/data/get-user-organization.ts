import 'server-only';

import type { Organization } from '@prisma/client';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';

export async function getUserOrganization(): Promise<Organization | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Get the user's personal organization (first membership)
  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id
    },
    include: {
      organization: true
    },
    orderBy: {
      createdAt: 'asc' // Get the first (personal) organization
    }
  });

  return membership?.organization ?? null;
}
