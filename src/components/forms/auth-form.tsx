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
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
        {form.formState.errors.email ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" aria-hidden />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">or continue with</span>
        </div>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={isPending}>
        Google
      </Button>
    </form>
  );
};
