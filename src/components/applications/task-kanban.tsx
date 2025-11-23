import { Button } from '@/components/ui/button';

export interface KanbanTask {
  id: string;
  title: string;
  owner: string;
  dueDate?: string;
}

type Stage = 'backlog' | 'active' | 'waiting' | 'submitted';

const STAGE_LABELS: Record<Stage, string> = {
  backlog: 'Backlog',
  active: 'Focused now',
  waiting: 'Waiting on others',
  submitted: 'Submitted'
};

const STAGE_HINT: Record<Stage, string> = {
  backlog: 'Queued items',
  active: 'High-priority work',
  waiting: 'Follow-ups + references',
  submitted: 'Ready for review'
};

export type KanbanMap = Record<Stage, KanbanTask[]>;

export const TaskKanban = ({ columns }: { columns: KanbanMap }) => {
  const stages: Stage[] = ['backlog', 'active', 'waiting', 'submitted'];

  return (
    <div className="space-y-6 rounded-[32px] border border-border bg-card p-8 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Task intelligence lanes</h2>
          <p className="text-sm text-muted-foreground">Power BI-style swim lanes that keep essays, exams, and references organized.</p>
        </div>
        <Button size="sm" variant="ghost" className="rounded-full px-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Create task
        </Button>
      </header>
      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-4">
        {stages.map((stage) => (
          <section key={stage} className="flex min-h-[360px] flex-col gap-4 rounded-[32px] border border-border bg-muted/50 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{STAGE_LABELS[stage]}</p>
                <p className="text-sm text-muted-foreground">{STAGE_HINT[stage]}</p>
              </div>
              <Button size="xs" variant="ghost">
                View all
              </Button>
            </div>
            <div className="flex-1 space-y-4">
              {columns[stage]?.length ? (
                columns[stage].map((task) => (
                  <article
                    key={task.id}
                    className="flex min-h-[140px] flex-col justify-between gap-4 rounded-[26px] border border-border bg-card px-5 py-4 text-sm text-foreground shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                  >
                    <div className="space-y-1">
                      <p className="break-words text-base font-semibold text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Owner: {task.owner}</p>
                      {task.dueDate ? <p className="text-xs text-muted-foreground">Due {task.dueDate}</p> : null}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Button size="xs" variant="outline">
                        Focus task
                      </Button>
                      <Button size="xs" variant="ghost">
                        Details
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                  Nothing here yet.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
