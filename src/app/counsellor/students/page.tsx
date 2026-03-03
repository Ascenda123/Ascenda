import { PageHero } from '@/components/layout/page-hero';
import { DUMMY_STUDENTS, getCohortStats } from '@/lib/data/counsellor-dummy-data';
import { StudentRoster } from '../_components/student-roster';

const stats = getCohortStats();

export default function CounsellorStudentsPage() {
  const flagged = DUMMY_STUDENTS.filter((s) => s.flags.length > 0).length;
  const complete = DUMMY_STUDENTS.filter((s) => s.profile.completionPct === 100).length;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Counsellor View"
        accent="Cohort"
        highlight={`${stats.total} students`}
        title="Student Roster"
        description="Search, filter, and review your full cohort. Click any student to view their full profile, matches, and applications."
        stats={[
          { label: 'Total', value: String(stats.total), detail: 'In this cohort' },
          { label: 'Profile Complete', value: String(complete), detail: `${Math.round((complete / stats.total) * 100)}% of cohort` },
          { label: 'Need Attention', value: String(flagged), detail: 'Have active flags' },
          { label: 'Avg Completion', value: `${stats.avgCompletion}%`, detail: 'Across all students' }
        ]}
      />
      <StudentRoster students={DUMMY_STUDENTS} />
    </div>
  );
}
