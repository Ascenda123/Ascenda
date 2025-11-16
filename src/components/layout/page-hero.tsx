import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeroStat {
  label: string;
  value: string;
  detail?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  highlight?: string;
  accent?: string;
  stats?: HeroStat[];
  actions?: ReactNode;
  className?: string;
}

export const PageHero = ({
  eyebrow,
  title,
  description,
  highlight,
  accent = 'Live focus',
  stats,
  actions,
  className
}: PageHeroProps) => {
  return (
    <section
      className={cn(
        'rounded-[28px] border border-[#e5e5e7] bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)]',
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.5em] text-slate-400">{eyebrow}</p>
          ) : null}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e7] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">
              <span>{accent}</span>
              {highlight ? <span className="text-slate-900">{highlight}</span> : null}
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{title}</h1>
            <p className="max-w-xl text-sm text-slate-500">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {stats && stats.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[#e5e5e7] bg-white px-4 py-3 text-center">
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                {stat.detail ? <p className="text-[11px] text-slate-500">{stat.detail}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};
