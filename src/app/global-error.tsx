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
      <body className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-slate-700">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Ascenda</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Something broke behind the scenes.</h1>
        <p className="mt-2 max-w-lg text-sm text-slate-500">
          We could not render the workspace safely. Use the button below to reload. If it keeps happening, please capture any steps
          leading to the error and share them with support.
        </p>
        <Button type="button" className="mt-6" onClick={() => reset()}>
          Reload workspace
        </Button>
        {error?.digest ? <p className="mt-3 text-xs text-slate-400">Error reference: {error.digest}</p> : null}
      </body>
    </html>
  );
}
