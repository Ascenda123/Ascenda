'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GraduationCap, ListChecks, Target, FileText, LayoutDashboard, Settings, Search, Award, BookmarkCheck } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: Target },
  { href: '/matches', label: 'Matches', icon: GraduationCap },
  { href: '/university-search/search', label: 'Search', icon: Search },
  { href: '/applications', label: 'Applications', icon: FileText },
  { href: '/applications/tasks', label: 'Checklist', icon: ListChecks },
  { href: '/shortlist', label: 'Course details', icon: BookmarkCheck },
  { href: '/scholarships', label: 'Scholarships', icon: Award },
  { href: '/admin', label: 'Admin', icon: Settings }
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky top-28 hidden w-60 self-start rounded-[24px] border border-border bg-card p-5 text-foreground shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-colors md:block">
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active && 'bg-muted/60 text-foreground shadow-inner'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-foreground' : 'text-muted-foreground')} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 space-y-2 rounded-2xl border border-border bg-muted/40 p-4 text-foreground transition-colors">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Support</p>
        <p className="text-base font-semibold leading-tight text-foreground">Need a counselor nudge?</p>
        <p className="text-sm text-muted-foreground">Live response in under 5 min during office hours.</p>
        <Link
          href="mailto:hello@ascenda.com"
          className="inline-flex items-center justify-center rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/50"
        >
          Ping support →
        </Link>
      </div>
    </aside>
  );
};
