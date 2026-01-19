'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { MailIcon, LockIcon, AlertCircleIcon } from 'lucide-react';

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
import { Label } from '@workspace/ui/components/label';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { InputPassword } from '@workspace/ui/components/input-password';
import { InputWithAdornments } from '@workspace/ui/components/input-with-adornments';

function SignInPageContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const callbackUrl = searchParams?.get('callbackUrl') || routes.marketing.account.Index;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-transparent dark:border-border">
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">Sign in to your account</CardTitle>
        <CardDescription>
          Access your license, invoices, and support portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <InputWithAdornments
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startAdornment={<MailIcon className="size-4 shrink-0" />}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href={routes.marketing.auth.ForgotPassword}
                className="text-sm underline"
              >
                Forgot password?
              </Link>
            </div>
            <InputPassword
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startAdornment={<LockIcon className="size-4 shrink-0" />}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-[18px] shrink-0" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          >
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center gap-1 text-sm text-muted-foreground">
        <span>Need an account?</span>
        <Link
          href={routes.marketing.Pricing}
          className="text-foreground underline"
        >
          Get started
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function SignInPage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <Card className="border-transparent dark:border-border">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Loading...</CardTitle>
          <CardDescription>Please wait...</CardDescription>
        </CardHeader>
      </Card>
    }>
      <SignInPageContent />
    </Suspense>
  );
}
