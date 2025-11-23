import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShortlistMarquee } from '@/components/shortlist/shortlist-marquee';
import { CourseDetailsPanel } from '@/components/shortlist/course-details-panel';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CalendarDays, CheckCircle2, Clock, LayoutList, Map, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shortlist | Ascenda'
};

const heroStats = [
  { label: 'Shortlisted courses', value: '4', detail: 'Synced this week' },
  { label: 'Average fit score', value: '88%', detail: 'Across regions' },
  { label: 'Core hours / week', value: '18', detail: 'Tutorial + studio' }
];

const coverageStats = [
  { label: 'Continent coverage', value: '3', detail: 'UK · Canada · Singapore' },
  { label: 'Immersion trips', value: '2', detail: 'Policy + urban lab' },
  { label: 'Team deliverables', value: '6', detail: 'Across programs' }
];

const shortlistCourses = [
  {
    id: 'oxford-ppe',
    university: 'University of Oxford',
    program: 'PPE (Hons)',
    location: 'Oxford, UK',
    focus: 'Politics · Philosophy · Economics',
    fitScore: 92,
    stage: 'Tutorial ready',
    nextAction: 'Upload written work pack by Oct 1',
    modules: [
      { name: 'Political theory tutorials', credits: '20 credits', highlight: '1:2 tutorial ratio with weekly essays.' },
      { name: 'Microeconomics workshop', credits: '15 credits', highlight: 'Quant bootcamp + policy lab.' },
      { name: 'Ethics & logic seminars', credits: '10 credits', highlight: 'Debate-led assessments.' }
    ],
    immersion: 'Hilary term UN policy sprint · Week 7',
    schedule: { tutorials: '2 / week', seminars: '3 / week', assessments: 'Weekly essays + timed paper' }
  },
  {
    id: 'rotman-commerce',
    university: 'University of Toronto',
    program: 'Rotman Commerce',
    location: 'Toronto, Canada',
    focus: 'Analytics · Finance · Innovation',
    fitScore: 86,
    stage: 'Interview prep',
    nextAction: 'Record video response set by Nov 12',
    modules: [
      { name: 'Foundations of finance', credits: '0.5 credit', highlight: 'Blended lectures + trading lab.' },
      { name: 'Data & Decisions', credits: '0.5 credit', highlight: 'Python + Tableau studio.' },
      { name: 'Business design studio', credits: 'Capstone', highlight: 'Team sprint with industry mentor.' }
    ],
    immersion: 'Creative Destruction Lab residency · Spring',
    schedule: { tutorials: '1 workshop', seminars: '2 studios', assessments: 'Team pitch + proctored exam' }
  },
  {
    id: 'nus-edesign',
    university: 'National University of Singapore',
    program: 'Engineering & Design',
    location: 'Singapore',
    focus: 'Systems · Product · Sustainability',
    fitScore: 84,
    stage: 'Portfolio polish',
    nextAction: 'Upload prototype walkthrough by Dec 1',
    modules: [
      { name: 'Integrated design project', credits: '8 MCs', highlight: 'Multi-disciplinary sprint with start-ups.' },
      { name: 'Future mobility lab', credits: '4 MCs', highlight: 'Hands-on studio, mobility stack focus.' },
      { name: 'Human factors studio', credits: '4 MCs', highlight: 'Field research & testing diaries.' }
    ],
    immersion: 'Jakarta urban innovation trip · Trimester 2',
    schedule: { tutorials: 'Design critiques', seminars: 'Studio block 6h', assessments: 'Portfolio + live review' }
  }
];

