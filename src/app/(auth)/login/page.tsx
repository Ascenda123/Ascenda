import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/forms/auth-form';

export const metadata: Metadata = {
  title: 'Sign in | Ascenda'
};

export default function LoginPage() {
  return (
    <div className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-8 text-slate-900 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to access your dashboard.</p>
      </div>
      <AuthForm mode="login" />
      <p className="text-center text-sm text-slate-500">
        New to Ascenda?{' '}
        <Link href="/signup" className="font-semibold text-slate-900 underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
