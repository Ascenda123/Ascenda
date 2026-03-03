import { PageHero } from '@/components/layout/page-hero';
import { DUMMY_STUDENTS, getCohortStats, getFieldDistribution } from '@/lib/data/counsellor-dummy-data';
import {
  ProgrammeSplit,
  IbDistribution,
  FieldChart,
  FullFunnel,
  MatchTierSummary,
  CompletionBreakdown
} from '../_components/analytics-charts';
import { ExportButton } from '../_components/export-button';

const stats = getCohortStats();
const fieldDistribution = getFieldDistribution();

// IB score buckets
const ibStudents = DUMMY_STUDENTS.filter((s) => s.academic.programmeType === 'IB');
const ibBuckets = [
  { label: '41–45', count: ibStudents.filter((s) => (s.academic.ibPoints ?? 0) >= 41).length },
  { label: '38–40', count: ibStudents.filter((s) => (s.academic.ibPoints ?? 0) >= 38 && (s.academic.ibPoints ?? 0) <= 40).length },
  { label: '35–37', count: ibStudents.filter((s) => (s.academic.ibPoints ?? 0) >= 35 && (s.academic.ibPoints ?? 0) <= 37).length },
  { label: '30–34', count: ibStudents.filter((s) => (s.academic.ibPoints ?? 0) < 35 && (s.academic.ibPoints ?? 0) >= 30).length }
];

// Profile completion data
const completionData = DUMMY_STUDENTS.map((s) => ({
  name: `${s.personal.firstName} ${s.personal.lastName}`,
  pct: s.profile.completionPct
}));

// Total matches and applications for hero
const totalMatches = DUMMY_STUDENTS.reduce((acc, s) => acc + s.matches.length, 0);
const totalApps = DUMMY_STUDENTS.reduce((acc, s) => acc + s.applications.length, 0);

export default function CounsellorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Counsellor View"
        accent="Analytics"
        highlight="Cohort insights"
        title="Cohort Analytics"
        description="Aggregate data and trends across your full student cohort. Use these insights to identify patterns and guide your counselling strategy."
        actions={<ExportButton />}
        stats={[
          { label: 'Students', value: String(stats.total), detail: 'In cohort' },
          { label: 'Total Matches', value: String(totalMatches), detail: 'Across all students' },
          { label: 'Applications', value: String(totalApps), detail: 'In progress or submitted' },
          { label: 'Avg Completion', value: `${stats.avgCompletion}%`, detail: 'Profile readiness' }
        ]}
      />

      {/* Row 1: Programme + IB distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <ProgrammeSplit breakdown={stats.programmeBreakdown} />
        <IbDistribution buckets={ibBuckets} />
      </div>

      {/* Row 2: Fields + completion */}
      <div className="grid gap-4 md:grid-cols-2">
        <FieldChart fields={fieldDistribution} />
        <CompletionBreakdown students={completionData} />
      </div>

      {/* Row 3: Funnel + match tiers */}
      <div className="grid gap-4 md:grid-cols-2">
        <FullFunnel funnel={stats.appFunnel} />
        <MatchTierSummary tiers={stats.matchTiers} />
      </div>

      {/* Key insights */}
      <div className="surface-card surface-card--static space-y-4">
        <p className="text-sm font-semibold text-foreground">Key Insights</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: 'Profile gaps',
              value: `${stats.flagged} student${stats.flagged !== 1 ? 's' : ''}`,
              detail: 'have incomplete profiles affecting match quality',
              color: 'text-amber-600',
              bg: 'bg-amber-500/10',
              border: 'border-amber-200/50 dark:border-amber-500/20'
            },
            {
              label: 'Top destination',
              value: 'United Kingdom',
              detail: 'is the #1 preferred study destination across the cohort',
              color: 'text-violet-600',
              bg: 'bg-violet-500/10',
              border: 'border-violet-200/50 dark:border-violet-500/20'
            },
            {
              label: 'Submission rate',
              value: `${Math.round((stats.appFunnel.submitted / (totalApps || 1)) * 100)}%`,
              detail: 'of all applications have been submitted',
              color: 'text-emerald-600',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-200/50 dark:border-emerald-500/20'
            },
            {
              label: 'Deadlines this week',
              value: String(stats.deadlinesThisWeek),
              detail: `deadline${stats.deadlinesThisWeek !== 1 ? 's' : ''} require immediate attention`,
              color: 'text-red-500',
              bg: 'bg-red-500/10',
              border: 'border-red-200/50 dark:border-red-500/20'
            },
            {
              label: 'Reach applications',
              value: `${stats.matchTiers.reach}`,
              detail: 'matches are Reach-tier — worth monitoring closely',
              color: 'text-rose-600',
              bg: 'bg-rose-500/10',
              border: 'border-rose-200/50 dark:border-rose-500/20'
            },
            {
              label: 'Safe coverage',
              value: `${DUMMY_STUDENTS.filter((s) => s.matches.some((m) => m.tier === 'Safe')).length} / ${stats.total}`,
              detail: 'students have at least one Safe-tier option',
              color: 'text-sky-600',
              bg: 'bg-sky-500/10',
              border: 'border-sky-200/50 dark:border-sky-500/20'
            }
          ].map(({ label, value, detail, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border px-4 py-4 ${bg} ${border}`}>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
