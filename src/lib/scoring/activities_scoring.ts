/**
 * Activities & Extracurricular Scoring — Ascenda v1
 *
 * Adds up to MAX_ACTIVITIES_SCORE points on top of the academic score.
 * Deliberately capped so it can never flip a Weak student into Strong —
 * it operates at the margin, rewarding genuine depth without distorting
 * the academic signal.
 *
 * Weights are exported so the batch runner can A/B tune them without
 * touching this file.
 */

import type { StudentProfilePayload } from '@/lib/profile/intake-types';

// ── Tunable weights (edit here to fine-tune between batches) ─────────────────

export const ACTIVITIES_WEIGHTS = {
  // commitment_level → raw points
  commitment: {
    light: 0,
    moderate: 3,
    deep: 8,
    exceptional: 15,
  } as Record<string, number>,

  // Points for having any leadership role vs. a notably prestigious one
  leadership_any: 3,
  leadership_notable: 5, // overrides _any if a notable role is present

  // Roles that count as "notable"
  notable_roles: new Set([
    'Head Boy / Girl',
    'Club Founder',
    'Class President',
    'Community Leader',
  ]),

  // Points for number of key activities selected
  key_activities: {
    0: 0,
    1: 1,
    3: 3, // 1–2 activities = 1, 3–4 = 3, 5+ = 5
    5: 5,
  } as Record<number, number>,

  // Points for international experience (any non-None entry)
  intl_experience: 3,

  // Points for any work / internship experience
  work_experience: 3,

  // Hard cap — activities score can never exceed this
  max_total: 20,
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActivitiesBreakdown = {
  commitment: number;
  leadership: number;
  key_activities: number;
  intl_experience: number;
  work_experience: number;
  total: number; // min(sum, max_total)
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const keyActivitiesPoints = (count: number): number => {
  if (count >= 5) return ACTIVITIES_WEIGHTS.key_activities[5];
  if (count >= 3) return ACTIVITIES_WEIGHTS.key_activities[3];
  if (count >= 1) return ACTIVITIES_WEIGHTS.key_activities[1];
  return 0;
};

// ── Main function ─────────────────────────────────────────────────────────────

export const calculateActivitiesScore = (
  lifestyle: StudentProfilePayload['lifestyle_preference']
): ActivitiesBreakdown => {
  // 1. Commitment level
  const commitment =
    ACTIVITIES_WEIGHTS.commitment[lifestyle.commitment_level ?? ''] ?? 0;

  // 2. Leadership roles
  const roles = lifestyle.leadership_roles ?? [];
  const hasNotable = roles.some((r) => ACTIVITIES_WEIGHTS.notable_roles.has(r));
  const hasAny = roles.some((r) => r !== 'None' && r !== '');
  const leadership = hasNotable
    ? ACTIVITIES_WEIGHTS.leadership_notable
    : hasAny
      ? ACTIVITIES_WEIGHTS.leadership_any
      : 0;

  // 3. Key activities (count of selected items)
  const actCount = (lifestyle.key_activities ?? []).length;
  const key_activities = keyActivitiesPoints(actCount);

  // 4. International experience (any non-None entry)
  const hasIntl = (lifestyle.intl_experience ?? []).some(
    (e) => e !== 'None' && e !== ''
  );
  const intl_experience = hasIntl ? ACTIVITIES_WEIGHTS.intl_experience : 0;

  // 5. Work / internship experience
  const work_experience = lifestyle.work_experience
    ? ACTIVITIES_WEIGHTS.work_experience
    : 0;

  const raw = commitment + leadership + key_activities + intl_experience + work_experience;
  const total = Math.min(ACTIVITIES_WEIGHTS.max_total, raw);

  return { commitment, leadership, key_activities, intl_experience, work_experience, total };
};
