'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/matches', label: 'Matches' },
  { href: '/applications', label: 'Applications' }
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-sm">
            A
          </span>
          Ascenda
        </Link>
        <nav className="hidden items-center gap-6 text-[0.65rem] uppercase tracking-[0.35em] text-slate-400 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition hover:text-slate-900',
                pathname.startsWith(link.href) && 'text-slate-900'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden border border-slate-200 text-sm text-slate-900 hover:bg-slate-50 md:inline-flex">
            <Link href="/matches">Matches</Link>
          </Button>
          <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
            <Link href="/applications">Planner</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
