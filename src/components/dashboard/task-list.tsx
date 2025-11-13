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
      <div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">Stay on track with your application milestones.</p>
      </div>
      <ul className="space-y-3">
        {tasks.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
            No tasks yet—add programs to generate a checklist.
          </li>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{task.name}</p>
                {task.dueDate ? <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Due {task.dueDate}</p> : null}
              </div>
              {onToggle ? (
                <Button
                  type="button"
                  size="sm"
                  variant={task.status === 'done' ? 'secondary' : 'outline'}
                  onClick={() => onToggle(task.id)}
                >
                  {task.status === 'done' ? 'Undo' : 'Mark done'}
                </Button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
