'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  BookmarkPlus,
  Brain,
  CalendarDays,
  Code,
  FileText,
  Globe2,
  Layers,
  Link2,
  Search,
  Laptop,
  Pencil,
  Plus,
  Presentation,
  ShieldCheck,
  Workflow,
  Users,
  type LucideIcon
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

type IconType = LucideIcon;

type EntryRequirement = { label: string; value: string; icon: IconType };
type CohortFact = { label: string; value: string };
type ModuleGroup = { title: string; items: string[]; icon: IconType };
type QuickFact = { label: string; value: string };
type ApplicationCard = { title: string; body: string; linkLabel: string; href: string };
type ApplicationStep = { label: string; status: 'not_started' | 'in_progress' | 'done'; due?: string; href?: string };

type CourseData = {
  id: string;
  title: string;
  university: string;
  location: string;
  acceptanceRate: string;
  guardianRank: string;
  qsRank: string;
  timesRank: string;
  satisfaction: number;
  employment: number;
  startingSalary: string;
  studyAbroad: boolean;
  topIndustries: string;
  placementYear: boolean;
  entryRequirements: EntryRequirement[];
  cohort: CohortFact[];
  modules: ModuleGroup[];
  quickFacts: QuickFact[];
  applicationCards: ApplicationCard[];
  applicationChecklist: ApplicationStep[];
  courseUrl?: string;
  applyUrl?: string;
};

