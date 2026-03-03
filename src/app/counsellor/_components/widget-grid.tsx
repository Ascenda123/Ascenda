'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, AlertTriangle, TrendingUp, BarChart2,
  Clock, Activity, PieChart, Trophy, X, SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type WidgetId =
  | 'alerts'
  | 'funnel'
  | 'matchDist'
  | 'deadlines'
  | 'activity'
  | 'cohortBreakdown'
  | 'topStudents';

export interface WidgetConfig {
  id: WidgetId;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
  span?: 'full' | 'half';
}

export const WIDGET_CONFIGS: WidgetConfig[] = [
  { id: 'alerts', label: 'Student Alerts', description: 'Students needing attention', icon: AlertTriangle },
  { id: 'funnel', label: 'Application Funnel', description: 'Application stage distribution', icon: TrendingUp, span: 'half' },
  { id: 'matchDist', label: 'Match Distribution', description: 'Reach / Match / Safe breakdown', icon: BarChart2, span: 'half' },
  { id: 'deadlines', label: 'Upcoming Deadlines', description: 'Deadlines in the next 7 days', icon: Clock },
  { id: 'activity', label: 'Recent Activity', description: 'Latest counsellor notes and updates', icon: Activity },
  { id: 'cohortBreakdown', label: 'Cohort Breakdown', description: 'Programme type and field distribution', icon: PieChart, span: 'full' },
  { id: 'topStudents', label: 'Top Students', description: 'Ranked by average match score', icon: Trophy }
];

const STORAGE_KEY = 'ascenda-counsellor-widgets';
const DEFAULT_VISIBLE: WidgetId[] = ['alerts', 'funnel', 'matchDist', 'deadlines', 'activity', 'cohortBreakdown', 'topStudents'];

function loadPrefs(): WidgetId[] {
  if (typeof window === 'undefined') return DEFAULT_VISIBLE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_VISIBLE;
    const parsed = JSON.parse(stored) as WidgetId[];
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return DEFAULT_VISIBLE;
}

function savePrefs(visible: WidgetId[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
  } catch {}
}

interface WidgetGridProps {
  children: (visibleWidgets: WidgetId[], removeWidget: (id: WidgetId) => void) => React.ReactNode;
}

export const WidgetGrid = ({ children }: WidgetGridProps) => {
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(DEFAULT_VISIBLE);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVisibleWidgets(loadPrefs());
    setHydrated(true);
  }, []);

  const toggleWidget = (id: WidgetId) => {
    setVisibleWidgets((prev) => {
      const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
      savePrefs(next);
      return next;
    });
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {visibleWidgets.length} of {WIDGET_CONFIGS.length} widgets visible
        </p>
        <button
          onClick={() => setPanelOpen((o) => !o)}
          className={cn(
            'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm',
            panelOpen
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:bg-muted/60'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Customise
        </button>
      </div>

      {/* Customise panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-[24px] border border-border bg-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Dashboard Widgets</p>
                <p className="text-xs text-muted-foreground">Toggle widgets on or off</p>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted/60"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {WIDGET_CONFIGS.map((cfg) => {
                const Icon = cfg.icon;
                const active = visibleWidgets.includes(cfg.id);
                return (
                  <button
                    key={cfg.id}
                    onClick={() => toggleWidget(cfg.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5',
                      active
                        ? 'border-primary/40 bg-primary/8 text-foreground shadow-sm'
                        : 'border-border/60 bg-background/60 text-muted-foreground hover:bg-muted/40'
                    )}
                  >
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', active ? 'bg-primary/15' : 'bg-muted/50')}>
                      <Icon className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{cfg.label}</p>
                      <p className="truncate text-[11px] opacity-70">{cfg.description}</p>
                    </div>
                    <div className={cn(
                      'ml-auto h-4 w-4 shrink-0 rounded-full border-2 transition',
                      active ? 'border-primary bg-primary' : 'border-border bg-background'
                    )} />
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => { setVisibleWidgets(DEFAULT_VISIBLE); savePrefs(DEFAULT_VISIBLE); }}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Reset to defaults
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget content */}
      {children(visibleWidgets, toggleWidget)}
    </div>
  );
};

// Single draggable widget wrapper
interface WidgetProps {
  id: WidgetId;
  title: string;
  description?: string;
  icon: typeof LayoutDashboard;
  onRemove: (id: WidgetId) => void;
  children: React.ReactNode;
  className?: string;
}

export const Widget = ({ id, title, description, icon: Icon, onRemove, children, className }: WidgetProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={cn('surface-card surface-card--static flex flex-col gap-4', className)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          title="Remove widget"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  );
};
