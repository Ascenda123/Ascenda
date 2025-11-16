import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen text-slate-900">
      <Navbar />
      <div className="flex w-full justify-center px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl gap-6">
          <Sidebar />
          <main className="flex-1 space-y-8 rounded-[28px] border border-[#e5e5e7] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
