'use server';

import { signIn } from '@workspace/auth';
import { hashPassword } from '@workspace/auth/password';
import { prisma } from '@workspace/database/client';
import { routes } from '@workspace/routes';

export type ResetPasswordResult =
  | { success: true }
  | {
      success: false;
      error: 'invalid-token' | 'token-expired' | 'user-not-found' | 'server-error';
      message: string;
    };

/**
 * Resets a user's password using a valid reset token.
 * Validates the token, updates the password, deletes the token,
 * and signs the user in.
 *
 * @param token - The reset token UUID
 * @param password - The new password
 * @returns Result indicating success or error details
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<ResetPasswordResult> {
  try {
    // Find the reset request
    const resetRequest = await prisma.resetPasswordRequest.findUnique({
      where: { id: token }
    });

    if (!resetRequest) {
      return {
        success: false,
        error: 'invalid-token',
        message: 'Invalid or expired reset link. Please request a new one.'
      };
    }

    // Check if token is expired
    if (resetRequest.expires < new Date()) {
      // Delete the expired token
      await prisma.resetPasswordRequest.delete({
        where: { id: token }
      });

      return {
        success: false,
        error: 'token-expired',
        message: 'This reset link has expired. Please request a new one.'
      };
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: resetRequest.email },
      select: { id: true, email: true }
    });

    if (!user || !user.email) {
      return {
        success: false,
        error: 'user-not-found',
        message: 'User account not found. Please contact support.'
      };
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update password and delete reset token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
        select: { id: true }
      }),
      prisma.resetPasswordRequest.delete({
        where: { id: token }
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

    console.error('Error resetting password:', error);
    return {
      success: false,
      error: 'server-error',
      message: 'An error occurred. Please try again.'
    };
  }
}