const courseDataset: CourseData[] = [
  {
    id: 'harvard-computational-design',
    title: 'Computational Design',
    university: 'Harvard University',
    location: 'Cambridge, USA',
    acceptanceRate: '8%',
    guardianRank: '10',
    qsRank: '4',
    timesRank: '3',
    satisfaction: 92,
    employment: 94,
    startingSalary: '$95,000',
    studyAbroad: true,
    topIndustries: 'Tech, Research, Design',
    placementYear: true,
    entryRequirements: [
      { label: 'IB Score Requirement', value: '40', icon: FileText },
      { label: 'A-Level Requirement', value: 'A*AA', icon: Pencil },
      { label: 'Preferred Subjects', value: 'Math, Physics, CompSci', icon: BookOpen },
      { label: 'English Requirement', value: 'IELTS 7.5', icon: Globe2 },
      { label: 'Admission Tests', value: 'ESAT', icon: Search },
      { label: 'Interview Required?', value: 'Yes', icon: Users },
      { label: 'UCAS Code', value: 'HCD123', icon: BadgeCheck },
      { label: 'UCAS Deadline', value: 'January 15', icon: CalendarDays }
    ],
    cohort: [
      { label: 'Intake Size (24/25)', value: '180' },
      { label: 'Class Size Per Year', value: '60' },
      { label: 'Domestic vs International', value: '60:40' },
      { label: 'Students in Department', value: '1,200' }
    ],
    modules: [
      { title: 'Year 1 Modules', items: ['Intro to Programming', 'Geometry & Graphics'], icon: Laptop },
      { title: 'Year 2 Modules', items: ['Algorithms', 'Generative Design'], icon: Workflow },
      { title: 'Year 3 Modules', items: ['ML for Design', 'Systems Studio'], icon: Brain },
      { title: 'Optional Modules', items: ['Data Science', 'Cybersecurity'], icon: ShieldCheck }
    ],
    quickFacts: [
      { label: 'Mode', value: 'On campus' },
      { label: 'Duration', value: '4 years' },
      { label: 'Placement year', value: 'Available' },
      { label: 'Start', value: 'September' }
    ],
    applicationChecklist: [
      { label: 'Review course webpage', status: 'done', href: '#', due: 'Ongoing' },
      { label: 'Prepare ESAT + portfolio', status: 'in_progress', due: 'Dec 15' },
      { label: 'Submit UCAS application', status: 'not_started', due: 'Jan 15' },
      { label: 'Book interview slot', status: 'not_started', due: 'Jan 30' }
    ],
    applyUrl: '#',
    courseUrl: '#',
    applicationCards: [
      {
        title: 'Official Course Webpage',
        body: 'Visit our official site for detailed information about this course.',
        linkLabel: 'Program',
        href: '#'
      },
      {
        title: 'Direct Apply Option',
        body: 'You can apply directly through our portal.',
        linkLabel: 'Apply',
        href: '#'
      },
      {
        title: 'Additional Requirements',
        body: 'A portfolio is required for design-related modules.',
        linkLabel: 'Portfolio',
        href: '#'
      },
      {
        title: 'Internal Deadlines',
        body: 'Ensure that your personal statement and references are ready ahead of submission.',
        linkLabel: 'Deadlines',
        href: '#'
      }
    ]
  },
  {
    id: 'stanford-engineering-society',
    title: 'Engineering & Society',
    university: 'Stanford University',
    location: 'Palo Alto, USA',
    acceptanceRate: '9%',
    guardianRank: '12',
    qsRank: '5',
    timesRank: '2',
    satisfaction: 90,
    employment: 93,
    startingSalary: '$105,000',
    studyAbroad: true,
    topIndustries: 'Tech, Consulting, Impact',
    placementYear: true,
    entryRequirements: [
      { label: 'IB Score Requirement', value: '38', icon: FileText },
      { label: 'A-Level Requirement', value: 'AAA', icon: Pencil },
      { label: 'Preferred Subjects', value: 'Math, Physics', icon: BookOpen },
      { label: 'English Requirement', value: 'IELTS 7.0', icon: Globe2 },
      { label: 'Admission Tests', value: 'ESAT', icon: Search },
      { label: 'Interview Required?', value: 'Yes', icon: Users },
      { label: 'UCAS Code', value: 'SES200', icon: BadgeCheck },
      { label: 'UCAS Deadline', value: 'January 15', icon: CalendarDays }
    ],
    cohort: [
      { label: 'Intake Size (24/25)', value: '220' },
      { label: 'Class Size Per Year', value: '70' },
      { label: 'Domestic vs International', value: '65:35' },
      { label: 'Students in Department', value: '1,050' }
    ],
    modules: [
      { title: 'Year 1 Modules', items: ['Foundations of Engineering', 'Programming Basics'], icon: Laptop },
      { title: 'Year 2 Modules', items: ['Algorithms', 'Systems Design'], icon: Workflow },
      { title: 'Year 3 Modules', items: ['Ethics & Tech', 'Product Studio'], icon: Presentation },
      { title: 'Optional Modules', items: ['Data Science', 'Cybersecurity'], icon: ShieldCheck }
    ],
    quickFacts: [
      { label: 'Mode', value: 'On campus' },
      { label: 'Duration', value: '4 years' },
      { label: 'Placement year', value: 'Available' },
      { label: 'Start', value: 'September' }
    ],
    applicationChecklist: [
      { label: 'Check program guidance', status: 'done', href: '#', due: 'Ongoing' },
      { label: 'Draft personal statement', status: 'in_progress', due: 'Dec 10' },
      { label: 'Upload ESAT results', status: 'not_started', due: 'Dec 22' },
      { label: 'Submit UCAS application', status: 'not_started', due: 'Jan 15' }
    ],
    applyUrl: '#',
    courseUrl: '#',
    applicationCards: [
      {
        title: 'Official Course Webpage',
        body: 'Visit our official site for detailed information about this course.',
        linkLabel: 'Program',
        href: '#'
      },
      {
        title: 'Direct Apply Option',
        body: 'You can apply directly through our portal.',
        linkLabel: 'Apply',
        href: '#'
      },
      {
        title: 'Additional Requirements',
        body: 'Statement on social impact is highly recommended.',
        linkLabel: 'Guidance',
        href: '#'
      },
      {
        title: 'Internal Deadlines',
        body: 'Ensure that your personal statement and references are ready ahead of submission.',
        linkLabel: 'Deadlines',
        href: '#'
      }
    ]
  },
  {
    id: 'oxford-phil-politics',
    title: 'Philosophy, Politics & Economics',
    university: 'University of Oxford',
    location: 'Oxford, UK',
    acceptanceRate: '15%',
    guardianRank: '2',
    qsRank: '3',
    timesRank: '1',
    satisfaction: 88,
    employment: 92,
    startingSalary: '$80,000',
    studyAbroad: false,
    topIndustries: 'Policy, Finance, Research',
    placementYear: false,
    entryRequirements: [
      { label: 'IB Score Requirement', value: '39', icon: FileText },
      { label: 'A-Level Requirement', value: 'AAA', icon: Pencil },
      { label: 'Preferred Subjects', value: 'Math, Economics', icon: BookOpen },
      { label: 'English Requirement', value: 'IELTS 7.5', icon: Globe2 },
      { label: 'Admission Tests', value: 'ESAT', icon: Search },
      { label: 'Interview Required?', value: 'Yes', icon: Users },
      { label: 'UCAS Code', value: 'L0V0', icon: BadgeCheck },
      { label: 'UCAS Deadline', value: 'January 15', icon: CalendarDays }
    ],
    cohort: [
      { label: 'Intake Size (24/25)', value: '320' },
      { label: 'Class Size Per Year', value: '80' },
      { label: 'Domestic vs International', value: '70:30' },
      { label: 'Students in Department', value: '900' }
    ],
    modules: [
      { title: 'Year 1 Modules', items: ['Intro to PPE', 'Logic & Reasoning'], icon: Laptop },
      { title: 'Year 2 Modules', items: ['Microeconomics', 'Political Theory'], icon: Presentation },
      { title: 'Year 3 Modules', items: ['Philosophy of Ethics', 'International Relations'], icon: BookOpen },
      { title: 'Optional Modules', items: ['Data Science', 'Cybersecurity'], icon: ShieldCheck }
    ],
    quickFacts: [
      { label: 'Mode', value: 'On campus' },
      { label: 'Duration', value: '3 years' },
      { label: 'Placement year', value: 'No' },
      { label: 'Start', value: 'October' }
    ],
    applicationChecklist: [
      { label: 'Read course handbook', status: 'done', href: '#', due: 'Ongoing' },
      { label: 'Collect written work samples', status: 'in_progress', due: 'Dec 5' },
      { label: 'Schedule ESAT', status: 'not_started', due: 'Nov 28' },
      { label: 'Submit UCAS application', status: 'not_started', due: 'Jan 15' }
    ],
    applyUrl: '#',
    courseUrl: '#',
    applicationCards: [
      {
        title: 'Official Course Webpage',
        body: 'Visit our official site for detailed information about this course.',
        linkLabel: 'Program',
        href: '#'
      },
      {
        title: 'Direct Apply Option',
        body: 'You can apply directly through our portal.',
        linkLabel: 'Apply',
        href: '#'
      },
      {
        title: 'Additional Requirements',
        body: 'Written work samples are required.',
        linkLabel: 'Guidance',
        href: '#'
      },
      {
        title: 'Internal Deadlines',
        body: 'Ensure that your personal statement and references are ready ahead of submission.',
        linkLabel: 'Deadlines',
        href: '#'
      }
    ]
  }
];

