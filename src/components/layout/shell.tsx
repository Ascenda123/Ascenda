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
          className="flex-1 min-w-0 space-y-8 rounded-[28px] border border-border/50 bg-card/70 backdrop-blur-xl p-6 text-foreground shadow-soft transition-colors dark:bg-muted/10 dark:border-white/10 dark:shadow-none"
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
