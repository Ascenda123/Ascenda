import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-night text-white">
      <div className="pointer-events-none fixed inset-0 bg-mesh-gradient opacity-90" aria-hidden />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 pb-12 pt-8 md:px-6">
          <Sidebar />
          <main className="flex-1 space-y-8 rounded-4xl border border-white/10 bg-white/5 p-6 shadow-glow-sm backdrop-blur">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
