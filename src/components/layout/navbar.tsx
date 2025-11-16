'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/matches', label: 'Matches' },
  { href: '/applications', label: 'Applications' },
  { href: '/applications/tasks', label: 'Checklist' }
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-transparent px-4 py-4 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-[999px] border border-white/60 bg-white/80 px-4 py-3 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <div className="flex flex-col leading-tight">
            <span>Ascenda</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-slate-400">workspace</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-xs font-medium text-slate-500 md:flex">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 transition',
                  active ? 'bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)]' : 'hover:text-slate-900'
                )}
              >
                <span>{link.label}</span>
                {active ? <span className="text-[10px] uppercase tracking-[0.4em] text-white/70">Live</span> : null}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2" />
      </div>
    </header>
  );
};
