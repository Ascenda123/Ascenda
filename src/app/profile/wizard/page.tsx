import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StudentIntakeForm } from '../_components/StudentIntakeForm';
import { PROFILE_STEPS, type StepCompletionMap } from '@/lib/profile/steps';
import { buildStepCompletion, isProfileComplete, type ProfileRecordGroup } from '@/lib/profile/completion';
import { AnimatedBlobBanner } from '@/components/animated-blob-banner';
import { Button } from '@/components/ui/button';
import { buildStudentProfilePayload } from '@/lib/scoring/student_score_loader';
import { ArrowLeft, Home, LayoutDashboard, User, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Profile wizard | Ascenda'
};

interface ProfileWizardPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function ProfileWizardPage({ searchParams }: ProfileWizardPageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

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
    .select('id')
    .eq('profile_id', user?.id ?? '');
  let initialPayload = null;
  try {
    initialPayload = await buildStudentProfilePayload(supabase, user.id);
  } catch (error) {
    console.error('Failed to preload intake payload', error);
  }

  const recordGroup: ProfileRecordGroup = {
    personal: personal ?? null,
    academicInput: academicInput ?? null,
    subjectCount: subjects?.length ?? 0,
    lifestyle: lifestyle ?? null
  };
  const stepCompletion: StepCompletionMap = buildStepCompletion(recordGroup);
  const hasCompletedProfile = isProfileComplete(recordGroup);
  const nextStep = PROFILE_STEPS.find((step) => !stepCompletion[step.key]);

  const stepParamRaw = searchParams?.step;
  const stepParam = Array.isArray(stepParamRaw) ? stepParamRaw[0] : stepParamRaw;
  const requestedStep = PROFILE_STEPS.find((step) => step.key === stepParam);
  const initialStep = requestedStep ? PROFILE_STEPS.indexOf(requestedStep) + 1 : nextStep ? PROFILE_STEPS.indexOf(nextStep) + 1 : 1;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBlobBanner className="opacity-60" variant="cool" />
      <div className="relative z-10 mx-auto flex w-full max-w-none flex-col gap-6 px-4 pb-16 pt-20 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
            <div className="w-px h-4 bg-border/50" />
            <Button asChild size="sm" variant="ghost" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
              <Link href="/profile">
                <User className="w-4 h-4" />
                Back to profile
              </Link>
            </Button>
          </div>
          <Button asChild size="sm" variant="secondary" className="gap-2 rounded-xl shadow-sm">
            <a href="/api/profile/export" download>
              <Download className="w-4 h-4" />
              Download CSV
            </a>
          </Button>
        </div>
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Profile wizard</p>
          <h1 className="mt-4 text-4xl font-semibold text-foreground">Let&apos;s build your profile</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            We’ll use this information to personalize matches, recommendations, and counselor updates. You can always
            tweak the details later.
          </p>
          {hasCompletedProfile ? (
            <p className="mt-3 text-xs text-muted-foreground">You&apos;re already complete — update anything you need.</p>
          ) : null}
        </header>
        <div className="rounded-[32px] glass-panel p-6 shadow-soft backdrop-blur">
          <StudentIntakeForm initialStep={initialStep} initialPayload={initialPayload} />
        </div>
      </div>
    </div>
  );
}
