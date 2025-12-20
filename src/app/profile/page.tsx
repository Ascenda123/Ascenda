import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PROFILE_STEPS, type StepCompletionMap, type StepKey } from '@/lib/profile/steps';
import { buildStepCompletion, type ProfileRecordGroup } from '@/lib/profile/completion';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionNav } from '@/components/layout/section-nav';
import { ProfileProgressCard } from './_components/profile-progress-card';
import { recalculateStudentScore, resubmitStudentProfile } from './actions';
import { Compass, GraduationCap, MapPin, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Profile | Ascenda'
};

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id ?? '').single();
  const { data: personal } = await supabase
    .from('student_personal_information')
    .select('*')
    .eq('profile_id', user?.id ?? '')
    .single();
  const { data: academicInput } = await supabase
    .from('student_academic_input')
    .select('*')
    .eq('profile_id', user?.id ?? '')
    .single();
  const { data: lifestyle } = await supabase
    .from('student_lifestyle_preference')
    .select('*')
    .eq('profile_id', user?.id ?? '')
    .single();
  const { data: subjects } = await supabase
    .from('student_subjects')
    .select('subject_name,level,grade_value')
    .eq('profile_id', user?.id ?? '');
  const { data: admissionsTests } = await supabase
    .from('student_admissions_tests')
    .select('test_type,status,score_numeric,percentile')
    .eq('profile_id', user?.id ?? '');
  const { data: scores } = await supabase
    .from('student_scores')
    .select('*')
    .eq('profile_id', user?.id ?? '')
    .single();

  const recordGroup: ProfileRecordGroup = {
    personal: personal ?? null,
    academicInput: academicInput ?? null,
    subjectCount: subjects?.length ?? 0,
    lifestyle: lifestyle ?? null
  };
  const stepCompletion: StepCompletionMap = buildStepCompletion(recordGroup);
  const completedCount = PROFILE_STEPS.filter((step) => stepCompletion[step.key]).length;
  const completionPercent = Math.round((completedCount / PROFILE_STEPS.length) * 100);
  const nextStep = PROFILE_STEPS.find((step) => !stepCompletion[step.key]);
  const nextStepKey: StepKey = nextStep?.key ?? 'personal_information';
  const heroStats = [
    { label: 'Completion', value: `${completionPercent}%`, detail: 'Profile ready' },
    { label: 'Steps done', value: `${completedCount}/${PROFILE_STEPS.length}`, detail: 'Sections' },
    { label: 'Next', value: nextStep?.title ?? 'All set', detail: 'Focus area' }
  ];
  const primaryClusters = Array.isArray(academicInput?.intended_clusters)
    ? academicInput.intended_clusters.filter(Boolean)
    : [];
  const secondaryClusters = Array.isArray(academicInput?.secondary_clusters)
    ? academicInput.secondary_clusters.filter(Boolean)
    : [];
  const profileFullName =
    personal?.first_name || personal?.last_name
      ? `${personal?.first_name ?? ''} ${personal?.last_name ?? ''}`.trim()
      : profile?.full_name;
  const profileEmail = personal?.email ?? user?.email ?? '';
  const formatClusterLabel = (value: string) =>
    value
      .split('_')
      .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
      .join(' ');

  const academicSignals = [
    academicInput?.programme_type ? `Programme: ${academicInput.programme_type}` : null,
    typeof academicInput?.ib_total_points === 'number' ? `IB ${academicInput.ib_total_points}/45` : null,
    typeof subjects?.length === 'number' && subjects.length > 0 ? `Subjects: ${subjects.length}` : null,
    academicInput?.english_status ? `English: ${academicInput.english_status}` : null
  ].filter(Boolean) as string[];
  const subjectHighlights = (subjects ?? [])
    .slice(0, 3)
    .map((subject) =>
      subject.subject_name
        ? `${subject.subject_name}${subject.grade_value ? ` (${subject.grade_value})` : ''}`
        : null
    )
    .filter(Boolean) as string[];
  const admissionsSummary = (admissionsTests ?? [])
    .filter((test) => test.test_type && test.test_type !== 'NONE')
    .slice(0, 2)
    .map((test) => `${test.test_type}${test.status ? ` • ${test.status}` : ''}`);
  const admissionsLabel = admissionsSummary.length ? admissionsSummary.join(', ') : 'No tests recorded';
  const profileNavItems = [{ label: 'Overview', href: '/profile', exact: true }];
  const outcomeHints = [
    primaryClusters.length === 0
      ? { title: 'Set intended subjects', detail: 'Improves programme relevance and admissions test guidance.' }
      : null,
    (subjects?.length ?? 0) === 0
      ? { title: 'Add subject predictions', detail: 'Enables eligibility checks and grade-fit scoring.' }
      : null,
    academicInput?.english_required === null || academicInput?.english_required === undefined
      ? { title: 'Confirm English requirements', detail: 'Ensures language test reminders are accurate.' }
      : null,
    (lifestyle?.extracurricular_interests ?? []).length === 0
      ? { title: 'Share lifestyle preferences', detail: 'Improves campus fit and experience match signals.' }
      : null
  ]
    .filter(Boolean)
    .slice(0, 3) as { title: string; detail: string }[];

  return (
    <DashboardShell>
      <SectionNav items={profileNavItems} />
      <PageHero
        eyebrow="Profile"
        title="Build your student profile"
        description="We use this information to personalize match suggestions, academic guidance, and your application plan."
        highlight={nextStep ? `Next • ${nextStep.title}` : 'All set'}
        stats={heroStats}
        breadcrumbs={<Breadcrumbs />}
        actions={
          <>
            <Button asChild size="sm" variant="soft">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/matches">Preview matches</Link>
            </Button>
          </>
        }
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[32px] glass-panel p-8 shadow-2xl transition-all duration-300 hover:shadow-primary/5 group border border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-primary/5 to-emerald-400/5 opacity-50" aria-hidden />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Profile</p>
              <p className="text-xl font-semibold text-foreground">{profileFullName || 'Add your full name'}</p>
              <p className="text-sm text-muted-foreground">{profileEmail || 'Add an email'}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Country</p>
              <p className="text-sm font-semibold text-foreground">{personal?.resident_country || 'Add home country'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Time zone</p>
              <p className="text-sm font-semibold text-foreground">{personal?.time_zone || profile?.time_zone || 'Set time zone'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Score</p>
              <p className="text-sm font-semibold text-foreground">
                {typeof scores?.total_score === 'number' ? `${scores.total_score} • ${scores.student_band ?? 'Unbanded'}` : 'Not scored'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Intended subjects</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {primaryClusters.length ? (
                primaryClusters.map((cluster) => (
                  <span
                    key={cluster}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-white/10"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    {formatClusterLabel(cluster)}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-white/10">
                  Add intended subjects
                </span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Secondary interests</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {secondaryClusters.slice(0, 2).map((cluster) => (
                <span
                  key={cluster}
                  className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-white/10"
                >
                  <Target className="h-3.5 w-3.5" />
                  {formatClusterLabel(cluster)}
                </span>
              ))}
              {!secondaryClusters.length ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-white/10">
                  Add secondary interests
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="sm" variant="outline" asChild className="rounded-xl px-6">
              <Link href="/profile/wizard?step=personal_information">Edit profile</Link>
            </Button>
            <form action={resubmitStudentProfile}>
              <Button size="sm" variant="ghost" type="submit" className="rounded-xl">
                Resubmit
              </Button>
            </form>
            <form action={recalculateStudentScore}>
              <Button size="sm" variant="secondary" type="submit" className="rounded-xl px-6 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                Recalculate score
              </Button>
            </form>
          </div>
        </div>
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-[32px] glass-panel p-6 shadow-xl border border-white/10 hover:shadow-primary/5 transition-all duration-300">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-primary/5 to-emerald-400/5 opacity-50" aria-hidden />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Lifestyle</p>
                <p className="text-lg font-semibold text-foreground">Study setup</p>
                <p className="text-sm text-muted-foreground">Teaching style and campus feel</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Teaching style</p>
                <p className="text-sm font-semibold text-foreground">
                  {lifestyle?.teaching_style ? formatClusterLabel(lifestyle.teaching_style) : 'Add preference'}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Location type</p>
                <p className="text-sm font-semibold text-foreground">
                  {lifestyle?.desired_location_type ? formatClusterLabel(lifestyle.desired_location_type) : 'Add preference'}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(lifestyle?.extracurricular_interests ?? []).slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-white/10"
                >
                  {interest}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild className="rounded-xl">
                <Link href="/profile/wizard?step=lifestyle_preferences">Edit preferences</Link>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[32px] glass-panel p-6 shadow-xl border border-white/10 hover:shadow-primary/5 transition-all duration-300">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/6 via-primary/5 to-emerald-400/6 opacity-50" aria-hidden />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Academics</p>
                <p className="text-lg font-semibold text-foreground">Snapshot</p>
                <p className="text-sm text-muted-foreground">
                  {academicInput?.programme_type ? academicInput.programme_type : 'Add qualification and grades'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {academicSignals.length ? (
                academicSignals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-white/10"
                  >
                    {signal}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-white/10">
                  Add scores to sharpen matches
                </span>
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">School</p>
                <p className="text-sm font-semibold text-foreground">
                  {academicInput?.school_name ? academicInput.school_name : 'Add school name'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {academicInput?.school_country ? academicInput.school_country : 'Add school country'}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Graduation</p>
                <p className="text-sm font-semibold text-foreground">
                  {academicInput?.graduation_year ? academicInput.graduation_year : 'Set graduation year'}
                </p>
                <p className="text-xs text-muted-foreground">{academicInput?.desired_start_date ?? 'Start date not set'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Top subjects</p>
                <p className="text-sm font-semibold text-foreground">{subjectHighlights.join(' • ') || 'Add subjects'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admissions tests</p>
                <p className="text-sm font-semibold text-foreground">{admissionsLabel}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild className="rounded-xl">
                <Link href="/profile/wizard?step=academic_details">Edit academics</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr,1fr]">
        <ProfileProgressCard
          completionPercent={completionPercent}
          completedCount={completedCount}
          totalSteps={PROFILE_STEPS.length}
          nextStepTitle={nextStep?.title}
          stepCompletion={stepCompletion}
        />
        <div className="relative overflow-hidden rounded-[32px] glass-panel p-8 text-sm text-muted-foreground shadow-xl border border-white/10 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-primary/5 to-emerald-400/5 opacity-60" aria-hidden />
          <div className="relative z-10">
            <p className="text-base font-semibold text-foreground">Why it matters</p>
            <ul className="mt-4 space-y-3 text-foreground/80">
              <li>Unlock tighter match suggestions as soon as each section is saved.</li>
              <li>Surface prerequisite gaps and testing needs with your academic profile.</li>
              <li>Align application plans with your preferences and long-term goals.</li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Need help? Email <a className="underline" href="mailto:hello@ascenda.com">hello@ascenda.com</a> to reach a
              counselor.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="relative overflow-hidden rounded-[32px] glass-panel p-8 text-sm text-muted-foreground shadow-xl border border-white/10 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/6 via-primary/8 to-emerald-400/8 opacity-60" aria-hidden />
          <div className="relative z-10 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Match boosts</p>
                <p className="text-lg font-semibold text-foreground">Top gains available</p>
                <p className="text-xs text-muted-foreground">Complete these to unlock better results.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Compass className="h-5 w-5" />
              </div>
            </div>
            <ul className="space-y-3">
              {outcomeHints.length ? (
                outcomeHints.map((hint) => (
                  <li
                    key={hint.title}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                  >
                    <p className="text-sm font-semibold text-foreground">{hint.title}</p>
                    <p className="text-xs text-muted-foreground">{hint.detail}</p>
                  </li>
                ))
              ) : (
                <li className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-foreground">
                  You&apos;ve unlocked the major boosts. Keep details current to stay optimized.
                </li>
              )}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" asChild>
                <Link href={`/profile/wizard?step=${nextStepKey}`}>Open wizard</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/matches">Preview matches</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-[32px] border border-border bg-card p-8 text-muted-foreground shadow-2xl transition-all duration-300">
        <p className="text-base font-semibold text-foreground">Profile complete</p>
        <p className="mt-2 text-sm">
          You&apos;ve already finished onboarding. You can revisit the wizard anytime if you need to update details.
        </p>
        <Button className="mt-6 rounded-xl px-8" size="sm" asChild>
          <Link href="/profile/wizard">Open profile wizard</Link>
        </Button>
      </div>
    </DashboardShell>
  );
}
