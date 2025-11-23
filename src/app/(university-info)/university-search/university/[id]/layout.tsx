import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/navbar';

export default function UniversityPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {children}
    </div>
  );
}
