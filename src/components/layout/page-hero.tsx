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
  breadcrumbs?: ReactNode;
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
  breadcrumbs,
  className
}: PageHeroProps) => {
  return (
    <section
      className={cn(
        'rounded-[28px] border border-border bg-card p-6 text-foreground shadow-[0_15px_40px_rgba(15,23,42,0.06)] transition-colors',
        className
      )}
    >
      <div className="flex flex-col gap-4">
        {breadcrumbs ? (
          <div className="mb-2">
            {breadcrumbs}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            {eyebrow ? (
              <p className="text-[11px] uppercase tracking-[0.5em] text-muted-foreground">{eyebrow}</p>
            ) : null}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                <span>{accent}</span>
                {highlight ? <span className="text-foreground">{highlight}</span> : null}
              </div>
              <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
              <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
            </div>
            {actions ? (
              <div className="flex flex-wrap gap-2">
                {actions}
              </div>
            ) : null}
          </div>
          {stats && stats.length > 0 ? (
            <div className="border-t border-border/70 pt-4 sm:border-l sm:border-t-0 sm:pl-4">
              <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="min-w-[180px] rounded-2xl border border-border bg-background px-5 py-3 text-center shadow-sm transition-colors sm:text-left"
                  >
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                    {stat.detail ? <p className="text-[11px] text-muted-foreground">{stat.detail}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
