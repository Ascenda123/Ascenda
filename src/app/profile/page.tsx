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
import { PROFILE_SECTION_ITEMS } from '@/components/layout/navigation';
import { ProfileProgressCard } from './_components/profile-progress-card';

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
  const isNewUser = completedCount === 0;
  const showFullScreenWizard = forceOnboarding || !hasCompletedProfile;

  if (showFullScreenWizard) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <AnimatedBlobBanner className="opacity-60" variant="cool" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-24">
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
      <SectionNav items={PROFILE_SECTION_ITEMS} />
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
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
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
      {forceOnboarding || !hasCompletedProfile ? (
        <ProfileWizard
          profile={profile ?? null}
          academics={academics ?? null}
          preferences={preferences ?? null}
          aspirations={aspirations ?? null}
          initialStep={initialStepKey}
          stepCompletion={stepCompletion}
        />
      ) : (
        <div className="mt-6 rounded-[28px] border border-border bg-card p-6 text-muted-foreground shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-colors">
          <p className="text-base font-semibold text-foreground">Profile complete</p>
          <p className="mt-2 text-sm">
            You&apos;ve already finished onboarding. You can revisit the wizard anytime if you need to update details.
          </p>
          <Button className="mt-4" size="sm" asChild>
            <Link href="/profile?onboarding=true">Open profile wizard</Link>
          </Button>
        </div>
      )}
    </DashboardShell>
  );
}
