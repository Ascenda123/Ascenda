'use client';

import Link from 'next/link';
import { BookOpen, Compass, LayoutDashboard, Search, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

type WorkspaceKey = 'dashboard' | 'matches' | 'applications' | 'profile' | 'search';

interface DockMetric {
  key: WorkspaceKey;
  value: string;
  detail: string;
}

interface StudentWorkspaceDockProps {
  current: WorkspaceKey;
  metrics?: Partial<Record<WorkspaceKey, Omit<DockMetric, 'key'>>>;
}

const ITEMS = [
  {
    key: 'dashboard' as const,
    label: 'Dashboard',
    description: 'Mission control and priorities',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    key: 'matches' as const,
    label: 'Matches',
    description: 'Best-fit programs and signals',
    href: '/matches',
    icon: Target
  },
  {
    key: 'applications' as const,
    label: 'Planner',
    description: 'Tasks, documents, and deadlines',
    href: '/applications',
    icon: BookOpen
  },
  {
    key: 'profile' as const,
    label: 'Profile',
    description: 'Readiness and academic inputs',
    href: '/profile',
    icon: Compass
  },
  {
    key: 'search' as const,
    label: 'Search',
    description: 'Browse the full catalog',
    href: '/university-search/search',
    icon: Search
  }
];

export function StudentWorkspaceDock({ current, metrics }: StudentWorkspaceDockProps) {
  return (
    <section className="surface-stage space-y-4">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Workspace</p>
          <h2 className="text-2xl font-semibold text-foreground">Student platform</h2>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Click to jump between modules</p>
      </div>
      <div className="relative z-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.key === current;
          const metric = metrics?.[item.key];

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'surface-subcard group flex min-h-[156px] flex-col justify-between p-4 transition-all duration-300 hover:-translate-y-1',
                active ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/10' : ''
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground transition-colors dark:border-white/10 dark:bg-muted/20',
                    active ? 'border-primary/20 bg-primary/10 text-primary' : 'group-hover:text-foreground'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em]',
                    active ? 'bg-primary text-primary-foreground' : 'bg-muted/70 text-muted-foreground'
                  )}>
                    {active ? 'Open' : 'Jump'}
                  </span>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="space-y-1 border-t border-border/60 pt-3 dark:border-white/10">
                <p className="text-xl font-semibold text-foreground">{metric?.value ?? 'Open'}</p>
                <p className="text-xs text-muted-foreground">{metric?.detail ?? 'Go to module'}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
