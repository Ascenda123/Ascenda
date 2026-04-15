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

  // Limit to the 5 most relevant nav items to avoid overflow
  const navItems = items.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto w-full max-w-sm px-3 md:hidden">
      <div className="flex items-center justify-between gap-1 rounded-full border border-border/50 bg-card/80 px-2 py-2 text-xs font-semibold text-muted-foreground shadow-soft backdrop-blur-xl dark:bg-muted/20 dark:border-white/10 dark:shadow-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 px-1 transition min-w-0',
                active ? 'bg-primary text-primary-foreground shadow-[0_6px_20px_rgba(15,23,42,0.2)]' : 'hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              <span className="text-[9px] font-semibold truncate leading-none">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center gap-0.5 rounded-full py-2 px-3 transition hover:text-destructive"
          title="Sign out"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden />
          <span className="text-[9px] font-semibold leading-none">Out</span>
        </button>
      </div>
    </nav>
  );
};
