'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, stagger as staggerVariant, childFade } from '@/lib/motion';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  const showTarget = typeof fadeUp.show === 'object' ? fadeUp.show as Record<string, unknown> : {};
  const showTransition = (showTarget.transition ?? {}) as Record<string, unknown>;

  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: fadeUp.hidden,
        show: { ...showTarget, transition: { ...showTransition, delay } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn(className)}
      variants={staggerVariant}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedGridItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={cn(className)} variants={childFade}>
      {children}
    </motion.div>
  );
}
