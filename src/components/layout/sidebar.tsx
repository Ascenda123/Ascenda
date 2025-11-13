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
    <aside className="hidden w-56 rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:block">
      <nav className="space-y-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
                active && 'bg-slate-900 text-white hover:bg-slate-900 hover:text-white'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-white' : 'text-slate-400')} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
