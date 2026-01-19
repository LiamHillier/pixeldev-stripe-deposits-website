'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircleIcon } from 'lucide-react';

import { routes } from '@workspace/routes';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification link may have expired or already been used.',
  Default: 'An error occurred during authentication.',
  CredentialsSignin: 'Invalid email or password.',
  unverified_email: 'Please verify your email address before signing in.',
  incorrect_email_or_password: 'Invalid email or password.',
  rate_limit_exceeded: 'Too many attempts. Please try again later.',
  internal_server_error: 'An internal error occurred. Please try again.'
};

function AuthErrorContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || 'Default';
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <Card className="border-transparent dark:border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircleIcon className="size-5 text-destructive" />
          <CardTitle className="text-base lg:text-lg">Authentication Error</CardTitle>
        </div>
        <CardDescription>
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          If this problem persists, please contact support.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={routes.marketing.auth.SignIn}>
            Back to Sign In
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AuthErrorPage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <Card className="border-transparent dark:border-border">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Loading...</CardTitle>
        </CardHeader>
      </Card>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
