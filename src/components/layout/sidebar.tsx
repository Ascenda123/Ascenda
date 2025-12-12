'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { filterNavByRole, isNavActive, NAV_ITEMS } from './navigation';
import { useUserRole } from '@/hooks/use-user-role';

export const Sidebar = () => {
  const pathname = usePathname();
  const role = useUserRole();
  const items = filterNavByRole(NAV_ITEMS, role);

  return (
    <aside className="glass-panel sticky top-28 hidden w-60 self-start rounded-[24px] p-5 text-foreground transition-colors md:block">
      <nav className="space-y-1">
        {items.map((item) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active && 'bg-muted/60 text-foreground shadow-inner'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-foreground' : 'text-muted-foreground')} aria-hidden />
              <span>{item.label}</span>
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
