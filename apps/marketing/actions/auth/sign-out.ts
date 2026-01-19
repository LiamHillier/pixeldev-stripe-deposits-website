'use server';

import { signOut as authSignOut } from '@workspace/auth';
import { routes } from '@workspace/routes';

export async function signOut(): Promise<void> {
  await authSignOut({ redirectTo: routes.marketing.auth.SignIn });
}
