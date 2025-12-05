import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskItem {
  id: string;
  name: string;
  status: 'todo' | 'doing' | 'done';
  dueDate?: string;
}

interface TaskListProps {
  title: string;
  tasks: TaskItem[];
  onToggle?: (id: string) => void;
  disabled?: boolean;
}

export const TaskList = ({ title, tasks, onToggle, disabled }: TaskListProps) => {
  const completed = tasks.filter((task) => task.status === 'done').length;
  const total = tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const statusTone: Record<TaskItem['status'], string> = {
    todo: 'border-amber-200/50 bg-amber-500/10',
    doing: 'border-sky-200/60 bg-sky-500/10',
    done: 'border-emerald-200/50 bg-emerald-500/10'
  };

  return (
    <div className="glass-panel space-y-4 rounded-[32px] p-6 text-foreground transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">Stay on track with your application milestones.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {progress}% ready
          </div>
          <Button size="sm" variant="ghost" className="rounded-full px-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            + Add task
          </Button>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted/60" aria-hidden>
        <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
            No tasks yet—add programs to generate a checklist.
          </div>
        ) : (
          tasks.map((task) => (
            <article
              key={task.id}
              className={cn(
                'relative flex flex-col gap-2 rounded-2xl border px-4 py-3 text-foreground transition hover:translate-x-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]',
                statusTone[task.status]
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{task.name}</p>
                {onToggle ? (
                  <Button
                    type="button"
                    size="sm"
                    variant={task.status === 'done' ? 'secondary' : 'outline'}
                    onClick={() => onToggle(task.id)}
                    disabled={disabled}
                  >
                    {task.status === 'done' ? 'Undo' : 'Mark done'}
                  </Button>
                ) : (
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{task.status}</span>
                )}
              </div>
              {task.dueDate ? <p className="text-xs font-semibold text-muted-foreground">Live due date · {task.dueDate}</p> : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
};
