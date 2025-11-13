import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { ProfileWizard } from './_components/profile-wizard';

export const metadata: Metadata = {
  title: 'Profile onboarding | Ascenda'
};

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

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

  return (
    <DashboardShell>
      <section className="space-y-2">
        <h1 className="font-display text-3xl">Build your student profile</h1>
        <p className="text-sm text-white/70">
          We use this information to personalize match suggestions, academic guidance, and your application plan.
        </p>
      </section>
      <ProfileWizard
        profile={profile ?? null}
        academics={academics ?? null}
        preferences={preferences ?? null}
        aspirations={aspirations ?? null}
      />
    </DashboardShell>
  );
}
