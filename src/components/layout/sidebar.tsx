'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GraduationCap, ListChecks, Target, FileText, LayoutDashboard, Settings } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: Target },
  { href: '/matches', label: 'Matches', icon: GraduationCap },
  { href: '/applications', label: 'Applications', icon: FileText },
  { href: '/applications/tasks', label: 'Checklist', icon: ListChecks },
  { href: '/admin', label: 'Admin', icon: Settings }
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow-sm backdrop-blur md:block">
      <nav className="space-y-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40',
                active && 'bg-white/15 text-white'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
