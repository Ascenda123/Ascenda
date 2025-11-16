'use client';

import { useState, useTransition } from 'react';
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

export type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  mode: AuthMode;
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const router = useRouter();
  const supabase = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' }
  });

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

  const onSubmit = (values: AuthFormValues) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      let authError: AuthError | null = null;
      let shouldRedirect = false;

      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword(values);
        authError = signInError;
        shouldRedirect = !signInError;
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({
          ...values,
          options: onboardingRedirectUrl ? { emailRedirectTo: onboardingRedirectUrl } : undefined
        });
        authError = signUpError;
        if (!signUpError) {
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
        setError(authError.message);
        return;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(RETURNING_USER_STORAGE_KEY, 'true');
      }

      if (shouldRedirect) {
        router.refresh();
        const target = mode === 'signup' ? '/profile?onboarding=true' : '/dashboard';
        router.push(target);
      }
    });
  };

  const handleGoogle = () => {
    setError(null);
    setSuccess(null);
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
        setError(signInError.message);
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
        <Input
          id="password"
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className="form-input"
          {...form.register('password')}
        />
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
        disabled={isPending}
        data-loading={isPending ? 'true' : undefined}
      >
        {isPending ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>
      <div className="form-divider">
        <span>or continue with</span>
      </div>
      <Button
        type="button"
        variant="outline"
        className="form-action w-full"
        onClick={handleGoogle}
        disabled={isPending}
        data-loading={isPending ? 'true' : undefined}
      >
        Google
      </Button>
    </form>
  );
};
