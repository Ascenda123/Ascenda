'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, GraduationCap, Globe2 } from 'lucide-react';
import messages from '@/messages/en.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const heroStats = [
  { label: 'Programs matched', value: '2.3M+' },
  { label: 'Campuses worldwide', value: '3,800' },
  { label: 'Scholarships tracked', value: '14k' }
];

const features = [
  {
    title: 'Live admissions signals',
    description: 'Know when requirements shift or deadlines move with instant notifications.',
    icon: Sparkles
  },
  {
    title: 'Guided application flow',
    description: 'A playful checklist keeps essays, tests, and documents on track.',
    icon: GraduationCap
  },
  {
    title: 'Privacy built in',
    description: 'Bank-grade security with role-based access for students and counselors.',
    icon: ShieldCheck
  },
  {
    title: 'Global reach',
    description: 'Surface opportunities across continents with localized insights.',
    icon: Globe2
  }
];

const steps = [
  {
    title: 'Create your vibe',
    copy: 'Tell us about your academics, dream cities, and the causes you care about.'
  },
  {
    title: 'Match & explore',
    copy: 'Our matching engine highlights programs where you can thrive—not just get in.'
  },
  {
    title: 'Apply with confidence',
    copy: 'Plan every essay, reference, and upload with counselor-ready collaboration.'
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: 'easeOut' }
  })
};

export default function HomePage() {
  const t = messages;

  return (
    <main
      id="main-content"
      className="relative min-h-screen overflow-hidden bg-night bg-mesh-gradient text-white"
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-24 px-4 py-10 sm:px-8 sm:py-16">
        <motion.nav
          className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex items-center gap-2 font-display text-xl font-semibold">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-iris to-sunrise p-px">
              <div className="h-full w-full rounded-2xl bg-night" />
            </div>
            Ascenda
          </div>
          <div className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <Link href="/matches" className="transition hover:text-white">
              Matches
            </Link>
            <Link href="/applications" className="transition hover:text-white">
              Applications
            </Link>
            <Link href="/admin" className="transition hover:text-white">
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">{t['marketing.hero.cta']}</Link>
            </Button>
          </div>
        </motion.nav>

        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial="hidden" animate="visible" custom={0.1} variants={fadeIn} className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Gen Z ready
            </span>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Feel-good admissions guidance for every bold next step.
            </h1>
            <p className="max-w-xl text-lg text-white/75">{t['marketing.hero.subtitle']}</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href="/signup" className="flex items-center gap-2">
                  Start matching
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/demo">See a live demo</Link>
              </Button>
            </div>
            <div className="grid gap-6 text-sm sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative rounded-4xl border border-white/10 bg-orb-gradient p-6 shadow-glow-lg backdrop-blur"
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeIn}
          >
            <div className="absolute -top-6 right-6 hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-white/70 sm:inline-flex">
              Live
            </div>
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-white/60">Match preview</p>
              <Card className="border-white/5 bg-white/10">
                <CardHeader>
                  <CardTitle>Global Tech University</CardTitle>
                  <CardDescription>Creative Computing • San Francisco</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Fit score</span>
                    <span className="font-semibold text-cyan">92%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10">
                    <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-cyan to-sunrise" />
                  </div>
                  <div className="grid gap-3 text-sm text-white/70">
                    <div className="flex items-center justify-between">
                      <span>Essays ready</span>
                      <span className="text-white">3 / 4</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Scholarship boost</span>
                      <span className="text-white">+15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
                “Ascenda feels like a creative studio for my future. It keeps my whole vibe organized without killing the buzz.”
              </div>
            </div>
          </motion.div>
        </section>

        <section className="space-y-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.1} variants={fadeIn} className="flex flex-col gap-4 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Why students choose us</p>
            <h2 className="font-display text-3xl">Designed with Gen Z energy</h2>
            <p className="mx-auto max-w-3xl text-white/70">
              Tap into playful UI and smart automation that make global admissions less stressful and more expressive.
            </p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0.1 + index * 0.05}
                variants={fadeIn}
              >
                <feature.icon className="mb-4 h-8 w-8 text-cyan" />
                <h3 className="font-display text-xl">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-4xl border border-white/10 bg-white/5 p-8 backdrop-blur md:grid-cols-[0.8fr_1.2fr]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.1} variants={fadeIn} className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">How it works</p>
            <h2 className="font-display text-3xl">The glow-up journey</h2>
            <p className="text-white/70">
              Built with counselors worldwide, Ascenda respects data privacy while giving students a collaborative space to own their applications.
            </p>
            <Button asChild variant="secondary" className="text-base text-night">
              <Link href="/dashboard">Jump into dashboard</Link>
            </Button>
          </motion.div>
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                className="flex gap-4 rounded-3xl border border-white/10 bg-night/40 p-4 backdrop-blur"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0.15 + idx * 0.05}
                variants={fadeIn}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 font-display text-lg">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-white/70">{step.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          className="relative overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-r from-iris/40 via-sunrise/30 to-cyan/30 p-10 text-center backdrop-blur"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_50%)] opacity-70" />
          <div className="relative space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-white/70">Join the wave</p>
            <h2 className="font-display text-3xl sm:text-4xl">Turn ambition into action</h2>
            <p className="mx-auto max-w-2xl text-white/80">
              Whether you&apos;re a student, counselor, or school partner, Ascenda keeps every milestone bright, organized, and authentically you.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">Create a free account</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="mailto:hello@ascenda.com">Partner with us</Link>
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
