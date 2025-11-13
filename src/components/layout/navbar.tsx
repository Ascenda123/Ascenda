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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night/70 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-iris to-sunrise text-sm">
            A
          </span>
          Ascenda
        </Link>
        <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.3em] text-white/60 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition hover:text-white',
                pathname.startsWith(link.href) && 'text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden text-sm md:inline-flex">
            <Link href="/matches">Matches</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/applications">Planner</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
