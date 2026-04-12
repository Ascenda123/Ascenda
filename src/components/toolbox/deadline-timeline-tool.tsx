'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger, cardFade } from '@/lib/motion';
import type { TimelineDeadline, TimelineDeadlineType } from '@/lib/data/student-demo-data';

const TYPE_CONFIG: Record<TimelineDeadlineType, { color: string; bg: string; dot: string; label: string }> = {
  submission: { color: 'text-primary', bg: 'bg-primary/10 border-primary/30', dot: 'bg-primary', label: 'Submission' },
  exam: { color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-300/40', dot: 'bg-amber-500', label: 'Exam' },
  interview: { color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-300/40', dot: 'bg-rose-500', label: 'Interview' },
  document: { color: 'text-sky-500', bg: 'bg-sky-500/10 border-sky-300/40', dot: 'bg-sky-500', label: 'Document' },
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface DeadlineTimelineToolProps {
  deadlines: TimelineDeadline[];
}

export function DeadlineTimelineTool({ deadlines }: DeadlineTimelineToolProps) {
  const [filterType, setFilterType] = useState<TimelineDeadlineType | null>(null);
  const [filterUniversity, setFilterUniversity] = useState<string | null>(null);

  const universities = useMemo(() => [...new Set(deadlines.map((d) => d.university))], [deadlines]);

  const filtered = useMemo(() => {
    let result = [...deadlines].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (filterType) result = result.filter((d) => d.type === filterType);
    if (filterUniversity) result = result.filter((d) => d.university === filterUniversity);
    return result;
  }, [deadlines, filterType, filterUniversity]);

  const focusDeadlines = filtered.filter((d) => daysUntil(d.date) <= 14 && daysUntil(d.date) >= 0);

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineDeadline[]>();
    filtered.forEach((d) => {
      const key = monthFormatter.format(new Date(d.date));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Focus cards: next 14 days */}
      {focusDeadlines.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Next 14 days</p>
          <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="show">
            {focusDeadlines.map((d) => {
              const cfg = TYPE_CONFIG[d.type];
              const days = daysUntil(d.date);
              return (
                <motion.div key={d.id} variants={cardFade} className={cn('rounded-2xl border p-4 space-y-2', cfg.bg)}>
                  <div className="flex items-center justify-between">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase', cfg.bg, cfg.color)}>{cfg.label}</span>
                    <span className={cn('text-xs font-semibold', days <= 3 ? 'text-rose-600' : days <= 7 ? 'text-amber-600' : 'text-muted-foreground')}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.university}</p>
                  {d.detail && <p className="text-xs text-muted-foreground">{d.detail}</p>}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(Object.keys(TYPE_CONFIG) as TimelineDeadlineType[]).map((type) => {
          const cfg = TYPE_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? null : type)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filterType === type ? cn(cfg.bg, cfg.color, 'border') : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <div className={cn('h-2 w-2 rounded-full', cfg.dot)} />
              {cfg.label}
            </button>
          );
        })}
        <select
          value={filterUniversity ?? ''}
          onChange={(e) => setFilterUniversity(e.target.value || null)}
          className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All universities</option>
          {universities.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Timeline (vertical, grouped by month) */}
      <div className="space-y-8">
        {grouped.map(([month, items]) => (
          <div key={month}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{month}</p>
            <div className="relative border-l-2 border-border pl-6 space-y-4">
              {items.map((d) => {
                const cfg = TYPE_CONFIG[d.type];
                const days = daysUntil(d.date);
                return (
                  <div key={d.id} className="relative">
                    {/* Dot on timeline */}
                    <div className={cn('absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background', cfg.dot)} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{d.title}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', cfg.bg, cfg.color)}>{cfg.label}</span>
                        {days >= 0 && days <= 7 && (
                          <span className="text-[10px] font-semibold text-rose-600">
                            {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days left`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{d.university} · {dateFormatter.format(new Date(d.date))}</p>
                      {d.detail && <p className="text-xs text-muted-foreground">{d.detail}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No deadlines match your filters.
        </div>
      )}
    </div>
  );
}
