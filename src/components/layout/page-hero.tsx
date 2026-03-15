'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
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
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

const statVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

const statsContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } }
};

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
        'surface-card surface-card--static text-foreground',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col gap-4">
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
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                <span>{accent}</span>
                {highlight ? <span className="text-foreground">{highlight}</span> : null}
              </div>
              <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
              <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
            </motion.div>
            {actions ? (
              <motion.div className="flex flex-wrap gap-2" variants={fadeUp}>
                {actions}
              </motion.div>
            ) : null}
          </motion.div>
          {stats && stats.length > 0 ? (
            <div className="border-t border-border/70 pt-4 sm:border-l sm:border-t-0 sm:pl-4">
              <motion.div
                className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
                variants={statsContainerVariants}
                initial="hidden"
                animate="show"
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="min-w-[180px] rounded-2xl border border-border bg-background px-5 py-3 text-center shadow-sm transition-colors hover:-translate-y-0.5 hover:shadow-md sm:text-left"
                    variants={statVariants}
                  >
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                    {stat.detail ? <p className="text-[11px] text-muted-foreground">{stat.detail}</p> : null}
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
