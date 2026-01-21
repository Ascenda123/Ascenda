'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthError } from '@supabase/supabase-js';
import { authSchema, type AuthFormValues } from '@/lib/validation/auth';
import { RETURNING_USER_STORAGE_KEY } from '@/lib/constants';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isProfileComplete } from '@/lib/profile/completion';

export type AuthMode = 'login' | 'signup';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
  </svg>
);

interface AuthFormProps {
  mode: AuthMode;
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const router = useRouter();
  const supabase = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authServiceReady, setAuthServiceReady] = useState(true);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ error: sessionError }) => {
      if (!isMounted) return;
      if (sessionError) {
        console.error('Supabase auth unavailable', sessionError);
        setAuthServiceReady(false);
        setError((prev) => prev ?? 'We could not reach the sign-in service. Please refresh and try again.');
      } else {
        setAuthServiceReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const buildAuthCallbackUrl = (nextPath: string) => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const baseUrl =
      envUrl && envUrl.length
        ? envUrl
        : typeof window !== 'undefined'
          ? window.location.origin
          : '';
    if (!baseUrl) {
      return undefined;
    }
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBase}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  };

  const onboardingRedirectUrl = buildAuthCallbackUrl('/profile/wizard');
  const dashboardRedirectUrl = buildAuthCallbackUrl('/dashboard');

  const determineRedirectTarget = async (userId?: string | null) => {
    if (!userId) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }
    if (!userId) {
      return '/dashboard';
    }

    const [personalResponse, academicResponse, lifestyleResponse, subjectResponse] = await Promise.all([
      supabase
        .from('student_personal_information')
        .select('first_name,last_name,email,nationality,resident_country')
        .eq('profile_id', userId)
        .maybeSingle(),
      supabase
        .from('student_academic_input')
        .select('programme_type,school_name,school_country,graduation_year,intended_clusters,english_required')
        .eq('profile_id', userId)
        .maybeSingle(),
      supabase.from('student_lifestyle_preference').select('extracurricular_interests').eq('profile_id', userId).maybeSingle(),
      supabase.from('student_subjects').select('id').eq('profile_id', userId)
    ]);

    const firstError = [personalResponse.error, academicResponse.error, lifestyleResponse.error, subjectResponse.error].find(Boolean);

    if (firstError) {
      console.error('Unable to determine onboarding status', firstError);
      return '/dashboard';
    }

    const needsOnboarding = !isProfileComplete({
      personal: personalResponse.data ?? null,
      academicInput: academicResponse.data ?? null,
      subjectCount: subjectResponse.data?.length ?? 0,
      lifestyle: lifestyleResponse.data ?? null
    });
    return needsOnboarding ? '/profile/wizard' : '/dashboard';
  };

  const formatAuthError = (authError: AuthError) => {
    const message = authError.message || 'Something went wrong.';
    if (/already registered/i.test(message)) {
      return 'This email is already registered. Try signing in instead or reset your password.';
    }
    if (/invalid login credentials/i.test(message)) {
      return 'Email or password looks incorrect. Double-check and try again.';
    }
    if (/over email rate limit/i.test(message) || authError.status === 429) {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    return message;
  };

  const onSubmit = (values: AuthFormValues) => {
    setError(null);
    setSuccess(null);
    if (!authServiceReady) {
      setError('Sign-in service is temporarily unavailable. Please refresh and try again.');
      return;
    }
    startTransition(async () => {
      let authError: AuthError | null = null;
      let shouldRedirect = false;
      let redirectTarget = '/dashboard';

      if (mode === 'login') {
        const { error: signInError, data } = await supabase.auth.signInWithPassword(values);
        authError = signInError;
        if (!signInError) {
          redirectTarget = await determineRedirectTarget(data.user?.id);
          shouldRedirect = true;
        }
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({
          ...values,
          options: onboardingRedirectUrl ? { emailRedirectTo: onboardingRedirectUrl } : undefined
        });
        authError = signUpError;
        if (!signUpError) {
          if (data.user?.identities?.length === 0) {
            setError('This email is already registered. Try signing in instead.');
            return;
          }
          if (data.session) {
            shouldRedirect = true;
          } else {
            setSuccess('Almost there! Confirm the link we sent to your email to finish setting up your account.');
            form.reset();
            return;
          }
        }
      }

      if (authError) {
        setError(formatAuthError(authError));
        return;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(RETURNING_USER_STORAGE_KEY, 'true');
      }

      if (shouldRedirect) {
        router.refresh();
        const target = mode === 'signup' ? '/profile/wizard' : redirectTarget;
        router.push(target);
      }
    });
  };

  const handleGoogle = () => {
    setError(null);
    setSuccess(null);
    if (!authServiceReady) {
      setError('Sign-in service is temporarily unavailable. Please refresh and try again.');
      return;
    }

    // We don't use startTransition here because we're initiating a top-level redirect to Google
    const redirectTo =
      dashboardRedirectUrl ??
      (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined);

    const initiation = async () => {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
        }
      });

      if (signInError) {
        setError(formatAuthError(signInError));
      } else if (typeof window !== 'undefined') {
        window.localStorage.setItem(RETURNING_USER_STORAGE_KEY, 'true');
      }
    };

    void initiation();
  };

  return (
    <form className="form-stack" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="form-field">
        <Label className="form-label" htmlFor="email">
          Email
        </Label>
        <Input id="email" type="email" autoComplete="email" className="form-input" {...form.register('email')} />
        {form.formState.errors.email ? (
          <p className="form-feedback form-feedback--error" role="alert">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="form-field">
        <Label className="form-label" htmlFor="password">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="form-input pr-28"
            {...form.register('password')}
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {mode === 'signup' ? '8+ characters' : 'Secure login'}
          </div>
        </div>
        {form.formState.errors.password ? (
          <p className="form-feedback form-feedback--error" role="alert">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>
      {error ? (
        <p className="form-feedback form-feedback--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="form-feedback form-feedback--success" role="status">
          {success}
        </p>
      ) : null}
      <Button
        type="submit"
        className="form-action w-full"
        disabled={isPending || !authServiceReady}
        data-loading={isPending ? 'true' : undefined}
      >
        {isPending ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>

      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span>Or continue with</span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
      <Button
        type="button"
        variant="outline"
        className="form-action w-full flex items-center justify-center gap-2 border-border/50 hover:bg-muted/10"
        onClick={handleGoogle}
        disabled={isPending || !authServiceReady}
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Supabase keeps your session secure and lets us warn you if this email is already registered.
      </p>
    </form>
  );
};
