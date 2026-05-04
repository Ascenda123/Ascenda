'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarClock,
  Check,
  ChevronRight,
  Plus,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  DeadlineNudge,
  NudgeUrgency,
  OutcomeRecord,
  RequirementRow,
  SandboxApplication,
  SandboxStatus,
  TimelineDeadline
} from '@/lib/data/student-demo-data';

// ─── Local helpers ───────────────────────────────────────────────────────────

const URGENCY_TONE: Record<NudgeUrgency, { ring: string; chip: string; icon: string }> = {
  critical: {
    ring: 'border-rose-200/60 bg-rose-500/5 dark:border-rose-500/20',
    chip: 'bg-rose-500/10 text-rose-600 border border-rose-200/60 dark:text-rose-400 dark:border-rose-500/20',
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
  },
  warning: {
    ring: 'border-amber-200/60 bg-amber-500/5 dark:border-amber-500/20',
    chip: 'bg-amber-500/10 text-amber-600 border border-amber-200/60 dark:text-amber-400 dark:border-amber-500/20',
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  },
  info: {
    ring: 'border-sky-200/60 bg-sky-500/5 dark:border-sky-500/20',
    chip: 'bg-sky-500/10 text-sky-600 border border-sky-200/60 dark:text-sky-400 dark:border-sky-500/20',
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
  }
};

const STATUS_LABEL: Record<SandboxStatus, string> = {
  ready: 'In progress',
  submitted: 'Submitted',
  confirmed: 'Confirmed'
};

const STATUS_TONE: Record<SandboxStatus, string> = {
  ready: 'bg-sky-500/10 text-sky-600 border border-sky-200/60 dark:text-sky-400 dark:border-sky-500/20',
  submitted: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/60 dark:text-emerald-400 dark:border-emerald-500/20',
  confirmed: 'bg-violet-500/10 text-violet-600 border border-violet-200/60 dark:text-violet-400 dark:border-violet-500/20'
};

const OUTCOME_LABEL: Record<OutcomeRecord['result'], string> = {
  accepted: 'Offer received',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  pending: 'Decision pending',
  withdrawn: 'Withdrawn'
};

const OUTCOME_TONE: Record<OutcomeRecord['result'], string> = {
  accepted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20',
  waitlisted: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20',
  pending: 'bg-muted/60 text-muted-foreground border border-border',
  withdrawn: 'bg-muted/60 text-muted-foreground border border-border'
};

