'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart2, PieChart, TrendingUp, CheckCircle, Target, Users,
  X, SlidersHorizontal, GripVertical, Maximize2, Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnalyticsWidgetId =
  | 'programmeSplit'
  | 'ibDistribution'
  | 'fieldChart'
  | 'completionBreakdown'
  | 'fullFunnel'
  | 'matchTierSummary'
  | 'insights';

export interface AnalyticsWidgetConfig {
  id: AnalyticsWidgetId;
  label: string;
  description: string;
  icon: typeof BarChart2;
}

export const ANALYTICS_WIDGET_CONFIGS: AnalyticsWidgetConfig[] = [
  { id: 'programmeSplit', label: 'Programme Split', description: 'IB vs A-Level breakdown', icon: PieChart },
  { id: 'ibDistribution', label: 'IB Scores', description: 'Score distribution by bracket', icon: BarChart2 },
  { id: 'fieldChart', label: 'Fields of Interest', description: 'Subject area distribution', icon: Target },
  { id: 'completionBreakdown', label: 'Profile Completion', description: 'Completion rate buckets', icon: CheckCircle },
  { id: 'fullFunnel', label: 'Application Funnel', description: 'Stage-by-stage breakdown', icon: TrendingUp },
  { id: 'matchTierSummary', label: 'Match Distribution', description: 'Reach / Match / Safe', icon: Users },
  { id: 'insights', label: 'Key Insights', description: 'Cohort takeaways at a glance', icon: BarChart2 }
];

const STORAGE_KEY = 'ascenda-counsellor-analytics-widgets';
const STORAGE_KEY_ORDER = 'ascenda-counsellor-analytics-widgets-order';
const STORAGE_KEY_SIZES = 'ascenda-counsellor-analytics-widgets-sizes';

const ALL_IDS: AnalyticsWidgetId[] = ['programmeSplit', 'ibDistribution', 'fieldChart', 'completionBreakdown', 'fullFunnel', 'matchTierSummary', 'insights'];

const DEFAULT_SIZES: Record<AnalyticsWidgetId, 'normal' | 'wide'> = {
  programmeSplit: 'normal', ibDistribution: 'normal', fieldChart: 'normal',
  completionBreakdown: 'normal', fullFunnel: 'normal', matchTierSummary: 'normal', insights: 'wide'
};

function loadPrefs(): AnalyticsWidgetId[] {
  if (typeof window === 'undefined') return ALL_IDS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return ALL_IDS;
    const parsed = JSON.parse(stored) as AnalyticsWidgetId[];
    if (Array.isArray(parsed)) return parsed;
  } catch { }
  return ALL_IDS;
}

function loadOrder(): AnalyticsWidgetId[] {
  if (typeof window === 'undefined') return ALL_IDS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ORDER);
    if (!stored) return ALL_IDS;
    const parsed = JSON.parse(stored) as AnalyticsWidgetId[];
    if (Array.isArray(parsed)) return parsed;
  } catch { }
  return ALL_IDS;
}

function loadSizes(): Record<AnalyticsWidgetId, 'normal' | 'wide'> {
  if (typeof window === 'undefined') return DEFAULT_SIZES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SIZES);
    if (!stored) return DEFAULT_SIZES;
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object') return { ...DEFAULT_SIZES, ...parsed };
  } catch { }
  return DEFAULT_SIZES;
}

function savePrefs(v: AnalyticsWidgetId[]) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch { } }
function saveOrder(v: AnalyticsWidgetId[]) { try { localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(v)); } catch { } }
function saveSizes(v: Record<AnalyticsWidgetId, 'normal' | 'wide'>) { try { localStorage.setItem(STORAGE_KEY_SIZES, JSON.stringify(v)); } catch { } }

export type AnalyticsDragHandlers = {
  onDragStart: (id: AnalyticsWidgetId) => void;
  onDragOver: (e: React.DragEvent, id: AnalyticsWidgetId) => void;
  onDrop: (id: AnalyticsWidgetId) => void;
  onDragEnd: () => void;
  dragOver: AnalyticsWidgetId | null;
};

interface AnalyticsWidgetGridProps {
  children: (
    visibleWidgets: AnalyticsWidgetId[],
    removeWidget: (id: AnalyticsWidgetId) => void,
    sizes: Record<AnalyticsWidgetId, 'normal' | 'wide'>,
    toggleSize: (id: AnalyticsWidgetId) => void,
    dragHandlers: AnalyticsDragHandlers
  ) => React.ReactNode;
}

