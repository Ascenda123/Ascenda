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
  const hasMeta = Boolean(eyebrow) || Boolean(highlight) || Boolean(resolvedAccent);

  return (
    <motion.section
      className={cn(
        'surface-card surface-card--static text-foreground overflow-hidden !py-4 !px-5 sm:!py-5 sm:!px-6',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="relative flex flex-col gap-3">
        {breadcrumbs ? (
          <motion.div variants={fadeUp}>
            {breadcrumbs}
          </motion.div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          {/* Left: identity */}
          <motion.div className="min-w-0 flex-1 space-y-2" variants={containerVariants}>
            {hasMeta ? (
              <motion.div
                className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]"
                variants={fadeUp}
              >
                {eyebrow ? (
                  <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                    {eyebrow}
                  </span>
                ) : null}
                {eyebrow && (resolvedAccent || highlight) ? (
                  <span aria-hidden className="text-muted-foreground/40">·</span>
                ) : null}
                {resolvedAccent ? (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
                      isStudent
                        ? 'bg-primary/8 text-primary/80'
                        : 'bg-primary/8 text-primary/80'
                    )}
                  >
                    {!isStudent ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    ) : null}
                    <span className="font-semibold">{resolvedAccent}</span>
                    {highlight ? (
                      <>
                        <span aria-hidden className="text-primary/40">·</span>
                        <span className="font-medium text-foreground/90">{highlight}</span>
                      </>
                    ) : null}
                  </span>
                ) : null}
              </motion.div>
            ) : null}

            <motion.div variants={fadeUp} className="space-y-1.5">
              <h1
                className={cn(
                  'font-semibold tracking-tight text-foreground leading-tight',
                  'text-xl sm:text-2xl'
                )}
              >
                {title}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </motion.div>

            {actions ? (
              <motion.div className="flex flex-wrap gap-2 pt-1" variants={fadeUp}>
                {actions}
              </motion.div>
            ) : null}
          </motion.div>

          {/* Right: stats */}
          {stats && stats.length > 0 ? (
            <motion.div
              className={cn(
                'grid gap-2.5 md:shrink-0',
                stats.length === 1
                  ? 'grid-cols-1'
                  : stats.length === 2
                    ? 'grid-cols-2'
                    : stats.length === 3
                      ? 'grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-4'
              )}
              variants={statsContainerVariants}
              initial="hidden"
              animate="show"
            >
              {stats.map((stat) => {
                const isNumeric = /^[-$£€¥]?\s*[\d,]+(?:\.\d+)?\s*[%a-zA-Z]{0,3}\s*$/.test(stat.value.trim());
                return (
                  <motion.div
                    key={stat.label}
                    className="min-w-[88px] rounded-xl border border-border/70 bg-background/60 px-3 py-2"
                    variants={statVariants}
                  >
                    <p
                      className={cn(
                        'font-semibold text-foreground leading-none',
                        isNumeric ? 'tabular-nums text-lg' : 'text-sm break-words'
                      )}
                      title={stat.value}
                    >
                      <AnimatedNumber value={stat.value} />
                    </p>
                    <p
                      className="mt-1 text-[11px] font-medium text-muted-foreground truncate"
                      title={stat.label}
                    >
                      {stat.label}
                    </p>
                    {stat.detail ? (
                      <p
                        className="mt-0.5 text-[10px] text-muted-foreground/70 truncate"
                        title={stat.detail}
                      >
                        {stat.detail}
                      </p>
                    ) : null}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
};
