import * as React from 'react';

import { CreateTicketDialog } from '~/components/account/support/create-ticket-dialog';
import { SupportTicketCard } from '~/components/account/support/support-ticket-card';
import { getUserSupportTickets } from '~/data/get-user-support-tickets';

export default async function SupportPage(): Promise<React.JSX.Element> {
  const tickets = await getUserSupportTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support</h1>
          <p className="text-muted-foreground">
            Get help with your WordPress plugin.
          </p>
        </div>
        <CreateTicketDialog />
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No support tickets yet. Create your first ticket to get help from
              our support team.
            </p>
            <CreateTicketDialog />
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <SupportTicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
