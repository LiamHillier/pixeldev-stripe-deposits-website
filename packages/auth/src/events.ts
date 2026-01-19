import type { NextAuthConfig } from 'next-auth';

import { prisma } from '@workspace/database/client';
import { sendConnectedAccountSecurityAlertEmail } from '@workspace/email/send-connected-account-security-alert-email';
import { APP_NAME } from '@workspace/common/app';

export const events = {
  async signIn({ user }) {
    if (user && user.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
        select: {
          id: true // SELECT NONE
        }
      });
    }
  },
  async signOut(message) {
    if ('session' in message && message.session?.sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken: message.session.sessionToken }
      });
    }
  },
  async linkAccount({ user, account }) {
    if (user && user.name && user.email && account && account.provider) {
      // Here we check if the user just has been created using an OAuth provider
      // - If yes -> No need to send out security alert
      // - If no (which means linked using an existing account) -> Send out security alert
      const newUser = await prisma.user.findFirst({
        where: {
          email: user.email,
          lastLogin: null
        },
        select: {
          _count: {
            select: { accounts: true }
          }
        }
      });
      const isNewUser = newUser && newUser._count.accounts < 2;
      if (!isNewUser) {
        try {
          await sendConnectedAccountSecurityAlertEmail({
            recipient: user.email,
            appName: APP_NAME,
            name: user.name,
            action: 'connected',
            provider: account.provider
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
} satisfies NextAuthConfig['events'];
