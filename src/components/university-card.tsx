import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { MatchTier } from '@/lib/matching/engine';

// Define a unified interface that covers both PlaceholderResult and EnrichedMatch
export interface UniversityCardProps {
    id: string;
    name: string;
    program: string;
    location: string;
    fitScore?: number | null;
    tier?: MatchTier | null;
    highlights?: string[]; // Optional, as EnrichedMatch might not have this exact field yet
    isShortlisted?: boolean;
    isSelected?: boolean;
    onToggleShortlist?: () => void;
    onToggleSelect?: () => void;
    actions?: React.ReactNode; // Slot for custom actions
    variant?: 'default' | 'compact';
}

export function UniversityCard({
    id,
    name,
    program,
    location,
    fitScore,
    tier,
    highlights = [],
    isShortlisted = false,
    isSelected = false,
    onToggleShortlist,
    onToggleSelect,
    actions,
    variant = 'default'
}: UniversityCardProps) {
    // Determine color based on fit score
    const getScoreColor = (score: number) => {
        if (score >= 88) return 'text-emerald-600 ring-emerald-100 bg-emerald-50';
        if (score >= 80) return 'text-amber-600 ring-amber-100 bg-amber-50';
        return 'text-rose-600 ring-rose-100 bg-rose-50';
    };

    const scoreValue = typeof fitScore === 'number' ? Math.round(fitScore) : null;
    const scoreColorClass = scoreValue !== null ? getScoreColor(scoreValue) : 'text-muted-foreground ring-border bg-muted';
    const courseHref = id ? `/course/${encodeURIComponent(id)}?from=search` : null;

    return (
        <article
            className={cn(
                'group relative flex h-full flex-col rounded-[24px] border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]',
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
                <h3 className={cn('font-bold text-foreground line-clamp-1', variant === 'compact' ? 'text-lg' : 'text-xl')} title={name}>
                    {name}
                </h3>
                <p className="text-sm font-medium text-muted-foreground line-clamp-1" title={program}>
                    {program}
                </p>

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
                                View Course
                            </Link>
                        ) : (
                            <Button size="sm" className="w-full rounded-xl font-semibold shadow-sm" disabled>
                                View Course
                            </Button>
                        )}
                        {onToggleShortlist && (
                            <Button
                                size="sm"
                                variant={isShortlisted ? 'secondary' : 'outline'}
                                className={cn('w-full rounded-xl font-semibold', isShortlisted && 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200')}
                                onClick={onToggleShortlist}
                            >
                                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </article>
    );
}
