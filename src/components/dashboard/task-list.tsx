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
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-sm backdrop-blur">
      <div>
        <h3 className="font-display text-xl text-white">{title}</h3>
        <p className="text-sm text-white/60">Stay on track with your application milestones.</p>
      </div>
      <ul className="space-y-3">
        {tasks.length === 0 ? (
          <li className="text-sm text-white/60">No tasks yet—add programs to generate a checklist.</li>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">{task.name}</p>
                {task.dueDate ? <p className="text-xs text-white/60">Due {task.dueDate}</p> : null}
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
