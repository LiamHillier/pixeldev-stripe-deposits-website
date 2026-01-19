import * as React from 'react';
import { redirect } from 'next/navigation';

import { auth } from '@workspace/auth';
import { routes } from '@workspace/routes';

// Marketing app sign-in redirects to dashboard auth
// Users who are already signed in will be redirected to the account page
export default async function SignInPage(): Promise<React.JSX.Element> {
  const session = await auth();

  if (session?.user) {
    redirect(routes.marketing.account.Index);
  }

  // Redirect to dashboard sign-in
  redirect(routes.dashboard.auth.SignIn);
}
