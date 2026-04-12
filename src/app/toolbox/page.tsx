import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from '@/components/layout/animated-section';
import { PenTool, BarChart3, Users, ClipboardCheck, CalendarClock } from 'lucide-react';
import {
  DEMO_BUILDING_BLOCKS,
  DEMO_ESSAY_PROMPTS,
  DEMO_ACTIVITIES,
  DEMO_UNIVERSITY_CHANCES,
  DEMO_REQUIREMENTS,
  DEMO_TIMELINE_DEADLINES,
} from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Toolbox | Ascenda' };

const totalHours = DEMO_ACTIVITIES.reduce((sum, a) => sum + a.hoursPerWeek * a.weeksPerYear, 0);
const avgProgress = Math.round(DEMO_REQUIREMENTS.reduce((sum, r) => sum + r.progress, 0) / DEMO_REQUIREMENTS.length);
const upcoming30 = DEMO_TIMELINE_DEADLINES.filter((d) => {
  const diff = (new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}).length;

const TOOL_CARDS = [
  {
    title: 'Essay Workshop',
    href: '/toolbox/essay-workshop',
    icon: PenTool,
    iconBg: 'bg-violet-500/10 text-violet-600',
    description: 'Draft essays with your building blocks and platform-specific limits.',
    miniSummary: `${DEMO_BUILDING_BLOCKS.length} blocks, ${DEMO_ESSAY_PROMPTS.length} prompts matched`,
  },
  {
    title: 'Chances Calculator',
    href: '/toolbox/chances',
    icon: BarChart3,
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    description: 'See reach, match, and safety schools based on your predicted grades.',
    miniSummary: `${DEMO_UNIVERSITY_CHANCES.length} universities assessed`,
  },
  {
    title: 'Activity Portfolio',
    href: '/toolbox/activities',
    icon: Users,
    iconBg: 'bg-sky-500/10 text-sky-600',
    description: 'Log extracurriculars and format for Common App or UC applications.',
    miniSummary: `${DEMO_ACTIVITIES.length} activities, ${totalHours.toLocaleString()} total hours`,
  },
  {
    title: 'Requirements Checker',
    href: '/toolbox/requirements',
    icon: ClipboardCheck,
    iconBg: 'bg-amber-500/10 text-amber-600',
    description: 'Track what each university needs — subjects, exams, documents, essays.',
    miniSummary: `${avgProgress}% average readiness across ${DEMO_REQUIREMENTS.length} universities`,
  },
  {
    title: 'Deadline Timeline',
    href: '/toolbox/timeline',
    icon: CalendarClock,
    iconBg: 'bg-rose-500/10 text-rose-600',
    description: 'Visual timeline of all deadlines across applications and countries.',
    miniSummary: `${upcoming30} deadlines in the next 30 days`,
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
          { label: 'Blocks', value: String(DEMO_BUILDING_BLOCKS.length), detail: 'Story pieces' },
          { label: 'Activities', value: String(DEMO_ACTIVITIES.length), detail: 'Logged' },
        ]}
      />

      {/* Next action card */}
      {nextDeadline && (
        <AnimatedSection>
          <Link href="/toolbox/timeline" className="block surface-card border-l-4 border-l-primary hover:border-l-primary/80 transition-colors">
            <div className="relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Your next action</p>
              <p className="text-lg font-semibold text-foreground mt-1">{nextDeadline.title}</p>
              <p className="text-sm text-muted-foreground">
                {nextDeadline.university} — {daysUntil !== null && daysUntil <= 7
                  ? <span className="text-rose-600 font-medium">{daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days left`}</span>
                  : new Date(nextDeadline.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                }
              </p>
            </div>
          </Link>
        </AnimatedSection>
      )}

      {/* Tool cards grid */}
      <AnimatedGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOL_CARDS.map((tool) => {
          const Icon = tool.icon;
          return (
            <AnimatedGridItem key={tool.href}>
              <Link href={tool.href} className="surface-card group flex h-full flex-col">
                <div className="relative z-10 flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tool.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{tool.title}</p>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                  <div className="surface-subcard px-3 py-2">
                    <p className="text-xs text-muted-foreground">{tool.miniSummary}</p>
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
