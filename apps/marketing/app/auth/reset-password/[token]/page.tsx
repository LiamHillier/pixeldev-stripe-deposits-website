'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

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

import { resetPassword } from '~/actions/auth/reset-password';

export default function ResetPasswordPage(): React.JSX.Element {
  const params = useParams();
  const token = params?.token as string;

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, password);

      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
      } else {
        setSuccess(true);
        // The resetPassword function will redirect to account page
      }
    } catch {
      // The redirect from signIn might throw, which is expected
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <Card className="border-transparent dark:border-border">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <CheckCircleIcon className="size-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-center text-base lg:text-lg">
            Password Reset!
          </CardTitle>
          <CardDescription className="text-center">
            Your password has been updated. Redirecting to your account...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-transparent dark:border-border">
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">Reset Your Password</CardTitle>
        <CardDescription>
          Enter a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="size-[18px] shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New Password</Label>
            <InputPassword
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
              minLength={8}
              placeholder="Enter your new password"
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters long
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <InputPassword
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
              minLength={8}
              placeholder="Confirm your new password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          >
            Reset Password
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
