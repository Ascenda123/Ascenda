'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, GraduationCap, Calendar, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger, cardFade } from '@/lib/motion';
import type { DemoStudentGrades, UniversityChance } from '@/lib/data/student-demo-data';

function classify(predicted: number, min: number): 'reach' | 'match' | 'safety' {
  const diff = predicted - min;
  if (diff >= 5) return 'safety';
  if (diff >= 1) return 'match';
  return 'reach';
}

const CLASS_CONFIG = {
  reach: { label: 'Reach', color: 'text-rose-600', bg: 'bg-rose-500/10 border-rose-200/60' },
  match: { label: 'Match', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200/60' },
  safety: { label: 'Safety', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-200/60' },
} as const;

interface ChancesCalculatorProps {
  grades: DemoStudentGrades;
  universities: UniversityChance[];
}

export function ChancesCalculator({ grades, universities }: ChancesCalculatorProps) {
  const [overrideScore, setOverrideScore] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const predicted = overrideScore ?? grades.predicted;

  const sorted = [...universities]
    .map((u) => ({ ...u, classification: classify(predicted, u.minimumScore) }))
    .sort((a, b) => {
      const order = { reach: 0, match: 1, safety: 2 };
      return order[a.classification] - order[b.classification];
    });

  const counts = { reach: 0, match: 0, safety: 0 };
  sorted.forEach((u) => counts[u.classification]++);

  return (
    <div className="space-y-6">
      {/* Student grades summary */}
      <div className="surface-subcard p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{grades.system} Predicted</p>
            <p className="text-2xl font-semibold text-foreground">{predicted} points</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Override:</label>
            <input
              type="number"
              min={24}
              max={45}
              value={overrideScore ?? ''}
              onChange={(e) => setOverrideScore(e.target.value ? Number(e.target.value) : null)}
              placeholder={String(grades.predicted)}
              className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {grades.subjects.map((s) => (
            <span key={s.name} className="surface-chip text-xs">
              {s.name} {s.level} · <strong>{s.predicted}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3">
        {(['reach', 'match', 'safety'] as const).map((tier) => (
          <div key={tier} className={cn('flex-1 rounded-xl border p-3 text-center', CLASS_CONFIG[tier].bg)}>
            <p className={cn('text-lg font-semibold', CLASS_CONFIG[tier].color)}>{counts[tier]}</p>
            <p className="text-xs text-muted-foreground">{CLASS_CONFIG[tier].label}</p>
          </div>
        ))}
      </div>

      {/* University cards */}
      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {sorted.map((uni) => {
          const cfg = CLASS_CONFIG[uni.classification];
          const isExpanded = expandedId === uni.id;
          return (
            <motion.div key={uni.id} variants={cardFade}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : uni.id)}
                className={cn('w-full text-left rounded-2xl border p-4 transition-colors', cfg.bg)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span>{uni.flagEmoji}</span>
                      <span className="text-base font-semibold text-foreground">{uni.university}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{uni.programme}</p>
                    <p className="text-xs text-muted-foreground">Typical offer: {uni.typicalOffer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', cfg.bg, cfg.color)}>
                      {cfg.label}
                    </span>
                    <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 grid gap-3 sm:grid-cols-3 border-t border-border/50 pt-4">
                        {uni.hlRequirements && uni.hlRequirements.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <GraduationCap className="h-3.5 w-3.5" /> HL Requirements
                            </div>
                            {uni.hlRequirements.map((req) => (
                              <p key={req} className="text-xs text-foreground">{req}</p>
                            ))}
                          </div>
                        )}
                        {uni.entranceExams && uni.entranceExams.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <ClipboardList className="h-3.5 w-3.5" /> Entrance Exams
                            </div>
                            {uni.entranceExams.map((exam) => (
                              <p key={exam} className="text-xs text-foreground">{exam}</p>
                            ))}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" /> Deadline
                          </div>
                          <p className="text-xs text-foreground">{new Date(uni.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          {uni.interviewRequired && <p className="text-xs text-amber-600">Interview required</p>}
                        </div>
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
