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
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  watch: 'bg-emerald-100 text-emerald-700'
};

export const ApplicationPriorityBoard = ({ items }: { items: PriorityItem[] }) => {
  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-border bg-card p-6 text-sm text-muted-foreground shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        Add programs to see real-time priority scoring based on deadlines, scholarships, and fit.
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-[32px] border border-border bg-card p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
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
            className="group flex flex-col gap-4 rounded-[28px] border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_35px_80px_rgba(15,23,42,0.12)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground truncate">{item.university}</p>
                <h3 className="text-base font-semibold text-foreground truncate">{item.program}</h3>
              </div>
              <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_TONE[item.priority]}`}>
                {PRIORITY_LABEL[item.priority]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Fit score</p>
                <p className="text-2xl font-semibold text-foreground">{item.fitScore}%</p>
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
              <span className="rounded-full bg-muted px-3 py-1 font-semibold text-foreground truncate">
                {item.status}
              </span>
              {item.scholarshipFocus ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 truncate">
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
