'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Laptop, Mail, NotepadText, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Matches', href: '/matches' },
  { label: 'Scholarships', href: '/scholarships' },
  { label: 'Counselors', href: '/counselors' },
  { label: 'Stories', href: '/stories' }
];

const features = [
  {
    title: 'Fit Score · Find your perfect match',
    description: 'Instant, data-driven matches that feel like they were tailored for your story.',
    icon: Sparkles
  },
  {
    title: 'Centralized university database',
    description: 'All universities. One place. Compare programs without the doom scroll.',
    icon: Search
  },
  {
    title: 'Campus insights',
    description: 'Real stories from real students—see what life actually feels like.',
    icon: Mail
  },
  {
    title: 'Application companion',
    description: 'Personalized timelines, tips, and steps for every part of your application.',
    icon: NotepadText
  }
];

const steps = [
  {
    title: 'Start Ascenda',
    copy: 'Create your profile once: predicted grades, subjects, languages, interests, and vibe.'
  },
  {
    title: 'Explore ranked results',
    copy: 'See Fit Scores, compare modules & requirements, and tune lifestyle filters.'
  },
  {
    title: 'Build & share your plan',
    copy: 'Auto-timeline essays, tests, references, and direct-apply quirks. Share with counselors instantly.'
  }
];

const heroStats = [
  { value: '6.5k+', label: 'programs benchmarked weekly' },
  { value: '91%', label: 'students stay ahead of deadlines' },
  { value: '24/7', label: 'admissions signal monitoring' }
];

const comparisons = [
  {
    title: 'Without Ascenda',
    bullets: [
      'Confusing choices → waste time on wrong universities.',
      'Scattered info → miss deadlines.',
      'Generic advice → one-size-fits-all stress.',
      'Frustration at every step.'
    ]
  },
  {
    title: 'With Ascenda',
    bullets: [
      'Smart matches → focus on what fits you.',
      'Centralized workspace → track everything in one place.',
      'Personalized guidance → roadmap built with you.',
      'Confidence & clarity → calm, organized journey.'
    ]
  }
];

const splitComparisonCopy = (copy: string) => {
  const [headline, detail] = copy.split('→');
  return {
    headline: headline?.trim() ?? '',
    detail: detail?.trim() ?? ''
  };
};

const comparisonPairs = comparisons[0].bullets.map((bullet, index) => {
  const withBullet = comparisons[1]?.bullets[index] ?? '';
  return {
    without: splitComparisonCopy(bullet),
    with: splitComparisonCopy(withBullet)
  };
});

const metrics = [
  { value: '40%', label: 'of students regret what/where they study.' },
  { value: '1 in 5', label: 'block themselves by missing prerequisites.' },
  { value: '~50%', label: 'of grads work outside their field.' }
];

