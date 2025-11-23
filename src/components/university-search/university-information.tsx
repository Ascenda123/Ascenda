'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useShortlist } from './shortlist-store';
import { useCompareStore } from './compare-store';

type UniversityData = {
  program: { title?: string | null; level?: string | null; duration?: string | number | null; size?: string | null };
  university: {
    name?: string | null;
    location?: string | null;
    totalStudents?: number | string | null;
    genderRatio?: string | null;
    internationalStudentRatio?: string | null;
    studentStaffRatio?: string | null;
    type?: string | null;
    studyAbroadAvailable?: boolean | null;
  };
  rankings: { guardian?: number | string | null; qs?: number | string | null; times?: number | string | null };
  statistics: { acceptanceRate?: string | number | null; nssScore?: string | number | null; employmentRate?: string | number | null };
  costs: { annualTuition?: string | number | null; dormitoryCost?: string | number | null; averageRent?: string | number | null; livingIndex?: string | number | null };
  experience: {
    culturalEnvironment?: string | null;
    socialLife?: string | null;
    climate?: string | null;
    safetyIndex?: string | number | null;
    airportDistance?: string | null;
    trainStationDistance?: string | null;
    cityCharacteristics?: string | null;
  };
  fitFactors: { insights?: string | null; cityDescription?: string | null };
};

type UniversityInformationProps = {
  universityData?: UniversityData | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
  programId?: string;
  contextSource?: 'course' | 'search' | 'direct';
};

const safeText = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return typeof value === 'number' ? value.toString() : value;
};

const formatRank = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const numeric = typeof value === 'string' ? Number.parseInt(value, 10) : Math.round(value);
  if (Number.isNaN(numeric)) return safeText(value);
  return `#${numeric}`;
};

const formatPercentage = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'string') {
    const cleaned = value.replace('%', '').trim();
    const numeric = Number.parseFloat(cleaned);
    if (Number.isNaN(numeric)) return value;
    return `${numeric}%`;
  }
  const normalized = value > 1 ? value : value * 100;
  return `${Math.round(normalized)}%`;
};

const formatCurrency = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'string') {
    const numeric = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(numeric)) return value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numeric);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const DetailItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</p>
    <p className="text-sm font-semibold text-slate-900">{safeText(value)}</p>
  </div>
);

const Metric = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">{label}</p>
    <p className="mt-1 text-xl font-semibold text-slate-900">{safeText(value)}</p>
  </div>
);

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('h-5 w-full animate-pulse rounded-md bg-slate-200', className)} />
);

