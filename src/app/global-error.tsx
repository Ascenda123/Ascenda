'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Unhandled global error', error);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Ascenda</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Something broke behind the scenes.</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          We could not render the workspace safely. Use the button below to reload. If it keeps happening, please capture any steps
          leading to the error and share them with support.
        </p>
        <Button type="button" className="mt-6" onClick={() => reset()}>
          Reload workspace
        </Button>
        {error?.digest ? <p className="mt-3 text-xs text-muted-foreground">Error reference: {error.digest}</p> : null}
      </body>
    </html>
  );
}
