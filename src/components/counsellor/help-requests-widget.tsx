'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Sparkles, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHelpRequests } from '@/hooks/use-help-requests';
import { useHelpDrawer } from '@/components/help/help-drawer-provider';
import type { HelpRequest } from '@/lib/types/demo-tables';

const formatRelative = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(1, Math.round(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
};

const studentDisplayName = (_: HelpRequest): string => 'Greg Franck';

export function HelpRequestsWidget() {
  const { items, loading } = useHelpRequests();
  const { openRequest } = useHelpDrawer();

  const openCount = items.filter((row) => row.status === 'open').length;

  return (
    <div className="surface-card surface-card--static">
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
              <Inbox className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Live · from your students
              </p>
              <h2 className="text-lg font-semibold text-foreground">Help requests</h2>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? 'Loading…'
                  : items.length === 0
                    ? "No open requests right now — you're all caught up."
                    : `${openCount} open${
                        items.length - openCount > 0 ? ` · ${items.length - openCount} accepted` : ''
                      }`}
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map((req) => {
                const isAccepted = req.status === 'accepted';
                return (
                  <motion.li
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => openRequest(req.id)}
                      className={cn(
                        'group flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm',
                        isAccepted
                          ? 'border-emerald-200/60 bg-emerald-500/5 hover:border-emerald-300/70'
                          : 'border-violet-200/60 bg-violet-500/5 hover:border-violet-300/70'
                      )}
                    >
                      <Sparkles
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          isAccepted ? 'text-emerald-600' : 'text-violet-600'
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {studentDisplayName(req)}
                          </p>
                          <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {formatRelative(req.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {req.university ? (
                            <>
                              {req.university}
                              {req.program ? ` · ${req.program}` : null}
                            </>
                          ) : (
                            req.subject
                          )}
                        </p>
                      </div>
                      {isAccepted ? (
                        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">
                          Accepted
                        </span>
                      ) : null}
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" aria-hidden />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        ) : null}
      </div>
    </div>
  );
}
