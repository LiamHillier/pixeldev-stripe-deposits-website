'use client';

import * as React from 'react';
import { CopyIcon, CheckIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/sonner';

type LicenseKeyCardProps = {
  licenseKey: string;
};

export function LicenseKeyCard({ licenseKey }: LicenseKeyCardProps): React.JSX.Element {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    toast.success('License key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-4">
      <code className="flex-1 font-mono text-sm">{licenseKey}</code>
      <Button
        size="sm"
        variant="outline"
        onClick={handleCopy}
        className="shrink-0"
      >
        {copied ? (
          <>
            <CheckIcon className="mr-2 size-4" />
            Copied
          </>
        ) : (
          <>
            <CopyIcon className="mr-2 size-4" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}
