'use client';

import { useMemo, useState, useTransition } from 'react';
import { TaskList } from './task-list';

type TaskItem = {
  id: string;
  name: string;
  status: 'todo' | 'doing' | 'done';
  dueDate?: string;
};

interface TaskListPanelProps {
  title: string;
  tasks: TaskItem[];
}

export const TaskListPanel = ({ title, tasks }: TaskListPanelProps) => {
  const [items, setItems] = useState<TaskItem[]>(tasks);
  const [isPending, startTransition] = useTransition();

  const optimisticMap = useMemo(() => {
    const map = new Map<string, TaskItem>();
    items.forEach((task) => map.set(task.id, task));
    return map;
  }, [items]);

  const handleToggle = (id: string) => {
    const current = optimisticMap.get(id);
    if (!current) return;

    const nextStatus = current.status === 'done' ? 'todo' : 'done';
    setItems((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: nextStatus } : task))
    );

    startTransition(async () => {
      try {
        const response = await fetch('/api/checklist', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: nextStatus })
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }
      } catch {
        setItems((prev) =>
          prev.map((task) => (task.id === id ? { ...task, status: current.status } : task))
        );
      }
    });
  };

  return <TaskList title={title} tasks={items} onToggle={handleToggle} disabled={isPending} />;
};
