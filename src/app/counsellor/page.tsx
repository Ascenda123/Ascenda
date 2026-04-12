'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, BarChart2, Clock, Activity, PieChart, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHero } from '@/components/layout/page-hero';
import { DUMMY_STUDENTS, getCohortStats, getUpcomingDeadlines, getRecentActivity, getFieldDistribution } from '@/lib/data/counsellor-dummy-data';
import { WidgetGrid, Widget } from './_components/widget-grid';
import type { WidgetId, DragHandlers } from './_components/widget-grid';
import { StatsBar } from './_components/stats-bar';
import { StudentAlerts } from './_components/student-alerts';
import { ApplicationFunnel } from './_components/application-funnel';
import { MatchDistribution } from './_components/match-distribution';
import { DeadlineWidget } from './_components/deadline-widget';
import { ActivityFeed } from './_components/activity-feed';
import { CohortBreakdown } from './_components/cohort-breakdown';
import { StudentRoster } from './_components/student-roster';
import { TopStudents } from './_components/top-students';

const stats = getCohortStats();
const upcomingDeadlines = getUpcomingDeadlines(7);
const recentActivity = getRecentActivity();
const fieldDistribution = getFieldDistribution();

const WIDGET_ICON_MAP: Record<WidgetId, typeof AlertTriangle> = {
  alerts: AlertTriangle,
  funnel: TrendingUp,
  matchDist: BarChart2,
  deadlines: Clock,
  activity: Activity,
  cohortBreakdown: PieChart,
  topStudents: Trophy
};

const WIDGET_META: Record<WidgetId, { title: string; description: string }> = {
  alerts: { title: 'Student Alerts', description: `${stats.flagged} students need attention` },
  funnel: { title: 'Application Funnel', description: 'Distribution by stage' },
  matchDist: { title: 'Match Distribution', description: 'Reach / Match / Safe across cohort' },
  deadlines: { title: 'Upcoming Deadlines', description: 'Next 7 days' },
  activity: { title: 'Recent Activity', description: 'Latest notes and updates' },
  cohortBreakdown: { title: 'Cohort Breakdown', description: 'Programme type & fields of interest' },
  topStudents: { title: 'Top Students', description: 'Ranked by average match score' }
};

export type DashboardFilter = { type: 'stage' | 'tier' | null; value: string | null };

export default function CounsellorOverviewPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<DashboardFilter>({ type: null, value: null });

  function renderWidget(
    id: WidgetId,
    index: number,
    removeWidget: (id: WidgetId) => void,
    sizes: Record<WidgetId, 'normal' | 'wide'>,
    toggleSize: (id: WidgetId) => void,
    dragHandlers: DragHandlers
  ) {
    const icon = WIDGET_ICON_MAP[id];
    const meta = WIDGET_META[id];
    const size = sizes[id];

    return (
      <Widget
        key={id}
        id={id}
        title={meta.title}
        description={meta.description}
        icon={icon}
        onRemove={removeWidget}
        onToggleSize={toggleSize}
        size={size}
        index={index}
        dragHandlers={dragHandlers}
      >
        {id === 'alerts' && <StudentAlerts students={DUMMY_STUDENTS} />}
        {id === 'funnel' && (
          <ApplicationFunnel
            funnel={stats.appFunnel}
            activeStage={filter.type === 'stage' ? (filter.value as any) : null}
            onSelectStage={(stage) =>
              setFilter(filter.value === stage ? { type: null, value: null } : { type: 'stage', value: stage })
            }
            onNavigateStage={(stage) => router.push(`/counsellor/students?stage=${stage}`)}
          />
        )}
        {id === 'matchDist' && (
          <MatchDistribution
            tiers={stats.matchTiers}
            activeTier={filter.type === 'tier' ? (filter.value as any) : null}
            onSelectTier={(tier) =>
              setFilter(filter.value === tier ? { type: null, value: null } : { type: 'tier', value: tier })
            }
            onNavigateTier={(tier) => router.push(`/counsellor/students?tier=${tier}`)}
          />
        )}
        {id === 'deadlines' && <DeadlineWidget deadlines={upcomingDeadlines} />}
        {id === 'activity' && <ActivityFeed activity={recentActivity} />}
        {id === 'cohortBreakdown' && (
          <CohortBreakdown
            programmeBreakdown={stats.programmeBreakdown}
            fieldDistribution={fieldDistribution}
            onNavigateProgramme={(prog) => router.push(`/counsellor/students?programme=${prog}`)}
            onNavigateField={(field) => router.push(`/counsellor/students?field=${encodeURIComponent(field)}`)}
          />
        )}
        {id === 'topStudents' && <TopStudents students={DUMMY_STUDENTS} />}
      </Widget>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Counsellor View"
        accent="Cohort"
        highlight={`${stats.total} students`}
        title="Overview"
        description="Your cohort at a glance — track progress, spot risks, and stay ahead of deadlines."
        stats={[
          { label: 'Students', value: String(stats.total), detail: 'Active this cycle' },
          { label: 'Avg Completion', value: `${stats.avgCompletion}%`, detail: 'Profile completeness' },
          { label: 'Deadlines / wk', value: String(stats.deadlinesThisWeek), detail: 'Next 7 days' },
          { label: 'Need Attention', value: String(stats.flagged), detail: 'Flags raised' }
        ]}
      />

      <StatsBar stats={stats} />

      <WidgetGrid>
        {(visibleWidgets, removeWidget, sizes, toggleSize, dragHandlers) => (
          <div className="space-y-6">
            {/* Responsive 2-col grid; wide widgets span 2 cols */}
            <div className="grid gap-6 md:grid-cols-2 [&>*]:min-w-0">
              <AnimatePresence mode="popLayout">
                {visibleWidgets.map((id, idx) =>
                  renderWidget(id, idx, removeWidget, sizes, toggleSize, dragHandlers)
                )}
              </AnimatePresence>
            </div>

            {/* Student Roster */}
            <div className="pt-4">
              <div className="mb-6 flex items-center justify-between pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Cohort</p>
                  <h2 className="text-2xl font-semibold text-foreground">Student Roster</h2>
                  <p className="text-xs text-muted-foreground">Manage your cohort and track progress</p>
                </div>
              </div>
              <StudentRoster
                students={DUMMY_STUDENTS}
                externalFilter={filter}
                onClearExternalFilter={() => setFilter({ type: null, value: null })}
              />
            </div>
          </div>
        )}
      </WidgetGrid>
    </div>
  );
}
