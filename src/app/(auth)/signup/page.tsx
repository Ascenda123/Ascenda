import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/forms/auth-form';

export const metadata: Metadata = {
  title: 'Create account | Ascenda'
};

export default function SignupPage() {
  return (
    <div className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-8 text-slate-900 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Create your free account</h1>
        <p className="text-sm text-slate-500">Join Ascenda to discover your perfect-fit universities.</p>
      </div>
      <AuthForm mode="signup" />
      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-slate-900 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
