'use server';

import { prisma } from '@workspace/database/client';
import { PASSWORD_RESET_EXPIRY_HOURS } from '@workspace/auth/constants';
import { sendPasswordResetEmail } from '@workspace/email/send-password-reset-email';
import { baseUrl } from '@workspace/routes';

export type RequestPasswordResetResult =
  | { success: true }
  | { success: false; error: 'server-error'; message: string };

/**
 * Requests a password reset for the given email address.
 * Creates a reset token and sends an email with a reset link.
 * Always returns success even if email doesn't exist (prevents email enumeration).
 *
 * @param email - The email address to send reset instructions to
 * @returns Result indicating success
 */
export async function requestPasswordReset(
  email: string
): Promise<RequestPasswordResetResult> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true }
    });

    // If user doesn't exist, still return success (prevent email enumeration)
    if (!user || !user.email) {
      return { success: true };
    }

    // Delete any existing reset tokens for this email
    await prisma.resetPasswordRequest.deleteMany({
      where: { email: normalizedEmail }
    });

    // Create new reset token with expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_EXPIRY_HOURS);

    const resetRequest = await prisma.resetPasswordRequest.create({
      data: {
        email: normalizedEmail,
        expires: expiresAt
      }
    });

    // Build reset link
    const resetLink = `${baseUrl.Marketing}/auth/reset-password/${resetRequest.id}`;

    // Send password reset email
    await sendPasswordResetEmail({
      recipient: user.email,
      appName: 'Payment Plans for WooCommerce',
      name: user.name || 'there',
      resetPasswordLink: resetLink
    });

    return { success: true };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      error: 'server-error',
      message: 'An error occurred. Please try again later.'
    };
  }
}
