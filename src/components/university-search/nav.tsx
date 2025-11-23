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
    <nav className="flex flex-wrap items-center gap-3 rounded-[32px] border border-border bg-card px-4 py-3 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-colors">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-semibold transition hover:bg-muted/80',
              isActive
                ? 'border-primary bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(15,23,42,0.25)]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};
