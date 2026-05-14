import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/forms/auth-form';

export const metadata: Metadata = {
  title: 'Create account'
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Get started with Ascenda — it takes about 30 seconds.</p>
      </div>
      <AuthForm mode="signup" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
