import { cache } from 'react';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import { encode } from 'next-auth/jwt';


import { keys } from '../keys';
import { adapter } from './adapter';
import { callbacks } from './callbacks';
import { events } from './events';
import { providers } from './providers';
import { session } from './session';

export const authConfig = {
  adapter,
  providers,
  secret: keys().AUTH_SECRET,
  session,
  pages: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-in',
    error: '/auth/error',
    newUser: '/account'
  },
  callbacks,
  events,
  jwt: {
    maxAge: session.maxAge,
    // Required line to encode credentials sessions
    async encode(arg) {
      return (arg.token?.sessionId as string) ?? encode(arg);
    }
  },
  trustHost: true
} satisfies NextAuthConfig;

// All those actions need to be called server-side
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

// Deduplicated server-side auth call
export const dedupedAuth = cache(auth);
