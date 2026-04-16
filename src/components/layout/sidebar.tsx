'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { filterNavByRole, isNavActive, NAV_ITEMS } from './navigation';
import { useUserRole } from '@/hooks/use-user-role';
import { useSupabase } from '@/hooks/useSupabase';
import { LogOut, CalendarPlus } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const role = useUserRole();
  const items = filterNavByRole(NAV_ITEMS, role, pathname);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  return (
    <aside className="sticky top-28 hidden w-56 self-start rounded-2xl border border-border bg-card p-4 text-foreground shadow-sm transition-colors md:block dark:border-white/10 dark:bg-card">
      <nav className="space-y-1">
        {items.map((item) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active && 'bg-primary/10 text-foreground font-semibold'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-foreground' : 'text-muted-foreground')} aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span>Sign out</span>
        </button>
      </nav>
      {!pathname.startsWith('/counsellor') && (
        <div className="mt-6 space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-foreground transition-colors">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">Your counsellor</p>
          <p className="text-base font-semibold leading-tight text-foreground">Mrs. Sarah Mitchell</p>
          <p className="text-xs text-muted-foreground">Request a session to discuss essays, applications, or university choices.</p>
          <Link
            href="/counsellor/appointment"
            className="inline-flex items-center gap-2 justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md w-full"
          >
            <CalendarPlus className="h-4 w-4" />
            Request appointment
          </Link>
        </div>
      )}
    </aside>
  );
};
