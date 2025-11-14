import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { ProfileWizard } from './_components/profile-wizard';
import { PROFILE_STEPS, type StepCompletionMap, type StepKey } from './constants';

export const metadata: Metadata = {
  title: 'Profile onboarding | Ascenda'
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

  const stepCompletion: StepCompletionMap = {
    personal: Boolean(profile?.full_name && profile?.country && profile?.time_zone),
    academics: Boolean(academics?.curriculum),
    preferences: Boolean((preferences?.countries ?? []).length),
    aspirations: Boolean((aspirations?.target_fields ?? []).length)
  };

  const completedCount = PROFILE_STEPS.filter((step) => stepCompletion[step.key]).length;
  const completionPercent = Math.round((completedCount / PROFILE_STEPS.length) * 100);
  const nextStep = PROFILE_STEPS.find((step) => !stepCompletion[step.key]);
  const nextStepKey: StepKey = nextStep?.key ?? 'aspirations';

  return (
    <DashboardShell>
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Build your student profile</h1>
        <p className="text-sm text-slate-500">
          We use this information to personalize match suggestions, academic guidance, and your application plan.
        </p>
      </section>
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
      <ProfileWizard
        profile={profile ?? null}
        academics={academics ?? null}
        preferences={preferences ?? null}
        aspirations={aspirations ?? null}
        initialStep={nextStepKey}
        stepCompletion={stepCompletion}
      />
    </DashboardShell>
  );
}
