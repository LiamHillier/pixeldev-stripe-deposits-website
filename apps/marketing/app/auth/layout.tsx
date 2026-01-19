import * as React from 'react';

export default function AuthLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="bg-muted flex flex-col items-center justify-center py-12 p-6 md:p-10">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
