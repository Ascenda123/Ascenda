'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthError } from '@supabase/supabase-js';
import { authSchema, type AuthFormValues } from '@/lib/validation/auth';
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
  const [isPending, startTransition] = useTransition();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = (values: AuthFormValues) => {
    setError(null);
    startTransition(async () => {
      let authError: AuthError | null = null;

      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword(values);
        authError = signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp(values);
        authError = signUpError;
      }

      if (authError) {
        setError(authError.message);
        return;
      }

      router.refresh();
      router.push('/dashboard');
    });
  };

  const handleGoogle = () => {
    setError(null);
    startTransition(async () => {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signInError) {
        setError(signInError.message);
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
