'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../theme/theme-toggle';
import { filterNavByRole, NAV_ITEMS } from './navigation';
import { useUserRole } from '@/hooks/use-user-role';
import { NavLink } from './nav-link';

export const Navbar = () => {
  const role = useUserRole();
  const navItems = filterNavByRole(NAV_ITEMS, role);
  const logoSrc = '/Ascenda_Logo-removebg-.png';

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-3">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-[999px] border border-border bg-card px-4 py-2 text-foreground shadow-nav transition-colors">
        <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold text-foreground">
          <div className="relative h-12 w-12 shrink-0 scale-125">
            <Image
              src={logoSrc}
              alt="Ascenda logo"
              fill
              className={cn('rounded-full object-contain transition')}
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="navbar-brand transition-colors">Ascenda</span>
            <span className="navbar-subtitle text-[11px] font-medium uppercase tracking-[0.4em] transition-colors">
              workspace
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-xs font-medium text-muted-foreground md:flex">
          {navItems.map((link) => (
            <NavLink key={link.href} item={link} />
          ))}
        </nav>
        <nav className="flex items-center gap-2 overflow-x-auto text-xs font-medium text-muted-foreground md:hidden">
          {navItems.map((link) => (
            <NavLink key={link.href} item={link} mobile />
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
        </div>
      </div>
    </header>
  );
};
