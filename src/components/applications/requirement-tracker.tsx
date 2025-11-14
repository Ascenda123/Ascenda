import { Button } from '@/components/ui/button';

export interface RequirementItem {
  id: string;
  requirement: string;
  application: string;
  dueDate?: string;
  owner: string;
  status: 'pending' | 'requested' | 'submitted';
}

const STATUS_LABEL: Record<RequirementItem['status'], string> = {
  pending: 'In progress',
  requested: 'Waiting on other',
  submitted: 'Submitted'
};

const STATUS_TONE: Record<RequirementItem['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  requested: 'bg-blue-100 text-blue-700',
  submitted: 'bg-emerald-100 text-emerald-700'
};

export const RequirementTracker = ({ items }: { items: RequirementItem[] }) => {
  return (
    <div className="space-y-4 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Documents & references</h2>
          <p className="text-sm text-slate-500">Every document and recommendation in one glance.</p>
        </div>
        <Button size="sm" variant="ghost" className="rounded-full px-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          Update status
        </Button>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {(items.length === 0 ? [{ id: 'empty-card', requirement: 'No items yet', application: '', owner: '', status: 'pending' as RequirementItem['status'], dueDate: undefined }] : items).map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between gap-3 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.requirement}</p>
              <p className="text-xs text-slate-500">{item.application || 'Add an application'}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Owner</p>
                <p className="text-sm text-slate-700">{item.owner || 'You'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Due</p>
                <p className="text-sm text-slate-700">{item.dueDate ?? 'Rolling'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[item.status]}`}>
                {STATUS_LABEL[item.status]}
              </span>
              <Button type="button" size="xs" variant="outline">
                View
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
