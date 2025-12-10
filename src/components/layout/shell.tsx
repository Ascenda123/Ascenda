import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-background pb-16 text-foreground transition-colors">
      <Navbar />
      <div className="flex w-full justify-center px-4 pt-28 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl gap-6">
          <Sidebar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 space-y-8 rounded-[28px] border border-border bg-card p-6 text-foreground shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-colors"
          >
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
};
