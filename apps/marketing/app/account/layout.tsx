import * as React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  HomeIcon,
  CreditCardIcon,
  FileTextIcon,
  KeyIcon,
  LifeBuoyIcon,
  UserIcon,
  ShieldIcon
} from 'lucide-react';

import { auth } from '@workspace/auth';
import { routes } from '@workspace/routes';
import { cn } from '@workspace/ui/lib/utils';

import { LogoutButton } from '~/components/account/logout-button';
import { isSupportAdmin } from '~/lib/is-support-admin';

const navigation = [
  {
    name: 'Overview',
    href: routes.marketing.account.Index,
    icon: HomeIcon
  },
  {
    name: 'Licenses',
    href: routes.marketing.account.License,
    icon: KeyIcon
  },
  {
    name: 'Subscription',
    href: routes.marketing.account.Subscription,
    icon: CreditCardIcon
  },
  {
    name: 'Invoices',
    href: routes.marketing.account.Invoices,
    icon: FileTextIcon
  },
  {
    name: 'Support',
    href: routes.marketing.account.Support,
    icon: LifeBuoyIcon
  },
  {
    name: 'Profile',
    href: routes.marketing.account.Profile,
    icon: UserIcon
  }
];

export default async function AccountLayout({
  children
}: React.PropsWithChildren): Promise<React.JSX.Element> {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.marketing.auth.SignIn);
  }

  const isAdmin = await isSupportAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-0 z-30 -ml-2 hidden h-screen w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'text-muted-foreground'
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <div className="h-px bg-border my-2" />
                  <Link
                    href="/admin/support"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'text-blue-600 dark:text-blue-400'
                    )}
                  >
                    <ShieldIcon className="size-4 shrink-0" />
                    Admin Dashboard
                  </Link>
                </>
              )}
              <LogoutButton />
            </nav>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
