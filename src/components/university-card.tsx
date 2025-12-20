'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { MatchTier } from '@/lib/matching/match-tier';
import { TrackProgramButton, type TrackLabelVariant } from '@/components/programs/track-program-button';
import { ACTION_TEXT } from '@/lib/constants/text';
import { getFitScoreVisuals } from '@/lib/theme/fit-score';

// Define a unified interface that covers both PlaceholderResult and EnrichedMatch
export interface UniversityCardProps {
    id: string;
    name: string;
    program: string;
    location: string;
    logoUrl?: string | null;
    fitScore?: number | null;
    tier?: MatchTier | null;
    reasons?: string[];
    highlights?: string[]; // Optional, as EnrichedMatch might not have this exact field yet
    isSelected?: boolean;
    onToggleSelect?: () => void;
    actions?: React.ReactNode; // Slot for custom actions
    variant?: 'default' | 'compact';
    trackingLabelVariant?: TrackLabelVariant;
    hideTrackingButton?: boolean;
}

export function UniversityCard({
    id,
    name,
    program,
    location,
    logoUrl,
    fitScore,
    tier,
    reasons = [],
    highlights = [],
    isSelected = false,
    onToggleSelect,
    actions,
    variant = 'default',
    trackingLabelVariant = 'shortlist',
    hideTrackingButton = false
}: UniversityCardProps) {
    const { value: scoreValue, badgeClass: scoreColorClass } = getFitScoreVisuals(fitScore);
    const courseHref = id ? `/course/${encodeURIComponent(id)}?from=search` : null;

    return (
        <article
            className={cn(
                'group relative flex h-full flex-col rounded-[24px] border bg-card/80 backdrop-blur-sm shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] dark:bg-muted/20 dark:border-white/10 dark:shadow-none dark:hover:border-primary/50 dark:hover:bg-muted/30',
                isSelected ? 'border-primary ring-1 ring-primary' : 'border-border',
                variant === 'compact' ? 'p-4' : 'p-5'
            )}
        >
            {/* Selection Checkbox (Visible on hover or when selected) */}
            {onToggleSelect && (
                <button
                    onClick={onToggleSelect}
                    className={cn(
                        'absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all',
                        isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border/60 bg-background/30 text-transparent opacity-0 backdrop-blur-[2px] group-hover:opacity-100 hover:border-primary/50'
                    )}
                    aria-label={isSelected ? 'Deselect' : 'Select for comparison'}
                >
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                </button>
            )}

            {/* Header: Score & Location */}
            <div className="flex items-start justify-between">
                <div className={cn('flex items-center justify-center rounded-full ring-4', scoreColorClass, variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12')}>
                    <span className={cn('font-bold', variant === 'compact' ? 'text-xs' : 'text-sm')}>
                        {scoreValue !== null ? `${scoreValue}%` : 'N/A'}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{location}</p>
                </div>
            </div>

            {/* Content */}
            <div className="mt-4 flex-1">
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoUrl}
                                alt={`${name} logo`}
                                className="h-full w-full object-contain"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    ) : null}
                    <div className="min-w-0">
                        <h3
                            className={cn('font-bold text-foreground line-clamp-1', variant === 'compact' ? 'text-lg' : 'text-xl')}
                            title={name}
                        >
                            {name}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground line-clamp-1" title={program}>
                            {program}
                        </p>
                    </div>
                </div>

                {/* Highlights */}
                {highlights.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {highlights.slice(0, 3).map((highlight) => (
                            <span
                                key={highlight}
                                className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                            >
                                {highlight}
                            </span>
                        ))}
                        {highlights.length > 3 && (
                            <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                +{highlights.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Eligibility Reasons */}
                {reasons.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold px-1">Eligibility Details</p>
                        <div className="flex flex-col gap-1">
                            {reasons.map((reason, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "text-[11px] px-2 py-1 rounded-lg border",
                                        reason.includes("below requirement") || reason.includes("missing")
                                            ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
                                            : "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    )}
                                >
                                    {reason}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3">
                {actions ? (
                    actions
                ) : (
                    <>
                        {courseHref ? (
                            <Link
                                href={courseHref}
                                className={cn(
                                    buttonVariants({ size: 'sm', className: 'w-full rounded-xl font-semibold shadow-sm' })
                                )}
                                prefetch
                            >
                                {ACTION_TEXT.viewCourse}
                            </Link>
                        ) : (
                            <Button size="sm" className="w-full rounded-xl font-semibold shadow-sm" disabled>
                                {ACTION_TEXT.viewCourse}
                            </Button>
                        )}
                        {!hideTrackingButton && (
                            <TrackProgramButton
                                programId={id}
                                programName={program}
                                universityName={name}
                                location={location}
                                fitScore={fitScore ?? null}
                                labelVariant={trackingLabelVariant}
                            />
                        )}
                    </>
                )}
            </div>
        </article>
    );
}
