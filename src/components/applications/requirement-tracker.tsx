import { ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { inferTaskType, TASK_VISUAL } from '@/lib/theme/categories';

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
  pending: 'bg-amber-500/10 text-amber-600 border border-amber-200/60 dark:text-amber-400 dark:border-amber-500/20',
  requested: 'bg-sky-500/10 text-sky-600 border border-sky-200/60 dark:text-sky-400 dark:border-sky-500/20',
  submitted:
    'bg-emerald-500/10 text-emerald-600 border border-emerald-200/60 dark:text-emerald-400 dark:border-emerald-500/20'
};

export const RequirementTracker = ({ items }: { items: RequirementItem[] }) => {
  const isEmpty = items.length === 0;

  return (
    <div className="space-y-4 rounded-[28px] border border-border bg-card p-6 text-foreground shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition-colors">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Documents & references</h2>
          <p className="text-sm text-muted-foreground">Every document and recommendation in one glance.</p>
        </div>
        <Button size="sm" variant="ghost" className="rounded-full px-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Update status
        </Button>
      </header>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <ListChecks className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">Nothing to track yet</p>
          <p className="text-xs text-muted-foreground">Add programs to populate your requirements list.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => {
            const visual = TASK_VISUAL[inferTaskType(item.requirement)];
            const Icon = visual.icon;
            return (
              <article
                key={item.id}
                className={cn(
                  'flex items-start gap-3 rounded-[26px] border border-l-4 bg-card/80 p-5 text-foreground shadow-sm transition hover:-translate-y-px hover:shadow-md',
                  visual.border,
                  visual.accent
                )}
              >
                <div className={visual.swatch}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="min-h-[3rem]">
                    <p className="truncate text-base font-semibold text-foreground" title={item.requirement}>
                      {item.requirement}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{item.application || 'Add an application'}</p>
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
                    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', STATUS_TONE[item.status])}>
                      {STATUS_LABEL[item.status]}
                    </span>
                    <Button type="button" size="xs" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
