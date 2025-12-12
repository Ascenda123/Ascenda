'use client';

import { useEffect, useMemo, useState, type ElementType } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2, Dot, GraduationCap, Landmark, Layers, ListChecks, Loader2, MapPin, ShieldCheck, Wallet } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import React from 'react';

type Requirement = { label: string; value: string };
type QuickFact = { label: string; value: string; icon: ElementType };

type CourseView = {
  id: string;
  title: string;
  university: string;
  location: string;
  level?: string | null;
  duration?: string | null;
  intake?: string | null;
  campus?: string | null;
  tuition?: string | null;
  ucasCode?: string | null;
  startDate?: string | null;
  summary?: string | null;
  modules?: string | null;
  assessment?: string | null;
  requirements: Requirement[];
  quickFacts: QuickFact[];
  courseUrl?: string | null;
  applyUrl?: string | null;
};

const normalizeLocation = (city?: string | null, region?: string | null, country?: string | null) =>
  [city, region, country].filter(Boolean).join(', ') || 'Location unavailable';

const buildRequirements = (raw: any): Requirement[] => {
  if (!raw) return [];
  const reqs: Requirement[] = [];
  if (raw.min_ib) reqs.push({ label: 'IB minimum', value: `${raw.min_ib}` });
  if (raw.min_alevel) reqs.push({ label: 'A-Levels', value: raw.min_alevel });
  if (raw.ucas_points) reqs.push({ label: 'UCAS points', value: raw.ucas_points });
  if (raw.subject_requirements) reqs.push({ label: 'Subjects', value: raw.subject_requirements });
  if (raw.entry_requirements_overview) reqs.push({ label: 'Overview', value: raw.entry_requirements_overview });
  if (raw.additional_entry_requirements) reqs.push({ label: 'Additional', value: raw.additional_entry_requirements });
  if (raw.english_requirements) reqs.push({ label: 'English', value: raw.english_requirements });
  if (raw.contextual_admissions) reqs.push({ label: 'Contextual admissions', value: raw.contextual_admissions });
  return reqs;
};

const buildQuickFacts = (course: CourseView): QuickFact[] => {
  const facts: QuickFact[] = [];
  if (course.level) facts.push({ label: 'Level', value: course.level, icon: GraduationCap });
  if (course.duration) facts.push({ label: 'Duration', value: course.duration, icon: CalendarDays });
  if (course.campus) facts.push({ label: 'Campus', value: course.campus, icon: Landmark });
  const tuitionDisplay = course.tuition && course.tuition.trim().length > 0 ? course.tuition : 'Contact university';
  const startRaw = course.startDate?.trim() ?? '';
  const intakeRaw = course.intake?.trim() ?? '';
  const intakeDisplay = intakeRaw.length > 0 ? intakeRaw : 'TBD';
  const showStart = startRaw.length > 0 && startRaw.toLowerCase() !== intakeRaw.toLowerCase();
  const startDisplay = showStart ? startRaw : '';
  facts.push({ label: 'Tuition', value: tuitionDisplay, icon: Wallet });
  facts.push({ label: 'Intake', value: intakeDisplay, icon: CalendarDays });
  if (showStart) {
    facts.push({ label: 'Start date', value: startDisplay, icon: CalendarDays });
  }
  if (course.ucasCode) facts.push({ label: 'UCAS code', value: course.ucasCode, icon: ShieldCheck });
  return facts;
};

