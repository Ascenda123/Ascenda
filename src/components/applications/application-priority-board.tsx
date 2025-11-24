'use client';

export interface PriorityItem {
  id: string;
  program: string;
  university: string;
  priority: 'high' | 'medium' | 'watch';
  fitScore: number;
  status: string;
  nextDeadline?: string;
  tasksRemaining: number;
  scholarshipFocus?: string;
}

const PRIORITY_LABEL: Record<PriorityItem['priority'], string> = {
  high: 'Prime focus',
  medium: 'Advancing',
  watch: 'Actively watching'
};

const PRIORITY_TONE: Record<PriorityItem['priority'], string> = {
  high: 'border-rose-200/80 bg-rose-100/80 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100',
  medium: 'border-amber-200/80 bg-amber-100/80 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100',
  watch: 'border-emerald-200/80 bg-emerald-100/80 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100'
};

const STATUS_TONE = {
  default: 'border border-border bg-muted text-foreground',
  progress:
    'border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-100',
  done:
    'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100'
};

export const ApplicationPriorityBoard = ({ items }: { items: PriorityItem[] }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-border bg-card p-12 text-center shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-plus"><path d="M11 12H3" /><path d="M16 6H3" /><path d="M16 18H3" /><path d="M18 9h6" /><path d="M21 6v6" /></svg>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">No priorities yet</h3>
          <p className="text-sm text-muted-foreground">Add programs to see real-time priority scoring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-[32px] border border-border bg-card p-6 shadow-floating">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Application priorities</h2>
          <p className="text-sm text-muted-foreground">Fit score + scholarship weight + deadline intensity.</p>
        </div>
        <div className="rounded-full bg-muted px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Live stack
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col gap-4 rounded-[28px] border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-floating"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground truncate">{item.university}</p>
                <h3 className="text-base font-semibold text-foreground truncate">{item.program}</h3>
              </div>
              <span
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold shadow-[0_4px_12px_rgba(15,23,42,0.06)] ${PRIORITY_TONE[item.priority]}`}
              >
                {PRIORITY_LABEL[item.priority]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Fit score</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${item.fitScore}%` }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{item.fitScore}%</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Next deadline</p>
                <p className="text-xs">{item.nextDeadline ?? 'TBD'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tasks</p>
                <p className="text-xs">{item.tasksRemaining} open</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] truncate ${
                  /done|submitted|complete/i.test(item.status)
                    ? STATUS_TONE.done
                    : /progress|draft|essay/i.test(item.status)
                      ? STATUS_TONE.progress
                      : STATUS_TONE.default
                }`}
              >
                {item.status}
              </span>
              {item.scholarshipFocus ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 truncate">
                  {item.scholarshipFocus}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
