'use client';

import * as React from 'react';
import { DownloadIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';

export function DownloadPluginButton(): React.JSX.Element {
  // TODO: Replace with actual download URL
  const downloadUrl = '/downloads/plugin.zip';

  return (
    <Button asChild>
      <a href={downloadUrl} download>
        <DownloadIcon className="mr-2 size-4" />
        Download Plugin
      </a>
    </Button>
  );
}
