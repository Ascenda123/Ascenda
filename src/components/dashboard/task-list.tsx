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
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">Stay on track with your application milestones.</p>
      </div>
      <ul className="space-y-3">
        {tasks.length === 0 ? (
          <li className="text-sm text-slate-500">No tasks yet—add programs to generate a checklist.</li>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800">{task.name}</p>
                {task.dueDate ? <p className="text-xs text-slate-500">Due {task.dueDate}</p> : null}
              </div>
              {onToggle ? (
                <Button
                  type="button"
                  size="sm"
                  variant={task.status === 'done' ? 'secondary' : 'outline'}
                  onClick={() => onToggle(task.id)}
                >
                  {task.status === 'done' ? 'Mark todo' : 'Mark done'}
                </Button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
