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

const splitSentences = (text: string) =>
  text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .flatMap((s) => {
      if (s.length <= 220) return s;
      // If still too long, break on semicolons/commas.
      return s.split(/(?<=;|\.)\s+/).map((p) => p.trim()).filter(Boolean);
    })
    .filter(Boolean);

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
        <ul className="space-y-2">
          {finalBullets.map((item, idx) => (
            <li key={`bullet-${idx}`} className="flex gap-2">
              <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden />
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

const extractYearSections = (modules?: string | null) => {
  if (!modules) return [];
  const normalized = modules.replace(/\r/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const tokens = normalized.split(/(Year\s*\d+)/i).map((t) => t.trim()).filter(Boolean);
  const sections: { title: string; items: string[] }[] = [];

  tokens.forEach((token) => {
    const yearMatch = token.match(/^Year\s*(\d+)/i);
    if (yearMatch) {
      sections.push({ title: `Year ${yearMatch[1]}`, items: [] });
      return;
    }
    if (!sections.length) {
      sections.push({ title: 'Overview', items: splitSentences(token) });
      return;
    }
    sections[sections.length - 1].items.push(...splitSentences(token));
  });

  const hasYear = sections.some((s) => s.title.toLowerCase().startsWith('year'));
  return hasYear ? sections : [];
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
  const moduleYearSections = useMemo(() => extractYearSections(course?.modules), [course?.modules]);
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
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <Breadcrumbs className="mb-6" />

        <div className="mb-6 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">Course overview</p>
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
            <header className="flex flex-col gap-4 rounded-[28px] border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{course.university}</p>
                <h1 className="text-3xl font-semibold">{course.title}</h1>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {course.location}
                </p>
              </div>
              <div className="flex gap-3">
                {course.applyUrl ? (
                  <Button asChild variant="default">
                    <Link href={course.applyUrl} target="_blank" rel="noreferrer">
                      Apply
                    </Link>
                  </Button>
                ) : null}
                {course.courseUrl ? (
                  <Button asChild variant="outline">
                    <Link href={course.courseUrl} target="_blank" rel="noreferrer">
                      Course page
                    </Link>
                  </Button>
                ) : null}
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Entry Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.requirements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No requirements available.</p>
                  ) : (
                    <ul className="space-y-2">
                      {course.requirements.map((item, idx) => (
                        <li key={`${item.label}-${idx}`} className="flex gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
                          <span className="min-w-[120px] font-semibold text-foreground">{item.label}</span>
                          <span className="text-muted-foreground">{item.value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe2 className="h-5 w-5 text-primary" />
                    Quick Facts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.quickFacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No quick facts available.</p>
                  ) : (
                    <ul className="space-y-2">
                      {course.quickFacts.map((fact) => (
                        <li key={fact.label} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                          <fact.icon className="mt-0.5 h-4 w-4 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">{fact.label}</p>
                            <p className="text-muted-foreground">{fact.value}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Course Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm leading-relaxed text-foreground/85">
                  {renderRichText(course.summary)}

                  {course.modules ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Modules</p>
                      {moduleYearSections.length ? (
                        <div className="relative space-y-4">
                          <div className="absolute left-2 top-1 bottom-4 w-px bg-border/80" aria-hidden />
                          {moduleYearSections.map((section, idx) => {
                            const expanded = expandedYears[section.title] ?? false;
                            const items = expanded ? section.items : section.items.slice(0, 4);
                            const canExpand = section.items.length > 4;
                            return (
                              <div key={`yr-${idx}`} className="relative flex gap-4">
                                <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-background shadow-sm" aria-hidden />
                                <div className="w-full rounded-2xl border border-border/70 bg-muted/30 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                    {section.title}
                                  </p>
                                  <ul className="mt-3 space-y-2 text-sm text-foreground/85">
                                    {items.map((item, i) => (
                                      <li key={`yr-${idx}-item-${i}`} className="flex gap-2">
                                        <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                                        <span className="leading-relaxed">{emphasize(item)}</span>
                                      </li>
                                    ))}
                                    {canExpand && section.items.length > items.length ? (
                                      <li className="text-xs text-muted-foreground">+ {section.items.length - items.length} more</li>
                                    ) : null}
                                  </ul>
                                  {canExpand ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setExpandedYears((prev) => ({
                                          ...prev,
                                          [section.title]: !expanded
                                        }))
                                      }
                                      className="mt-3 px-0 text-primary"
                                    >
                                      {expanded ? 'Show fewer' : 'Show all'}
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : moduleItems.length ? (
                        <div className="space-y-3">
                          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {visibleModules.map((item, idx) => (
                              <li
                                key={`module-${idx}`}
                                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground/85"
                              >
                                <span className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-primary/70" aria-hidden />
                                <span className="leading-relaxed">{emphasize(item)}</span>
                              </li>
                            ))}
                          </ul>
                          {moduleItems.length > visibleModules.length ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllFlatModules(true)}
                              className="px-0 text-primary"
                            >
                              Show all modules ({moduleItems.length})
                            </Button>
                          ) : moduleItems.length > 8 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllFlatModules(false)}
                              className="px-0 text-primary"
                            >
                              Show fewer
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        renderRichText(course.modules, { forceBullets: true })
                      )}
                    </div>
                  ) : null}
                  {course.assessment ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Assessment</p>
                      {renderRichText(course.assessment, { forceBullets: true })}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No course data available.
          </div>
        )}
      </main>
    </div>
  );
}
