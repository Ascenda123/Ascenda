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
  pending: 'bg-amber-500/15 text-amber-100 border border-amber-200/40',
  requested: 'bg-sky-500/15 text-sky-100 border border-sky-200/40',
  submitted: 'bg-emerald-500/15 text-emerald-100 border border-emerald-200/40'
};

export const RequirementTracker = ({ items }: { items: RequirementItem[] }) => {
  return (
    <div className="space-y-4 rounded-[36px] border border-border bg-card p-6 text-foreground shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition-colors">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Documents & references</h2>
          <p className="text-sm text-muted-foreground">Every document and recommendation in one glance.</p>
        </div>
        <Button size="sm" variant="ghost" className="rounded-full px-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Update status
        </Button>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {(items.length === 0
          ? [
              {
                id: 'empty-card',
                requirement: 'No items yet',
                application: '',
                owner: '',
                status: 'pending' as RequirementItem['status'],
                dueDate: undefined
              }
            ]
          : items
        ).map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-[26px] border border-border bg-card/80 p-5 text-foreground shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-colors"
          >
            <div className="min-h-[3rem]">
              <p className="text-base font-semibold text-foreground truncate" title={item.requirement}>
                {item.requirement}
              </p>
              <p className="text-xs text-muted-foreground truncate">{item.application || 'Add an application'}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="min-w-[40%]">
                <p className="uppercase tracking-[0.3em] text-muted-foreground">Owner</p>
                <p className="text-sm text-foreground truncate">{item.owner || 'You'}</p>
              </div>
              <div>
                <p className="uppercase tracking-[0.3em] text-muted-foreground">Due</p>
                <p className="text-sm text-foreground">{item.dueDate ?? 'Rolling'}</p>
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
