'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../theme/theme-toggle';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/matches', label: 'Matches' },
  { href: '/applications', label: 'Applications', exact: true },
  { href: '/applications/tasks', label: 'Checklist' },
  { href: '/scholarships', label: 'Scholarships' }
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-[999px] border border-border bg-card px-4 py-3 text-foreground shadow-[0_30px_80px_rgba(15,23,42,0.08)] transition-colors">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <div className="flex flex-col leading-tight">
            <span>Ascenda</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground">workspace</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-xs font-medium text-muted-foreground md:flex">
          {links.map((link) => {
            const active = pathname === link.href || (!link.exact && pathname.startsWith(`${link.href}/`));
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
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
        </div>
      </div>
    </header>
  );
};
