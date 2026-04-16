import { PageHero } from '@/components/layout/page-hero';
import { DUMMY_STUDENTS, getCohortStats } from '@/lib/data/counsellor-dummy-data';
import { StudentsPageClient } from './_students-page-client';

const stats = getCohortStats();

interface Props {
  searchParams: Promise<{ stage?: string; tier?: string; programme?: string; field?: string; filter?: string }>;
}

export default async function CounsellorStudentsPage({ searchParams }: Props) {
  const params = await searchParams;
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
      <StudentsPageClient
        students={DUMMY_STUDENTS}
        initialStage={params.stage}
        initialTier={params.tier}
        initialProgramme={params.programme}
        initialField={params.field}
        initialFlagFilter={params.filter === 'flagged' ? 'flagged' : undefined}
      />
    </div>
  );
}
