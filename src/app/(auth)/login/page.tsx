import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/forms/auth-form';

export const metadata: Metadata = {
  title: 'Sign in | Ascenda'
};

export default function LoginPage() {
  return (
    <div className="space-y-6 rounded-4xl border border-white/10 bg-white/5 p-8 text-white shadow-glow-sm backdrop-blur">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="text-sm text-white/70">Sign in to access your dashboard.</p>
      </div>
      <AuthForm mode="login" />
      <p className="text-center text-sm text-white/70">
        New to Ascenda?{' '}
        <Link href="/signup" className="font-semibold text-cyan hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
