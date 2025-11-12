import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-6 md:px-6">
        <Sidebar />
        <main className="flex-1 space-y-6">{children}</main>
      </div>
    </div>
  );
};
