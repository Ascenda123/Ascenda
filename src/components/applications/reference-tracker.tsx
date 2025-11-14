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
  drafted: 'bg-amber-100 text-amber-700',
  sent: 'bg-blue-100 text-blue-700',
  received: 'bg-emerald-100 text-emerald-700'
};

export const ReferenceTracker = ({ references }: { references: ReferenceItem[] }) => {
  return (
    <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Reference center</h2>
          <p className="text-xs text-slate-500">Who still owes a letter + when to nudge them.</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Send reminder
        </button>
      </div>
      <ul className="space-y-3">
        {references.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400">
            Add recommenders to manage nudges here.
          </li>
        ) : (
          references.map((ref) => (
            <li
              key={ref.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{ref.name}</p>
                <p className="text-xs text-slate-500">
                  {ref.relationship} · {ref.school}
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
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
