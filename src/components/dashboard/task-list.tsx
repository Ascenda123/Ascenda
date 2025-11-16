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
}

export const TaskList = ({ title, tasks, onToggle }: TaskListProps) => {
  const completed = tasks.filter((task) => task.status === 'done').length;
  const total = tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const statusTone: Record<TaskItem['status'], string> = {
    todo: 'border-amber-100 bg-amber-50/40',
    doing: 'border-sky-100 bg-sky-50/50',
    done: 'border-emerald-100 bg-emerald-50/60'
  };

  return (
    <div className="space-y-4 rounded-[32px] border border-[#e5e5e7] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">Stay on track with your application milestones.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {progress}% ready
          </div>
          <Button size="sm" variant="ghost" className="rounded-full px-3 text-xs uppercase tracking-[0.3em] text-slate-500">
            + Add task
          </Button>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100" aria-hidden>
        <div className="h-1.5 rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
            No tasks yet—add programs to generate a checklist.
          </div>
        ) : (
          tasks.map((task) => (
            <article
              key={task.id}
              className={cn(
                'relative flex flex-col gap-2 rounded-2xl border px-4 py-3 transition hover:translate-x-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]',
                statusTone[task.status]
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{task.name}</p>
                {onToggle ? (
                  <Button
                    type="button"
                    size="sm"
                    variant={task.status === 'done' ? 'secondary' : 'outline'}
                    onClick={() => onToggle(task.id)}
                  >
                    {task.status === 'done' ? 'Undo' : 'Mark done'}
                  </Button>
                ) : (
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{task.status}</span>
                )}
              </div>
              {task.dueDate ? <p className="text-xs font-semibold text-slate-500">Live due date · {task.dueDate}</p> : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
};