export const AnalyticsWidgetGrid = ({ children }: AnalyticsWidgetGridProps) => {
  const [visibleWidgets, setVisibleWidgets] = useState<AnalyticsWidgetId[]>(ALL_IDS);
  const [order, setOrder] = useState<AnalyticsWidgetId[]>(ALL_IDS);
  const [sizes, setSizes] = useState<Record<AnalyticsWidgetId, 'normal' | 'wide'>>(DEFAULT_SIZES);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [dragOver, setDragOver] = useState<AnalyticsWidgetId | null>(null);
  const dragId = useRef<AnalyticsWidgetId | null>(null);

  useEffect(() => {
    setVisibleWidgets(loadPrefs());
    setOrder(loadOrder());
    setSizes(loadSizes());
    setHydrated(true);
  }, []);

  const toggleWidget = (id: AnalyticsWidgetId) => {
    setVisibleWidgets((prev) => {
      const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
      savePrefs(next);
      return next;
    });
  };

  const toggleSize = (id: AnalyticsWidgetId) => {
    setSizes((prev) => {
      const next = { ...prev, [id]: prev[id] === 'wide' ? 'normal' : 'wide' };
      saveSizes(next);
      return next;
    });
  };

  const dragHandlers: AnalyticsDragHandlers = {
    dragOver,
    onDragStart: (id) => { dragId.current = id; },
    onDragOver: (e, id) => {
      e.preventDefault();
      if (dragId.current && dragId.current !== id) setDragOver(id);
    },
    onDrop: (targetId) => {
      const fromId = dragId.current;
      dragId.current = null;
      setDragOver(null);
      if (!fromId || fromId === targetId) return;
      setOrder((prev) => {
        const allIds = [...new Set([...prev, ...visibleWidgets])];
        const next = [...allIds];
        const fromIdx = next.indexOf(fromId);
        const toIdx = next.indexOf(targetId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, fromId);
        saveOrder(next);
        return next;
      });
    },
    onDragEnd: () => {
      dragId.current = null;
      setDragOver(null);
    }
  };

  if (!hydrated) return null;

  const orderedVisible = [
    ...order.filter((id) => visibleWidgets.includes(id)),
    ...visibleWidgets.filter((id) => !order.includes(id))
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {visibleWidgets.length} of {ANALYTICS_WIDGET_CONFIGS.length} charts · drag to reorder · resize with ⤢
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
            className="rounded-2xl border border-border bg-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Analytics Charts</p>
                <p className="text-xs text-muted-foreground">Toggle charts on or off</p>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                aria-label="Close chart panel"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted/60"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ANALYTICS_WIDGET_CONFIGS.map((cfg) => {
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
                onClick={() => {
                  setVisibleWidgets(ALL_IDS);
                  setOrder(ALL_IDS);
                  setSizes(DEFAULT_SIZES);
                  savePrefs(ALL_IDS);
                  saveOrder(ALL_IDS);
                  saveSizes(DEFAULT_SIZES);
                }}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Reset to defaults
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart content */}
      <div className="min-h-0">
        {children(orderedVisible, toggleWidget, sizes, toggleSize, dragHandlers)}
      </div>
    </div>
  );
};

/* ─── Reusable Analytics Widget wrapper ──────────────────────────────────────── */

export interface AnalyticsWidgetProps {
  id: AnalyticsWidgetId;
  title: string;
  description?: string;
  icon: typeof BarChart2;
  onRemove: (id: AnalyticsWidgetId) => void;
  onToggleSize?: (id: AnalyticsWidgetId) => void;
  size?: 'normal' | 'wide';
  children: React.ReactNode;
  className?: string;
  index?: number;
  dragHandlers?: AnalyticsDragHandlers;
}

export const AnalyticsWidget = ({
  id, title, description, icon: Icon, onRemove, onToggleSize, size = 'normal',
  children, className, index = 0, dragHandlers
}: AnalyticsWidgetProps) => {
  const isDragOver = dragHandlers?.dragOver === id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      draggable
      onDragStart={() => dragHandlers?.onDragStart(id)}
      onDragOver={(e) => dragHandlers?.onDragOver(e, id)}
      onDrop={() => dragHandlers?.onDrop(id)}
      onDragEnd={() => dragHandlers?.onDragEnd()}
      className={cn(
        'surface-card surface-card--static flex flex-col gap-4 transition-shadow duration-200',
        isDragOver && 'ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.01]',
        size === 'wide' && 'md:col-span-2',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 cursor-grab items-center justify-center rounded-xl bg-muted/50 active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onToggleSize && (
            <button
              onClick={() => onToggleSize(id)}
              aria-label={size === 'wide' ? `Shrink ${title} chart` : `Expand ${title} chart`}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
              title={size === 'wide' ? 'Shrink chart' : 'Expand chart to full width'}
            >
              {size === 'wide'
                ? <Minimize2 className="h-3.5 w-3.5" />
                : <Maximize2 className="h-3.5 w-3.5" />
              }
            </button>
          )}
          <button
            onClick={() => onRemove(id)}
            aria-label={`Remove ${title} chart`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            title="Remove chart"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  );
};
