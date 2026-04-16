'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SectionNavItem } from './navigation';

interface SectionNavProps {
  items: SectionNavItem[];
  getIsActive?: (item: SectionNavItem, pathname: string, searchParams: URLSearchParams) => boolean;
}

export const SectionNav = (props: SectionNavProps) => (
  <Suspense fallback={
    <nav className="surface-toolbar flex items-center gap-2 sm:gap-3 rounded-[28px] overflow-x-auto scrollbar-none -mx-1 px-1">
      {props.items.map((item) => (
        <span key={item.href} className="nav-pill shrink-0">{item.label}</span>
      ))}
    </nav>
  }>
    <SectionNavInner {...props} />
  </Suspense>
);

const SectionNavInner = ({ items, getIsActive }: SectionNavProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="surface-toolbar flex items-center gap-2 sm:gap-3 rounded-[28px] overflow-x-auto scrollbar-none -mx-1 px-1">
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
              'nav-pill shrink-0',
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
