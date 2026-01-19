'use client';

import * as React from 'react';
import { XIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/sonner';

import { deactivateLicense } from '~/actions/license/deactivate-license';

type DeactivateLicenseButtonProps = {
  domain?: string;
};

export function DeactivateLicenseButton({
  domain
}: DeactivateLicenseButtonProps): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDeactivate = async (): Promise<void> => {
    const message = domain
      ? `Are you sure you want to unlink ${domain}? You can reactivate the license on a different domain.`
      : 'Are you sure you want to unlink all domains? You can reactivate the license on different domains.';

    if (!confirm(message)) {
      return;
    }

    setIsLoading(true);
    const result = await deactivateLicense(domain);

    if (result.success) {
      toast.success(
        domain ? `${domain} unlinked successfully` : 'All domains unlinked successfully'
      );
    } else {
      toast.error(result.error || 'Failed to unlink domain');
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDeactivate}
      disabled={isLoading}
      className="h-auto px-2 py-1 text-muted-foreground hover:text-destructive"
    >
      <XIcon className="mr-1 size-3" />
      Unlink
    </Button>
  );
}
