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
    <nav className="surface-toolbar flex flex-wrap items-center gap-3 rounded-[32px]">
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
            : item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'nav-pill',
              active
                ? 'nav-pill-active'
                : ''
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
