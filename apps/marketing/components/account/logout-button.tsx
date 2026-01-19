'use client';

import * as React from 'react';
import { LogOutIcon } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';

import { signOut } from '~/actions/auth/sign-out';

export function LogoutButton(): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'text-muted-foreground'
      )}
    >
      <LogOutIcon className="size-4 shrink-0" />
      Log out
    </button>
  );
}
