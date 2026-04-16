'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Rocket, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SandboxApplication, SandboxPlatform, SandboxStatus } from '@/lib/data/student-demo-data';

// ─── Config ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<SandboxPlatform, string> = {
  'UCAS': 'bg-violet-500/10 text-violet-600 border-violet-200/60 dark:text-violet-400 dark:border-violet-500/20',
  'Common App': 'bg-sky-500/10 text-sky-600 border-sky-200/60 dark:text-sky-400 dark:border-sky-500/20',
  'UC Application': 'bg-amber-500/10 text-amber-600 border-amber-200/60 dark:text-amber-400 dark:border-amber-500/20',
  'Coalition App': 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60 dark:text-emerald-400 dark:border-emerald-500/20',
  'Direct': 'bg-muted/60 text-foreground border-border'
};

// ─── Animation ───────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
};

const cardFade = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

// ─── Component ───────────────────────────────────────────────────────────────

interface SandboxBoardProps {
  initialApps: SandboxApplication[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function SandboxBoard({ initialApps }: SandboxBoardProps) {
  const [apps, setApps] = useState<(SandboxApplication & { status: SandboxStatus })[]>(
    initialApps.map((a) => ({ ...a }))
  );

  const submittedCount = apps.filter((a) => a.status === 'submitted' || a.status === 'confirmed').length;

  const handleApply = (id: string) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'submitted' as const, submittedDate: new Date().toISOString().slice(0, 10) }
          : a
      )
    );
  };

  // Group by platform
  const platforms = [...new Set(apps.map((a) => a.platform))];

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{submittedCount}</span> of{' '}
            <span className="font-semibold text-foreground">{apps.length}</span> applications submitted
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/60">
            <motion.div
              className="h-2 rounded-full bg-emerald-500"
              animate={{ width: `${(submittedCount / apps.length) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Rocket className="h-5 w-5" />
        </div>
      </div>

      {/* Grouped cards */}
      {platforms.map((platform) => {
        const platformApps = apps.filter((a) => a.platform === platform);
        return (
          <div key={platform} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', PLATFORM_COLORS[platform])}>
                {platform}
              </span>
              <span className="text-xs text-muted-foreground">
                {platformApps.length} application{platformApps.length !== 1 ? 's' : ''}
              </span>
            </div>
            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              {platformApps.map((app) => {
                const isSubmitted = app.status === 'submitted' || app.status === 'confirmed';

                return (
                  <motion.div
                    key={app.id}
                    variants={cardFade}
                    layout
                    className={cn(
                      'flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all',
                      isSubmitted
                        ? 'border-emerald-200/60 bg-emerald-500/5 dark:border-emerald-500/20'
                        : 'border-border/60 bg-background/60 hover:-translate-y-0.5'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        <span className="mr-1.5" role="img" aria-label={app.country}>{app.flagEmoji}</span>
                        {app.university}
                      </p>
                      <p className="text-sm text-muted-foreground">{app.program} · {app.country}</p>
                    </div>

                    <AnimatePresence mode="wait">
                      {isSubmitted ? (
                        <motion.div
                          key="submitted"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          {app.submittedDate && (
                            <span className="text-xs text-muted-foreground">{formatDate(app.submittedDate)}</span>
                          )}
                          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:border-emerald-500/20 dark:text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                            Applied
                          </span>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="apply"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          onClick={() => handleApply(app.id)}
                          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Apply
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
