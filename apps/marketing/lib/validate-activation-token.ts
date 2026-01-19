import { AccountActivationToken } from '@workspace/database';
import { prisma } from '@workspace/database/client';

export type ValidationResult =
  | { valid: true; token: AccountActivationToken }
  | { valid: false; reason: 'not-found' | 'expired' | 'already-used' };

/**
 * Validates an account activation token.
 * Checks if the token exists, is not expired, and has not been used.
 *
 * @param tokenString - The token UUID string
 * @returns Validation result with token record if valid, or error reason if invalid
 */
export async function validateActivationToken(
  tokenString: string
): Promise<ValidationResult> {
  const token = await prisma.accountActivationToken.findUnique({
    where: { token: tokenString }
  });

  if (!token) {
    return { valid: false, reason: 'not-found' };
  }

  if (token.used) {
    return { valid: false, reason: 'already-used' };
  }

  const now = new Date();
  if (token.expiresAt < now) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, token };
}
