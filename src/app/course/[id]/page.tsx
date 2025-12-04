'use client';

import { useEffect, useMemo, useState, type ElementType } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, CalendarDays, Globe2, GraduationCap, Landmark, Loader2, MapPin, ShieldCheck, Wallet } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pb-24">
        {/* Hero Section */}
        <div className="relative border-b border-border/40 bg-muted/10">
          <div className="absolute inset-0 bg-gradient-to-b from-background/5 to-background/60" />
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
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
            ) : null}
          </div>
        </div>

        {course && !loading && !error && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              {/* Main Content Column */}
              <div className="lg:col-span-8 space-y-12">

                {/* Overview Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold">Course Overview</h2>
                  </div>
                  <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                    {renderRichText(course.summary)}
                  </div>
                </section>

                {/* Modules Section */}
                {course.modules && (
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <h2 className="text-2xl font-semibold">Course Modules</h2>
                    </div>

                    {moduleYearSections.length ? (
                      <div className="relative space-y-8 pl-4">
                        <div className="absolute left-[27px] top-4 bottom-8 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
                        {moduleYearSections.map((section, idx) => {
                          const expanded = expandedYears[section.title] ?? false;
                          const items = expanded ? section.items : section.items.slice(0, 5);
                          const canExpand = section.items.length > 5;
                          return (
                            <div key={`yr-${idx}`} className="relative group">
                              <div className="flex items-start gap-6">
                                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-all group-hover:border-primary/50 group-hover:shadow-md">
                                  <span className="text-lg font-bold text-primary">{section.yearNum ?? idx + 1}</span>
                                </div>
                                <div className="w-full space-y-4 pt-2">
                                  <h3 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
                                    {section.title}
                                  </h3>
                                  <div className="grid gap-3 grid-cols-1">
                                    {items.map((item, i) => (
                                      <div
                                        key={`yr-${idx}-item-${i}`}
                                        className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                                      >
                                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                                        <span className="text-sm font-medium leading-relaxed">{emphasize(item)}</span>
                                      </div>
                                    ))}
                                  </div>
                                  {canExpand && (
                                    <Button
                                      variant="ghost"
                                      onClick={() =>
                                        setExpandedYears((prev) => ({
                                          ...prev,
                                          [section.title]: !expanded
                                        }))
                                      }
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      {expanded ? 'Show fewer modules' : `Show ${section.items.length - items.length} more modules`}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : moduleItems.length ? (
                      <div className="rounded-3xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
                        <ul className="grid grid-cols-1 gap-4">
                          {visibleModules.map((item, idx) => (
                            <li key={`module-${idx}`} className="flex items-start gap-3 text-foreground/80">
                              <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                              <span className="leading-relaxed">{emphasize(item)}</span>
                            </li>
                          ))}
                        </ul>
                        {moduleItems.length > visibleModules.length && (
                          <Button
                            variant="link"
                            onClick={() => setShowAllFlatModules(true)}
                            className="mt-4 px-0 text-primary"
                          >
                            Show all {moduleItems.length} modules
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="prose prose-neutral dark:prose-invert">
                        {renderRichText(course.modules, { forceBullets: true })}
                      </div>
                    )}
                  </section>
                )}

                {/* Assessment Section */}
                {course.assessment && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-semibold">Assessment</h2>
                    </div>
                    <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                      {renderRichText(course.assessment, { forceBullets: true })}
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-4 space-y-8">
                <div className="sticky top-24 space-y-8">
                  {/* Key Information Card */}
                  <Card className="overflow-hidden border-border/60 shadow-lg">
                    <CardHeader className="bg-muted/30 pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Globe2 className="h-5 w-5 text-primary" />
                        Key Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-6">
                      {course.quickFacts.map((fact) => (
                        <div key={fact.label} className="flex items-center gap-4 rounded-xl border border-border/40 bg-background p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <fact.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground">{fact.label}</p>
                            <p className="font-semibold text-foreground">{fact.value}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Entry Requirements Card */}
                  <Card className="border-border/60">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Entry Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {course.requirements.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No requirements listed.</p>
                      ) : (
                        <ul className="space-y-3">
                          {course.requirements.map((item, idx) => (
                            <li key={`${item.label}-${idx}`} className="space-y-1 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.value}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
