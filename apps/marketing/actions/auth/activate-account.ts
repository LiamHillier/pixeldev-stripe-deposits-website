'use server';

import { signIn } from '@workspace/auth';
import { hashPassword } from '@workspace/auth/password';
import { prisma } from '@workspace/database/client';
import { routes } from '@workspace/routes';

import { validateActivationToken } from '~/lib/validate-activation-token';

export type ActivateAccountResult =
  | { success: true }
  | {
      success: false;
      error: 'invalid-token' | 'token-expired' | 'token-used' | 'account-protected' | 'server-error';
      message: string;
    };

/**
 * Activates a user account by setting their password and logging them in.
 * Validates the activation token, updates the user's password, marks token as used,
 * and signs the user in.
 *
 * @param token - The activation token UUID
 * @param password - The user's new password
 * @returns Result indicating success or error details
 */
export async function activateAccount(
  token: string,
  password: string
): Promise<ActivateAccountResult> {
  try {
    // Validate the token
    const validation = await validateActivationToken(token);

    if (!validation.valid) {
      if (validation.reason === 'not-found') {
        return {
          success: false,
          error: 'invalid-token',
          message: 'Invalid activation link. Please contact support.'
        };
      }
      if (validation.reason === 'expired') {
        return {
          success: false,
          error: 'token-expired',
          message:
            'This activation link has expired. Please contact support for a new link.'
        };
      }
      if (validation.reason === 'already-used') {
        return {
          success: false,
          error: 'token-used',
          message:
            'This activation link has already been used. Please sign in with your password.'
        };
      }
    }

    // Type narrowing: validation is valid, so token exists
    if (!validation.valid) {
      throw new Error('Unexpected: validation should be valid at this point');
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: validation.token.userId },
      select: { id: true, email: true, password: true, createdAt: true }
    });

    if (!user || !user.email) {
      return {
        success: false,
        error: 'server-error',
        message: 'User account not found. Please contact support.'
      };
    }

    // Security: Prevent activation hijacking of existing accounts
    // If user already has a password and account is older than 1 hour, reject activation
    if (user.password) {
      const accountAge = Date.now() - user.createdAt.getTime();
      const oneHourInMs = 60 * 60 * 1000;

      if (accountAge > oneHourInMs) {
        return {
          success: false,
          error: 'account-protected',
          message: 'This account is already set up. Please sign in with your existing password or reset your password if you forgot it.'
        };
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Update user password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
        select: { id: true }
      }),
      prisma.accountActivationToken.update({
        where: { id: validation.token.id },
        data: { used: true },
        select: { id: true }
      })
    ]);

    // Sign in the user (this will throw NEXT_REDIRECT for the redirect)
    await signIn('credentials', {
      email: user.email,
      password: password,
      redirect: true,
      redirectTo: routes.marketing.account.Index
    });

    return { success: true };
  } catch (error) {
    // Re-throw NEXT_REDIRECT errors (they're not actual errors, they're how Next.js redirects work)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('Error activating account:', error);
    return {
      success: false,
      error: 'server-error',
      message:
        'An error occurred while activating your account. Please try again.'
    };
  }
}
