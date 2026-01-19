import 'server-only';

import type { SupportTicket } from '@prisma/client';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';

type SupportTicketWithMessageCount = SupportTicket & {
  _count: {
    messages: number;
  };
};

export async function getUserSupportTickets(): Promise<
  SupportTicketWithMessageCount[]
> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const tickets = await prisma.supportTicket.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      _count: {
        select: {
          messages: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return tickets;
}
