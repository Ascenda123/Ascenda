'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ListChecks, Plus, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SeedTask {
  id: string;
  name: string;
  done: boolean;
  dueDate?: string;
  group: string;
}

type Filter = 'open' | 'done' | 'all';

function dueLabel(iso?: string) {
  if (!iso) return null;
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, urgent: true };
  if (diff === 0) return { label: 'Today', urgent: true };
  if (diff === 1) return { label: 'Tomorrow', urgent: false };
  if (diff <= 30) return { label: `In ${diff} days`, urgent: false };
  return { label: due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), urgent: false };
}

interface CrossApplicationTasksProps {
  initialTasks: SeedTask[];
}

export function CrossApplicationTasks({ initialTasks }: CrossApplicationTasksProps) {
  const [tasks, setTasks] = useState<SeedTask[]>(initialTasks);
  const [filter, setFilter] = useState<Filter>('open');
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('General');

  const filtered = useMemo(() => {
    if (filter === 'open') return tasks.filter((t) => !t.done);
    if (filter === 'done') return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, SeedTask[]>();
    for (const task of filtered) {
      const list = map.get(task.group) ?? [];
      list.push(task);
      map.set(task.group, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const groups = useMemo(() => {
    const set = new Set(tasks.map((t) => t.group));
    return [...set].sort();
  }, [tasks]);

  const totals = {
    open: tasks.filter((t) => !t.done).length,
    done: tasks.filter((t) => t.done).length,
    all: tasks.length
  };

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    setTasks((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name, done: false, group: newGroup }
    ]);
    setNewName('');
  };

  return (
    <div className="space-y-6">
      {/* ── Add task + filters ──────────────────────────────────────── */}
      <section className="surface-card surface-card--static space-y-4 rounded-[28px] p-5">
        <div className="flex flex-wrap items-center gap-2">
          {(['open', 'done', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold capitalize transition',
                filter === f
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
              )}
            >
              {f} <span className="opacity-60">· {totals[f]}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add();
            }}
            placeholder="Add a task — press Enter"
            className="flex-1 min-w-[200px] rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            {['General', ...groups.filter((g) => g !== 'General')].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={add} disabled={!newName.trim()}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </section>

      {/* ── Grouped tasks ───────────────────────────────────────────── */}
      {grouped.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <ListChecks className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">
            {filter === 'done' ? 'Nothing finished yet' : filter === 'open' ? 'You’re all caught up' : 'No tasks tracked'}
          </p>
          <p className="text-xs text-muted-foreground">
            {filter === 'open' ? 'Add a task above or check the done tab.' : 'Switch filter to see other tasks.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([group, list]) => {
            const groupOpen = list.filter((t) => !t.done).length;
            return (
              <section key={group} className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{group}</h3>
                    <p className="text-xs text-muted-foreground">
                      {groupOpen} open · {list.length - groupOpen} done
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <AnimatePresence>
                    {list.map((task) => {
                      const due = dueLabel(task.dueDate);
                      return (
                        <motion.li
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 12 }}
                          className={cn(
                            'group flex items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3 transition',
                            task.done ? 'border-emerald-200/60 dark:border-emerald-500/20' : 'border-border'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => toggle(task.id)}
                            aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
                            className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition',
                              task.done
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-border bg-background hover:border-primary'
                            )}
                          >
                            {task.done ? <Check className="h-3.5 w-3.5" /> : null}
                          </button>
                          <p
                            className={cn(
                              'flex-1 text-sm text-foreground',
                              task.done && 'text-muted-foreground line-through'
                            )}
                          >
                            {task.name}
                          </p>
                          {due ? (
                            <span
                              className={cn(
                                'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                                due.urgent
                                  ? 'border-rose-200/60 bg-rose-500/10 text-rose-600 dark:border-rose-500/20 dark:text-rose-400'
                                  : 'border-border bg-muted/50 text-foreground'
                              )}
                            >
                              {due.label}
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => remove(task.id)}
                            aria-label="Remove task"
                            className="rounded-full p-1 text-muted-foreground/60 opacity-0 transition hover:bg-muted/80 hover:text-foreground group-hover:opacity-100"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
