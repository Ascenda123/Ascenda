import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlaceholderResult } from './placeholder-results';
import { Check } from 'lucide-react';

interface ResultCardProps {
    result: PlaceholderResult;
    isShortlisted: boolean;
    isSelected: boolean;
    onToggleShortlist: (result: PlaceholderResult) => void;
    onToggleSelect: (result: PlaceholderResult) => void;
}

export function ResultCard({
    result,
    isShortlisted,
    isSelected,
    onToggleShortlist,
    onToggleSelect
}: ResultCardProps) {
    // Determine color based on fit score
    const getScoreColor = (score: number) => {
        if (score >= 88) return 'text-emerald-600 ring-emerald-100 bg-emerald-50';
        if (score >= 80) return 'text-amber-600 ring-amber-100 bg-amber-50';
        return 'text-rose-600 ring-rose-100 bg-rose-50';
    };

    const scoreColorClass = getScoreColor(result.fitScore);

    return (
        <article
            className={cn(
                'group relative flex h-full flex-col rounded-[24px] border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]',
                isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
            )}
        >
            {/* Selection Checkbox (Visible on hover or when selected) */}
            <button
                onClick={() => onToggleSelect(result)}
                className={cn(
                    'absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all',
                    isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-transparent opacity-0 group-hover:opacity-100 hover:border-primary/50'
                )}
                aria-label={isSelected ? 'Deselect' : 'Select for comparison'}
            >
                <Check className="h-4 w-4" />
            </button>

            {/* Header: Score & Location */}
            <div className="flex items-start justify-between">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-full ring-4', scoreColorClass)}>
                    <span className="text-sm font-bold">{result.fitScore}%</span>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{result.location}</p>
                </div>
            </div>

            {/* Content */}
            <div className="mt-4 flex-1">
                <h3 className="text-xl font-bold text-foreground line-clamp-1" title={result.name}>
                    {result.name}
                </h3>
                <p className="text-sm font-medium text-muted-foreground line-clamp-1" title={result.program}>
                    {result.program}
                </p>

                {/* Highlights */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {result.highlights.slice(0, 3).map((highlight) => (
                        <span
                            key={highlight}
                            className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                            {highlight}
                        </span>
                    ))}
                    {result.highlights.length > 3 && (
                        <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            +{result.highlights.length - 3}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3">
                <Button asChild size="sm" className="w-full rounded-xl font-semibold shadow-sm">
                    <Link href={`/course/${result.id}?from=search`}>View Course</Link>
                </Button>
                <Button
                    size="sm"
                    variant={isShortlisted ? 'secondary' : 'outline'}
                    className={cn('w-full rounded-xl font-semibold', isShortlisted && 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200')}
                    onClick={() => onToggleShortlist(result)}
                >
                    {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </Button>
            </div>
        </article>
    );
}
