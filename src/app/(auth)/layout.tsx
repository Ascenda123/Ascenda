import type { ReactNode } from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-400/[0.05] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_420px]">

          {/* Left — brand */}
          <section className="hidden space-y-8 lg:block">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full">
                <Image src="/ascenda-logo.png" alt="Ascenda" fill className="object-contain" />
              </div>
              <span className="font-heading text-xl font-semibold">Ascenda</span>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                University admissions platform
              </p>
              <h1 className="font-heading text-4xl font-semibold leading-tight sm:text-5xl">
                Your shortlist.<br />Your timeline.<br />Your counsellor.
              </h1>
              <p className="max-w-md text-base text-muted-foreground">
                Ascenda connects your profile, your applications, and your counsellor in one place — so nothing falls through the cracks.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Fit scores that explain themselves', body: 'See where you stand at every university — and exactly why.' },
                { title: 'One hub for every application', body: 'Tasks, deadlines, documents, and status in one view.' },
                { title: 'Your counsellor, always in the loop', body: 'Notes, messages, and meetings without the email chain.' },
                { title: 'Built for international students', body: 'Cost of living, campus life, and career outcomes — for every course.' },
              ].map((f) => (
                <div key={f.title} className="rounded-[20px] border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
                  <p className="mb-1 text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Right — form */}
          <div className="w-full">
            <div className="surface-card surface-card--static p-8">
              {/* Mobile logo */}
              <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image src="/ascenda-logo.png" alt="Ascenda" fill className="object-contain" />
                </div>
                <span className="font-heading text-lg font-semibold">Ascenda</span>
              </div>

              {children}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
