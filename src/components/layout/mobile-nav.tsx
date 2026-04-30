'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { filterNavByRole, isNavActive, NAV_ITEMS } from './navigation';
import { useUserRole } from '@/hooks/use-user-role';
import { useSupabase } from '@/hooks/useSupabase';
import { LogOut } from 'lucide-react';

export const MobileNav = () => {
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

  // Show up to 4 items; sign-out lives in the sidebar/profile menu, not in the
  // mobile primary nav (mobile space is too valuable for a destructive action).
  const navItems = items.slice(0, 4);

  // Mobile nav uses short labels — long ones like "Applications" or
  // "Scholarships" need to fit a ~64px-wide column on a 360-390px phone.
  const SHORT_LABELS: Record<string, string> = {
    Applications: 'Apply',
    Scholarships: 'Aid',
    Toolbox: 'Tools',
    Overview: 'Home',
    Students: 'Students',
    Analytics: 'Stats',
    Deadlines: 'Dates',
    Documents: 'Docs',
    Outcomes: 'Results',
    Parents: 'Parents'
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[env(safe-area-inset-bottom,8px)] pt-1 md:hidden">
      <div className="mx-auto flex max-w-md items-end justify-between gap-1 rounded-2xl border border-border/50 bg-card/90 p-1.5 text-xs font-semibold text-muted-foreground shadow-lg backdrop-blur-xl dark:bg-muted/30 dark:border-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item, pathname);
          const label = SHORT_LABELS[item.label] ?? item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:text-foreground active:bg-muted/60'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="max-w-full truncate text-[10px] font-medium leading-none">
                {label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="flex h-[46px] w-11 shrink-0 flex-col items-center justify-center gap-1 rounded-xl transition hover:text-destructive active:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-[10px] font-medium leading-none">Out</span>
        </button>
      </div>
    </nav>
  );
};
