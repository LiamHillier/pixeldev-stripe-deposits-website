import * as React from 'react';
import { format } from 'date-fns';
import {
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  GlobeIcon
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

import { getUserLicenses } from '~/data/get-user-licenses';
import { LicenseKeyCard } from '~/components/account/license/license-key-card';
import { DeactivateLicenseButton } from '~/components/account/license/deactivate-license-button';
import { DownloadPluginButton } from '~/components/account/license/download-plugin-button';

export default async function LicensePage(): Promise<React.JSX.Element> {
  const licenses = await getUserLicenses();

  if (licenses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Licenses</h1>
          <p className="text-muted-foreground">
            No licenses found. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Licenses</h1>
        <p className="text-muted-foreground">
          Manage your WordPress plugin license keys. You have{' '}
          {licenses.length} {licenses.length === 1 ? 'license' : 'licenses'}.
        </p>
      </div>

      <div className="grid gap-6">
        {licenses.map((license) => {
          const isExpired = license.expiresAt < new Date();
          const isActive = license.active && !isExpired;
          const activationsUsed = license.domainActivations.length;
          const slotsRemaining = Math.max(0, license.maxDomains - activationsUsed);

          return (
            <Card key={license.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <KeyIcon className="size-5" />
                    License Key
                  </CardTitle>
                  <Badge variant={isActive ? 'default' : 'destructive'}>
                    {isActive ? (
                      <>
                        <CheckCircleIcon className="mr-1 size-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="mr-1 size-3" />
                        {isExpired ? 'Expired' : 'Inactive'}
                      </>
                    )}
                  </Badge>
                </div>
                <CardDescription>
                  Use this license key to activate your WordPress plugin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LicenseKeyCard licenseKey={license.licenseKey} />

                <div className="grid gap-4 pt-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Expiration Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(license.expiresAt, 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GlobeIcon className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Activated Domains ({activationsUsed}/{license.maxDomains})
                      </p>
                      {license.domainActivations.length > 0 ? (
                        <div className="space-y-1">
                          {license.domainActivations.map((activation) => (
                            <div
                              key={activation.id}
                              className="flex items-center gap-1"
                            >
                              <p className="text-sm text-muted-foreground">
                                {activation.domain}
                              </p>
                              <DeactivateLicenseButton domain={activation.domain} />
                            </div>
                          ))}
                          {slotsRemaining > 0 && (
                            <p className="text-xs text-muted-foreground/70">
                              {slotsRemaining} slot{slotsRemaining !== 1 ? 's' : ''}{' '}
                              remaining
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not activated
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isActive && (
                  <div className="pt-4">
                    <DownloadPluginButton />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardHeader>
            <CardTitle>How to Activate</CardTitle>
            <CardDescription>
              Follow these steps to activate your license in WordPress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal space-y-2 pl-4">
              <li className="text-sm">Copy your license key from above</li>
              <li className="text-sm">Go to your WordPress admin panel</li>
              <li className="text-sm">
                Navigate to <strong>Settings → Stripe Deposits → License</strong>
              </li>
              <li className="text-sm">
                Paste your license key and click <strong>Activate</strong>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
