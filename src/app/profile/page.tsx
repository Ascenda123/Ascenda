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
import { AnimatedBlobBanner } from '@/components/animated-blob-banner';

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
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <AnimatedBlobBanner className="opacity-60" variant="cool" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-24">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.6em] text-white/50">Welcome aboard</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Let&apos;s build your profile</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70">
              We’ll use this information to personalize matches, recommendations, and counselor updates. You can always
              tweak the details later.
            </p>
          </header>
          <div className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-[0_35px_120px_rgba(15,23,42,0.55)] backdrop-blur">
            <ProfileWizard
              profile={profile ?? null}
              academics={academics ?? null}
              preferences={preferences ?? null}
              aspirations={aspirations ?? null}
              initialStep={nextStepKey}
              stepCompletion={stepCompletion}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      <PageHero
        eyebrow="Profile"
        title="Build your student profile"
        description="We use this information to personalize match suggestions, academic guidance, and your application plan."
        highlight={nextStep ? `Next • ${nextStep.title}` : 'All set'}
        stats={heroStats}
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
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Profile completion</p>
              <p className="text-3xl font-semibold text-slate-900">{completionPercent}%</p>
            </div>
            <p className="text-sm text-slate-500">
              {completedCount === PROFILE_STEPS.length
                ? 'Everything is saved. Update any section anytime.'
                : `Next step: ${nextStep?.title ?? 'Aspirations'}`}
            </p>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all"
              style={{ width: `${completionPercent}%` }}
              aria-hidden
            />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PROFILE_STEPS.map((step) => {
              const complete = stepCompletion[step.key];
              return (
                <div
                  key={step.key}
                  className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4 shadow-[0_12px_25px_rgba(15,23,42,0.04)]"
                >
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                  <p
                    className={
                      complete ? 'mt-3 text-sm font-semibold text-emerald-600' : 'mt-3 text-sm font-semibold text-amber-600'
                    }
                  >
                    {complete ? 'Complete' : 'Action needed'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <p className="text-base font-semibold text-slate-900">Why it matters</p>
          <ul className="mt-4 space-y-3">
            <li>Unlock tighter match suggestions as soon as each section is saved.</li>
            <li>Surface prerequisite gaps and testing needs with your academic profile.</li>
            <li>Align application plans with your preferences and long-term goals.</li>
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Need help? Email <a className="underline" href="mailto:hello@ascenda.com">hello@ascenda.com</a> to reach a
            counselor.
          </p>
        </div>
      </div>
      {forceOnboarding || !hasCompletedProfile ? (
        <ProfileWizard
          profile={profile ?? null}
          academics={academics ?? null}
          preferences={preferences ?? null}
          aspirations={aspirations ?? null}
          initialStep={nextStepKey}
          stepCompletion={stepCompletion}
        />
      ) : (
        <div className="mt-6 rounded-[28px] border border-slate-100 bg-white p-6 text-slate-600 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <p className="text-base font-semibold text-slate-900">Profile complete</p>
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
