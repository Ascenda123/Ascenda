import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/forms/auth-form';

export const metadata: Metadata = {
  title: 'Sign in | Ascenda'
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-slate-600">Sign in to access your dashboard.</p>
      </div>
      <AuthForm mode="login" />
      <p className="text-center text-sm text-slate-600">
        New to Ascenda?{' '}
        <Link href="/signup" className="font-medium text-slate-900 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
