import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from '@/components/layout/animated-section';
import { PenTool, BarChart3, Users, ClipboardCheck, CalendarClock, ArrowRight, Sparkles } from 'lucide-react';
import {
  DEMO_BUILDING_BLOCKS,
  DEMO_ESSAY_PROMPTS,
  DEMO_ACTIVITIES,
  DEMO_UNIVERSITY_CHANCES,
  DEMO_REQUIREMENTS,
  DEMO_TIMELINE_DEADLINES,
} from '@/lib/data/student-demo-data';
import { ToolboxProgressRing, ToolboxCountdown } from '@/components/toolbox/toolbox-landing-widgets';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Toolbox | Ascenda' };

const totalHours = DEMO_ACTIVITIES.reduce((sum, a) => sum + a.hoursPerWeek * a.weeksPerYear, 0);
const avgProgress = DEMO_REQUIREMENTS.length ? Math.round(DEMO_REQUIREMENTS.reduce((sum, r) => sum + r.progress, 0) / DEMO_REQUIREMENTS.length) : 0;
const upcoming14 = DEMO_TIMELINE_DEADLINES.filter((d) => {
  const diff = (new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 14;
}).length;
const upcoming30 = DEMO_TIMELINE_DEADLINES.filter((d) => {
  const diff = (new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}).length;

const reachCount = DEMO_UNIVERSITY_CHANCES.filter((u) => (39 - u.minimumScore) < 1).length;
const safetyCount = DEMO_UNIVERSITY_CHANCES.filter((u) => (39 - u.minimumScore) >= 5).length;

const TOOL_CARDS = [
  {
    title: 'Requirements Checker',
    href: '/toolbox/requirements',
    icon: ClipboardCheck,
    iconBg: 'bg-amber-500/10 text-amber-600',
    gradient: 'from-amber-500/5 to-transparent',
    description: 'Interactive status toggles and progress rings for each university\'s requirements.',
    step: 1,
    stats: [
      { label: 'Universities', value: DEMO_REQUIREMENTS.length },
      { label: 'Readiness', value: `${avgProgress}%` },
      { label: 'Complete', value: DEMO_REQUIREMENTS.filter((r) => r.progress === 100).length },
    ],
  },
  {
    title: 'Chances Calculator',
    href: '/toolbox/chances',
    icon: BarChart3,
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    gradient: 'from-emerald-500/5 to-transparent',
    description: 'Visual probability gauges and what-if score slider for each university.',
    step: 2,
    stats: [
      { label: 'Universities', value: DEMO_UNIVERSITY_CHANCES.length },
      { label: 'Reach', value: reachCount },
      { label: 'Safety', value: safetyCount },
    ],
  },
  {
    title: 'Activity Portfolio',
    href: '/toolbox/activities',
    icon: Users,
    iconBg: 'bg-sky-500/10 text-sky-600',
    gradient: 'from-sky-500/5 to-transparent',
    description: 'Drag-to-reorder activities with impact visualization and format previews.',
    step: 3,
    stats: [
      { label: 'Activities', value: DEMO_ACTIVITIES.length },
      { label: 'Hours', value: totalHours },
      { label: 'Tier 1', value: DEMO_ACTIVITIES.filter((a) => a.tier === 1).length },
    ],
  },
  {
    title: 'Essay Workshop',
    href: '/toolbox/essay-workshop',
    icon: PenTool,
    iconBg: 'bg-violet-500/10 text-violet-600',
    gradient: 'from-violet-500/5 to-transparent',
    description: 'Rich text editor with building blocks, platform-specific limits, and AI writing tips.',
    step: 4,
    stats: [
      { label: 'Blocks', value: DEMO_BUILDING_BLOCKS.length },
      { label: 'Prompts', value: DEMO_ESSAY_PROMPTS.length },
      { label: 'Platforms', value: 4 },
    ],
  },
  {
    title: 'Deadline Timeline',
    href: '/toolbox/timeline',
    icon: CalendarClock,
    iconBg: 'bg-rose-500/10 text-rose-600',
    gradient: 'from-rose-500/5 to-transparent',
    description: 'Calendar and timeline views with urgency indicators and filtering.',
    step: 5,
    stats: [
      { label: 'Next 14d', value: upcoming14 },
      { label: 'Next 30d', value: upcoming30 },
      { label: 'Total', value: DEMO_TIMELINE_DEADLINES.length },
    ],
  },
];

export default async function ToolboxPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Next action: nearest deadline
  const nextDeadline = DEMO_TIMELINE_DEADLINES
    .filter((d) => new Date(d.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const daysUntil = nextDeadline
    ? Math.round((new Date(nextDeadline.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <DashboardShell>
      <SectionNav items={TOOLBOX_SECTION_ITEMS} />
      <PageHero
        eyebrow="Toolbox"
        title="Your toolkit"
        description="Five purpose-built tools to plan, write, and track every part of your applications."
        stats={[
          { label: 'Tools', value: '5', detail: 'Available' },
          { label: 'Readiness', value: `${avgProgress}%`, detail: 'Overall' },
          { label: 'Upcoming', value: String(upcoming14), detail: 'Next 14 days' },
        ]}
      />

      {/* Next action + overall progress */}
      <AnimatedSection>
        <div className="grid gap-4 md:grid-cols-[1fr,auto]">
          {/* Next action card */}
          {nextDeadline && (
            <Link href="/toolbox/timeline" className="block surface-card border-l-4 border-l-primary hover:border-l-primary hover:shadow-xl transition-all hover:-translate-y-0.5 group overflow-hidden">
              <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="relative z-10 flex items-center gap-4">
                <ToolboxCountdown days={daysUntil ?? 0} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Your next action
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-0.5 truncate">{nextDeadline.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {nextDeadline.university} — {daysUntil !== null && daysUntil <= 7
                      ? <span className="text-rose-600 font-semibold">{daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days left`}</span>
                      : new Date(nextDeadline.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    }
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </Link>
          )}

          {/* Requirements progress ring */}
          <div className="surface-card flex items-center gap-4 min-w-[200px]">
            <div className="relative z-10 flex items-center gap-4 w-full">
              <ToolboxProgressRing value={avgProgress} />
              <div>
                <p className="text-sm font-semibold text-foreground">Requirements</p>
                <p className="text-xs text-muted-foreground">{DEMO_REQUIREMENTS.filter((r) => r.progress === 100).length} of {DEMO_REQUIREMENTS.length} ready</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Tool cards grid */}
      <AnimatedGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOL_CARDS.map((tool) => {
          const Icon = tool.icon;
          return (
            <AnimatedGridItem key={tool.href}>
              <Link href={tool.href} className="surface-card group flex h-full flex-col hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden">
                {/* Gradient header strip */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} rounded-[inherit] pointer-events-none`} />
                <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40" style={{ background: 'var(--primary)' }} />

                <div className="relative z-10 flex-1 flex flex-col gap-4">
                  {/* Icon + title row */}
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tool.iconBg} ring-1 ring-black/5 dark:ring-white/5 shadow-sm`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background shadow-sm">
                        {tool.step}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-base font-semibold text-foreground">{tool.title}</p>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{tool.description}</p>
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    {tool.stats.map((stat) => (
                      <div key={stat.label} className="surface-subcard px-2.5 py-2.5 text-center rounded-xl">
                        <p className="text-sm font-bold text-foreground tabular-nums">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </AnimatedGridItem>
          );
        })}
      </AnimatedGrid>
    </DashboardShell>
  );
}
