'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../theme/theme-toggle';
import { useThemeMode } from '../theme/theme-provider';
import { filterNavByRole, isNavActive, NAV_ITEMS } from './navigation';
import { useUserRole } from '@/hooks/use-user-role';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const role = useUserRole();
  const navItems = filterNavByRole(NAV_ITEMS, role);
  const logoSrc = '/Ascenda_Logo-removebg-.png';

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-3">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-[999px] border border-border bg-card px-4 py-2 text-foreground shadow-[0_30px_80px_rgba(15,23,42,0.08)] transition-colors">
        <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold text-foreground">
          <div className="relative h-12 w-12 shrink-0 scale-125">
            <Image
              src={logoSrc}
              alt="Ascenda logo"
              fill
              className={cn('rounded-full object-contain transition', mode === 'dark' ? 'brightness-110' : '')}
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span>Ascenda</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground">workspace</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-xs font-medium text-muted-foreground md:flex">
          {navItems.map((link) => {
            const active = isNavActive(link, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 transition',
                  active
                    ? 'bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(15,23,42,0.25)]'
                    : 'hover:text-foreground'
                )}
              >
                <span>{link.label}</span>
                {active ? <span className="text-[10px] uppercase tracking-[0.4em] text-primary-foreground/70">Live</span> : null}
              </Link>
            );
          })}
        </nav>
        <nav className="flex items-center gap-2 overflow-x-auto text-xs font-medium text-muted-foreground md:hidden">
          {navItems.map((link) => {
            const active = isNavActive(link, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1 transition',
                  active ? 'bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(15,23,42,0.18)]' : 'hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
        </div>
      </div>
    </header>
  );
};
