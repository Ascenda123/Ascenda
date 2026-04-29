'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarPlus, ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { filterNavByRole, isNavActive, NAV_ITEMS } from './navigation';
import { useUserRole } from '@/hooks/use-user-role';
import { useSupabase } from '@/hooks/useSupabase';
import { useSidebar } from './sidebar-context';

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const role = useUserRole();
  const items = filterNavByRole(NAV_ITEMS, role, pathname);
  const { collapsed, toggle } = useSidebar();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'sticky top-28 hidden self-start rounded-2xl border border-border bg-card text-foreground shadow-sm transition-[width] duration-200 md:block dark:border-white/10 dark:bg-card',
        collapsed ? 'w-16 p-2' : 'w-60 p-3'
      )}
      aria-label="Primary navigation"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between px-1 pb-2')}>
        {!collapsed ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Menu</span>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={`${collapsed ? 'Expand' : 'Collapse'} sidebar (⌘B)`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-0.5">
        {items.map((item) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                'group flex h-9 items-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                active && 'bg-primary/10 text-foreground font-semibold'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
                aria-hidden
              />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign out' : undefined}
          aria-label={collapsed ? 'Sign out' : undefined}
          className={cn(
            'flex h-9 w-full items-center rounded-lg text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive',
            collapsed ? 'justify-center px-0' : 'gap-3 px-3'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          {!collapsed ? <span className="truncate">Sign out</span> : null}
        </button>
      </nav>

      {!pathname.startsWith('/counsellor') && !collapsed ? (
        <div className="mt-4 space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-foreground transition-colors">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">Your counsellor</p>
          <p className="text-sm font-semibold leading-tight text-foreground">Mrs. Sarah Mitchell</p>
          <p className="text-xs text-muted-foreground">
            Request a session to discuss essays, applications, or university choices.
          </p>
          <Link
            href="/appointment"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Request appointment
          </Link>
        </div>
      ) : null}

      {!pathname.startsWith('/counsellor') && collapsed ? (
        <Link
          href="/appointment"
          title="Request appointment"
          aria-label="Request appointment"
          className="mt-3 flex h-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/90"
        >
          <CalendarPlus className="h-4 w-4" />
        </Link>
      ) : null}
    </aside>
  );
};
