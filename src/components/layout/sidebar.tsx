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
    <aside className="hidden w-64 border-r border-slate-200 bg-white px-4 py-6 md:block">
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
                active && 'bg-slate-100 text-slate-900'
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
