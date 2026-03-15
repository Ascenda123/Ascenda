'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const taskVariant = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

function AnimatedProgress({ value }: { value: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div className="h-1.5 rounded-full bg-muted/60" aria-hidden>
      <motion.div
        className="h-1.5 rounded-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      />
    </div>
  );
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
    <div className="space-y-4 text-foreground">
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
      <AnimatedProgress value={progress} />
      <motion.div
        className="space-y-3"
        variants={listStagger}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              key="empty"
              className="rounded-2xl border border-dashed border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground"
              variants={taskVariant}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              No tasks yet—add programs to generate a checklist.
            </motion.div>
          ) : (
            tasks.map((task) => (
              <motion.article
                key={task.id}
                className={cn(
                  'relative flex flex-col gap-2 rounded-2xl border px-4 py-3 text-foreground transition hover:translate-x-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]',
                  statusTone[task.status]
                )}
                variants={taskVariant}
                layout
              >
                <div className="flex items-center justify-between gap-3">
                  <p className={cn('text-sm font-semibold text-foreground transition-all', task.status === 'done' && 'line-through opacity-60')}>{task.name}</p>
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
              </motion.article>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
