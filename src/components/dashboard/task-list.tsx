import { Button } from '@/components/ui/button';

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
  return (
    <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">Stay on track with your application milestones.</p>
        </div>
        <Button size="sm" variant="ghost" className="rounded-full px-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          + Add task
        </Button>
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
              className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
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
