'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
  Users
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type IconType = (props: { className?: string; size?: number }) => JSX.Element;

type EntryRequirement = { label: string; value: string; icon: IconType };
type CohortFact = { label: string; value: string };
type ModuleGroup = { title: string; items: string[]; icon: IconType };
type QuickFact = { label: string; value: string };
type ApplicationCard = { title: string; body: string; linkLabel: string; href: string };

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
  const [activeTab, setActiveTab] = useState<'course' | 'university'>('course');
  const [shortlisted, setShortlisted] = useState(false);

  const course = useMemo(() => {
    const match = courseDataset.find((item) => item.id === params.id);
    return match ?? courseDataset[0];
  }, [params.id]);

  const heroMeta = {
    title: course.title,
    university: course.university,
    location: course.location
  };

  const metricCards = [
    { label: 'Acceptance Rate', value: course.acceptanceRate },
    { label: 'Guardian Rank', value: course.guardianRank },
    { label: 'QS Rank', value: course.qsRank },
    { label: 'Times Rank', value: course.timesRank },
    { label: 'Student Satisfaction (NSS)', value: `${course.satisfaction}%` },
    { label: 'Graduate Employment Rate', value: `${course.employment}%` },
    { label: 'Average Starting Salary', value: course.startingSalary },
    { label: 'Study Abroad Option', value: course.studyAbroad ? 'Yes' : 'No' },
    { label: 'Top Industries Graduates Enter', value: course.topIndustries },
    { label: 'Placement Year Available?', value: course.placementYear ? 'Yes' : 'No' }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-screen-2xl space-y-10 px-4 py-10 md:px-8 lg:px-12">
        <Hero activeTab={activeTab} onTabChange={setActiveTab} shortlisted={shortlisted} onShortlist={() => setShortlisted(!shortlisted)} meta={heroMeta} />

        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <QuickActions shortlisted={shortlisted} applyUrl={course.applyUrl} courseUrl={course.courseUrl} />
            <Card className="border-slate-100 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <CardContent className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Key facts</p>
                <div className="space-y-3">
                  {course.quickFacts.map((fact) => (
                    <div key={fact.label} className="flex items-center justify-between text-sm text-slate-700">
                      <span className="text-slate-500">{fact.label}</span>
                      <span className="font-semibold text-slate-900">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Section title="Course key metrics" description="A quick snapshot of outcomes and rankings.">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {metricCards.map((metric) => (
                <Card
                  key={metric.label}
                  className="border-slate-100 bg-white shadow-[0_18px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]"
                >
                  <CardContent className="space-y-2 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{metric.value}</p>
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

          <Section title="Entry requirements" description="Understand what you need to apply.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {course.entryRequirements.map((item) => (
                <Card
                  key={item.label}
                  className="border-slate-100 bg-white shadow-[0_18px_35px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]"
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                      <item.icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Cohort information" description="Who you will study with.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {course.cohort.map((item) => (
                <Card
                  key={item.label}
                  className="border-slate-100 bg-white shadow-[0_18px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]"
                >
                  <CardContent className="space-y-1 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Modules" description="View the curriculum across all years.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {course.modules.map((module, index) => (
                <Card
                  key={module.title}
                  className="border-slate-100 bg-white shadow-[0_18px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]"
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                        <module.icon size={18} />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{module.title}</p>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
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

          <Section title="Application information" description="Find out how to apply to this program.">
            <div className="grid gap-6 lg:grid-cols-[1.15fr,1fr]">
              <Card className="border-slate-100 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.1)]">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">Application Information</CardTitle>
                  <p className="text-sm text-slate-600">Find out how to apply to this program.</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-6">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-slate-900 text-slate-900 hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white"
                  >
                    <Link href={course.applyUrl ?? '#'}>Apply Now</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-slate-900 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-black"
                  >
                    <Link href={course.courseUrl ?? '#'}>Visit Course Page</Link>
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {course.applicationCards.map((card) => (
                  <Card
                    key={card.title}
                    className="border-slate-100 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]"
                  >
                    <CardContent className="flex items-start justify-between gap-3 p-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                        <p className="text-sm text-slate-600">{card.body}</p>
                      </div>
                      <Link
                        href={card.href}
                        className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-900 underline-offset-4 hover:underline"
                      >
                        {card.linkLabel}
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

const QuickActions = ({ shortlisted, applyUrl, courseUrl }: { shortlisted: boolean; applyUrl?: string; courseUrl?: string }) => {
  return (
    <Card className="border-slate-100 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.12)]">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Quick actions</p>
          <p className="text-sm text-slate-600">Keep key links and actions in reach while you scan details.</p>
        </div>
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-slate-900 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-black"
          >
            <Link href={applyUrl ?? '#'}>Apply now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-slate-900 text-slate-900 hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white"
          >
            <Link href={courseUrl ?? '#'}>Visit course page</Link>
          </Button>
          <Button variant="secondary" className="w-full hover:-translate-y-0.5">
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

const ProgressBar = ({ value }: { value: number }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
      <span>Score</span>
      <span className="font-semibold text-slate-800">{value}%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-slate-900 transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  </div>
);

const Pill = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white">
    {label}
  </span>
);

const ModuleIcon = ({ label }: { label: string }) => {
  const normalized = label.toLowerCase();
  if (normalized.includes('programming') || normalized.includes('web')) {
    return <Laptop size={14} className="text-slate-700" />;
  }
  if (normalized.includes('data structure') || normalized.includes('data ')) {
    return <Layers size={14} className="text-slate-700" />;
  }
  if (normalized.includes('algorithm')) {
    return <Workflow size={14} className="text-slate-700" />;
  }
  if (normalized.includes('ml') || normalized.includes('machine learning')) {
    return <Brain size={14} className="text-slate-700" />;
  }
  if (normalized.includes('security')) {
    return <ShieldCheck size={14} className="text-slate-700" />;
  }
  if (normalized.includes('system')) {
    return <Code size={14} className="text-slate-700" />;
  }
  if (normalized.includes('design')) {
    return <Presentation size={14} className="text-slate-700" />;
  }
  if (normalized.includes('econom') || normalized.includes('ethics')) {
    return <BookOpen size={14} className="text-slate-700" />;
  }
  if (normalized.includes('science')) {
    return <BarChart3 size={14} className="text-slate-700" />;
  }
  return <BookOpen size={14} className="text-slate-700" />;
};

const Hero = ({
  activeTab,
  onTabChange,
  shortlisted,
  onShortlist,
  meta
}: {
  activeTab: 'course' | 'university';
  onTabChange: (tab: 'course' | 'university') => void;
  shortlisted: boolean;
  onShortlist: () => void;
  meta: { title: string; university: string; location: string };
}) => {
  return (
    <Card className="border-slate-100 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-5 p-6 md:p-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
            <span>Course</span>
            <span className="text-slate-900">Overview</span>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">{meta.title}</h1>
          <p className="text-lg text-slate-700">{meta.university}</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
              <Globe2 size={16} className="text-slate-500" />
              <span>{meta.location}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white">
                Compare
              </Button>
              <Button
                onClick={onShortlist}
                className={`bg-slate-900 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)] hover:bg-black ${
                  shortlisted ? 'opacity-90' : ''
                }`}
              >
                <BookmarkPlus size={16} className="mr-2" />
                {shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['course', 'university'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {tab === 'course' ? 'Course' : 'University'}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const Section = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{title}</p>
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
        <p className="text-base text-slate-600">{description}</p>
      </div>
    </div>
    <Card className="border-slate-100 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
      <CardContent className="space-y-6 p-6 lg:p-8">{children}</CardContent>
    </Card>
  </section>
);
