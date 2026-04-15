'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Zap } from 'lucide-react';
import { stagger, cardFade, itemSlide as focusFade } from '@/lib/motion';

export type HighlightTone = 'positive' | 'warning' | 'muted' | undefined;

export type HighlightCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  href?: string;
  tone?: HighlightTone;
};

export type FocusItem = {
  id: string;
  label: string;
  title: string;
  detail: string;
};

export interface OverviewPayload {
  highlightCards: HighlightCard[];
  focusItems: FocusItem[];
  nextStepTitle: string | null;
}

const toneClass = (tone?: HighlightTone) =>
  tone === 'positive'
    ? 'border-emerald-300/60 bg-emerald-500/5'
    : tone === 'warning'
      ? 'border-amber-300/60 bg-amber-500/5'
      : tone === 'muted'
        ? 'border-border bg-muted/40'
    : 'border-border/60 bg-card/60';

const toneDot = (tone?: HighlightTone) =>
  tone === 'positive'
    ? 'bg-emerald-500'
    : tone === 'warning'
      ? 'bg-amber-500'
      : 'bg-primary';

export const DashboardOverview = ({ data }: { data: OverviewPayload }) => {
  const focusList = data.focusItems.slice(0, 4);

  return (
    <motion.section
      className="surface-stage space-y-6 text-foreground"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      <motion.div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" variants={cardFade}>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground font-semibold">Overview</p>
          <h2 className="text-2xl font-semibold text-foreground">Calm control center</h2>
          <p className="text-sm text-muted-foreground">
            {data.nextStepTitle ? `${data.nextStepTitle} is the smartest next move.` : 'Everything is aligned. Keep momentum steady.'}
          </p>
        </div>
      </motion.div>

      <div className="space-y-5">
        {/* Highlight cards */}
        <motion.div className="grid gap-4 sm:grid-cols-2" variants={stagger}>
          {data.highlightCards.map((card) => {
            const content = (
              <div className={cn(
                'group relative overflow-hidden surface-stat h-full p-5 text-foreground transition-all duration-300',
                toneClass(card.tone),
                card.href && 'hover:-translate-y-1 hover:shadow-lg cursor-pointer'
              )}>
                {/* Gradient blobs */}
                <div className={cn(
                  'pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-40',
                  card.tone === 'positive' ? 'bg-emerald-400' : card.tone === 'warning' ? 'bg-amber-400' : 'bg-primary'
                )} />

                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', toneDot(card.tone))} />
                    <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">{card.label}</p>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-foreground leading-tight tracking-tight">{card.value}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{card.detail}</p>
                  {card.href && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-0.5 duration-200">
                      View details <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            );

            return (
              <motion.div key={card.id} variants={cardFade}>
                {card.href ? (
                  <Link href={card.href} className="block h-full" aria-label={card.label}>
                    {content}
                  </Link>
                ) : content}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Focus radar */}
        <motion.div className="surface-stat rounded-2xl p-5" variants={cardFade}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary ring-1 ring-primary/10">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Focus radar</p>
                <p className="text-xs text-muted-foreground">Only the items that keep you moving.</p>
              </div>
            </div>
          </div>
          <motion.ul className="mt-4 space-y-2" variants={stagger}>
            {focusList.map((item, index) => (
              <motion.li
                key={item.id}
                className="group surface-subcard p-4 transition-all duration-300 hover:-translate-y-px hover:shadow-sm hover:border-primary/10"
                variants={focusFade}
                whileHover={{ x: 2 }}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary mt-0.5 ring-1 ring-primary/10 group-hover:bg-primary/15 transition-colors">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
              </motion.li>
            ))}
            {focusList.length === 0 && (
              <motion.li className="surface-subcard p-4 text-sm text-muted-foreground" variants={focusFade}>
                Nothing urgent right now. Keep logging progress or add programs to reveal new actions.
              </motion.li>
            )}
          </motion.ul>
        </motion.div>
      </div>
    </motion.section>
  );
};
