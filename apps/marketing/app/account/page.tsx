import * as React from 'react';
import Link from 'next/link';
import { KeyIcon, CreditCardIcon, FileTextIcon, LifeBuoyIcon } from 'lucide-react';

import { auth } from '@workspace/auth';
import { routes } from '@workspace/routes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default async function AccountOverviewPage(): Promise<React.JSX.Element> {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name}</h1>
        <p className="text-muted-foreground">
          Manage your license, subscription, and support tickets.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="size-5" />
              License
            </CardTitle>
            <CardDescription>
              View and manage your plugin license key
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={routes.marketing.account.License}>
              <Button variant="outline" className="w-full">
                View License
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="size-5" />
              Subscription
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={routes.marketing.account.Subscription}>
              <Button variant="outline" className="w-full">
                View Subscription
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="size-5" />
              Invoices
            </CardTitle>
            <CardDescription>
              Download your billing invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={routes.marketing.account.Invoices}>
              <Button variant="outline" className="w-full">
                View Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoyIcon className="size-5" />
              Support
            </CardTitle>
            <CardDescription>
              Get help with your plugin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={routes.marketing.account.Support}>
              <Button variant="outline" className="w-full">
                Get Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