const faqs = [
  {
    question: 'Why do real-time admissions signals matter?',
    answer:
      'Requirements pivot mid-cycle; Ascenda flags updates instantly so you move before a deadline slips.'
  },
  {
    question: 'Who uses Ascenda?',
    answer: 'Students, counselors, and universities craving one modern, polished planning space.'
  },
  {
    question: 'Is there a free plan?',
    answer:
      'Students start free with vibe profiles, five program boards, and scholarship tracking. Counselors can invite teams on flexible plans.'
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Ascenda stores data in-region, enforces MFA, and offers permissions for every stakeholder.'
  },
  {
    question: 'Which destinations are covered?',
    answer:
      'US, Canada, UK, EU, Australia, Singapore, Hong Kong, and more regional pathways with visa insights preloaded.'
  },
  {
    question: 'Can I talk to someone?',
    answer:
      'Absolutely. Email hello@ascenda.com for a live walkthrough, counselor intro, or onboarding help.'
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(faqs[0].question);

  return (
    <main
      id="main-content"
      className="bg-white text-slate-900 font-[family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',sans-serif]"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <motion.header
          className="mb-10 flex flex-col gap-4 border-b border-slate-200 pb-6 text-slate-900 sm:flex-row sm:items-center sm:justify-between"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex items-center gap-3 text-lg font-semibold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-900">
              A
            </div>
            Ascenda
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full px-3 py-1 transition hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="border border-slate-300 text-slate-900 hover:bg-slate-50"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
              <Link href="/signup" className="flex items-center gap-2">
                <Laptop className="h-4 w-4" />
                Launch Ascenda
              </Link>
            </Button>
          </div>
        </motion.header>

        <section className="space-y-12 border-b border-slate-100 pb-16">
          <motion.div
            className="grid items-center gap-10 lg:grid-cols-[0.9fr,1.1fr]"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Admissions OS · Minimal decisions</p>
              <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-[3.6rem]">
                Replace chaos with one calm admissions studio.
              </h1>
              <p className="text-lg text-slate-600 sm:text-xl">
                Ascenda gives students, counselors, and families a single, beautifully organized workflow—fit scores, deadlines,
                scholarships, and notes stay perfectly aligned without extra dashboards.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/signup">Launch Ascenda</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-slate-200 text-slate-900 hover:bg-slate-50">
                  <Link href="/download">See product tour</Link>
                </Button>
              </div>
              <ul className="flex flex-wrap gap-4 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                  Fit scores auto recalibrate with every edit.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                  Counselor + student notes stay in sync.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                  Timeline nudges prevent deadline drift.
                </li>
              </ul>
            </div>
            <div className="rounded-[36px] border border-slate-100 bg-white p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-4 text-[0.7rem] uppercase tracking-[0.4em] text-slate-400">
                <span>Ascenda board</span>
                <div className="flex gap-2">
                  <span className="rounded-full border border-slate-200 px-3 py-0.5 text-[0.55rem]">Plan</span>
                  <span className="rounded-full border border-slate-200 px-3 py-0.5 text-[0.55rem] text-slate-500">Signals</span>
                  <span className="rounded-full border border-slate-200 px-3 py-0.5 text-[0.55rem] text-slate-500">Notes</span>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Fit score</p>
                    <span className="text-xs uppercase tracking-[0.3em] text-emerald-500">On target</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-4xl font-semibold text-slate-900">92%</p>
                    <p className="text-sm text-slate-600">Parsons Paris · Strategic Design</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div className="h-full rounded-full bg-gradient-to-r from-slate-900 via-cyan to-emerald-400" style={{ width: '92%' }} />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-100 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Next actions</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      <li className="flex items-center justify-between">
                        <span>Scholarship essay · Draft 2</span>
                        <span className="text-xs text-slate-400">Due Fri</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Portfolio upload · Motion study</span>
                        <span className="text-xs text-slate-400">Needs review</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-[24px] border border-slate-100 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Counselor sync</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                      <span>“Greenlit for ESADE interview—send prep doc.”</span>
                      <span className="text-xs text-slate-400">Claire · 2 hours ago</span>
                      <span className="text-xs text-slate-400">Shared on Ascenda workspace</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-100 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Active signals</p>
                  <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <div>
                      <p className="text-2xl font-semibold text-slate-900">4</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Programs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-slate-900">2</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Deadlines</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-slate-900">1</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Scholarship</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>Updated 1 min ago</span>
                <span className="h-px flex-1 bg-slate-100"></span>
                <span>View timeline →</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-4 pt-2 text-sm text-slate-500 sm:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-left shadow-[0_12px_35px_rgba(15,23,42,0.06)]"
              >
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="mt-16 space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Why Ascenda</p>
            <h2 className="text-3xl font-semibold">Tools that feel invisible but do the work.</h2>
            <p className="text-sm text-slate-600">Each feature is opinionated, minimalist, and tuned for modern admissions teams.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex flex-col gap-4 rounded-[28px] border border-slate-100 bg-white px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
              >
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-slate-400">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-base font-semibold text-slate-900">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  Pillar
                </div>
                <div>
                  <feature.icon className="mb-4 h-9 w-9 text-slate-900" />
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          className="mt-16 grid gap-8 rounded-[32px] border border-slate-100 bg-white p-6 md:grid-cols-[0.9fr_1.1fr]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Quick demo</p>
            <h2 className="text-3xl font-semibold">Paste a dream. Watch the shortlist re-rank.</h2>
            <p className="text-sm text-slate-600">
              Paste predicted grades, hit enter, and Ascenda animates Fit Scores, timelines, and required actions in real time. No extra UI
              noise—just the next move.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                Live Fit Score recalculations
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                Scholarships + visa checks in-line
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                Counselor notes synced automatically
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="sm">
                <Link href="/demo">Watch 45s demo</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="border border-slate-200 text-slate-900 hover:bg-slate-50">
                <Link href="/stories">See student reels</Link>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50 p-4">
            <div className="absolute inset-x-4 top-4 h-12 rounded-full bg-white/70 blur-2xl" />
            <Image
              src="/demo-loop.gif"
              alt="Ascenda demo loop"
              width={960}
              height={540}
              className="relative h-auto w-full rounded-[18px] border border-slate-100"
              priority
            />
          </div>
        </motion.section>

        <section className="mt-16 space-y-6 border-t border-slate-100 pt-14">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Your shortlist in 3 steps</p>
            <h2 className="text-3xl font-semibold">Simple. High impact.</h2>
            <p className="text-sm text-slate-600">Each scroll answers the next question: what now, why is Ascenda different, and how do I act?</p>
          </div>
          <div className="relative space-y-4 pt-4">
            <span className="pointer-events-none absolute left-[1.85rem] top-9 hidden h-[calc(100%-3rem)] w-px bg-slate-200 sm:block" />
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="flex items-start gap-4 rounded-[26px] border border-slate-100 bg-white/70 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.05 } }
                }}
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900">
                  {index + 1}
                </div>
                <div className="text-sm text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Step {index + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1">{step.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          className="mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-slate-900 text-white shadow-[0_35px_80px_rgba(15,23,42,0.18)]">
            <div className="pointer-events-none absolute inset-0 opacity-90">
              <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_60%)]" />
            </div>
            <div className="relative p-6 sm:p-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">With & without Ascenda</p>
                  <h2 className="text-3xl font-semibold text-white">Same student. Different outcome.</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Feel the delta between chaos and clarity—each row pairs the old grind with the Ascenda way.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-300" />
                    {comparisons[0].title}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    {comparisons[1].title}
                  </span>
                </div>
              </div>
              <div className="mt-10 space-y-6">
                {comparisonPairs.map((pair, index) => (
                  <div
                    key={`${pair.without.headline}-${pair.with.headline}-${index}`}
                    className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]"
                  >
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rose-200">
                        {comparisons[0].title}
                      </p>
                      <h3 className="mt-3 text-lg font-semibold text-white">{pair.without.headline}</h3>
                      {pair.without.detail && <p className="mt-1 text-sm text-slate-200">{pair.without.detail}</p>}
                    </div>
                    <div className="relative flex flex-col items-center gap-2">
                      {index !== 0 && <span className="hidden h-8 w-px bg-white/20 md:block" />}
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[0.65rem] font-semibold uppercase tracking-[0.3em]">
                        vs
                      </span>
                      {index !== comparisonPairs.length - 1 && <span className="hidden h-8 w-px bg-white/20 md:block" />}
                    </div>
                    <div className="rounded-[24px] border border-emerald-200/40 bg-white p-5 text-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.35)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                        {comparisons[1].title}
                      </p>
                      <h3 className="mt-3 text-lg font-semibold">{pair.with.headline}</h3>
                      {pair.with.detail && <p className="mt-1 text-sm text-slate-600">{pair.with.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mt-16 rounded-[32px] border border-slate-100 bg-white p-6">
          <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Proof points</p>
            <p>Students and counselors feel the delta immediately—data shows why.</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[24px] border border-slate-100 bg-white/70 p-5 text-left text-sm text-slate-500 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
              >
                <p className="text-3xl font-semibold text-slate-900">{metric.value}</p>
                <p className="mt-2 font-medium text-slate-600">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-slate-100 pt-14">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Frequently asked questions</p>
              <h2 className="text-3xl font-semibold">Answers before you even ask.</h2>
              <p className="text-sm text-slate-600">
                We keep the playbook simple: transparent timelines, privacy controls, and human support whenever you need it.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="mailto:hello@ascenda.com">Talk to a counselor</Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="border border-slate-200 text-slate-900 hover:bg-slate-50">
                  <Link href="/stories">Read stories</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <motion.div
                  key={faq.question}
                  className="rounded-[24px] border border-slate-100 bg-white/70 p-5"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeIn}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left text-base font-semibold text-slate-900"
                    onClick={() => setOpenFaq((prev) => (prev === faq.question ? '' : faq.question))}
                  >
                    <span>{faq.question}</span>
                    <span className="text-sm text-slate-500">{openFaq === faq.question ? '−' : '+'}</span>
                  </button>
                  {openFaq === faq.question && <p className="mt-3 text-sm text-slate-600">{faq.answer}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <motion.section
          className="mt-16 space-y-4 rounded-[36px] border border-slate-100 bg-white px-8 py-10 text-center text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.08)]"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Minimalism meets impact</p>
          <h2 className="text-3xl font-semibold">Launch your admissions era with Ascenda.</h2>
          <p className="text-sm text-slate-600">
            Keep every essay, scholarship, and counselor update in one clean studio. Students stay creative, counselors stay informed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
              <Link href="/signup">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="border border-slate-200 text-slate-900 hover:bg-slate-50">
              <Link href="/demo">Book live demo</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
