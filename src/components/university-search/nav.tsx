'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Search', href: '/university-search/search' },
  { label: 'Results', href: '/university-search/results' },
  { label: 'Shortlist', href: '/university-search/shortlist' }
];

export const UniversitySearchNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-3 rounded-[32px] border border-slate-200 bg-white px-4 py-3 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-slate-100',
              isActive
                ? 'border border-slate-900 bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.25)]'
                : 'text-slate-600'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};
