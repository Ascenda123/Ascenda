'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger, cardFade } from '@/lib/motion';
import type { ActivityEntry } from '@/lib/data/student-demo-data';

const TIER_CONFIG = {
  1: { label: 'Tier 1', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-200/60', desc: 'National / Leadership' },
  2: { label: 'Tier 2', color: 'text-sky-600', bg: 'bg-sky-500/10 border-sky-200/60', desc: 'Significant commitment' },
  3: { label: 'Tier 3', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200/60', desc: 'Regular participation' },
  4: { label: 'Tier 4', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border', desc: 'Casual involvement' },
} as const;

const CATEGORY_OPTIONS: ActivityEntry['category'][] = ['academic', 'leadership', 'service', 'athletics', 'arts', 'work', 'other'];

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
  const charLimit = formatPreview === 'common-app' ? 150 : 350;

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
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="surface-subcard px-4 py-2 text-center">
          <p className="text-lg font-semibold text-foreground">{activities.length}</p>
          <p className="text-xs text-muted-foreground">Activities</p>
        </div>
        <div className="surface-subcard px-4 py-2 text-center">
          <p className="text-lg font-semibold text-foreground">{totalHours.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total hours</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setFormatPreview('common-app')}
            className={cn('rounded-full px-3 py-1 text-xs font-medium transition-colors', formatPreview === 'common-app' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}
          >Common App (150 chars)</button>
          <button
            onClick={() => setFormatPreview('uc')}
            className={cn('rounded-full px-3 py-1 text-xs font-medium transition-colors', formatPreview === 'uc' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}
          >UC (350 chars)</button>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null); setForm(EMPTY_ACTIVITY); }}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 transition-transform"
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
            <div className="surface-subcard p-4 space-y-4">
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
                <p className={cn('mt-1 text-xs', form.description.length > charLimit * 0.9 ? 'text-rose-600' : 'text-muted-foreground')}>
                  {form.description.length} / {charLimit} characters
                </p>
              </div>
              <button onClick={handleSave} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 transition-transform">
                <Check className="h-4 w-4" /> {editingId ? 'Save changes' : 'Add activity'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity list */}
      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {activities.map((activity) => {
          const tier = TIER_CONFIG[activity.tier];
          return (
            <motion.div key={activity.id} variants={cardFade} className="surface-subcard p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-foreground">{activity.name}</span>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', tier.bg, tier.color)}>
                      {tier.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.role} · {activity.organization}</p>
                  <p className="text-xs text-muted-foreground">{activity.hoursPerWeek} hrs/wk · {activity.weeksPerYear} wks/yr · <strong>{activity.hoursPerWeek * activity.weeksPerYear} total hours</strong></p>
                  <p className="text-sm text-foreground/80 mt-1">{activity.description}</p>
                  <p className={cn('text-xs mt-1', activity.description.length > charLimit ? 'text-rose-600 font-medium' : 'text-muted-foreground')}>
                    {activity.description.length} / {charLimit} chars ({formatPreview === 'common-app' ? 'Common App' : 'UC'})
                  </p>
                </div>
                <div className="flex gap-1 ml-3 shrink-0">
                  <button onClick={() => startEdit(activity)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(activity.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {activities.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No activities logged yet. Click &ldquo;Add activity&rdquo; to get started.
        </div>
      )}
    </div>
  );
}
