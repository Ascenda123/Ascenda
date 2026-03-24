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

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto w-full max-w-3xl px-4 md:hidden">
      <div className="flex items-center justify-between gap-2 rounded-full border border-border/50 bg-card/70 px-4 py-3 text-xs font-semibold text-muted-foreground shadow-soft backdrop-blur-xl dark:bg-muted/20 dark:border-white/10 dark:shadow-none">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 transition',
                active ? 'bg-primary text-primary-foreground shadow-[0_10px_25px_rgba(15,23,42,0.22)]' : 'hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className="flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 transition hover:text-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  );
};