export default function CoursePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [shortlisted, setShortlisted] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [showActionBar, setShowActionBar] = useState(false);

  const contextSource = searchParams.get('from') === 'search' ? 'search' : searchParams.get('from') === 'university' ? 'university' : 'direct';
  const course = useMemo(() => {
    return courseDataset.find((item) => item.id === params.id);
  }, [params.id]);

  const universityHref = course ? `/university-search/university/${course.id}${contextSource === 'search' ? '?from=search' : ''}` : '/university-search/search';
  const backHref =
    contextSource === 'search'
      ? '/university-search/search'
      : contextSource === 'university'
        ? universityHref
        : '/dashboard';
  const backLabel =
    contextSource === 'search' ? 'Back to search results' : contextSource === 'university' ? 'Back to university page' : 'Back to dashboard';

  const sectionNav = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'metrics', label: 'Metrics' },
      { id: 'requirements', label: 'Requirements' },
      { id: 'cohort', label: 'Cohort' },
      { id: 'modules', label: 'Modules' },
      { id: 'apply', label: 'Apply' }
    ],
    []
  );

  useEffect(() => {
    if (!course) return;
    const observedSections = sectionNav.map((item) => document.getElementById(item.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.35, rootMargin: '-80px 0px -40% 0px' }
    );
    observedSections.forEach((section) => observer.observe(section!));
    return () => observer.disconnect();
  }, [sectionNav, course]);

  useEffect(() => {
    const handleScroll = () => {
      setShowActionBar(window.scrollY > 320);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!course) {
    return <MissingCourse backHref={backHref} backLabel={backLabel} />;
  }

  const heroMeta = {
    title: course.title,
    university: course.university,
    location: course.location
  };

  const metricCards = [
    { label: 'Acceptance Rate', value: course.acceptanceRate, hint: 'Estimated admissions rate for this cohort.' },
    { label: 'Guardian Rank', value: course.guardianRank, hint: 'Guardian University Guide rank.' },
    { label: 'QS Rank', value: course.qsRank, hint: 'QS World University ranking.' },
    { label: 'Times Rank', value: course.timesRank, hint: 'Times Higher Education ranking.' },
    { label: 'Student Satisfaction (NSS)', value: `${course.satisfaction}%`, hint: 'National Student Survey satisfaction.' },
    { label: 'Graduate Employment Rate', value: `${course.employment}%`, hint: 'Employment within 6 months of graduation.' },
    { label: 'Average Starting Salary', value: course.startingSalary, hint: 'Median starting salary for recent graduates.' },
    { label: 'Study Abroad Option', value: course.studyAbroad ? 'Yes' : 'No', hint: 'Whether a study abroad term is available.' },
    { label: 'Top Industries Graduates Enter', value: course.topIndustries, hint: 'Most common industries for alumni.' },
    { label: 'Placement Year Available?', value: course.placementYear ? 'Yes' : 'No', hint: 'Optional placement/sandwich year.' }
  ];

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 88;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-screen-2xl space-y-10 px-4 pb-16 pt-28 md:px-8 lg:px-12">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Explore', href: '/university-search/search' },
            { label: course.title }
          ]}
          className="text-xs text-muted-foreground"
        />
        <ContextChip contextSource={contextSource} />
        <div id="overview" className="scroll-mt-24">
          <Hero
            shortlisted={shortlisted}
            onShortlist={() => setShortlisted(!shortlisted)}
            meta={heroMeta}
            universityHref={universityHref}
            backHref={backHref}
            backLabel={backLabel}
          />
        </div>

        <InPageNav items={sectionNav} activeId={activeSection} onNavigate={handleNavigate} />

        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <QuickActions shortlisted={shortlisted} applyUrl={course.applyUrl} courseUrl={course.courseUrl} onShortlist={() => setShortlisted(!shortlisted)} />
            <Card className="border-border bg-card shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <CardContent className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Key facts</p>
                <div className="space-y-3">
                  {course.quickFacts.map((fact) => (
                    <div key={fact.label} className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="text-muted-foreground">{fact.label}</span>
                      <span className="font-semibold text-foreground">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Section id="metrics" title="Course key metrics" description="A quick snapshot of outcomes and rankings.">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {metricCards.map((metric) => (
                <Card
                  key={metric.label}
                  className="border-border bg-card text-foreground shadow-[0_18px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]"
                >
                  <CardContent className="space-y-2 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground" title={metric.hint}>
                      {metric.label}
                    </p>
                    <p className="text-lg font-semibold text-foreground">{metric.value}</p>
                    {metric.label === 'Student Satisfaction (NSS)' ? (
                      <ProgressBar value={course.satisfaction} />
                    ) : metric.label === 'Graduate Employment Rate' ? (
                      <ProgressBar value={course.employment} />
                    ) : metric.label === 'Study Abroad Option' ? (
                      <Pill label={course.studyAbroad ? 'Available' : 'No'} />
                    ) : metric.label === 'Placement Year Available?' ? (
                      <Pill label={course.placementYear ? 'Yes' : 'No'} />
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section id="requirements" title="Entry requirements" description="Understand what you need to apply.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {course.entryRequirements.map((item) => (
                <Card
                  key={item.label}
                  className="border-border bg-card text-foreground shadow-[0_18px_35px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]"
                >
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
                      <item.icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section id="cohort" title="Cohort information" description="Who you will study with.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {course.cohort.map((item) => (
                <Card
                  key={item.label}
                  className="border-border bg-card text-foreground shadow-[0_18px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]"
                >
                  <CardContent className="space-y-1 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold text-foreground">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section id="modules" title="Modules" description="View the curriculum across all years.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {course.modules.map((module, index) => (
                <Card
                  key={module.title}
                  className="border-border bg-card text-foreground shadow-[0_18px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]"
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                        <module.icon size={18} />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{module.title}</p>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {module.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <ModuleIcon label={item} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {index === course.modules.length - 1 ? <Pill label="Choose 2+" /> : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section id="apply" title="Application information" description="Find out how to apply to this program.">
            <div className="grid gap-6 lg:grid-cols-[1.15fr,1fr]">
              <Card className="border-border bg-muted/60 text-foreground shadow-[0_20px_55px_rgba(15,23,42,0.1)]">
                <CardHeader className="border-b border-border/70">
                  <CardTitle className="text-2xl text-foreground">Application Information</CardTitle>
                  <p className="text-sm text-muted-foreground">Find out how to apply to this program.</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-6">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link
                      href={course.applyUrl ?? '#'}
                      aria-disabled={!course.applyUrl}
                      tabIndex={course.applyUrl ? 0 : -1}
                      className={!course.applyUrl ? 'pointer-events-none opacity-70' : undefined}
                    >
                      Apply Now
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full"
                  >
                    <Link
                      href={course.courseUrl ?? '#'}
                      aria-disabled={!course.courseUrl}
                      tabIndex={course.courseUrl ? 0 : -1}
                      className={!course.courseUrl ? 'pointer-events-none opacity-70' : undefined}
                    >
                      Visit Course Page
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {course.applicationCards.map((card) => (
                  <Card
                    key={card.title}
                    className="border-border bg-card text-foreground shadow-[0_16px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]"
                  >
                    <CardContent className="flex items-start justify-between gap-3 p-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                          <p className="text-sm font-semibold text-foreground">{card.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{card.body}</p>
                      <Link
                        href={card.href}
                        className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground underline-offset-4 hover:underline"
                      >
                        {card.linkLabel}
                      </Link>
                    </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ApplicationChecklist steps={course.applicationChecklist} />
            </div>
          </Section>
        </div>
      </div>
      <StickyActionBar
        show={showActionBar}
        shortlisted={shortlisted}
        onShortlist={() => setShortlisted(!shortlisted)}
        applyUrl={course.applyUrl}
        courseUrl={course.courseUrl}
      />
    </div>
  );
}

const QuickActions = ({
  shortlisted,
  applyUrl,
  courseUrl,
  onShortlist
}: {
  shortlisted: boolean;
  applyUrl?: string;
  courseUrl?: string;
  onShortlist: () => void;
}) => {
  return (
    <Card className="border-border bg-card text-foreground shadow-[0_22px_50px_rgba(15,23,42,0.12)]">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Quick actions</p>
          <p className="text-sm text-muted-foreground">Keep key links and actions in reach while you scan details.</p>
        </div>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link
              href={applyUrl ?? '#'}
              aria-disabled={!applyUrl}
              tabIndex={applyUrl ? 0 : -1}
              className={!applyUrl ? 'pointer-events-none opacity-70' : undefined}
            >
              Apply now
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link
              href={courseUrl ?? '#'}
              aria-disabled={!courseUrl}
              tabIndex={courseUrl ? 0 : -1}
              className={!courseUrl ? 'pointer-events-none opacity-70' : undefined}
            >
              Visit course page
            </Link>
          </Button>
          <Button
            variant="secondary"
            className="w-full hover:-translate-y-0.5"
            onClick={onShortlist}
            aria-pressed={shortlisted}
          >
            {shortlisted ? 'Shortlisted' : 'Add to shortlist'}
          </Button>
          <Button variant="soft" className="w-full hover:-translate-y-0.5" asChild>
            <Link href="#" className="flex items-center justify-center gap-2">
              <Link2 size={16} />
              Share course
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ApplicationChecklist = ({ steps }: { steps: ApplicationStep[] }) => {
  return (
    <Card className="border-border bg-card text-foreground shadow-[0_18px_35px_rgba(15,23,42,0.08)]">
      <CardHeader className="border-b border-border/70">
        <CardTitle className="text-xl text-foreground">Application checklist</CardTitle>
        <p className="text-sm text-muted-foreground">Track progress and key deadlines.</p>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {steps.map((step) => (
          <div key={step.label} className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/50 p-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              {step.due ? <p className="text-xs text-muted-foreground">Due: {step.due}</p> : null}
              {step.href ? (
                <Link href={step.href} className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground underline-offset-4 hover:underline">
                  View guidance
                </Link>
              ) : null}
            </div>
            <StatusPill status={step.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const StatusPill = ({ status }: { status: ApplicationStep['status'] }) => {
  const labelMap: Record<ApplicationStep['status'], string> = {
    done: 'Done',
    in_progress: 'In progress',
    not_started: 'Not started'
  };
  const colorMap: Record<ApplicationStep['status'], string> = {
    done: 'bg-green-100 text-green-800 border-green-200',
    in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
    not_started: 'bg-muted text-foreground border-border'
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${colorMap[status]}`}>
      {labelMap[status]}
    </span>
  );
};

const InPageNav = ({ items, activeId, onNavigate }: { items: { id: string; label: string }[]; activeId: string; onNavigate: (id: string) => void }) => {
  return (
    <nav className="sticky top-20 z-20 -mb-4 overflow-hidden rounded-xl border border-border bg-background/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
              }`}
              aria-current={isActive ? 'true' : 'false'}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const StickyActionBar = ({
  show,
  shortlisted,
  onShortlist,
  applyUrl,
  courseUrl
}: {
  show: boolean;
  shortlisted: boolean;
  onShortlist: () => void;
  applyUrl?: string;
  courseUrl?: string;
}) => {
  if (!show) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-30 w-[min(960px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-border bg-background/95 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.2)] backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild className="min-w-[160px] flex-1">
          <Link
            href={applyUrl ?? '#'}
            aria-disabled={!applyUrl}
            tabIndex={applyUrl ? 0 : -1}
            className={!applyUrl ? 'pointer-events-none opacity-70' : undefined}
          >
            Apply now
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-w-[160px] flex-1">
          <Link
            href={courseUrl ?? '#'}
            aria-disabled={!courseUrl}
            tabIndex={courseUrl ? 0 : -1}
            className={!courseUrl ? 'pointer-events-none opacity-70' : undefined}
          >
            Visit course page
          </Link>
        </Button>
        <Button
          aria-pressed={shortlisted}
          onClick={onShortlist}
          className={`min-w-[130px] ${shortlisted ? 'opacity-90' : ''}`}
        >
          {shortlisted ? 'Shortlisted' : 'Add to shortlist'}
        </Button>
      </div>
    </div>
  );
};

const ContextChip = ({ contextSource }: { contextSource: string }) => {
  if (contextSource === 'direct') return null;
  const label =
    contextSource === 'search'
      ? 'Back to search — your filters are saved'
      : 'Back to university page — your context is saved';
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
      <Globe2 size={14} className="text-muted-foreground" />
      <span>{label}</span>
    </div>
  );
};

const MissingCourse = ({ backHref, backLabel }: { backHref: string; backLabel: string }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-screen-md space-y-6 px-4 pb-16 pt-28 md:px-8">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Explore', href: '/university-search/search' },
            { label: 'Course not found' }
          ]}
          className="text-xs text-muted-foreground"
        />
        <Card className="border-border bg-card text-foreground shadow-[0_22px_55px_rgba(15,23,42,0.12)]">
          <CardContent className="space-y-4 p-8 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-muted px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Missing course
            </div>
            <h1 className="text-3xl font-semibold text-foreground">We couldn&apos;t find that course</h1>
            <p className="text-sm text-muted-foreground">
              The program link may be outdated. Head back to explore other universities or return to your dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="sm">
                <Link href={backHref}>{backLabel}</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/university-search/search">Browse universities</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProgressBar = ({ value }: { value: number }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
      <span>Score</span>
      <span className="font-semibold text-foreground">{value}%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  </div>
);

const Pill = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground">
    {label}
  </span>
);

const ModuleIcon = ({ label }: { label: string }) => {
  const normalized = label.toLowerCase();
  if (normalized.includes('programming') || normalized.includes('web')) {
    return <Laptop size={14} className="text-muted-foreground" />;
  }
  if (normalized.includes('data structure') || normalized.includes('data ')) {
    return <Layers size={14} className="text-muted-foreground" />;
  }
  if (normalized.includes('algorithm')) {
    return <Workflow size={14} className="text-muted-foreground" />;
  }
  if (normalized.includes('ml') || normalized.includes('machine learning')) {
    return <Brain size={14} className="text-muted-foreground" />;
  }
  if (normalized.includes('security')) {
    return <ShieldCheck size={14} className="text-muted-foreground" />;
  }
  if (normalized.includes('system')) {
    return <Code size={14} className="text-muted-foreground" />;
  }
  if (normalized.includes('design')) {
    return <Presentation size={14} className="text-muted-foreground" />;
  }
  if (normalized.includes('econom') || normalized.includes('ethics')) {
    return <BookOpen size={14} className="text-muted-foreground" />;
  }
  if (normalized.includes('science')) {
    return <BarChart3 size={14} className="text-muted-foreground" />;
  }
  return <BookOpen size={14} className="text-muted-foreground" />;
};

const Hero = ({
  shortlisted,
  onShortlist,
  meta,
  backHref,
  backLabel,
  universityHref
}: {
  shortlisted: boolean;
  onShortlist: () => void;
  meta: { title: string; university: string; location: string };
  backHref: string;
  backLabel: string;
  universityHref: string;
}) => {
  return (
    <Card className="border-border bg-card text-foreground shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-5 p-6 md:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground transition hover:border-primary/60 hover:bg-muted hover:text-foreground"
          >
            <Globe2 size={14} />
            {backLabel}
          </Link>
        </div>
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            <span>Course</span>
            <span className="text-foreground">Overview</span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground md:text-5xl">{meta.title}</h1>
          <p className="text-lg text-muted-foreground">{meta.university}</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
              <Globe2 size={16} className="text-muted-foreground" />
              <span>{meta.location}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onShortlist}
                className={`bg-primary text-primary-foreground shadow-[0_20px_55px_rgba(99,102,241,0.16)] hover:bg-primary/90 ${
                  shortlisted ? 'opacity-90' : ''
                }`}
                aria-pressed={shortlisted}
                aria-label={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
              >
                <BookmarkPlus size={16} className="mr-2" />
                {shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Course</span>
            <Link
              href={universityHref}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:bg-muted hover:text-foreground"
            >
              University
            </Link>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            <span>Fall 2025</span>
            <span className="text-foreground">Open</span>
          </span>
        </div>
        <div className="h-[3px] w-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary opacity-80" />
        <p className="text-sm text-muted-foreground">
          Scan every key signal for this course: rankings, requirements, cohort makeup, modules, and how to apply.
        </p>
      </CardContent>
    </Card>
  );
};

const Section = ({ id, title, description, children }: { id?: string; title: string; description: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-24 space-y-6">
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{title}</p>
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-foreground md:text-[34px]">{title}</h2>
        <p className="text-base text-muted-foreground md:text-lg">{description}</p>
      </div>
    </div>
    <Card className="overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
      <div className="h-1 w-full bg-gradient-to-r from-muted via-background to-muted" />
      <CardContent className="space-y-8 p-6 lg:p-8">{children}</CardContent>
    </Card>
  </section>
);
