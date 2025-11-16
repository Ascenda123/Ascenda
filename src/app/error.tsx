'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-slate-600">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Something went wrong</p>
      <h1 className="text-2xl font-semibold text-slate-900">We hit a snag loading this view.</h1>
      <p className="max-w-md text-sm text-slate-500">
        The page will auto-refresh, but you can force a retry below. If the issue persists, let the team know so we can investigate.
      </p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
      {error?.digest ? <p className="text-xs text-slate-400">Error reference: {error.digest}</p> : null}
    </div>
  );
}
