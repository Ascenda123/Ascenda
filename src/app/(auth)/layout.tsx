import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50 text-foreground dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/20" />
      <div className="pointer-events-none absolute bottom-10 right-[-4rem] h-80 w-80 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-400/10" />

      <div className="relative mx-auto flex min-h-screen w-full items-center px-6 py-12 lg:px-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              Guided admissions workspace
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Everything you need to plan, track, and submit on time.
              </h1>
              <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                Create an account to organize deadlines, collaborate with mentors, and keep your applications on track.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-foreground/80 sm:grid-cols-2 sm:gap-4">
              {[
                { title: 'Supabase-secured auth', body: 'Single account for login, onboarding, and dashboard data.' },
                { title: 'Onboarding checklists', body: 'We direct you to profile setup the moment you sign up.' },
                { title: 'Live status updates', body: 'Progress-aware redirects keep you on the right page.' },
                { title: 'Fast social login', body: 'Hop in with Google in one click.' }
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 rounded-2xl bg-card/70 p-4 shadow-sm ring-1 ring-border/70"
                >
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" aria-hidden />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="w-full">
            <Card className="glass-panel border border-border/70 shadow-2xl">
              <CardHeader className="space-y-1 border-0 bg-transparent p-6 pb-4 text-center">
                <CardTitle className="text-2xl font-semibold">Ascenda</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sign up or sign in to keep your admissions workspace synced everywhere.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0">{children}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