export const UniversityInformation = ({
  universityData,
  loading,
  error,
  className,
  programId,
  contextSource = 'direct'
}: UniversityInformationProps) => {
  const { addItem: addShortlist, items: shortlistItems } = useShortlist();
  const { addItem: addCompare, items: compareItems } = useCompareStore();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const canRenderContent = !!universityData && !loading && !error;
  const courseHref = programId ? `/course/${programId}` : undefined;
  const universityHref = programId ? `/university-search/university/${programId}` : undefined;
  const backHref = contextSource === 'course' ? courseHref : contextSource === 'search' ? '/university-search/search' : '/dashboard';
  const backLabel =
    contextSource === 'course' ? 'Back to course' : contextSource === 'search' ? 'Back to search results' : 'Back to dashboard';

  const headerSubtitle = useMemo(() => {
    if (!universityData) return '';
    const parts = [universityData.university?.location].filter(Boolean);
    return parts.join(' • ');
  }, [universityData]);

  const programMeta = useMemo(() => {
    if (!universityData) return '';
    const parts = [universityData.program?.level, universityData.program?.duration, universityData.program?.size].filter(Boolean);
    return parts.join(' | ');
  }, [universityData]);

  const handleShortlist = () => {
    if (!universityData) return;
    const id = `${universityData.program?.title ?? universityData.university?.name ?? 'university'}-shortlist`;
    const already = shortlistItems.some((item) => item.id === id);
    if (already) {
      setStatusMessage('Already on your shortlist.');
      return;
    }
    // Store minimal metadata so shortlist panels can render meaningful text.
    addShortlist({
      id,
      name: universityData.university?.name ?? 'University',
      program: universityData.program?.title ?? 'Program',
      stage: 'Researching',
      fitScore: typeof universityData.statistics?.employmentRate === 'number' ? Math.round(universityData.statistics.employmentRate) : 0,
      nextAction: 'Review university fit and decide next steps.',
      due: 'TBD',
      location: universityData.university?.location ?? undefined
    });
    setStatusMessage('Added to shortlist.');
  };

  const handleCompare = () => {
    if (!universityData) return;
    const id = `${universityData.program?.title ?? universityData.university?.name ?? 'university'}-compare`;
    const already = compareItems.some((item) => item.id === id);
    if (already) {
      setStatusMessage('Already in your compare tray.');
      return;
    }
    addCompare({
      id,
      program: universityData.program?.title ?? 'Program',
      university: universityData.university?.name ?? 'University',
      location: universityData.university?.location ?? undefined,
      guardianRank: universityData.rankings?.guardian ?? null,
      qsRank: universityData.rankings?.qs ?? null,
      timesRank: universityData.rankings?.times ?? null
    });
    setStatusMessage('Added to compare.');
  };

  return (
    <div className={cn('min-h-screen w-full space-y-10 bg-[#f5f5f7] px-4 pb-12 pt-6 md:px-8 lg:px-12', className)}>
      {error ? (
        <Card className="p-6">
          <p className="text-xl font-semibold text-slate-900">We hit a snag loading this university.</p>
          <p className="text-sm text-slate-600">{error}</p>
        </Card>
      ) : null}

      {loading ? (
        <Card className="p-6">
          <div className="space-y-4">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-8 w-2/3" />
            <SkeletonBlock className="h-4 w-1/2" />
            <div className="flex flex-wrap gap-3">
              <SkeletonBlock className="h-10 w-32" />
              <SkeletonBlock className="h-10 w-40" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-20" />
              ))}
            </div>
          </div>
        </Card>
      ) : null}

      {canRenderContent ? (
        <>
          <Card className="p-6 md:p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              {backHref ? (
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  <ArrowLeft size={14} />
                  {backLabel}
                </Link>
              ) : null}
            </div>
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                  <span>University</span>
                  <span className="text-slate-900">Overview</span>
                </div>
                <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{safeText(universityData.university?.name)}</h1>
                <p className="text-lg text-slate-700">{safeText(universityData.program?.title)}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                    <Globe2 size={16} className="text-slate-500" />
                    <span>{headerSubtitle || 'Location unavailable'}</span>
                  </div>
                  {programMeta ? <span className="text-sm text-slate-500">{programMeta}</span> : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white" onClick={handleCompare}>
                    Compare
                  </Button>
                  <Button
                    onClick={handleShortlist}
                    className="bg-slate-900 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)] hover:bg-black"
                  >
                    Add to Shortlist
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {courseHref ? (
                    <Link
                      href={courseHref}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                    >
                      Course
                    </Link>
                  ) : null}
                  <span className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white">University</span>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">
                  <span>Updated</span>
                  <span className="text-slate-900">Live</span>
                </span>
              </div>

              {statusMessage ? <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">{statusMessage}</p> : null}
              <div className="h-[3px] w-full rounded-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 opacity-80" />
              <p className="text-sm text-slate-600">Review rankings, experience, and costs to judge overall university fit alongside the course page.</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Metric label="Guardian Rank" value={formatRank(universityData.rankings?.guardian)} />
              <Metric label="QS Rank" value={formatRank(universityData.rankings?.qs)} />
              <Metric label="Times Rank" value={formatRank(universityData.rankings?.times)} />
              <Metric label="Acceptance Rate" value={formatPercentage(universityData.statistics?.acceptanceRate)} />
              <Metric label="NSS Score" value={formatPercentage(universityData.statistics?.nssScore)} />
              <Metric label="Graduate Employment Rate" value={formatPercentage(universityData.statistics?.employmentRate)} />
            </div>
          </Card>

          <Section title="University Overview" description="High-level facts that define this university.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="University Name" value={universityData.university?.name} />
              <DetailItem label="Location" value={universityData.university?.location} />
              <DetailItem label="Total Student Population" value={universityData.university?.totalStudents} />
              <DetailItem label="Gender Ratio" value={universityData.university?.genderRatio} />
              <DetailItem label="International Student Ratio" value={universityData.university?.internationalStudentRatio} />
              <DetailItem label="Student-to-Staff Ratio" value={universityData.university?.studentStaffRatio} />
              <DetailItem label="University Type" value={universityData.university?.type} />
              <DetailItem
                label="Study Abroad Option"
                value={
                  universityData.university?.studyAbroadAvailable === null || universityData.university?.studyAbroadAvailable === undefined
                    ? 'N/A'
                    : universityData.university?.studyAbroadAvailable
                      ? 'Available'
                      : 'Not available'
                }
              />
            </div>
          </Section>

          <Section title="Cost & Economics" description="Understand the financial footprint of attending.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Average Annual Tuition Fee" value={formatCurrency(universityData.costs?.annualTuition)} />
              <DetailItem label="Student Dormitory Cost" value={formatCurrency(universityData.costs?.dormitoryCost)} />
              <DetailItem label="Average Rent Near Campus" value={formatCurrency(universityData.costs?.averageRent)} />
              <DetailItem label="Cost of Living Index" value={safeText(universityData.costs?.livingIndex)} />
            </div>
          </Section>

          <Section title="Student Experience" description="Lifestyle signals that shape daily campus life.">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Cultural Environment" value={universityData.experience?.culturalEnvironment} />
              <DetailItem label="Social Life" value={universityData.experience?.socialLife} />
              <DetailItem label="Climate" value={universityData.experience?.climate} />
              <DetailItem label="Safety Index" value={safeText(universityData.experience?.safetyIndex)} />
              <DetailItem label="Distance to Airport" value={universityData.experience?.airportDistance} />
              <DetailItem label="Distance to Train Station" value={universityData.experience?.trainStationDistance} />
              <div className="md:col-span-2">
                <DetailItem label="City Characteristics" value={universityData.experience?.cityCharacteristics} />
              </div>
            </div>
          </Section>

          <Section title="Additional Fit Factors" description={universityData.fitFactors?.insights ?? 'Insights gathered from interviews.'}>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              {safeText(universityData.fitFactors?.cityDescription)}
            </div>
          </Section>
        </>
      ) : null}
    </div>
  );
};

const Section = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{title}</p>
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-slate-900 md:text-[34px]">{title}</h2>
        <p className="text-base text-slate-600 md:text-lg">{description}</p>
      </div>
    </div>
    <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
      <div className="h-1 w-full bg-gradient-to-r from-slate-100 via-white to-slate-100" />
      <CardContent className="space-y-8 p-6 lg:p-8">{children}</CardContent>
    </Card>
  </section>
);

export type { UniversityData, UniversityInformationProps };
