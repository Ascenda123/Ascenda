export interface ReferenceItem {
  id: string;
  name: string;
  relationship: string;
  school: string;
  dueDate?: string;
  status: 'drafted' | 'sent' | 'received';
  lastNudged?: string;
}

const STATUS_BADGE: Record<ReferenceItem['status'], string> = {
  drafted: 'bg-amber-500/15 text-amber-500',
  sent: 'bg-blue-500/15 text-blue-400',
  received: 'bg-emerald-500/15 text-emerald-400'
};

export const ReferenceTracker = ({ references }: { references: ReferenceItem[] }) => {
  return (
    <div className="space-y-4 rounded-[28px] border border-border bg-card p-6 text-sm text-muted-foreground shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Reference center</h2>
          <p className="text-xs text-muted-foreground">Who still owes a letter + when to nudge them.</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted/70"
        >
          Send reminder
        </button>
      </div>
      <ul className="space-y-3">
        {references.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            Add recommenders to manage nudges here.
          </li>
        ) : (
          references.map((ref) => (
            <li
              key={ref.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/60 px-4 py-3 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{ref.name}</p>
                <p className="text-xs text-muted-foreground">
                  {ref.relationship} · {ref.school}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Due {ref.dueDate ?? 'TBD'}</p>
                {ref.lastNudged ? <p>Last nudged {ref.lastNudged}</p> : null}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[ref.status]}`}>
                {ref.status}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
