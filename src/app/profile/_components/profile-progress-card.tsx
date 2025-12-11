'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { PROFILE_STEPS, type StepCompletionMap } from '@/lib/profile/steps';
import { cn } from '@/lib/utils';

interface ProfileProgressCardProps {
  completionPercent: number;
  completedCount: number;
  totalSteps: number;
  nextStepTitle?: string;
  stepCompletion: StepCompletionMap;
}

const confettiPieces = [
  { top: '10%', left: '14%', delay: 0 },
  { top: '18%', left: '82%', delay: 0.05 },
  { top: '32%', left: '36%', delay: 0.12 },
  { top: '40%', left: '68%', delay: 0.18 },
  { top: '22%', left: '50%', delay: 0.24 }
];

export function ProfileProgressCard({
  completionPercent,
  completedCount,
  totalSteps,
  nextStepTitle,
  stepCompletion
}: ProfileProgressCardProps) {
  const [celebrate, setCelebrate] = useState(false);
  const clampedPercent = useMemo(() => Math.min(100, Math.max(0, completionPercent)), [completionPercent]);
  const isComplete = clampedPercent >= 100;

  useEffect(() => {
    if (!isComplete) {
      setCelebrate(false);
      return;
    }

    setCelebrate(true);
    const timer = setTimeout(() => setCelebrate(false), 2200);
    return () => clearTimeout(timer);
  }, [isComplete]);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-card/60 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-lg backdrop-saturate-150 transition-colors dark:border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-primary/5 to-sky-500/5 opacity-60" aria-hidden />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Profile completion</p>
          <p className="text-3xl font-semibold text-foreground">{clampedPercent}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {completedCount}/{totalSteps} steps done {nextStepTitle ? `• Next: ${nextStepTitle}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-foreground backdrop-blur-sm dark:border-white/10">
          <Sparkles className="h-4 w-4 text-primary" />
          Progress
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-sky-400 to-emerald-400 shadow-[0_0_0_1px_rgba(255,255,255,0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercent}%` }}
          transition={{ type: 'spring', stiffness: 110, damping: 20 }}
          aria-hidden
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {PROFILE_STEPS.map((step) => {
          const complete = stepCompletion[step.key];
          return (
            <Link
              key={step.key}
              href={`/profile?onboarding=true&step=${step.key}`}
              className={cn(
                'group relative overflow-hidden rounded-2xl border px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-colors hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                complete
                  ? 'border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-400/30 dark:bg-emerald-500/10'
                  : 'border-white/10 bg-white/5 dark:border-white/10 dark:bg-white/5'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
                    complete
                      ? 'bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-400/40 dark:text-emerald-200'
                      : 'bg-white/5 text-muted-foreground ring-1 ring-white/10'
                  )}
                >
                  {complete ? 'Complete' : 'Action'}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary opacity-80 transition group-hover:opacity-100">
                Open
              </span>
            </Link>
          );
        })}
      </div>

      <AnimatePresence>
        {celebrate ? (
          <>
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-[28px] ring-2 ring-primary/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[0_0_80px_rgba(56,189,248,0.35)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              {confettiPieces.map((piece, index) => (
                <motion.span
                  key={`${piece.left}-${piece.top}-${index}`}
                  className="absolute h-2 w-4 rounded-full bg-gradient-to-r from-primary via-sky-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                  style={{ top: piece.top, left: piece.left }}
                  initial={{ y: -12, opacity: 0, rotate: -12 }}
                  animate={{ y: 12, opacity: [0.9, 1, 0.6, 0], rotate: [0, 8, -6, 12] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, delay: piece.delay, ease: 'easeOut' }}
                />
              ))}
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
