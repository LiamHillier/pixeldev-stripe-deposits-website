import { auth } from '@workspace/auth';

// Support admin emails - users with these emails can access admin features
const SUPPORT_ADMIN_EMAILS = [
  process.env.SUPPORT_ADMIN_EMAIL ?? 'admin@example.com'
];

export async function isSupportAdmin(): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.email) {
    return false;
  }

  return SUPPORT_ADMIN_EMAILS.includes(session.user.email);
}
