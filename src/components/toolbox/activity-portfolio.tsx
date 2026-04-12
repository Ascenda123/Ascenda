'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, GripVertical, Clock, Trophy, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityEntry } from '@/lib/data/student-demo-data';

const TIER_CONFIG = {
  1: { label: 'Tier 1', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-200/60', barColor: 'bg-emerald-500', desc: 'National / Leadership', impact: 'Highest impact' },
  2: { label: 'Tier 2', color: 'text-sky-600', bg: 'bg-sky-500/10 border-sky-200/60', barColor: 'bg-sky-500', desc: 'Significant commitment', impact: 'High impact' },
  3: { label: 'Tier 3', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200/60', barColor: 'bg-amber-500', desc: 'Regular participation', impact: 'Moderate impact' },
  4: { label: 'Tier 4', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border', barColor: 'bg-muted-foreground/40', desc: 'Casual involvement', impact: 'Low impact' },
} as const;

const CATEGORY_OPTIONS: ActivityEntry['category'][] = ['academic', 'leadership', 'service', 'athletics', 'arts', 'work', 'other'];

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'bg-violet-500/10 text-violet-600 border-violet-200/60',
  leadership: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
  service: 'bg-sky-500/10 text-sky-600 border-sky-200/60',
  athletics: 'bg-rose-500/10 text-rose-600 border-rose-200/60',
  arts: 'bg-amber-500/10 text-amber-600 border-amber-200/60',
  work: 'bg-primary/10 text-primary border-primary/20',
  other: 'bg-muted/50 text-muted-foreground border-border',
};

const EMPTY_ACTIVITY: Omit<ActivityEntry, 'id'> = {
  name: '', role: '', organization: '', category: 'other',
  startDate: new Date().toISOString().slice(0, 10),
  hoursPerWeek: 0, weeksPerYear: 0, description: '', tier: 3,
};

interface ActivityPortfolioProps {
  initialActivities: ActivityEntry[];
}

export function ActivityPortfolio({ initialActivities }: ActivityPortfolioProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>(initialActivities);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Omit<ActivityEntry, 'id'>>(EMPTY_ACTIVITY);
  const [formatPreview, setFormatPreview] = useState<'common-app' | 'uc'>('common-app');
  const [viewMode, setViewMode] = useState<'list' | 'impact'>('list');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ascenda-activities');
      if (saved) setActivities(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('ascenda-activities', JSON.stringify(activities));
  }, [activities]);

  const totalHours = activities.reduce((sum, a) => sum + a.hoursPerWeek * a.weeksPerYear, 0);
  const maxHours = Math.max(...activities.map((a) => a.hoursPerWeek * a.weeksPerYear), 1);
  const charLimit = formatPreview === 'common-app' ? 150 : 350;
  const tier1Count = activities.filter((a) => a.tier === 1).length;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach((a) => {
      map.set(a.category, (map.get(a.category) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [activities]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setActivities((prev) => prev.map((a) => (a.id === editingId ? { ...form, id: editingId } : a)));
    } else {
      setActivities((prev) => [...prev, { ...form, id: `act-${Date.now()}` }]);
    }
    setForm(EMPTY_ACTIVITY);
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (activity: ActivityEntry) => {
    const { id, ...rest } = activity;
    setForm(rest);
    setEditingId(id);
    setShowAdd(true);
  };

  const handleDelete = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) { setEditingId(null); setShowAdd(false); }
  };

  return (
    <div className="space-y-6">
      {/* Stats dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={BarChart3}
          value={activities.length}
          label="Activities"
          sub={`of 10 max`}
          color="text-primary"
        />
        <StatCard
          icon={Clock}
          value={totalHours.toLocaleString()}
          label="Total Hours"
          sub="all activities"
          color="text-sky-600"
        />
        <StatCard
          icon={Trophy}
          value={tier1Count}
          label="Tier 1"
          sub="highest impact"
          color="text-emerald-600"
        />
        <div className="surface-subcard px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">Categories</p>
          <div className="flex flex-wrap gap-1">
            {categoryBreakdown.map(([cat, count]) => (
              <span key={cat} className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', CATEGORY_COLORS[cat])}>
                {cat} ({count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5 surface-subcard p-1 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={cn('rounded-lg px-3 py-1 text-xs font-medium transition-colors', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('impact')}
            className={cn('rounded-lg px-3 py-1 text-xs font-medium transition-colors', viewMode === 'impact' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            Impact
          </button>
        </div>

        <div className="flex gap-1.5 surface-subcard p-1 rounded-xl">
          <button
            onClick={() => setFormatPreview('common-app')}
            className={cn('rounded-lg px-3 py-1 text-xs font-medium transition-colors', formatPreview === 'common-app' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            Common App (150)
          </button>
          <button
            onClick={() => setFormatPreview('uc')}
            className={cn('rounded-lg px-3 py-1 text-xs font-medium transition-colors', formatPreview === 'uc' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            UC (350)
          </button>
        </div>

        <button
          onClick={() => { setShowAdd(true); setEditingId(null); setForm(EMPTY_ACTIVITY); }}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 transition-transform shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Add activity
        </button>
      </div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="surface-subcard p-5 space-y-4 rounded-2xl ring-1 ring-primary/10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{editingId ? 'Edit activity' : 'New activity'}</p>
                <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Activity name" className="form-input" />
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Your role" className="form-input" />
                <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Organisation" className="form-input" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ActivityEntry['category'] })} className="form-input">
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <input type="number" value={form.hoursPerWeek || ''} onChange={(e) => setForm({ ...form, hoursPerWeek: Number(e.target.value) })} placeholder="Hours/week" className="form-input" />
                <input type="number" value={form.weeksPerYear || ''} onChange={(e) => setForm({ ...form, weeksPerYear: Number(e.target.value) })} placeholder="Weeks/year" className="form-input" />
                <select value={form.tier} onChange={(e) => setForm({ ...form, tier: Number(e.target.value) as 1 | 2 | 3 | 4 })} className="form-input">
                  {([1, 2, 3, 4] as const).map((t) => <option key={t} value={t}>{TIER_CONFIG[t].label} — {TIER_CONFIG[t].desc}</option>)}
                </select>
              </div>
              <div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description (keep under character limit)"
                  className="form-input min-h-[80px] resize-y"
                  maxLength={charLimit}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className={cn('text-xs', form.description.length > charLimit * 0.9 ? 'text-rose-600' : 'text-muted-foreground')}>
                    {form.description.length} / {charLimit} characters
                  </p>
                  <div className="h-1 w-20 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', form.description.length > charLimit * 0.9 ? 'bg-rose-500' : 'bg-emerald-500')}
                      style={{ width: `${Math.min((form.description.length / charLimit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <button onClick={handleSave} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 transition-transform">
                <Check className="h-4 w-4" /> {editingId ? 'Save changes' : 'Add activity'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Impact view */}
      {viewMode === 'impact' && (
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Impact Visualization</p>
          <div className="space-y-3">
            {[...activities].sort((a, b) => a.tier - b.tier || (b.hoursPerWeek * b.weeksPerYear) - (a.hoursPerWeek * a.weeksPerYear)).map((activity) => {
              const tier = TIER_CONFIG[activity.tier];
              const hours = activity.hoursPerWeek * activity.weeksPerYear;
              const barWidth = (hours / maxHours) * 100;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <span className={cn('w-14 text-right text-[10px] font-semibold shrink-0', tier.color)}>
                    {tier.label}
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">{activity.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{hours} hrs</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        className={cn('h-full rounded-full', tier.barColor)}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tier distribution */}
          <div className="surface-subcard p-4 rounded-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Tier Distribution</p>
            <div className="flex gap-1 h-4 rounded-full overflow-hidden">
              {([1, 2, 3, 4] as const).map((t) => {
                const count = activities.filter((a) => a.tier === t).length;
                if (count === 0) return null;
                return (
                  <motion.div
                    key={t}
                    className={cn('h-full', TIER_CONFIG[t].barColor)}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / activities.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    title={`${TIER_CONFIG[t].label}: ${count} activities`}
                  />
                );
              })}
            </div>
            <div className="flex gap-4 mt-2">
              {([1, 2, 3, 4] as const).map((t) => {
                const count = activities.filter((a) => a.tier === t).length;
                if (count === 0) return null;
                return (
                  <div key={t} className="flex items-center gap-1.5">
                    <div className={cn('h-2.5 w-2.5 rounded-full', TIER_CONFIG[t].barColor)} />
                    <span className="text-[11px] text-muted-foreground">{TIER_CONFIG[t].label} ({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* List view with reorder */}
      {viewMode === 'list' && (
        <Reorder.Group
          axis="y"
          values={activities}
          onReorder={setActivities}
          className="space-y-3"
        >
          {activities.map((activity) => {
            const tier = TIER_CONFIG[activity.tier];
            const hours = activity.hoursPerWeek * activity.weeksPerYear;
            return (
              <Reorder.Item key={activity.id} value={activity} className="cursor-grab active:cursor-grabbing">
                <div className="surface-subcard p-4 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-4 w-4 mt-1 text-muted-foreground/40 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-semibold text-foreground">{activity.name}</span>
                        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', tier.bg, tier.color)}>
                          {tier.label}
                        </span>
                        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', CATEGORY_COLORS[activity.category])}>
                          {activity.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.role} · {activity.organization}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.hoursPerWeek} hrs/wk · {activity.weeksPerYear} wks/yr
                        </span>
                        <span className="font-semibold text-foreground">{hours} total hours</span>
                      </div>

                      {/* Hours bar */}
                      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden max-w-xs">
                        <motion.div
                          className={cn('h-full rounded-full', tier.barColor)}
                          initial={{ width: 0 }}
                          animate={{ width: `${(hours / maxHours) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      <p className="text-sm text-foreground/80">{activity.description}</p>
                      <p className={cn('text-xs', activity.description.length > charLimit ? 'text-rose-600 font-medium' : 'text-muted-foreground')}>
                        {activity.description.length} / {charLimit} chars ({formatPreview === 'common-app' ? 'Common App' : 'UC'})
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEdit(activity)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(activity.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {activities.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No activities logged yet.</p>
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); setForm(EMPTY_ACTIVITY); }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add your first activity
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, sub, color }: {
  icon: typeof BarChart3;
  value: string | number;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="surface-subcard px-4 py-3 space-y-1">
      <Icon className={cn('h-4 w-4', color)} />
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/60">{sub}</p>
    </div>
  );
}
