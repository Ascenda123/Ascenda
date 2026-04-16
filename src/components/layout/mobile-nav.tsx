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

  // Show up to 4 items + sign out to avoid cramping
  const navItems = items.slice(0, 4);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[env(safe-area-inset-bottom,8px)] pt-1 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-border/50 bg-card/90 px-1 py-1.5 text-xs font-semibold text-muted-foreground shadow-lg backdrop-blur-xl dark:bg-muted/30 dark:border-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-3 transition min-w-0',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:text-foreground active:bg-muted/60'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-[10px] font-medium leading-none truncate max-w-[56px]">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-3 transition hover:text-destructive active:bg-destructive/10"
          title="Sign out"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-[10px] font-medium leading-none">Sign out</span>
        </button>
      </div>
    </nav>
  );
};
