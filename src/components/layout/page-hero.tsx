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
  accent = 'Live focus',
  stats,
  actions,
  breadcrumbs,
  className
}: PageHeroProps) => {
  return (
    <motion.section
      className={cn(
        'surface-card surface-card--static text-foreground overflow-hidden',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Ambient gradient blob */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/3 blur-2xl" />

      <div className="relative flex flex-col gap-4">
        {breadcrumbs ? (
          <motion.div className="mb-2" variants={fadeUp}>
            {breadcrumbs}
          </motion.div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <motion.div className="space-y-3" variants={containerVariants}>
            {eyebrow ? (
              <motion.p className="text-[11px] uppercase tracking-[0.5em] text-muted-foreground" variants={fadeUp}>{eyebrow}</motion.p>
            ) : null}
            <motion.div className="space-y-2" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-primary/70">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>{accent}</span>
                {highlight ? <span className="text-foreground font-bold">{highlight}</span> : null}
              </div>
              <h1 className="text-[22px] font-semibold leading-snug text-foreground md:text-[28px]">{title}</h1>
              <p className="max-w-xl text-xs sm:text-sm text-muted-foreground">{description}</p>
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
                className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]"
                variants={statsContainerVariants}
                initial="hidden"
                animate="show"
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="rounded-xl sm:rounded-2xl border border-border bg-background px-3 py-2 sm:px-5 sm:py-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 sm:text-left"
                    variants={statVariants}
                  >
                    <p className="text-lg sm:text-2xl font-semibold text-foreground">
                      <AnimatedNumber value={stat.value} />
                    </p>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                    {stat.detail ? <p className="hidden sm:block text-[11px] text-muted-foreground">{stat.detail}</p> : null}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
};
