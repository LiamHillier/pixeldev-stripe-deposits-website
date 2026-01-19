'use client';

import * as React from 'react';
import Link from 'next/link';
import { MailIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

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
import { InputWithAdornments } from '@workspace/ui/components/input-with-adornments';
import { requestPasswordReset } from '~/actions/auth/request-password-reset';

export default function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await requestPasswordReset(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <Card className="border-transparent dark:border-border">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Check your email</CardTitle>
          <CardDescription>
            We've sent password reset instructions to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircleIcon className="size-[18px] shrink-0" />
            <AlertDescription>
              If an account exists with this email, you will receive password reset instructions.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center gap-1 text-sm text-muted-foreground">
          <Link
            href={routes.marketing.auth.SignIn}
            className="text-foreground underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-transparent dark:border-border">
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-[18px] shrink-0" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          >
            Send reset link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center gap-1 text-sm text-muted-foreground">
        <span>Remember your password?</span>
        <Link
          href={routes.marketing.auth.SignIn}
          className="text-foreground underline"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
