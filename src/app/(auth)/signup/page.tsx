import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/forms/auth-form';

export const metadata: Metadata = {
  title: 'Create account | Ascenda'
};

export default function SignupPage() {
  return (
    <div className="space-y-6 rounded-4xl border border-white/10 bg-white/5 p-8 text-white shadow-glow-sm backdrop-blur">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl">Create your free account</h1>
        <p className="text-sm text-white/70">Join Ascenda to discover your perfect-fit universities.</p>
      </div>
      <AuthForm mode="signup" />
      <p className="text-center text-sm text-white/70">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-cyan hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
