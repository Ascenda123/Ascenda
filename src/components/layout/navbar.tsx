'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../theme/theme-toggle';
import { filterNavByRole, NAV_ITEMS } from './navigation';
import { useUserRole } from '@/hooks/use-user-role';
import { NavLink } from './nav-link';

import { LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '../ui/button';

export const Navbar = () => {
  const role = useUserRole();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const navItems = filterNavByRole(NAV_ITEMS, role, pathname);
  const logoSrc = '/Ascenda_Logo-removebg-.png';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="container mx-auto px-4 pb-3 pt-3 md:px-6">
        <div
          className={cn(
            'flex w-full items-center justify-between rounded-[28px] border border-white/30 bg-background/70 px-4 py-2 text-foreground backdrop-blur-md backdrop-saturate-150 transition-all supports-[backdrop-filter]:bg-background/70 dark:border-white/10 dark:bg-card/70',
            scrolled ? 'shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]' : 'shadow-nav'
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold text-foreground">
            <div className="relative h-12 w-12 shrink-0 scale-125">
              <Image
                src={logoSrc}
                alt="Ascenda logo"
                fill
                className={cn('rounded-full object-contain transition')}
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="navbar-brand transition-colors">Ascenda</span>
              <span className="navbar-subtitle text-[11px] font-medium uppercase tracking-[0.4em] transition-colors">
                workspace
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-xs font-medium text-muted-foreground md:flex">
            {navItems.map((link) => (
              <NavLink key={link.href} item={link} />
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