const weekTimeline = [
  {
    id: 'foundation',
    window: 'Weeks 1-2',
    focus: 'Foundation ramp',
    course: 'Oxford PPE',
    detail: 'Quant bootcamp + essay calibration with tutor feedback loops.',
    action: 'Upload first two essays and track return cadence.'
  },
  {
    id: 'studio',
    window: 'Weeks 3-5',
    focus: 'Studio sprint',
    course: 'Rotman Commerce',
    detail: 'Business design studio deliverable each Friday.',
    action: 'Log mentor notes and align metrics before presentations.'
  },
  {
    id: 'immersion',
    window: 'Week 6',
    focus: 'Immersion prep',
    course: 'NUS Engineering & Design',
    detail: 'Prototype review + travel briefing for Jakarta immersion.',
    action: 'Finalize prototype video + upload travel docs.'
  },
  {
    id: 'assessment',
    window: 'Weeks 7-8',
    focus: 'Assessment focus',
    course: 'Mixed',
    detail: 'Rhythm of essays, proctored exam, and live critiques.',
    action: 'Lock revision blocks + confirm assessor availability.'
  }
];

const collaborationBoard = [
  {
    id: 'oxford-reading',
    title: 'Share Oxford reading stack',
    owner: 'Counselor',
    due: 'Sept 10',
    status: 'Queued'
  },
  {
    id: 'rotman-video',
    title: 'Review Rotman video drafts',
    owner: 'Mentor',
    due: 'Nov 4',
    status: 'In progress'
  },
  {
    id: 'nus-portfolio',
    title: 'Tag NUS prototypes to checklist',
    owner: 'You',
    due: 'Nov 20',
    status: 'Ready'
  }
];

const loadInsights = [
  { label: 'Tutorial essays', value: '32', detail: 'across 8 weeks' },
  { label: 'Studios', value: '18h', detail: 'average contact' },
  { label: 'Assessments', value: '5', detail: 'major deliverables' },
  { label: 'Collab partners', value: '4', detail: 'Counselor + mentors' }
];

const courseSignals = [
  {
    id: 'signal-oxford',
    title: 'Logic tutorials shifted to Thursdays',
    detail: 'Update weekly planner & notify tutor of travel window.',
    course: 'Oxford PPE',
    timeAgo: '15m ago'
  },
  {
    id: 'signal-rotman',
    title: 'Rotman studio swapped mentor',
    detail: 'New mentor prefers growth metric dashboards in pitch deck.',
    course: 'Rotman Commerce',
    timeAgo: '1h ago'
  },
  {
    id: 'signal-nus',
    title: 'NUS mobility lab adding lidar workshop',
    detail: 'Reserve maker space slot + confirm equipment checklist.',
    course: 'NUS Engineering & Design',
    timeAgo: '3h ago'
  }
];

const nextActionDigest = shortlistCourses.map((course) => ({
  id: course.id,
  label: `${course.university} · ${course.program}`,
  action: course.nextAction,
  stage: course.stage
}));

