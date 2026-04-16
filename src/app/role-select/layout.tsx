import type { ReactNode } from 'react';

export default function RoleSelectLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50 text-foreground dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/20" />
      <div className="pointer-events-none absolute bottom-10 right-[-4rem] h-96 w-96 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-400/10" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/20 blur-3xl dark:bg-sky-400/10" />
      {children}
    </main>
  );
}
