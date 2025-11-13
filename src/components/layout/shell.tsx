import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-white text-slate-900">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.04),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 pb-12 pt-8 md:px-6">
          <Sidebar />
          <main className="flex-1 space-y-8 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