export default async function ShortlistPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell>
      <PageHero
        eyebrow="Shortlist control"
        title="Course-by-course breakdown"
        description="Every shortlisted course mapped with modules, cadence, and actions. Share this board with mentors so everyone sees the same source of truth."
        highlight="Live course breakdown"
        stats={heroStats}
        actions={
          <>
            <Button asChild size="sm">
              <Link href="/university-search/results">Add more courses</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/applications">Sync to application tracker</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/profile">Adjust fit inputs</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-5 rounded-[34px] border border-border bg-card p-6 text-foreground shadow-[0_35px_80px_rgba(15,23,42,0.08)] transition-colors">
          <ShortlistMarquee label="Live shortlist" tone="light" />
          <p className="text-sm text-muted-foreground">
            Your shortlist stays calm with cadence, modules, and handoffs. Use this snapshot to prep counselor syncs or send parents a
            course digest.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {coverageStats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-border bg-muted/70 px-4 py-3 transition-colors">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[28px] border border-border bg-muted/70 p-4 transition-colors">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Next actions</p>
            <div className="mt-3 space-y-3">
              {nextActionDigest.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-background px-4 py-3 text-foreground shadow-[0_10px_25px_rgba(15,23,42,0.05)] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.action}</p>
                    </div>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{item.stage}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" className="mt-3">
              Share overview
            </Button>
          </div>
        </div>
        <div className="space-y-4 rounded-[34px] border border-border bg-card p-6 text-foreground shadow-[0_35px_80px_rgba(15,23,42,0.08)] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Collaboration</p>
              <h2 className="text-2xl font-semibold text-foreground">Partner board</h2>
            </div>
            <LayoutList className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <ul className="space-y-3">
            {collaborationBoard.map((item) => (
              <li key={item.id} className="rounded-[24px] border border-border bg-muted/70 px-4 py-3 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Owner: {item.owner}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Due {item.due}</p>
              </li>
            ))}
          </ul>
          <div className="rounded-[24px] border border-dashed border-border bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
            Share this board to give counselors the full module view before next sync.
          </div>
          <Button type="button" size="sm" variant="soft">
            Copy board link
          </Button>
        </div>
      </section>

      <section className="space-y-6 rounded-[34px] border border-border bg-card p-6 text-foreground shadow-[0_35px_80px_rgba(15,23,42,0.08)] transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Shortlist stack</p>
            <h2 className="text-3xl font-semibold text-foreground">Course details</h2>
            <p className="text-sm text-muted-foreground">Modules, cadence, and immersion notes pulled straight from the shortlist.</p>
          </div>
          <Button size="sm" variant="ghost">
            Export PDF
          </Button>
        </div>
        <CourseDetailsPanel courses={shortlistCourses} />
      </section>

      <section className="space-y-4 rounded-[34px] border border-border bg-card p-6 text-foreground shadow-[0_30px_70px_rgba(15,23,42,0.08)] transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Rhythm</p>
            <h2 className="text-2xl font-semibold text-foreground">Weekly focus timeline</h2>
          </div>
          <CalendarDays className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-4">
          {weekTimeline.map((phase) => (
            <article
              key={phase.id}
              className="rounded-[28px] border border-border bg-muted/70 p-4 text-foreground shadow-[0_15px_45px_rgba(15,23,42,0.08)] transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{phase.window}</p>
                  <p className="text-base font-semibold text-foreground">{phase.focus}</p>
                </div>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {phase.course}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{phase.detail}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-4 w-4 text-emerald-500" aria-hidden />
                {phase.action}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4 rounded-[34px] border border-border bg-card p-6 text-foreground shadow-[0_30px_70px_rgba(15,23,42,0.08)] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Signals</p>
              <h2 className="text-2xl font-semibold text-foreground">Course updates</h2>
            </div>
            <Clock className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <ul className="space-y-3">
            {courseSignals.map((signal) => (
              <li
                key={signal.id}
                className="rounded-[26px] border border-border bg-muted/70 px-4 py-3 text-foreground shadow-[0_15px_40px_rgba(15,23,42,0.08)] transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{signal.course}</p>
                  <span className="text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">{signal.timeAgo}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{signal.title}</p>
                <p className="text-xs text-muted-foreground">{signal.detail}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4 rounded-[34px] border border-border bg-card p-6 text-foreground shadow-[0_30px_70px_rgba(15,23,42,0.08)] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Load summary</p>
              <h2 className="text-2xl font-semibold text-foreground">What to expect</h2>
            </div>
            <Map className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {loadInsights.map((insight) => (
              <div key={insight.label} className="rounded-[24px] border border-border bg-muted/70 px-4 py-3 transition-colors">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{insight.label}</p>
                <p className="text-2xl font-semibold text-foreground">{insight.value}</p>
                <p className="text-xs text-muted-foreground">{insight.detail}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[26px] border border-border bg-muted/70 px-4 py-3 text-sm text-muted-foreground transition-colors">
            Keep logging reflections after each tutorial or studio—Ascenda will soon surface trends to guide decisions.
          </div>
          <Button type="button" size="sm" variant="secondary" className="w-full">
            Add reflection
          </Button>
          <div className="flex items-center gap-2 rounded-[24px] border border-border bg-background px-4 py-3 text-xs text-muted-foreground transition-colors">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
            Immersion docs are synced for Oxford + NUS.
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
