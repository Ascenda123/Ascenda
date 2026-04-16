import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-background pb-28 md:pb-16 text-foreground transition-colors">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:m-2">
        Skip to main content
      </a>
      <Navbar />
      <div className="flex w-full gap-6 px-4 pt-28 sm:px-6 lg:px-10">
        <Sidebar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-w-0 space-y-6 p-5 lg:p-6 text-foreground transition-colors motion-safe:animate-fade-in"
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
