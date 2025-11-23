import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/navbar';

export default function UniversityPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <Navbar />
      {children}
    </div>
  );
}
