'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, FileSignature, Mail, PenLine, Send, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import type { RecLetterRequest, RecLetterStatus } from '@/lib/data/student-demo-data';

const REMIND_STORAGE_KEY = 'ascenda-letter-reminders';

const formatReminderAge = (at: number): string => {
  const sec = Math.max(1, Math.round((Date.now() - at) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
};

// ─── Status config ───────────────────────────────────────────────────────────

const STEPS: { key: RecLetterStatus; label: string; icon: typeof Mail }[] = [
  { key: 'draft', label: 'Draft', icon: PenLine },
  { key: 'requested', label: 'Requested', icon: Mail },
  { key: 'writing', label: 'Writing', icon: FileSignature },
  { key: 'signed', label: 'Signed', icon: Check },
  { key: 'uploaded', label: 'Uploaded', icon: Upload }
];

const STATUS_INDEX: Record<RecLetterStatus, number> = {
  draft: 0,
  requested: 1,
  writing: 2,
  signed: 3,
  uploaded: 4
};

const STATUS_COLORS: Record<RecLetterStatus, string> = {
  draft: 'text-muted-foreground',
  requested: 'text-amber-600 dark:text-amber-400',
  writing: 'text-sky-600 dark:text-sky-400',
  signed: 'text-violet-600 dark:text-violet-400',
  uploaded: 'text-emerald-600 dark:text-emerald-400'
};

const STATUS_BG: Record<RecLetterStatus, string> = {
  draft: 'bg-muted/60',
  requested: 'bg-amber-500/10',
  writing: 'bg-sky-500/10',
  signed: 'bg-violet-500/10',
  uploaded: 'bg-emerald-500/10'
};

// ─── Animation ───────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

const cardFade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
};

// ─── Component ───────────────────────────────────────────────────────────────

interface RecLetterWorkflowProps {
  letters: RecLetterRequest[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function RecLetterWorkflow({ letters }: RecLetterWorkflowProps) {
  const completedCount = letters.filter((l) => l.status === 'uploaded' || l.status === 'signed').length;
  const [reminders, setReminders] = useState<Record<string, number>>({});
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMIND_STORAGE_KEY);
      if (raw) setReminders(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(REMIND_STORAGE_KEY, JSON.stringify(reminders));
    } catch {
      // ignore
    }
  }, [reminders]);

  const handleRemind = (letter: RecLetterRequest) => {
    setReminders((prev) => ({ ...prev, [letter.id]: Date.now() }));
    showToast({
      title: `Reminder sent to ${letter.teacherName}`,
      description: 'They’ll get a nudge through the platform',
      variant: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{completedCount}</span> of{' '}
            <span className="font-semibold text-foreground">{letters.length}</span> letters received
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/60">
            <motion.div
              className="h-2 rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / letters.length) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <motion.div
        className="space-y-4"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {letters.map((letter) => {
          const currentIdx = STATUS_INDEX[letter.status];

          return (
            <motion.div
              key={letter.id}
              variants={cardFade}
              className="surface-subcard rounded-2xl p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{letter.teacherName}</p>
                  <p className="text-sm text-muted-foreground">
                    {letter.subject} &middot; {letter.relationship}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold',
                    STATUS_BG[letter.status],
                    STATUS_COLORS[letter.status],
                    letter.status === 'uploaded' ? 'border-emerald-200/60 dark:border-emerald-500/20' :
                    letter.status === 'signed' ? 'border-violet-200/60 dark:border-violet-500/20' :
                    letter.status === 'writing' ? 'border-sky-200/60 dark:border-sky-500/20' :
                    letter.status === 'requested' ? 'border-amber-200/60 dark:border-amber-500/20' :
                    'border-border'
                  )}
                >
                  {STEPS[currentIdx].label}
                </span>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1">
                {STEPS.map((step, i) => {
                  const isComplete = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex items-center gap-1 flex-1">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-all',
                          isComplete
                            ? cn('border-transparent', STATUS_BG[letter.status], STATUS_COLORS[letter.status])
                            : 'border-border/60 text-muted-foreground/40',
                          isCurrent && 'ring-2 ring-primary/20'
                        )}
                      >
                        <StepIcon className="h-3.5 w-3.5" />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={cn(
                            'h-px flex-1',
                            i < currentIdx ? 'bg-emerald-400/40' : 'bg-border/40'
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Universities + dates */}
              <div className="flex flex-wrap items-center gap-2">
                {letter.universities.map((uni) => (
                  <span key={uni} className="surface-chip text-[11px]">
                    {uni}
                  </span>
                ))}
                {letter.requestedDate && (
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    Requested {formatDate(letter.requestedDate)}
                  </span>
                )}
              </div>

              {/* Remind affordance — chase the teacher without leaving the app */}
              {(letter.status === 'requested' || letter.status === 'writing') ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
                  {reminders[letter.id] ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/60 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                      <Send className="h-3 w-3" aria-hidden />
                      Reminder sent · {formatReminderAge(reminders[letter.id])}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemind(letter)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/60 hover:text-foreground"
                    >
                      <Send className="h-3 w-3" aria-hidden />
                      Remind {letter.teacherName.split(' ')[0]}
                    </button>
                  )}
                  <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Through the platform
                  </span>
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
