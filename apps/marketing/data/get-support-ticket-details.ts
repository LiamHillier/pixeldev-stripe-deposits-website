import 'server-only';

import type { SupportTicket, SupportTicketMessage, User } from '@prisma/client';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';

export type TicketAttachment = {
  id: string;
  filename: string;
  contentType: string;
  contentId: string | null;
  size: number;
  hash: string;
};

type SupportTicketWithMessages = SupportTicket & {
  messages: (SupportTicketMessage & {
    user: User | null;
    attachments: TicketAttachment[];
  })[];
};

export async function getSupportTicketDetails(
  ticketId: string
): Promise<SupportTicketWithMessages | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      userId: session.user.id // Ensure user can only access their own tickets
    },
    include: {
      messages: {
        include: {
          user: true,
          attachments: {
            select: {
              id: true,
              filename: true,
              contentType: true,
              contentId: true,
              size: true,
              hash: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  return ticket;
}