const emphasize = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((chunk, idx) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return (
        <strong key={`${chunk}-${idx}`}>
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${chunk}-${idx}`}>{chunk}</React.Fragment>;
  });

const parseTextBlocks = (text?: string | null) => {
  if (!text) return { intro: [] as string[], bullets: [] as string[] };
  const normalized = text.replace(/\r/g, '').trim();
  if (!normalized) return { intro: [], bullets: [] };

  const parts = normalized.split(/\s+-\s+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return { intro: [normalized], bullets: [] };
  }
  const [first, ...rest] = parts;
  return { intro: [first], bullets: rest };
};

const splitSentences = (text: string) => {
  // 1. Split by explicit delimiters first (bullets, numbered lists)
  const lines = text
    .split(/(?:^|\n)\s*(?:[•\-*]|\d+\.)\s+/m)
    .map((s) => s.trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  // 2. If no bullets, try splitting by semicolons if there are multiple
  if (text.includes(';')) {
    const parts = text.split(';').map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) return parts;
  }

  // 3. Fallback: Split by sentence endings, but keep them together if short
  // This regex looks for [.!?] followed by space and a capital letter.
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const renderRichText = (text?: string | null, options?: { forceBullets?: boolean }) => {
  const { forceBullets = false } = options ?? {};
  const { intro, bullets } = parseTextBlocks(text);
  const fallbackSentences = forceBullets && text ? splitSentences(text.replace(/\r/g, '')) : [];
  const hasContent = intro.length || bullets.length || fallbackSentences.length;

  if (!hasContent) return <p className="text-muted-foreground">No information available.</p>;

  const finalIntro = intro;
  const finalBullets = bullets.length ? bullets : fallbackSentences;

  return (
    <div className="space-y-3">
      {intro.map((para, idx) => (
        <p key={`intro-${idx}`} className="text-foreground/85 leading-relaxed">
          {emphasize(para)}
        </p>
      ))}
      {finalBullets.length ? (
        <ul className="space-y-3 not-prose">
          {finalBullets.map((item, idx) => (
            <li key={`bullet-${idx}`} className="flex items-start gap-3">
              <span className="mt-2.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
              <span className="text-foreground/85 leading-relaxed">{emphasize(item)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

const extractBulletItems = (text?: string | null) => {
  const { intro, bullets } = parseTextBlocks(text);
  if (bullets.length) return bullets;
  if (intro.length > 1) return intro;
  if (text) return splitSentences(text);
  return [];
};

const extractYearSections = (modules?: string | null, durationText?: string | null) => {
  if (!modules) return [];
  const normalized = modules.replace(/\r/g, '\n').trim(); // Keep newlines for structure
  if (!normalized) return [];

  // Regex to find "Year X" or "Stage X" headers
  // We look for "Year" followed by a number, optionally followed by a colon or newline
  // Use word boundary \b to match "Year 1" even if inline without punctuation
  const yearPattern = /\b(?:Year|Stage)\s*(\d+)(?:\s*[:\-])?/gi;

  const sections: { title: string; items: string[] }[] = [];
  let match: RegExpExecArray | null;
  const indices: { title: string; start: number; endHeader: number }[] = [];

  while ((match = yearPattern.exec(normalized)) !== null) {
    indices.push({
      title: `Year ${match[1]}`,
      start: match.index,
      endHeader: match.index + match[0].length
    });
  }

  if (!indices.length) {
    // No explicit years found, treat whole text as one block (or try to parse list)
    const items = splitSentences(normalized);
    return items.length ? [{ title: 'Modules', items, yearNum: null }] : [];
  }

  indices.forEach((entry, idx) => {
    // Content starts after the header
    const contentStart = entry.endHeader;
    // Content ends at the start of the next header, or end of string
    const contentEnd = idx + 1 < indices.length ? indices[idx + 1].start : normalized.length;

    let content = normalized.slice(contentStart, contentEnd).trim();

    // Clean up leading punctuation often left after "Year 1:"
    content = content.replace(/^[:\-\s]+/, '');

    if (!content) return;

    const items = splitSentences(content);
    if (items.length) {
      sections.push({ title: entry.title, items });
    }
  });

  // Merge duplicate years
  const mergedByYear = new Map<number, string[]>();
  const extras: { title: string; items: string[] }[] = [];

  const getYearNum = (t: string) => parseInt(t.replace(/\D/g, ''), 10);

  sections.forEach((section) => {
    const yr = getYearNum(section.title);
    if (!isNaN(yr)) {
      const existing = mergedByYear.get(yr) ?? [];
      mergedByYear.set(yr, [...existing, ...section.items]);
    } else {
      extras.push(section);
    }
  });

  const mergedSections = [
    ...Array.from(mergedByYear.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([yearNum, items]) => ({
        title: `Year ${yearNum}`,
        yearNum,
        items: Array.from(new Set(items)) // Dedupe items
      })),
    ...extras.map(s => ({ ...s, yearNum: null }))
  ];

  // Logic to filter out years beyond duration (same as before)
  const parseDurationCount = (text?: string | null) => {
    if (!text) return null;
    const m = text.match(/(\d+(?:\.\d+)?)/);
    return m ? Math.round(parseFloat(m[1])) : null;
  };

  const maxYears = parseDurationCount(durationText);
  if (maxYears) {
    return mergedSections
      .filter((section) => section.yearNum === null || section.yearNum <= maxYears)
      .sort((a, b) => {
        if (a.yearNum === null || b.yearNum === null) return 0;
        return a.yearNum - b.yearNum;
      });
  }

  return mergedSections;
};

const RequirementRenderer = ({ value }: { value: string }) => {
  // 1. Split Standard vs Contextual
  // Some descriptions combine both. We try to split them.
  const parts = value.split(/Typical Contextual Offer:|Contextual Offer:/i);
  const standard = parts[0].trim();
  const contextual = parts.length > 1 ? parts[1].trim() : null;

  const renderList = (text: string, title?: string) => {
    if (!text) return null;

    // Remove any leading "Typical Offer:" or similar prefixes if they exist redundantly
    const cleanText = text.replace(/^(Typical Offer:|Entry Requirements:)/i, '').trim();

    // Heuristic for splitting into a list:
    // 1. Semicolons are strong separators.
    // 2. If no semicolons, maybe split by sentences if it's long?
    // 3. Or if it contains bullet-like chars.

    let items: string[] = [];

    if (cleanText.includes(';')) {
      items = cleanText.split(';').map(s => s.trim()).filter(Boolean);
    } else if (cleanText.includes('•') || cleanText.includes('- ')) {
      items = cleanText.split(/[•-]/).map(s => s.trim()).filter(Boolean);
    } else {
      // Fallback: If it's a long paragraph (> 150 chars) with multiple sentences,
      // split by period to make it digestible.
      // But preserve "A.B." acronyms: Look for period followed by space and capital letter.
      if (cleanText.length > 150) {
        items = cleanText.split(/(?<=\.)\s+(?=[A-Z])/).map(s => s.trim()).filter(Boolean);
      } else {
        items = [cleanText];
      }
    }

    // Clean up items (remove trailing periods inside list items usually looks cleaner, or keep them)
    // We'll keep them to be safe.

    return (
      <div className="space-y-3">
        {title && (
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary/80">
            <span className="h-px w-4 bg-primary/40"></span>
            {title}
          </h4>
        )}

        {items.length === 1 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {emphasize(items[0])}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-1">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 text-sm transition-colors hover:bg-muted/40">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <span className="text-foreground/90 leading-relaxed">{emphasize(item)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderList(standard)}
      {contextual && (
        <>
          {renderList(contextual, 'Contextual Offer')}
        </>
      )}
    </div>
  );
};

export default function CoursePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [course, setCourse] = useState<CourseView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllFlatModules, setShowAllFlatModules] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  const backHref = useMemo(() => {
    const from = searchParams.get('from');
    if (from === 'search') return '/university-search/results';
    if (from === 'university') return '/university-search/search';
    return '/dashboard';
  }, [searchParams]);

  const moduleItems = useMemo(() => extractBulletItems(course?.modules), [course?.modules]);
  const moduleYearSections = useMemo(
    () => extractYearSections(course?.modules, course?.duration),
    [course?.modules, course?.duration]
  );
  const visibleModules = showAllFlatModules ? moduleItems : moduleItems.slice(0, 8);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = getBrowserSupabaseClient();
        const { data, error: supabaseError } = await supabase
          .from('programs')
          .select(
            `
            *,
            universities (
              name,
              city,
              region,
              country
            )
          `
          )
          .eq('id', params.id)
          .maybeSingle();

        if (supabaseError) throw supabaseError;
        if (!data) {
          setError('Course not found.');
          return;
        }

        const uni = (data as any).universities ?? {};
        const location = normalizeLocation(uni.city, uni.region, uni.country);
        const duration = data.duration || null;
        const intake = data.start_date || null;
        const tuition = data.tuition_fees_international || data.tuition_fees_home || null;

        const mapped: CourseView = {
          id: data.id,
          title: (data as any).course_name,
          university: uni.name ?? 'University',
          location,
          level: data.study_level ?? null,
          duration,
          intake,
          campus: data.campus ?? null,
          tuition,
          ucasCode: data.ucas_code ?? null,
          startDate: data.start_date ?? null,
          summary: data.course_summary ?? null,
          modules: data.modules ?? null,
          assessment: data.assessment_methods ?? null,
          requirements: buildRequirements(data),
          quickFacts: [],
          courseUrl: data.provider_course_url ?? null,
          applyUrl: data.provider_apply_url ?? null
        };

        mapped.quickFacts = buildQuickFacts(mapped);
        setCourse(mapped);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load this course.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  const [activeTab, setActiveTab] = useState('overview');

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'curriculum', label: 'Curriculum', icon: Layers },
    { id: 'requirements', label: 'Requirements', icon: ListChecks },
    { id: 'assessment', label: 'Assessment', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pb-24">
        {/* Hero Section */}
        <div className="relative border-b border-border/40 bg-muted/10">
          <div className="absolute inset-0 bg-gradient-to-b from-background/5 to-background/60" />
          <div className="relative z-10 w-full px-4 py-12 sm:px-6 lg:px-10">
            <Breadcrumbs className="mb-8" />

            <div className="mb-8 flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
                <Link href={backHref}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to results
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading course…
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : course ? (
              <div className="space-y-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest text-primary">
                        {course.university}
                      </p>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                      {course.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{course.location}</span>
                      </div>
                      {course.ucasCode && (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          <span>UCAS: {course.ucasCode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {course.courseUrl && (
                      <Button asChild variant="outline" size="lg" className="h-12 px-6">
                        <Link href={course.courseUrl} target="_blank" rel="noreferrer">
                          Visit Website
                        </Link>
                      </Button>
                    )}
                    {course.applyUrl && (
                      <Button asChild size="lg" className="h-12 px-8 shadow-lg shadow-primary/20">
                        <Link href={course.applyUrl} target="_blank" rel="noreferrer">
                          Apply Now
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Highlights Bar */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {course.quickFacts.map((fact) => (
                    <div key={fact.label} className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card/50 p-4 transition-colors hover:bg-card">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <fact.icon className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{fact.label}</span>
                      </div>
                      <p className="font-semibold text-foreground">{fact.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {course && !loading && !error && (
          <>
            {/* Sticky Tabs Navigation */}
            <div className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-md">
              <div className="w-full px-4 sm:px-6 lg:px-10">
                <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="w-full px-4 py-12 sm:px-6 lg:px-10 min-h-[500px]">

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  {/* Summary Text */}
                  <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Course Overview</h2>
                    <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                      {renderRichText(course.summary)}
                    </div>
                  </div>

                  {/* At a Glance Dashboard */}
                  <div className="grid gap-6 md:grid-cols-2">

                    {/* Requirements Preview */}
                    <div
                      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/60 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                      onClick={() => setActiveTab('requirements')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <ListChecks className="h-5 w-5 text-primary" />
                          Entry Requirements
                        </h3>
                        <ArrowLeft className="h-4 w-4 rotate-180 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                      </div>
                      <div className="space-y-3">
                        {/* Show top 3 short requirements */}
                        {course.requirements.slice(0, 3).map((r, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{r.label}</span>
                            <span className="font-medium text-foreground truncate max-w-[120px]">{r.value}</span>
                          </div>
                        ))}
                        {course.requirements.length === 0 && <p className="text-sm text-muted-foreground italic">View requirements details...</p>}
                      </div>
                      <div className="mt-4 text-xs font-bold text-primary uppercase tracking-wider">View Full Details</div>
                    </div>

                    {/* Curriculum Preview */}
                    <div
                      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/60 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                      onClick={() => setActiveTab('curriculum')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Layers className="h-5 w-5 text-primary" />
                          Curriculum
                        </h3>
                        <ArrowLeft className="h-4 w-4 rotate-180 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {course.modules ? course.modules.slice(0, 150) + "..." : "Explore the modules and subjects you will study."}
                        </p>
                      </div>
                      <div className="mt-4 text-xs font-bold text-primary uppercase tracking-wider">View Modules</div>
                    </div>

                  </div>
                </div>
              )}

              {/* Curriculum Tab */}
              {activeTab === 'curriculum' && (
                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Course Curriculum</h2>
                    {moduleItems.length > 8 && !moduleYearSections.length && (
                      <Button
                        variant="outline"
                        onClick={() => setShowAllFlatModules(!showAllFlatModules)}
                      >
                        {showAllFlatModules ? 'Show Less' : 'Show All'}
                      </Button>
                    )}
                  </div>

                  {moduleYearSections.length ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {moduleYearSections.map((section, idx) => (
                        <Card key={idx} className="overflow-hidden border-border/60 bg-card hover:shadow-md transition-all">
                          <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center gap-3 text-lg">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                                {section.yearNum ?? idx + 1}
                              </div>
                              {section.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <ul className="divide-y divide-border/40">
                              {section.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
                                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                                  <span className="text-sm text-foreground/80 leading-relaxed">{emphasize(item)}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : moduleItems.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {(showAllFlatModules ? moduleItems : moduleItems.slice(0, 9)).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/40 transition-colors">
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="text-sm font-medium text-foreground/90 leading-relaxed">{emphasize(item)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-border/60 bg-card p-8">
                      <p className="text-muted-foreground italic">No specific curriculum modules available for this course.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Requirements Tab */}
              {activeTab === 'requirements' && (
                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold">Entry Requirements</h2>

                  {/* 1. Key Metrics Row (Grades, Points - things that are short) */}
                  {course.requirements.some(r => ['IB minimum', 'A-Levels', 'UCAS points'].includes(r.label)) && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {course.requirements
                        .filter(req => ['IB minimum', 'A-Levels', 'UCAS points'].includes(req.label))
                        .map((req, idx) => {
                          const separator = req.value.match(/[,;]/);
                          const splitIndex = separator ? separator.index : -1;

                          const headline = splitIndex !== -1 ? req.value.substring(0, splitIndex) : req.value;
                          const rawSubtext = splitIndex !== -1 ? req.value.substring(splitIndex! + 1).trim() : null;

                          // Parse subtext into list items
                          // Split by semicolon or comma to create a clean list
                          const subtextItems = rawSubtext
                            ? rawSubtext.split(/;|(?<=\w), /)
                              .map(s => s.trim())
                              .filter(s => s.length > 0)
                            : [];

                          return (
                            <Card key={idx} className="border-border/60 bg-primary/5 border-primary/20">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                                  {req.label}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="text-2xl font-bold text-foreground">
                                  {headline}
                                </div>
                                {subtextItems.length > 0 && (
                                  <ul className="space-y-1">
                                    {subtextItems.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2 text-xs font-medium text-muted-foreground leading-snug">
                                        <div className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  )}

                  {/* 2. Detailed Requirements (Subjects, Overview, English, etc.) */}
                  <div className="space-y-4">
                    {course.requirements
                      .filter(req => !['IB minimum', 'A-Levels', 'UCAS points'].includes(req.label))
                      .map((req, idx) => (
                        <div key={idx} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                          <div className="border-b border-border/40 bg-muted/30 px-6 py-4">
                            <h3 className="font-semibold text-foreground">{req.label}</h3>
                          </div>
                          <div className="p-6">
                            <RequirementRenderer value={req.value} />
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Fallback */}
                  {course.requirements.length === 0 && (
                    <div className="rounded-3xl border border-border/60 bg-card p-8">
                      <p className="text-muted-foreground italic">No specific entry requirements listed.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Assessment Tab */}
              {activeTab === 'assessment' && (
                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Assessment Methods</h2>
                    {course.assessment ? (
                      <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                        {renderRichText(course.assessment)}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No assessment information available.</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </main>
    </div>
  );
}
