'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ClipboardList,
  Laptop,
  LayoutDashboard,
  Mail,
  NotepadText,
  NotebookPen,
  Search,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
const heroHeadline = 'The #1 University Application Companion.';

const features = [
  {
    title: 'Fit Score · Find your perfect match',
    description: 'Instant, data driven matches that feel like they were tailored for your story.',
    icon: Sparkles
  },
  {
    title: 'Centralized university database',
    description: 'All universities. One place. Compare programs without the doom scroll.',
    icon: Search
  },
  {
    title: 'Campus insights',
    description: 'Real stories from real students show what life actually feels like.',
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
    copy: 'Automatic timelines for essays, tests, references, and direct apply quirks. Share with collaborators instantly.'
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
      'Generic advice → one size fits all stress.',
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
    question: 'Why do real time admissions signals matter?',
    answer:
      'Requirements pivot mid cycle; Ascenda flags updates instantly so you move before a deadline slips.'
  },
  {
    question: 'Who uses Ascenda?',
    answer: 'Students, families, and universities craving one modern, polished planning space.'
  },
  {
    question: 'Is there a free plan?',
    answer:
      'Students start free with vibe profiles, five program boards, and scholarship tracking. Teams can invite collaborators on flexible plans.'
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Ascenda stores data in region, enforces MFA, and offers permissions for every stakeholder.'
  },
  {
    question: 'Which destinations are covered?',
    answer:
      'US, Canada, UK, EU, Australia, Singapore, Hong Kong, and more regional pathways with visa insights preloaded.'
  },
  {
    question: 'Can I talk to someone?',
    answer:
      'Absolutely. Email hello@ascenda.com for a live walkthrough, expert intro, or onboarding help.'
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const heroBoardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }
  }
};

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(faqs[0].question);
  const [typedHeadline, setTypedHeadline] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);

  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedHeadline(heroHeadline.slice(0, index));
      if (index >= heroHeadline.length) {
        setIsTypingDone(true);
        window.clearInterval(timer);
      }
    }, 30);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const heroRevealClass = isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2';
  const displayedHeadline = typedHeadline || ' ';

  return (
    <main
      id="main-content"
      className="bg-transparent text-slate-900 font-[family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',sans-serif]"
    >
      <section className="relative min-h-[75vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/Ascenda Banner.png"
            alt="Ascenda hero banner"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-white pointer-events-none" />
        </div>
        <div className="relative z-10">
          <motion.header
            className="sticky top-0 z-30 w-full mb-8 bg-transparent px-4 py-4 sm:px-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-white">
              <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
                <Image
                  src="/Gemini_Generated_Image_t7l91wt7l91wt7l9-removebg-preview.png"
                  alt="Ascenda logo"
                  width={160}
                  height={160}
                  priority
                  className="h-auto w-[205px] object-contain"
                />
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="sm"
                  className="bg-white/10 text-white border border-white/50 shadow-none hover:bg-white/20 hover:text-white hover:shadow-none hover:scale-100 !text-white"
                >
                  <Link href="/signup" className="flex items-center gap-2 text-white">
                    <Laptop className="h-4 w-4 text-white" />
                    Launch Ascenda
                  </Link>
                </Button>
              </div>
            </div>
          </motion.header>

          <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6">
            <section className="space-y-12 pb-16 pt-4">
              <motion.div
                className="grid items-center gap-10 lg:grid-cols-[0.9fr,1.1fr]"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div className="space-y-6">
                  <p className="text-xs uppercase tracking-[0.5em] text-white/70">Admissions OS</p>
                  <h1
                    className="text-5xl font-semibold leading-tight tracking-tight text-white sm:text-[3.6rem]"
                    aria-label={heroHeadline}
                  >
                    <span className="text-white">{displayedHeadline}</span>
                    <span
                      aria-hidden
                      className={`ml-2 inline-block h-[1.1em] w-px bg-white align-middle transition-opacity duration-300 ${
                        isTypingDone ? 'opacity-0' : 'opacity-100 animate-pulse'
                      }`}
                    />
                  </h1>
                  <p
                    className={`text-lg text-white/80 sm:text-xl transition-all duration-500 ease-out ${heroRevealClass}`}
                    style={{ transitionDelay: isTypingDone ? '120ms' : '0ms' }}
                  >
                    Get matched to the right universities and courses, unlock real campus insights, and receive a tailored application plan in one modern workspace.
                  </p>
                  <div
                    className={`flex flex-wrap gap-3 transition-all duration-500 ease-out ${heroRevealClass}`}
                    style={{ transitionDelay: isTypingDone ? '200ms' : '0ms' }}
                  >
                    <Button
                      asChild
                      size="lg"
                      className="bg-white/20 text-white border border-white/30 shadow-none hover:bg-white/30 hover:text-white hover:shadow-none hover:scale-100"
                    >
                      <Link href="/signup">Launch Ascenda</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border border-white/70 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Link href="/download">See product tour</Link>
                    </Button>
                  </div>
                  <ul
                    className={`flex flex-wrap gap-4 text-sm text-white/80 transition-all duration-500 ease-out ${heroRevealClass}`}
                    style={{ transitionDelay: isTypingDone ? '260ms' : '0ms' }}
                  >
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      Fit scores auto recalibrate with every edit.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      Notes stay perfectly in sync.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      Timeline nudges prevent deadline drift.
                    </li>
                  </ul>
                </div>
                <motion.div
                  className="rounded-[36px] border border-white/30 bg-black/40 p-6 text-white shadow-[0_35px_80px_rgba(2,6,23,0.45)] backdrop-blur"
                  initial="hidden"
                  animate={isTypingDone ? 'visible' : 'hidden'}
                  variants={heroBoardVariants}
                >
                  <div className="flex items-center justify-between gap-4 text-[0.7rem] uppercase tracking-[0.4em] text-white">
                    <span className="flex items-center gap-2 !text-white" style={{ color: '#fff' }}>
                      <LayoutDashboard className="h-4 w-4 text-cyan-200" />
                      Ascenda board
                    </span>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 rounded-full border border-white/40 px-3 py-0.5 text-[0.55rem] !text-white">
                        <ClipboardList className="h-3.5 w-3.5 text-cyan-100" />
                        Plan
                      </span>
                      <span className="flex items-center gap-1 rounded-full border border-white/40 px-3 py-0.5 text-[0.55rem] !text-white">
                        <Activity className="h-3.5 w-3.5 text-emerald-200" />
                        Signals
                      </span>
                      <span className="flex items-center gap-1 rounded-full border border-white/40 px-3 py-0.5 text-[0.55rem] !text-white">
                        <NotebookPen className="h-3.5 w-3.5 text-amber-100" />
                        Notes
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-[24px] border border-white/20 bg-white/10 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.35em] text-white">Fit score</p>
                        <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">On target</span>
                      </div>
                      <div className="mt-2 flex items-end justify-between">
                        <p className="text-4xl font-semibold text-white">92%</p>
                        <p className="text-sm text-white">Parsons Paris · Strategic Design</p>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-slate-900 via-cyan to-emerald-400" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-[24px] border border-white/20 bg-white/5 px-5 py-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-white">Next actions</p>
                        <ul className="mt-3 space-y-2 text-sm text-white">
                          <li className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-200 to-cyan-300" />
                              <span className="font-medium text-white">Scholarship essay · Draft 2</span>
                            </div>
                            <span className="rounded-full border border-white/40 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-white">
                              Due Fri
                            </span>
                          </li>
                          <li className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-amber-200 to-rose-300" />
                              <span className="font-medium text-white">Portfolio upload · Motion study</span>
                            </div>
                            <span className="rounded-full border border-white/40 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-white">
                              Needs review
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="rounded-[24px] border border-white/20 bg-white/5 px-5 py-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-white">Notes sync</p>
                        <div className="mt-3 space-y-2 text-sm text-white">
                          <p className="text-base font-medium leading-relaxed text-white/95">
                            <span className="text-2xl text-amber-200">“</span>Greenlit for ESADE interview; send prep doc.&rdquo;
                          </p>
                          <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.35em] text-white/80">
                            <span className="font-semibold text-white">Claire</span>
                            <span className="h-0.5 w-8 bg-white/30" />
                            <span className="text-white/95">2 hours ago</span>
                          </div>
                          <span className="text-xs text-white/80">Shared on Ascenda workspace</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/20 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white">Active signals</p>
                      <div className="mt-3 grid gap-3 text-sm text-white/80 md:grid-cols-3">
                        <div>
                          <p className="text-2xl font-semibold text-white">4</p>
                          <p className="text-xs uppercase tracking-[0.3em] text-white">Programs</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-white">2</p>
                          <p className="text-xs uppercase tracking-[0.3em] text-white">Deadlines</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-white">1</p>
                          <p className="text-xs uppercase tracking-[0.3em] text-white">Scholarship</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white">
                    <span>Updated 1 min ago</span>
                    <span className="h-px flex-1 bg-white/30"></span>
                    <span>View timeline →</span>
                  </div>
                </motion.div>
              </motion.div>
            </section>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6">

        <section className="mt-16 space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Why Ascenda</p>
            <h2 className="text-3xl font-semibold text-[#111111]">Four ways to make your application journey easier</h2>
            <p className="text-sm text-[#666666]">
              Everything in Ascenda is tuned to blend calm clarity with clear actions—so you and your team can move through the cycle with
              confidence and zero guesswork.
            </p>
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

        <section className="mt-16 space-y-6">
          <div>
            <h2 className="text-3xl font-semibold">Your shortlist in 3 steps</h2>
            <p className="text-sm text-slate-600">The easiest way to see what’s next, why it matters, and how to act.</p>
          </div>
          <div className="relative space-y-4 pt-4">
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
                    Feel the delta between chaos and clarity, each row pairs the old grind with the Ascenda way.
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
            <p>Students and families feel the delta immediately, data shows why.</p>
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
        <motion.section
          className="mt-16 grid gap-8 rounded-[32px] border border-slate-100 bg-white p-6 md:grid-cols-[0.9fr_1.1fr]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Quick demo</p>
            <h2 className="text-3xl font-semibold">Aim higher. Land smarter.</h2>
            <p className="text-sm text-slate-600">
              Paste predicted grades, hit enter, and Ascenda animates Fit Scores, timelines, and required actions in real time. No extra UI
              noise, just the next move.
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
                Notes stay synced automatically
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

        <section className="mt-16 space-y-8 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="text-center text-slate-600 md:text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Frequently asked questions</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Answers before you even ask.</h2>
            <p className="text-sm">
              We keep the playbook simple: transparent timelines, privacy controls, and human support whenever you need it.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <motion.div
                key={faq.question}
                className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5"
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
        </section>
        <motion.section
            className="mt-16 space-y-4 rounded-[36px] border border-slate-100 bg-white px-8 py-10 text-center text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.08)]"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Plan confidently</p>
            <h2 className="text-3xl font-semibold">Launch with the decisions that matter.</h2>
            <p className="text-sm text-slate-600">
              Tie programs, essays, scholarships, and deadlines together—so every action is tied to the right school and nothing slips through the cracks.
            </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-slate-900 text-white hover:bg-slate-50 hover:text-slate-900 shadow-none hover:shadow-none hover:scale-100"
            >
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
