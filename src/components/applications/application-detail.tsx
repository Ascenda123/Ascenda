'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  FileText,
  GraduationCap,
  Mail,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  XCircle
} from 'lucide-react';
import { HelpRequestModal } from './help-request-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  OutcomeRecord,
  RecLetterRequest,
  RequirementRow,
  RequirementCell,
  RequirementCategory,
  RequirementStatus,
  SandboxApplication,
  SandboxStatus,
  TimelineDeadline
} from '@/lib/data/student-demo-data';

// ─── Static labels ───────────────────────────────────────────────────────────

const REQ_LABEL: Record<RequirementCategory, string> = {
  subjects: 'Academic subjects',
  exams: 'Entrance exams',
  interviews: 'Interview',
  documents: 'Documents',
  essays: 'Essays / motivation'
};

const REQ_ICON: Record<RequirementCategory, typeof GraduationCap> = {
  subjects: GraduationCap,
  exams: ClipboardList,
  interviews: MessageCircle,
  documents: FileText,
  essays: FileText
};

const STATUS_TONE: Record<RequirementStatus, string> = {
  complete: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20',
  'in-progress': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20',
  missing: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20',
  'not-required': 'bg-muted/60 text-muted-foreground border-border'
};

const STATUS_LABEL: Record<RequirementStatus, string> = {
  complete: 'Complete',
  'in-progress': 'In progress',
  missing: 'Not started',
  'not-required': 'Not required'
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function nextRequirementStatus(current: RequirementStatus): RequirementStatus {
  if (current === 'missing') return 'in-progress';
  if (current === 'in-progress') return 'complete';
  if (current === 'complete') return 'missing';
  return current;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ApplicationDetailProps {
  app: SandboxApplication;
  requirement?: RequirementRow;
  outcome?: OutcomeRecord;
  deadlines: TimelineDeadline[];
  letters: RecLetterRequest[];
}

interface AppTask {
  id: string;
  name: string;
  done: boolean;
  dueDate?: string;
}

// Seed tasks based on the application's requirements — gives every app a
// useful starting checklist without wiring a real DB.
function deriveSeedTasks(req?: RequirementRow): AppTask[] {
  if (!req) return [];
  return req.cells
    .filter((cell) => cell.status !== 'not-required')
    .map((cell, i) => ({
      id: `${req.id}-task-${i}`,
      name: REQ_LABEL[cell.category] + (cell.detail ? ` — ${cell.detail}` : ''),
      done: cell.status === 'complete'
    }));
}

export function ApplicationDetail({
  app,
  requirement,
  outcome,
  deadlines,
  letters
}: ApplicationDetailProps) {
  const [status, setStatus] = useState<SandboxStatus>(app.status);
  const [requirementCells, setRequirementCells] = useState<RequirementCell[]>(requirement?.cells ?? []);
  const [tasks, setTasks] = useState<AppTask[]>(() => deriveSeedTasks(requirement));
  const [newTaskName, setNewTaskName] = useState('');
  const [outcomeResult, setOutcomeResult] = useState<OutcomeRecord['result']>(
    outcome?.result ?? (status === 'submitted' || status === 'confirmed' ? 'pending' : 'pending')
  );
  const [outcomeNotes, setOutcomeNotes] = useState(outcome?.notes ?? '');
  const [helpOpen, setHelpOpen] = useState(false);

  const progress = useMemo(() => {
    const considered = requirementCells.filter((c) => c.status !== 'not-required');
    if (!considered.length) return 0;
    const complete = considered.filter((c) => c.status === 'complete').length;
    return Math.round((complete / considered.length) * 100);
  }, [requirementCells]);

  const taskProgress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
  }, [tasks]);

  const cycleRequirement = (idx: number) => {
    setRequirementCells((cells) =>
      cells.map((cell, i) => (i === idx ? { ...cell, status: nextRequirementStatus(cell.status) } : cell))
    );
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = () => {
    const name = newTaskName.trim();
    if (!name) return;
    setTasks((prev) => [...prev, { id: `task-${Date.now()}`, name, done: false }]);
    setNewTaskName('');
  };

  const submitApplication = () => {
    setStatus('submitted');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Status strip — single most important row ─────────────────── */}
      <section className="surface-card surface-card--static rounded-[28px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl',
              status === 'submitted' || status === 'confirmed'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
            )}>
              {status === 'submitted' || status === 'confirmed' ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <CircleDot className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Status</p>
              <p className="text-lg font-semibold text-foreground">
                {status === 'ready' ? 'Preparing' : status === 'submitted' ? 'Submitted' : 'Confirmed'}
              </p>
              <p className="text-xs text-muted-foreground">
                {status === 'ready'
                  ? `${progress}% of requirements complete`
                  : app.submittedDate
                  ? `Submitted ${new Date(app.submittedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                  : 'Awaiting decision'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setHelpOpen(true)}
              size="sm"
              variant="outline"
              className="border-violet-400/50 bg-violet-500/5 text-violet-700 hover:border-violet-400 hover:bg-violet-500/10 dark:text-violet-300"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Request counsellor help
            </Button>
            {status === 'ready' ? (
              <Button onClick={submitApplication} size="sm" disabled={progress < 60}>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Mark as submitted
              </Button>
            ) : (
              <Button onClick={() => setStatus('ready')} size="sm" variant="outline">
                Reopen application
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span>Requirements</span>
            <span className="text-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
            <motion.div
              className={cn('h-full rounded-full', progress === 100 ? 'bg-emerald-500' : 'bg-primary')}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          {status === 'ready' && progress < 60 ? (
            <p className="text-xs text-muted-foreground">
              Get to at least 60% before submitting. Click any requirement below to update its status.
            </p>
          ) : null}
        </div>
      </section>

      {/* ── Two-column: requirements + tasks ─────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-2 sm:gap-6">
        {/* Requirements */}
        <div className="surface-card surface-card--static space-y-4 rounded-[28px] p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Requirements</p>
            <h3 className="text-lg font-semibold text-foreground">What this app needs</h3>
            <p className="text-xs text-muted-foreground">Click a row to cycle its status.</p>
          </div>
          {requirementCells.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              No requirements profile yet for this university.
            </p>
          ) : (
            <ul className="space-y-2">
              {requirementCells.map((cell, idx) => {
                const Icon = REQ_ICON[cell.category];
                const disabled = cell.status === 'not-required';
                return (
                  <li key={`${cell.category}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => !disabled && cycleRequirement(idx)}
                      disabled={disabled}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3 text-left transition',
                        disabled
                          ? 'cursor-not-allowed opacity-60'
                          : 'hover:-translate-y-px hover:bg-card hover:shadow-sm'
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{REQ_LABEL[cell.category]}</p>
                        {cell.detail ? (
                          <p className="truncate text-xs text-muted-foreground">{cell.detail}</p>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                          STATUS_TONE[cell.status]
                        )}
                      >
                        {STATUS_LABEL[cell.status]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Tasks */}
        <div className="surface-card surface-card--static space-y-4 rounded-[28px] p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Tasks</p>
              <h3 className="text-lg font-semibold text-foreground">What to do for this app</h3>
              <p className="text-xs text-muted-foreground">{taskProgress}% complete</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTask();
              }}
              placeholder="Add a task — press Enter"
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button size="sm" onClick={addTask} disabled={!newTaskName.trim()}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {tasks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              No tasks yet. Add one above to get started.
            </p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.li
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className={cn(
                      'group flex items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3 transition',
                      task.done ? 'border-emerald-200/60 dark:border-emerald-500/20' : 'border-border'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition',
                        task.done
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-border bg-background hover:border-primary'
                      )}
                    >
                      {task.done ? <Check className="h-3.5 w-3.5" /> : null}
                    </button>
                    <p
                      className={cn(
                        'flex-1 text-sm text-foreground',
                        task.done && 'text-muted-foreground line-through'
                      )}
                    >
                      {task.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      aria-label="Remove task"
                      className="rounded-full p-1 text-muted-foreground/60 opacity-0 transition hover:bg-muted/80 hover:text-foreground group-hover:opacity-100"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </section>

      {/* ── Two-column: deadlines + letters ──────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-2 sm:gap-6">
        <div className="surface-card surface-card--static space-y-4 rounded-[28px] p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Deadlines</p>
            <h3 className="text-lg font-semibold text-foreground">Key dates</h3>
          </div>
          {deadlines.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              No deadlines tracked yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {deadlines.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{d.title}</p>
                    {d.detail ? (
                      <p className="truncate text-xs text-muted-foreground">{d.detail}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                    {formatDueLabel(d.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-card surface-card--static space-y-4 rounded-[28px] p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Recommendation letters</p>
            <h3 className="text-lg font-semibold text-foreground">Linked to this app</h3>
          </div>
          {letters.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              No letters tied to this university yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {letters.map((letter) => (
                <li
                  key={letter.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{letter.teacherName}</p>
                    <p className="truncate text-xs text-muted-foreground">{letter.subject}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
                      letter.status === 'uploaded' || letter.status === 'signed'
                        ? STATUS_TONE.complete
                        : letter.status === 'writing'
                        ? STATUS_TONE['in-progress']
                        : STATUS_TONE.missing
                    )}
                  >
                    {letter.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Decision / outcome — only meaningful once submitted ──────── */}
      <section className="surface-card surface-card--static space-y-4 rounded-[28px] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Decision</p>
            <h3 className="text-lg font-semibold text-foreground">Record the outcome</h3>
            <p className="text-xs text-muted-foreground">
              {status === 'ready'
                ? 'Available once you submit this application.'
                : 'Update once you hear back from the university.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['pending', 'accepted', 'waitlisted', 'rejected', 'withdrawn'] as const).map((value) => {
            const active = outcomeResult === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setOutcomeResult(value)}
                disabled={status === 'ready'}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition',
                  active
                    ? value === 'accepted'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : value === 'rejected'
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : value === 'waitlisted'
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground hover:border-foreground/40',
                  status === 'ready' && 'cursor-not-allowed opacity-50'
                )}
              >
                {value}
              </button>
            );
          })}
        </div>

        <textarea
          value={outcomeNotes}
          onChange={(e) => setOutcomeNotes(e.target.value)}
          disabled={status === 'ready'}
          placeholder="Notes about the decision — offer conditions, scholarship amount, response deadline…"
          rows={3}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </section>

      <HelpRequestModal
        open={helpOpen}
        onOpenChange={setHelpOpen}
        app={app}
        requirement={requirement ?? undefined}
      />
    </div>
  );
}
