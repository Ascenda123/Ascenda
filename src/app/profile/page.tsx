import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { ProfileWizard } from './_components/profile-wizard';
import { PROFILE_STEPS, type StepCompletionMap, type StepKey } from '@/lib/profile/steps';
import { buildStepCompletion, isProfileComplete, type ProfileRecordGroup } from '@/lib/profile/completion';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { AnimatedBlobBanner } from '@/components/animated-blob-banner';
import { SectionNav } from '@/components/layout/section-nav';
import { ProfileProgressCard } from './_components/profile-progress-card';
import { Compass, GraduationCap, MapPin, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Profile onboarding | Ascenda'
};

interface ProfilePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id ?? '').single();
  const { data: academics } = await supabase.from('student_academics').select('*').eq('profile_id', user?.id ?? '').single();
  const { data: preferences } = await supabase
    .from('student_preferences')
    .select('*')
    .eq('profile_id', user?.id ?? '')
    .single();
  const { data: aspirations } = await supabase
    .from('student_aspirations')
    .select('*')
    .eq('profile_id', user?.id ?? '')
    .single();

  const recordGroup: ProfileRecordGroup = {
    profile: profile ?? null,
    academics: academics ?? null,
    preferences: preferences ?? null,
    aspirations: aspirations ?? null
  };
  const stepCompletion: StepCompletionMap = buildStepCompletion(recordGroup);
  const hasCompletedProfile = isProfileComplete(recordGroup);
  const completedCount = PROFILE_STEPS.filter((step) => stepCompletion[step.key]).length;
  const completionPercent = Math.round((completedCount / PROFILE_STEPS.length) * 100);
  const nextStep = PROFILE_STEPS.find((step) => !stepCompletion[step.key]);
  const nextStepKey: StepKey = nextStep?.key ?? 'aspirations';
  const stepParamRaw = searchParams?.step;
  const stepParam = Array.isArray(stepParamRaw) ? stepParamRaw[0] : stepParamRaw;
  const requestedStep = PROFILE_STEPS.find((step) => step.key === stepParam);
  const initialStepKey: StepKey = (requestedStep?.key as StepKey) ?? nextStepKey;
  const heroStats = [
    { label: 'Completion', value: `${completionPercent}%`, detail: 'Profile ready' },
    { label: 'Steps done', value: `${completedCount}/${PROFILE_STEPS.length}`, detail: 'Sections' },
    { label: 'Next', value: nextStep?.title ?? 'All set', detail: 'Focus area' }
  ];

  const onboardingParam = searchParams?.onboarding;
  const forceOnboarding = Array.isArray(onboardingParam)
    ? onboardingParam.includes('true')
    : onboardingParam === 'true';
  const showFullScreenWizard = forceOnboarding || !hasCompletedProfile;
  const destinationCountries = Array.isArray(preferences?.countries) ? preferences.countries.filter(Boolean) : [];
  const programLevels = Array.isArray(preferences?.program_levels) ? preferences.program_levels.filter(Boolean) : [];
  const targetFields = Array.isArray(aspirations?.target_fields) ? aspirations.target_fields.filter(Boolean) : [];

  const formatCurrency = (value?: number | null) => {
    if (typeof value !== 'number') return null;
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  const budgetRange = (() => {
    const min = formatCurrency(preferences?.budget_min);
    const max = formatCurrency(preferences?.budget_max);
    if (min && max) return `${min} - ${max}`;
    if (min) return `${min}+`;
    if (max) return `Up to ${max}`;
    return 'Add budget';
  })();

  const academicSignals = [
    typeof academics?.gpa === 'number' ? `GPA ${academics.gpa.toFixed(2)}` : null,
    typeof academics?.sat === 'number' ? `SAT ${academics.sat}` : null,
    typeof academics?.act === 'number' ? `ACT ${academics.act}` : null,
    typeof academics?.ib_total === 'number' ? `IB ${academics.ib_total}/45` : null
  ].filter(Boolean) as string[];
  const profileNavItems = [{ label: 'Overview', href: '/profile', exact: true }];
  const outcomeHints = [
    !preferences?.budget_min || !preferences?.budget_max
      ? { title: 'Add a budget range', detail: 'Improves affordability ranking and scholarship matches.' }
      : null,
    destinationCountries.length === 0
      ? { title: 'Set destination countries', detail: 'Unlocks location-specific requirements and aid flags.' }
      : null,
    !academics?.sat && !academics?.act
      ? { title: 'Add SAT/ACT scores', detail: 'Boosts scholarship eligibility and U.S. fit signals.' }
      : null,
    targetFields.length === 0
      ? { title: 'Add target fields', detail: 'Sharpens program recommendations for your interests.' }
      : null
  ]
    .filter(Boolean)
    .slice(0, 3) as { title: string; detail: string }[];

  if (showFullScreenWizard) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <AnimatedBlobBanner className="opacity-60" variant="cool" />
        <div className="relative z-10 mx-auto flex w-full max-w-none flex-col gap-8 px-4 pb-16 pt-24 sm:px-6 lg:px-10">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Welcome aboard</p>
            <h1 className="mt-4 text-4xl font-semibold text-foreground">Let&apos;s build your profile</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              We’ll use this information to personalize matches, recommendations, and counselor updates. You can always
              tweak the details later.
            </p>
          </header>
          <div className="rounded-[32px] border border-border bg-card p-6 shadow-[0_35px_120px_rgba(15,23,42,0.55)] backdrop-blur">
            <ProfileWizard
              profile={profile ?? null}
              academics={academics ?? null}
              preferences={preferences ?? null}
              aspirations={aspirations ?? null}
              initialStep={initialStepKey}
              stepCompletion={stepCompletion}
            />
          </div>
        </div>
      </div>
    );
  }

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
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-card/60 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-lg transition-colors dark:border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-primary/5 to-emerald-400/5 opacity-50" aria-hidden />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Profile</p>
              <p className="text-xl font-semibold text-foreground">{profile?.full_name || 'Add your full name'}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? 'Add an email'}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Country</p>
              <p className="text-sm font-semibold text-foreground">{profile?.country || 'Add home country'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Time zone</p>
              <p className="text-sm font-semibold text-foreground">{profile?.time_zone || 'Set time zone'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Destinations</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {destinationCountries.length ? (
                destinationCountries.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-white/10"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    {country}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-white/10">
                  Add destination countries
                </span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Focus</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {targetFields.slice(0, 2).map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-white/10"
                >
                  <Target className="h-3.5 w-3.5" />
                  {field}
                </span>
              ))}
              {!targetFields.length ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-white/10">
                  Add fields of interest
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/profile?onboarding=true&step=personal">Edit profile</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/matches">Preview matches</Link>
            </Button>
          </div>
        </div>
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-card/60 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.1)] backdrop-blur-lg dark:border-white/10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-primary/5 to-emerald-400/5 opacity-50" aria-hidden />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Preferences</p>
                <p className="text-lg font-semibold text-foreground">Study setup</p>
                <p className="text-sm text-muted-foreground">Budget and program focus</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Budget</p>
                <p className="text-sm font-semibold text-foreground">{budgetRange}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Levels</p>
                <p className="text-sm font-semibold text-foreground">
                  {programLevels.length ? programLevels.join(', ') : 'Add program levels'}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {programLevels.slice(0, 3).map((level) => (
                <span
                  key={level}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-white/10"
                >
                  {level}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/profile?onboarding=true&step=preferences">Edit preferences</Link>
              </Button>
              <Button size="sm" variant="secondary" asChild>
                <Link href="/profile?onboarding=true&step=preferences">Update budget</Link>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-card/60 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.1)] backdrop-blur-lg dark:border-white/10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/6 via-primary/5 to-emerald-400/6 opacity-50" aria-hidden />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Academics</p>
                <p className="text-lg font-semibold text-foreground">Snapshot</p>
                <p className="text-sm text-muted-foreground">
                  {academics?.curriculum ? academics.curriculum : 'Add curriculum and grades'}
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
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/profile?onboarding=true&step=academics">Edit academics</Link>
              </Button>
              <Button size="sm" variant="secondary" asChild>
                <Link href="/profile?onboarding=true&step=academics">Add scores</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <ProfileProgressCard
          completionPercent={completionPercent}
          completedCount={completedCount}
          totalSteps={PROFILE_STEPS.length}
          nextStepTitle={nextStep?.title}
          stepCompletion={stepCompletion}
        />
        <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-card/60 p-6 text-sm text-muted-foreground shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur-lg transition-colors dark:border-white/10">
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
      <div className="mt-6">
        <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-card/60 p-6 text-sm text-muted-foreground shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-lg transition-colors dark:border-white/10">
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
                <Link href={`/profile?onboarding=true&step=${nextStepKey}`}>Open wizard</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/matches">Preview matches</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-[28px] border border-border bg-card p-6 text-muted-foreground shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-colors">
        <p className="text-base font-semibold text-foreground">Profile complete</p>
        <p className="mt-2 text-sm">
          You&apos;ve already finished onboarding. You can revisit the wizard anytime if you need to update details.
        </p>
        <Button className="mt-4" size="sm" asChild>
          <Link href="/profile?onboarding=true">Open profile wizard</Link>
        </Button>
      </div>
    </DashboardShell>
  );
}
