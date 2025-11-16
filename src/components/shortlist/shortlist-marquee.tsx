'use client';

import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShortlistMarqueeProps {
  className?: string;
  label?: string;
  tone?: 'light' | 'dark';
}

const marqueeItems = ['Course breakdown', 'Shortlist sync', 'Module clarity', 'Next steps'];

export const ShortlistMarquee = ({ className, label = 'Shortlist flow', tone = 'dark' }: ShortlistMarqueeProps) => {
  const isLight = tone === 'light';
  const containerClasses = isLight
    ? 'border-slate-200/70 bg-white text-slate-900'
    : 'border-white/10 bg-white/5 text-white';
  const labelClasses = isLight ? 'text-slate-400' : 'text-white/60';
  const textClasses = isLight ? 'text-slate-900' : 'text-white';

  return (
    <div
      className={cn(
        'relative w-full max-w-full overflow-hidden rounded-full px-6 py-3 backdrop-blur',
        containerClasses,
        className
      )}
    >
      <div className={cn('mb-1 text-[0.6rem] uppercase tracking-[0.4em]', labelClasses)}>{label}</div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-lg font-semibold uppercase tracking-[0.3em] sm:justify-between">
        {marqueeItems.map((text) => (
          <span key={text} className={cn('flex items-center gap-2', textClasses)}>
            {text}
            <GraduationCap className={cn('h-5 w-5', isLight ? 'text-amber-500' : 'text-amber-300')} aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
};
