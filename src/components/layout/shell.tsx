import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-background pb-16 text-foreground transition-colors">
      <Navbar />
      <div className="flex w-full gap-6 px-4 pt-28 sm:px-6 lg:px-10">
        <Sidebar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-w-0 space-y-6 rounded-2xl border border-border bg-card p-5 lg:p-6 text-foreground shadow-sm transition-colors motion-safe:animate-fade-in dark:bg-card dark:border-white/10"
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
