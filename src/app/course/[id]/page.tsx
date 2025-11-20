'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  BookOpen,
  BookmarkPlus,
  CalendarDays,
  Code,
  FileText,
  Globe2,
  Link2,
  Laptop,
  Pencil,
  Plus,
  Presentation,
  Search,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';

const courseMeta = {
  title: 'Bachelor of Science in Computer Science',
  university: 'University of Technology',
  location: 'City, Country'
};

const metrics = [
  { label: 'Acceptance Rate', value: '75%' },
  { label: 'Guardian Rank', value: '100' },
  { label: 'QS Rank', value: '150' },
  { label: 'Times Rank', value: '200' },
  { label: 'Student Satisfaction (NSS)', value: '88%' },
  { label: 'Graduate Employment Rate', value: '90%' },
  { label: 'Average Starting Salary', value: '$50,000' },
  { label: 'Study Abroad Option', value: 'Yes' },
  { label: 'Top Industries Graduates Enter', value: 'Tech, Finance, Educ' },
  { label: 'Placement Year Available?', value: 'Yes' }
];

const entryRequirements = [
  { label: 'IB Score Requirement', value: '30', icon: FileText },
  { label: 'A-Level Requirement', value: 'BBC', icon: Pencil },
  { label: 'Preferred Subjects', value: 'Math, Physics, Computer Science', icon: BookOpen },
  { label: 'English Requirement', value: 'IELTS 6.5', icon: Globe2 },
  { label: 'Admission Tests', value: 'ESAT', icon: Search },
  { label: 'Interview Required?', value: 'No', icon: Users },
  { label: 'UCAS Code', value: 'ABC123', icon: BadgeCheck },
  { label: 'UCAS Deadline', value: 'January 15', icon: CalendarDays }
];

const cohortInfo = [
  { label: 'Intake Size (24/25)', value: '500' },
  { label: 'Class Size Per Year', value: '120' },
  { label: 'Domestic vs International', value: '80:20' },
  { label: 'Students in Department', value: '1,000' }
];

const modules = [
  { title: 'Year 1 Modules', items: ['Introduction to Programming', 'Data Structures'], icon: Laptop },
  { title: 'Year 2 Modules', items: ['Algorithms', 'Software Engineering'], icon: Presentation },
  { title: 'Year 3 Modules', items: ['Machine Learning', 'Web Development'], icon: Code },
  { title: 'Optional Modules', items: ['Data Science', 'Cybersecurity'], icon: Plus }
];

const quickFacts = [
  { label: 'Mode', value: 'On campus' },
  { label: 'Duration', value: '3-4 years' },
  { label: 'Placement year', value: 'Available' },
  { label: 'Start', value: 'September' }
];

const applicationCards = [
  {
    title: 'Official Course Webpage',
    body: 'Visit our official site for detailed information about this course.',
    linkLabel: 'Program',
    href: '#'
  },
  {
    title: 'Direct Apply Option',
    body: 'You can apply directly through our portal.',
    linkLabel: 'Wes',
    href: '#'
  },
  {
    title: 'Additional Requirements',
    body: 'A portfolio is required for design-related modules.',
    linkLabel: 'Helo',
    href: '#'
  },
  {
    title: 'Internal Deadlines',
    body: 'Ensure that your personal statement and references are ready ahead of submission.',
    linkLabel: 'Res',
    href: '#'
  }
];

export default function CoursePage() {
  const [activeTab, setActiveTab] = useState<'course' | 'university'>('course');
  const [shortlisted, setShortlisted] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-screen-2xl space-y-10 px-4 py-10 md:px-8 lg:px-12">
        <Hero
          activeTab={activeTab}
          onTabChange={setActiveTab}
          shortlisted={shortlisted}
          onShortlist={() => setShortlisted(!shortlisted)}
        />

        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <QuickActions shortlisted={shortlisted} />
            <Card className="border-slate-100 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <CardContent className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Key facts</p>
                <div className="space-y-3">
                  {quickFacts.map((fact) => (
                    <div key={fact.label} className="flex items-center justify-between text-sm text-slate-700">
                      <span className="text-slate-500">{fact.label}</span>
                      <span className="font-semibold text-slate-900">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Section title="Course key metrics" subtitle="A quick snapshot of outcomes and rankings.">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {metrics.map((metric) => (
                <Card
                  key={metric.label}
                  className="border-slate-100 bg-white shadow-[0_18px_35px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]"
                >
                  <CardContent className="space-y-2 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{metric.value}</p>
                    {metric.label === 'Student Satisfaction (NSS)' ? (
                      <ProgressBar value={88} />
                    ) : metric.label === 'Graduate Employment Rate' ? (
                      <ProgressBar value={90} />
                    ) : metric.label === 'Study Abroad Option' ? (
                      <Pill label="Available" />
                    ) : metric.label === 'Placement Year Available?' ? (
                      <Pill label="Yes" />
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Entry requirements" subtitle="Understand what you need to apply.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {entryRequirements.map((item) => (
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

          <Section title="Cohort information" subtitle="Who you will study with.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {cohortInfo.map((item) => (
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

          <Section title="Modules" subtitle="View the curriculum across all years.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {modules.map((module, index) => (
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
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {index === modules.length - 1 ? <Pill label="Choose 2+" /> : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Application information" subtitle="Find out how to apply to this program.">
            <div className="grid gap-6 lg:grid-cols-[1.15fr,1fr]">
              <Card className="border-slate-100 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.1)]">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">Application Information</CardTitle>
                  <p className="text-sm text-slate-600">Find out how to apply to this program.</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-6">
                  <Button
                    variant="outline"
                    className="w-full border-slate-900 text-slate-900 hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white"
                  >
                    Apply Now
                  </Button>
                  <Button className="w-full bg-slate-900 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-black">
                    Visit Course Page
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {applicationCards.map((card) => (
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

const QuickActions = ({ shortlisted }: { shortlisted: boolean }) => {
  return (
    <Card className="border-slate-100 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.12)]">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Quick actions</p>
          <p className="text-sm text-slate-600">Keep key links and actions in reach while you scan details.</p>
        </div>
        <div className="space-y-3">
          <Button className="w-full bg-slate-900 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-black">
            Apply now
          </Button>
          <Button variant="outline" className="w-full border-slate-900 text-slate-900 hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white">
            Visit course page
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

const Hero = ({
  activeTab,
  onTabChange,
  shortlisted,
  onShortlist
}: {
  activeTab: 'course' | 'university';
  onTabChange: (tab: 'course' | 'university') => void;
  shortlisted: boolean;
  onShortlist: () => void;
}) => {
  return (
    <Card className="border-slate-100 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-5 p-6 md:p-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
            <span>Course</span>
            <span className="text-slate-900">Overview</span>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">{courseMeta.title}</h1>
          <p className="text-lg text-slate-700">{courseMeta.university}</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex w-full max-w-md items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner shadow-slate-100">
              <Search size={18} className="text-slate-400" />
              <Input
                defaultValue={`University Location: ${courseMeta.location}`}
                readOnly
                className="w-full border-0 bg-transparent text-sm text-slate-800 shadow-none focus-visible:ring-0"
              />
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

const Section = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-600">{subtitle}</p>
    </div>
    {children}
  </section>
);