function formatDueLabel(iso: string) {
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff <= 30) return `In ${diff} days`;
  return due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function urgencyIcon(urgency: NudgeUrgency) {
  if (urgency === 'critical') return AlertTriangle;
  if (urgency === 'warning') return CalendarClock;
  return Bell;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ApplicationsHubProps {
  apps: SandboxApplication[];
  requirements: RequirementRow[];
  nudges: DeadlineNudge[];
  outcomes: OutcomeRecord[];
  deadlines: TimelineDeadline[];
}

export function ApplicationsHub({
  apps,
  requirements,
  nudges,
  outcomes,
  deadlines
}: ApplicationsHubProps) {
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  const visibleNudges = useMemo(
    () => nudges.filter((n) => !dismissedNudges.has(n.id) && !n.dismissed),
    [nudges, dismissedNudges]
  );

  const upcomingDeadlines = useMemo(() => {
    const now = Date.now();
    return [...deadlines]
      .filter((d) => new Date(d.date).getTime() >= now - 24 * 60 * 60 * 1000)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [deadlines]);

  const enrichedApps = useMemo(() => {
    return apps.map((app) => {
      const req = requirements.find(
        (r) => r.university === app.university && r.programme.split(' ').slice(1).join(' ') === app.program.split(' ').slice(1).join(' ')
      ) ?? requirements.find((r) => r.university === app.university);
      const outcome = outcomes.find((o) => o.university === app.university && o.program === app.program);
      const next = deadlines
        .filter((d) => d.university === app.university)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      return { app, requirement: req, outcome, nextDeadline: next };
    });
  }, [apps, requirements, outcomes, deadlines]);

  const dismiss = (id: string) =>
    setDismissedNudges((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  return (
    <div className="space-y-8">
      {/* ── Action row: nudges (do this now) ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Now</p>
            <h2 className="text-2xl font-semibold text-foreground">What needs you today</h2>
            <p className="text-sm text-muted-foreground">
              Time-sensitive items across your applications. Dismiss to clear.
            </p>
          </div>
          {visibleNudges.length === 0 && nudges.length > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissedNudges(new Set())}
            >
              Restore dismissed ({nudges.length})
            </Button>
          ) : null}
        </div>

        {visibleNudges.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <Sparkles className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">You&apos;re all caught up</p>
            <p className="text-xs text-muted-foreground">Check back later — new nudges appear as deadlines approach.</p>
          </div>
        ) : (
          <motion.ul layout className="grid gap-3 md:grid-cols-2">
            <AnimatePresence>
              {visibleNudges.map((nudge) => {
                const tone = URGENCY_TONE[nudge.urgency];
                const Icon = urgencyIcon(nudge.urgency);
                return (
                  <motion.li
                    layout
                    key={nudge.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                    className={cn(
                      'flex items-start gap-3 rounded-[24px] border bg-card px-5 py-4',
                      tone.ring
                    )}
                  >
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl', tone.icon)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{nudge.title}</p>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', tone.chip)}>
                          {formatDueLabel(nudge.dueDate)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{nudge.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Button asChild size="xs" variant="outline">
                          <Link href={nudge.actionHref}>
                            {nudge.actionLabel}
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => dismiss(nudge.id)}
                      aria-label="Dismiss nudge"
                      className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </section>

      {/* ── Application list (the heart of the page) ─────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Your list</p>
            <h2 className="text-2xl font-semibold text-foreground">All applications</h2>
            <p className="text-sm text-muted-foreground">Click into any application to manage its requirements, tasks and decision.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/university-search/shortlist">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add from shortlist
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/applications/sandbox">Practice board</Link>
            </Button>
          </div>
        </div>

        <motion.div
          className="grid gap-4 md:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {enrichedApps.map(({ app, requirement, outcome, nextDeadline }) => {
            const progress = requirement?.progress ?? (app.status === 'submitted' || app.status === 'confirmed' ? 100 : 0);
            return (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="group surface-card surface-card--static relative flex flex-col gap-4 rounded-[28px] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      <span className="mr-1.5" aria-hidden>{app.flagEmoji}</span>
                      {app.country} · {app.platform}
                    </p>
                    <h3 className="mt-1 truncate text-base font-semibold text-foreground">{app.university}</h3>
                    <p className="truncate text-sm text-muted-foreground">{app.program}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    <span>Progress</span>
                    <span className="text-foreground">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        progress === 100 ? 'bg-emerald-500' : 'bg-primary'
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={cn('rounded-full px-2.5 py-0.5 font-semibold', STATUS_TONE[app.status])}>
                    {STATUS_LABEL[app.status]}
                  </span>
                  {outcome ? (
                    <span className={cn('rounded-full px-2.5 py-0.5 font-semibold', OUTCOME_TONE[outcome.result])}>
                      {OUTCOME_LABEL[outcome.result]}
                    </span>
                  ) : null}
                  {nextDeadline ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 font-medium text-muted-foreground">
                      <CalendarClock className="h-3 w-3" />
                      {nextDeadline.title} · {formatDueLabel(nextDeadline.date)}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </motion.div>
      </section>

      {/* ── Upcoming deadlines (read-only stripe) ────────────────────── */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Upcoming</p>
          <h2 className="text-2xl font-semibold text-foreground">Next 5 deadlines</h2>
          <p className="text-sm text-muted-foreground">Across every application on your list.</p>
        </div>
        <div className="surface-card surface-card--static rounded-[28px] p-2">
          <ul className="divide-y divide-border/60">
            {upcomingDeadlines.map((deadline) => (
              <li
                key={deadline.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{deadline.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {deadline.university} · {deadline.detail ?? deadline.type}
                  </p>
                </div>
                <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground">
                  {formatDueLabel(deadline.date)}
                </span>
              </li>
            ))}
            {upcomingDeadlines.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-muted-foreground">No upcoming deadlines.</li>
            ) : null}
          </ul>
        </div>
      </section>

      {/* ── Quick links to deeper sections ───────────────────────────── */}
      <section className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Tasks', href: '/applications/tasks', detail: 'Mark off what you finish', icon: Check },
          { label: 'Documents', href: '/applications/documents', detail: 'Letters & transcripts', icon: Send },
          { label: 'Practice board', href: '/applications/sandbox', detail: 'Try submitting (safe)', icon: Sparkles }
        ].map(({ label, href, detail, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group surface-card surface-card--static flex items-center gap-3 rounded-[24px] px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="truncate text-xs text-muted-foreground">{detail}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </section>
    </div>
  );
}
