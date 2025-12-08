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
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to access your dashboard.</p>
      </div>
      <AuthForm mode="login" />
      <p className="text-center text-sm text-muted-foreground">
        New to Ascenda?{' '}
        <Link href="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
