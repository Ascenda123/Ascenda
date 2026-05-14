'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftRight, Briefcase, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsDemoUser } from '@/lib/demo/use-is-demo-user';
import { useUserRole } from '@/hooks/use-user-role';

type Mode = 'student' | 'counsellor';

const modeForPath = (pathname: string | null): Mode =>
  pathname?.startsWith('/counsellor') ? 'counsellor' : 'student';

export const SideSwitcher = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isDemo = useIsDemoUser();
  const role = useUserRole();

  // Demo + admin only. Hide for real students and counsellors in production.
  if (!isDemo && role !== 'admin') return null;

  const currentMode = modeForPath(pathname);
  const nextMode: Mode = currentMode === 'student' ? 'counsellor' : 'student';
  const nextPath = nextMode === 'counsellor' ? '/counsellor' : '/dashboard';

  // Warm the next page's chunk + RSC payload so the flip moment in the
  // demo lands instantly rather than triggering a cold server-render.
  useEffect(() => {
    router.prefetch(nextPath);
  }, [router, nextPath]);
  const NextIcon = nextMode === 'counsellor' ? Briefcase : GraduationCap;
  const nextLabel = nextMode === 'counsellor' ? 'Faculty view' : 'Student view';
  const accent =
    nextMode === 'counsellor'
      ? 'border-violet-400/40 bg-violet-500/10 text-violet-700 hover:border-violet-400/70 hover:bg-violet-500/15 dark:text-violet-300'
      : 'border-sky-400/40 bg-sky-500/10 text-sky-700 hover:border-sky-400/70 hover:bg-sky-500/15 dark:text-sky-300';

  const handleSwitch = () => {
    try {
      sessionStorage.setItem('ascenda-session-role', nextMode);
    } catch {
      // sessionStorage can throw in private mode; the route guard handles fallback.
    }
    router.push(nextPath);
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      title={`Switch to ${nextLabel.toLowerCase()}`}
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all backdrop-blur-sm hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        accent,
        className
      )}
    >
      <NextIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">{nextLabel}</span>
      <ArrowLeftRight className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" aria-hidden />
    </button>
  );
};
