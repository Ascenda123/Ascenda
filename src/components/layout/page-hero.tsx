'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
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
  /**
   * 'student' = warmer, lighter, sentence-case (default for student-facing pages).
   * 'counsellor' = denser, all-caps tracking, live-pulse pill (operational vibe).
   */
  tone?: 'student' | 'counsellor';
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

const statVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

const statsContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } }
};

function AnimatedNumber({ value }: { value: string }) {
  const numericMatch = value.match(/-?[\d,]*\.?\d+/);
  const numericText = numericMatch ? numericMatch[0].replace(/,/g, '') : '';
  const numeric = numericText ? parseFloat(numericText) : NaN;
  const isNumeric = !Number.isNaN(numeric) && numeric > 0;
  const prefix = numericMatch ? value.slice(0, numericMatch.index) : '';
  const suffix = numericMatch ? value.slice((numericMatch.index ?? 0) + numericMatch[0].length) : '';
  const isInteger = Number.isInteger(numeric) && !numericText.includes('.');

  const formatNumber = (n: number) => {
    if (isInteger) return Math.round(n).toLocaleString('en-US');
    return (Math.round(n * 10) / 10).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 18 });
  const [display, setDisplay] = useState(isNumeric ? `${prefix}0${suffix}` : value);

  useEffect(() => {
    if (inView && isNumeric) motionVal.set(numeric);
  }, [inView, isNumeric, numeric, motionVal]);

  useEffect(() => {
    if (!isNumeric) return;
    return spring.on('change', (v) => {
      setDisplay(`${prefix}${formatNumber(v)}${suffix}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spring, isNumeric, numeric, prefix, suffix, isInteger]);

  return <span ref={ref}>{display}</span>;
}

export const PageHero = ({
  eyebrow,
  title,
  description,
  highlight,
  accent,
  stats,
  actions,
  breadcrumbs,
  className,
  tone = 'counsellor'
}: PageHeroProps) => {
  const isStudent = tone === 'student';
  const resolvedAccent = accent ?? (isStudent ? 'Today' : 'Live focus');
  return (
    <motion.section
      className={cn(
        'surface-card surface-card--static text-foreground overflow-hidden',
        isStudent && 'sm:p-8',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Ambient gradient blob — warmer for students, indigo-only for counsellors */}
      {isStudent ? (
        <>
          <div className="pointer-events-none absolute -top-28 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-violet-400/15 via-primary/10 to-emerald-300/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-amber-200/15 blur-3xl" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/3 blur-2xl" />
        </>
      )}

      <div className="relative flex flex-col gap-4">
        {breadcrumbs ? (
          <motion.div className="mb-2" variants={fadeUp}>
            {breadcrumbs}
          </motion.div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <motion.div className="space-y-3" variants={containerVariants}>
            {eyebrow ? (
              <motion.p
                className={cn(
                  'text-muted-foreground',
                  isStudent
                    ? 'text-xs font-medium tracking-normal'
                    : 'text-[11px] uppercase tracking-[0.5em]'
                )}
                variants={fadeUp}
              >
                {eyebrow}
              </motion.p>
            ) : null}
            <motion.div className="space-y-2" variants={fadeUp}>
              {isStudent ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary/80">
                  <span>{resolvedAccent}</span>
                  {highlight ? (
                    <>
                      <span className="text-muted-foreground/60">·</span>
                      <span className="font-semibold text-foreground">{highlight}</span>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-primary/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span>{resolvedAccent}</span>
                  {highlight ? <span className="text-foreground font-bold">{highlight}</span> : null}
                </div>
              )}
              <h1
                className={cn(
                  'font-semibold text-foreground',
                  isStudent
                    ? 'text-[26px] leading-tight md:text-[34px]'
                    : 'text-[22px] leading-snug md:text-[28px]'
                )}
              >
                {title}
              </h1>
              <p
                className={cn(
                  'text-muted-foreground',
                  isStudent ? 'max-w-xl text-sm sm:text-base leading-relaxed' : 'max-w-xl text-xs sm:text-sm'
                )}
              >
                {description}
              </p>
            </motion.div>
            {actions ? (
              <motion.div className="flex flex-wrap gap-2" variants={fadeUp}>
                {actions}
              </motion.div>
            ) : null}
          </motion.div>
          {stats && stats.length > 0 ? (
            <div className="border-t border-border/70 pt-3 sm:pt-4 md:border-l md:border-t-0 md:pl-4">
              <motion.div
                className={cn(
                  'grid gap-2 sm:gap-3 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]',
                  // On mobile: 2-up if 3+ stats (safer for long values like "$31,667 USD"),
                  // 3-up only when there are exactly 3 short stats and we're on a slightly wider phone.
                  stats.length >= 4
                    ? 'grid-cols-2'
                    : stats.length === 3
                      ? 'grid-cols-2 sm:grid-cols-3'
                      : stats.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-1'
                )}
                variants={statsContainerVariants}
                initial="hidden"
                animate="show"
              >
                {stats.map((stat) => {
                  // Numeric values stay on one line (truncate, tabular-nums); text
                  // values like "Video / In-person" or "Sarah Mitchell" wrap so
                  // they don't show ugly mid-word ellipses on mobile.
                  const isNumeric = /^[-$£€¥]?\s*[\d,]+(?:\.\d+)?\s*[%a-zA-Z]{0,3}\s*$/.test(stat.value.trim());
                  return (
                  <motion.div
                    key={stat.label}
                    className={cn(
                      'min-w-0 rounded-xl sm:rounded-2xl border border-border bg-background px-3 py-2 sm:px-5 sm:py-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 sm:text-left'
                    )}
                    variants={statVariants}
                  >
                    <p
                      className={cn(
                        'font-semibold text-foreground',
                        isNumeric
                          ? 'tabular-nums truncate text-base sm:text-2xl'
                          : 'text-sm leading-tight sm:text-lg break-words'
                      )}
                      title={stat.value}
                    >
                      <AnimatedNumber value={stat.value} />
                    </p>
                    <p
                      className={cn(
                        'truncate text-muted-foreground',
                        isStudent
                          ? 'text-[11px] sm:text-xs font-medium'
                          : 'text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em]'
                      )}
                      title={stat.label}
                    >
                      {stat.label}
                    </p>
                    {stat.detail ? (
                      <p className="hidden truncate sm:block text-[11px] text-muted-foreground" title={stat.detail}>
                        {stat.detail}
                      </p>
                    ) : null}
                  </motion.div>
                  );
                })}
              </motion.div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
};
