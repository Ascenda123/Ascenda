'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, Minus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger, cardFade } from '@/lib/motion';
import type { RequirementRow, RequirementStatus, RequirementCategory } from '@/lib/data/student-demo-data';

const STATUS_CONFIG: Record<RequirementStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  'complete': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Complete' },
  'in-progress': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'In progress' },
  'missing': { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Missing' },
  'not-required': { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted/30', label: 'N/A' },
};

const CATEGORY_LABELS: Record<RequirementCategory, string> = {
  subjects: 'Subjects',
  exams: 'Exams',
  interviews: 'Interviews',
  documents: 'Documents',
  essays: 'Essays',
};

interface RequirementsCheckerProps {
  matrix: RequirementRow[];
}

export function RequirementsChecker({ matrix }: RequirementsCheckerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const avgProgress = Math.round(matrix.reduce((sum, r) => sum + r.progress, 0) / matrix.length);
  const categories: RequirementCategory[] = ['subjects', 'exams', 'interviews', 'documents', 'essays'];

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="surface-subcard p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Overall readiness</p>
          <p className="text-lg font-semibold text-foreground">{avgProgress}%</p>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              avgProgress >= 80 ? 'bg-emerald-500' : avgProgress >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            )}
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>

      {/* Desktop: table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">University</th>
              {categories.map((cat) => (
                <th key={cat} className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{CATEGORY_LABELS[cat]}</th>
              ))}
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Progress</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span>{row.flagEmoji}</span>
                    <div>
                      <p className="font-medium text-foreground">{row.university}</p>
                      <p className="text-xs text-muted-foreground">{row.programme}</p>
                    </div>
                  </div>
                </td>
                {row.cells.map((cell) => {
                  const cfg = STATUS_CONFIG[cell.status];
                  const Icon = cfg.icon;
                  return (
                    <td key={cell.category} className="text-center px-3 py-3" title={cell.detail}>
                      <div className={cn('mx-auto flex h-8 w-8 items-center justify-center rounded-lg', cfg.bg)}>
                        <Icon className={cn('h-4 w-4', cfg.color)} />
                      </div>
                    </td>
                  );
                })}
                <td className="text-center px-3 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', row.progress >= 80 ? 'bg-emerald-500' : row.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500')}
                        style={{ width: `${row.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{row.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card view */}
      <motion.div className="md:hidden space-y-3" variants={stagger} initial="hidden" animate="show">
        {matrix.map((row) => {
          const isExpanded = expandedId === row.id;
          return (
            <motion.div key={row.id} variants={cardFade}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : row.id)}
                className="w-full text-left surface-subcard p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{row.flagEmoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{row.university}</p>
                      <p className="text-xs text-muted-foreground">{row.programme}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">{row.progress}%</span>
                    <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                  </div>
                </div>

                {/* Status icons row */}
                <div className="flex gap-2 mt-3">
                  {row.cells.map((cell) => {
                    const cfg = STATUS_CONFIG[cell.status];
                    const Icon = cfg.icon;
                    return (
                      <div key={cell.category} className={cn('flex h-7 w-7 items-center justify-center rounded-lg', cfg.bg)}>
                        <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                      </div>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                        {row.cells.filter((c) => c.detail).map((cell) => {
                          const cfg = STATUS_CONFIG[cell.status];
                          return (
                            <div key={cell.category} className="flex items-start gap-2">
                              <span className={cn('text-xs font-semibold', cfg.color)}>{CATEGORY_LABELS[cell.category]}:</span>
                              <span className="text-xs text-muted-foreground">{cell.detail}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
