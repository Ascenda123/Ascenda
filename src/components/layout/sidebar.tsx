'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GraduationCap, ListChecks, Target, FileText, LayoutDashboard, Settings, Search, Award } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: Target },
  { href: '/matches', label: 'Matches', icon: GraduationCap },
  { href: '/university-search/search', label: 'Search', icon: Search },
  { href: '/applications', label: 'Applications', icon: FileText },
  { href: '/applications/tasks', label: 'Checklist', icon: ListChecks },
  { href: '/shortlist', label: 'Course details', icon: Award },
  { href: '/admin', label: 'Admin', icon: Settings }
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky top-28 hidden w-60 self-start rounded-[24px] border border-[#e5e5e7] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:block">
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#f5f5f7] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200',
                active && 'bg-[#f5f5f7] text-slate-900 shadow-inner'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-slate-900' : 'text-slate-400')} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 space-y-2 rounded-2xl border border-[#e5e5e7] bg-[#f9f9fb] p-4 text-slate-700">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Support</p>
        <p className="text-base font-semibold leading-tight text-slate-900">Need a counselor nudge?</p>
        <p className="text-sm text-slate-500">Live response in under 5 min during office hours.</p>
        <Link
          href="mailto:hello@ascenda.com"
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#f0f0f2]"
        >
          Ping support →
        </Link>
      </div>
    </aside>
  );
};
