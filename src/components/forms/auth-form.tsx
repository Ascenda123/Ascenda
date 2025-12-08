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

  const onboardingRedirectUrl = buildAuthCallbackUrl('/profile?onboarding=true');
  const dashboardRedirectUrl = buildAuthCallbackUrl('/dashboard');

  const determineRedirectTarget = async (userId?: string | null) => {
    if (!userId) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }
    if (!userId) {
      return '/dashboard';
    }

    const [profileResponse, academicsResponse, preferencesResponse, aspirationsResponse] = await Promise.all([
      supabase.from('profiles').select('full_name,country,time_zone').eq('id', userId).maybeSingle(),
      supabase.from('student_academics').select('curriculum').eq('profile_id', userId).maybeSingle(),
      supabase.from('student_preferences').select('countries').eq('profile_id', userId).maybeSingle(),
      supabase.from('student_aspirations').select('target_fields').eq('profile_id', userId).maybeSingle()
    ]);

    const firstError = [
      profileResponse.error,
      academicsResponse.error,
      preferencesResponse.error,
      aspirationsResponse.error
    ].find(Boolean);

    if (firstError) {
      console.error('Unable to determine onboarding status', firstError);
      return '/dashboard';
    }

    const needsOnboarding = !isProfileComplete({
      profile: profileResponse.data ?? null,
      academics: academicsResponse.data ?? null,
      preferences: preferencesResponse.data ?? null,
      aspirations: aspirationsResponse.data ?? null
    });
    return needsOnboarding ? '/profile?onboarding=true' : '/dashboard';
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
        const target = mode === 'signup' ? '/profile?onboarding=true' : redirectTarget;
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
    startTransition(async () => {
      const redirectTo =
        dashboardRedirectUrl ??
        (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined);
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });

      if (signInError) {
        setError(formatAuthError(signInError));
        return;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(RETURNING_USER_STORAGE_KEY, 'true');
      }
    });
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
        className="form-action w-full"
        onClick={handleGoogle}
        disabled={isPending || !authServiceReady}
        data-loading={isPending ? 'true' : undefined}
      >
        Google
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Supabase keeps your session secure and lets us warn you if this email is already registered.
      </p>
    </form>
  );
};
