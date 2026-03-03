'use client';

import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, BarChart2, Clock, Activity, PieChart, Trophy } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { DUMMY_STUDENTS, getCohortStats, getUpcomingDeadlines, getRecentActivity, getFieldDistribution } from '@/lib/data/counsellor-dummy-data';
import { WidgetGrid, Widget } from './_components/widget-grid';
import type { WidgetId } from './_components/widget-grid';
import { StatsBar } from './_components/stats-bar';
import { StudentAlerts } from './_components/student-alerts';
import { ApplicationFunnel } from './_components/application-funnel';
import { MatchDistribution } from './_components/match-distribution';
import { DeadlineWidget } from './_components/deadline-widget';
import { ActivityFeed } from './_components/activity-feed';
import { CohortBreakdown } from './_components/cohort-breakdown';
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

function renderWidget(id: WidgetId, index: number, removeWidget: (id: WidgetId) => void) {
  const icon = WIDGET_ICON_MAP[id];
  const meta = WIDGET_META[id];

  return (
    <Widget key={id} id={id} title={meta.title} description={meta.description} icon={icon} onRemove={removeWidget} index={index}>
      {id === 'alerts' && <StudentAlerts students={DUMMY_STUDENTS} />}
      {id === 'funnel' && <ApplicationFunnel funnel={stats.appFunnel} />}
      {id === 'matchDist' && <MatchDistribution tiers={stats.matchTiers} />}
      {id === 'deadlines' && <DeadlineWidget deadlines={upcomingDeadlines} />}
      {id === 'activity' && <ActivityFeed activity={recentActivity} />}
      {id === 'cohortBreakdown' && <CohortBreakdown programmeBreakdown={stats.programmeBreakdown} fieldDistribution={fieldDistribution} />}
      {id === 'topStudents' && <TopStudents students={DUMMY_STUDENTS} />}
    </Widget>
  );
}

export default function CounsellorOverviewPage() {
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
        {(visibleWidgets, removeWidget) => {
          const spanned = new Set(['funnel', 'matchDist', 'cohortBreakdown']);
          const half = visibleWidgets.filter((id) => id === 'funnel' || id === 'matchDist');
          const full = visibleWidgets.filter((id) => id === 'cohortBreakdown');
          const single = visibleWidgets.filter((id) => !spanned.has(id));

          return (
            <div className="space-y-6">
              {/* Half-width pair: funnel + matchDist */}
              {half.length > 0 && (
                <div className={`grid gap-6 ${half.length === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                  <AnimatePresence mode="popLayout">
                    {half.map((id, idx) => renderWidget(id, idx, removeWidget))}
                  </AnimatePresence>
                </div>
              )}

              {/* Single-col widgets */}
              {single.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {single.map((id, idx) => renderWidget(id, half.length + idx, removeWidget))}
                  </AnimatePresence>
                </div>
              )}

              {/* Full-width: cohortBreakdown */}
              {full.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence mode="popLayout">
                    {full.map((id, idx) => renderWidget(id, half.length + single.length + idx, removeWidget))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        }}
      </WidgetGrid>
    </div>
  );
}
