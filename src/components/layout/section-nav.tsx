'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SectionNavItem } from './navigation';

interface SectionNavProps {
  items: SectionNavItem[];
  getIsActive?: (item: SectionNavItem, pathname: string, searchParams: URLSearchParams) => boolean;
}

export const SectionNav = ({ items, getIsActive }: SectionNavProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="flex flex-wrap items-center gap-3 rounded-[32px] border border-border bg-card px-4 py-3 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-colors">
      {items.map((item) => {
        const active = getIsActive
          ? getIsActive(item, pathname, searchParams)
          : item.matchParam
            ? (() => {
                const value = searchParams.get(item.matchParam.key);
                if (!value && item.matchParam.value === 'personal') {
                  return pathname.startsWith('/profile');
                }
                return value === item.matchParam.value;
              })()
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-semibold transition hover:bg-muted/80',
              active
                ? 'border-primary bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(15,23,42,0.25)]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
