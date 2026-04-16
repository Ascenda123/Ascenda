import { type ReactNode, useMemo, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProgramSearchResult } from './types';
import { cn } from '@/lib/utils';

type MetricRow = {
    id: string;
    label: string;
    hint?: string;
    valueForCompare: (uni: ProgramSearchResult) => string | number | null | undefined;
    render: (uni: ProgramSearchResult) => ReactNode;
    numeric?: (uni: ProgramSearchResult) => number | null | undefined;
    direction?: 'higher' | 'lower';
};

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    universities: ProgramSearchResult[];
    onRemove: (id: string) => void;
    maxItems?: number;
}

const formatScore = (score?: number | null) => (typeof score === 'number' ? `${Math.round(score)}%` : 'N/A');
const formatPercentage = (value?: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    const normalized = value > 1 ? value : value * 100;
    return `${Math.round(normalized)}%`;
};
const formatCurrencyRange = (value?: { low?: number | null; high?: number | null; fallback?: number | null; currency?: string | null }) => {
    if (!value) return 'N/A';
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: value.currency ?? 'USD',
        maximumFractionDigits: 0
    });
    if (value.low !== null && value.low !== undefined && value.high !== null && value.high !== undefined) {
        return `${formatter.format(value.low)} - ${formatter.format(value.high)}`;
    }
    if (value.fallback !== null && value.fallback !== undefined) {
        return formatter.format(value.fallback);
    }
    return 'N/A';
};

export function ComparisonModal({ isOpen, onClose, universities, onRemove, maxItems = 5 }: ComparisonModalProps) {
    const [highlightDiffs, setHighlightDiffs] = useState(true);
    const [hideMatches, setHideMatches] = useState(false);

    const metricRows: MetricRow[] = [
        {
            id: 'fitScore',
            label: 'Fit Score',
            hint: 'How well this program maps to your signals.',
            valueForCompare: (uni) => formatScore(uni.fitScore),
            render: (uni) => (
                <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-base font-semibold">{formatScore(uni.fitScore)}</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{uni.tier ?? 'N/A'}</span>
                </div>
            ),
            numeric: (uni) => uni.fitScore,
            direction: 'higher'
        },
        {
            id: 'acceptanceRate',
            label: 'Acceptance Rate',
            hint: 'Lower means more competitive.',
            valueForCompare: (uni) => formatPercentage(uni.acceptanceRate),
            render: (uni) => <span className="text-[13px] font-semibold text-foreground">{formatPercentage(uni.acceptanceRate)}</span>,
            numeric: (uni) => uni.acceptanceRate,
            direction: 'lower'
        },
        {
            id: 'duration',
            label: 'Duration',
            valueForCompare: (uni) => uni.duration ?? (uni.durationYears ? `${uni.durationYears} years` : 'N/A'),
            render: (uni) => <span className="text-[13px] text-foreground">{uni.duration ?? (uni.durationYears ? `${uni.durationYears} years` : 'N/A')}</span>,
            numeric: (uni) => uni.durationYears ?? null,
            direction: 'lower'
        },
        {
            id: 'tuition',
            label: 'Tuition (annual)',
            hint: 'Rounded annual tuition; housing not included.',
            valueForCompare: (uni) =>
                formatCurrencyRange({
                    low: uni.intlTuitionLow,
                    high: uni.intlTuitionHigh,
                    fallback: uni.tuition,
                    currency: uni.currency
                }),
            render: (uni) => (
                <div className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                    <span className="rounded-full bg-muted px-3 py-1">
                        {formatCurrencyRange({
                            low: uni.intlTuitionLow,
                            high: uni.intlTuitionHigh,
                            fallback: uni.tuition,
                            currency: uni.currency
                        })}
                    </span>
                </div>
            ),
            numeric: (uni) => uni.intlTuitionLow ?? uni.tuition ?? null,
            direction: 'lower'
        },
        {
            id: 'location',
            label: 'Location',
            valueForCompare: (uni) => uni.location,
            render: (uni) => <span className="text-sm text-foreground">{uni.location}</span>
        },
        {
            id: 'program',
            label: 'Program',
            valueForCompare: (uni) => uni.programName,
            render: (uni) => <span className="text-sm font-medium text-foreground">{uni.programName}</span>
        },
        {
            id: 'highlights',
            label: 'Highlights',
            valueForCompare: (uni) => uni.highlights.join('|'),
            render: (uni) => (
                <div className="flex flex-wrap justify-center gap-1">
                    {uni.highlights.slice(0, 3).map((h) => (
                        <span
                            key={h}
                            className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                            {h}
                        </span>
                    ))}
                </div>
            )
        }
    ];

    const shouldHideRow = (row: MetricRow) => {
        if (!hideMatches || universities.length <= 1) return false;
        const values = universities.map((uni) => row.valueForCompare(uni));
        return values.every((val) => val === values[0]);
    };

    const visibleRows = metricRows.filter((row) => !shouldHideRow(row));

    const isEmpty = universities.length === 0;

    const metricStats = useMemo(() => {
        return visibleRows.reduce<Record<string, { min: number; max: number }>>((acc, row) => {
            if (!row.numeric) return acc;
            const values = universities.map((u) => row.numeric?.(u)).filter((v): v is number => typeof v === 'number');
            if (values.length === 0) return acc;
            acc[row.id] = { min: Math.min(...values), max: Math.max(...values) };
            return acc;
        }, {});
    }, [visibleRows, universities]);

    const getDiffBadge = (row: MetricRow, uni: ProgramSearchResult) => {
        if (!highlightDiffs || !row.numeric) return null;
        const stats = metricStats[row.id];
        if (!stats || stats.min === stats.max) return null;

        const value = row.numeric(uni);
        const isBest = row.direction === 'lower' ? value === stats.min : value === stats.max;
        const isBottom = row.direction === 'lower' ? value === stats.max : value === stats.min;
        if (!isBest && !isBottom) return null;

        const label = isBest ? 'Best' : 'Weakest';
        const color = isBest
            ? 'bg-success/10 text-success border-success/30'
            : 'bg-destructive/10 text-destructive border-destructive/30';

        return (
            <span className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm",
                color
            )}>
                {label}
            </span>
        );
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl overflow-hidden p-0 sm:rounded-[28px]">
                <div className="flex h-[80vh] flex-col">
                    {/* Header */}
                    <div className="flex flex-col gap-3 border-b border-border bg-card px-6 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <DialogTitle className="text-2xl font-bold">Compare Universities</DialogTitle>
                                <p className="text-muted-foreground">
                                    {isEmpty
                                        ? 'Select programs from results to compare side-by-side'
                                        : hideMatches
                                            ? `Showing only differences between ${universities.length} program${universities.length > 1 ? 's' : ''}`
                                            : highlightDiffs
                                                ? `Highlighting differences across ${universities.length} program${universities.length > 1 ? 's' : ''}`
                                                : `Comparing ${universities.length} program${universities.length > 1 ? 's' : ''} side-by-side${universities.length >= maxItems ? ' · remove one to add another' : ''}`}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {!isEmpty && (
                                    <button
                                        onClick={() => setHighlightDiffs((v) => !v)}
                                        className="flex items-center gap-3 rounded-full border border-border bg-background px-4 py-1.5 transition-all hover:border-primary/50 hover:bg-muted/30"
                                        role="switch"
                                        aria-checked={highlightDiffs}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            Highlight differences
                                        </span>
                                        <div
                                            className={cn(
                                                'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-in-out',
                                                highlightDiffs ? 'bg-primary' : 'bg-muted'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out',
                                                    highlightDiffs ? 'translate-x-4' : 'translate-x-0'
                                                )}
                                            />
                                        </div>
                                    </button>
                                )}
                                <Button variant="outline" onClick={onClose}>
                                    Close
                                </Button>
                            </div>
                        </div>
                        {!isEmpty && (
                            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/60 p-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background text-sm font-bold text-foreground ring-1 ring-border">
                                        {universities.length}
                                    </span>
                                    <span>Active comparisons</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                    <button
                                        onClick={() => setHideMatches((v) => !v)}
                                        className={cn(
                                            'rounded-full px-3 py-1 transition',
                                            hideMatches ? 'bg-foreground text-background shadow-sm' : 'bg-background text-foreground ring-1 ring-border'
                                        )}
                                        role="switch"
                                        aria-checked={hideMatches}
                                    >
                                        {hideMatches ? 'Showing only differences' : 'Hide matching rows'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-auto bg-muted/30 p-4">
                        {isEmpty ? (
                            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/50 p-10 text-center">
                                <div className="mb-4 h-12 w-12 rounded-full bg-card text-2xl">🔍</div>
                                <h3 className="text-lg font-semibold text-foreground">No selections yet</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Choose up to {maxItems} programs from search results and tap Compare to see them here.
                                </p>
                            </div>
                        ) : (
                            <div
                                className="grid gap-x-4 gap-y-0"
                                style={{
                                    gridTemplateColumns: `200px repeat(${universities.length}, minmax(200px, 1fr))`
                                }}
                            >
                                {/* University Background Cards */}
                                {universities.map((uni, index) => (
                                    <div
                                        key={`bg-${uni.id}`}
                                        className="rounded-2xl bg-card shadow-sm ring-1 ring-border transition hover:shadow-lg"
                                        style={{
                                            gridColumn: index + 2,
                                            gridRow: `1 / span ${visibleRows.length + 1}`,
                                            zIndex: 0
                                        }}
                                    />
                                ))}

                                {/* Header Row */}
                                <div className="flex items-center bg-muted/30 px-2 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                                    Comparison focus
                                </div>
                                {universities.map((uni, index) => (
                                    <div
                                        key={`header-${uni.id}`}
                                        className="relative z-10 p-6"
                                        style={{ gridColumn: index + 2, gridRow: 1 }}
                                    >
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <button
                                                onClick={() => onRemove(uni.id)}
                                                className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground shadow-sm ring-1 ring-border transition hover:bg-destructive hover:text-destructive-foreground"
                                            >
                                                <X className="h-2 w-2" />
                                                Remove
                                            </button>
                                            {uni.logoUrl ? (
                                                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-black ring-1 ring-border">
                                                    <Image
                                                        src={uni.logoUrl}
                                                        alt={`${uni.universityName} logo`}
                                                        fill
                                                        className="object-contain"
                                                        sizes="40px"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg font-bold text-muted-foreground ring-1 ring-border">
                                                    {uni.universityName.charAt(0)}
                                                </div>
                                            )}
                                            <h3 className="text-lg font-bold text-foreground line-clamp-2">{uni.universityName}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{uni.programName}</p>
                                            <Button asChild size="sm" className="mt-1 w-full rounded-lg" variant="secondary">
                                                <Link href={`/course/${uni.id}`}>Open course page</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Data Rows */}
                                {visibleRows.map((row, rowIndex) => (
                                    <div key={`row-${row.id}`} style={{ display: 'contents' }}>
                                        {/* Label */}
                                        <div
                                            className="flex flex-col justify-center bg-muted/30 px-2 py-2"
                                            style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
                                        >
                                            <span className="text-[13px] font-semibold text-muted-foreground">{row.label}</span>
                                            {row.hint && <span className="text-[11px] font-normal text-muted-foreground/70">{row.hint}</span>}
                                        </div>

                                        {/* Data Cells */}
                                        {universities.map((uni, uniIndex) => {
                                            const badge = getDiffBadge(row, uni);
                                            return (
                                                <div
                                                    key={`${uni.id}-${row.id}`}
                                                    className="relative z-10 flex flex-col items-center justify-center gap-2 p-4 text-center"
                                                    style={{ gridColumn: uniIndex + 2, gridRow: rowIndex + 2 }}
                                                >
                                                    <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-muted/40 p-3">
                                                        {row.render(uni)}
                                                        {badge}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {!isEmpty && (
                        <div className="border-t border-border bg-card/90 px-8 py-4 backdrop-blur">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-sm text-muted-foreground">
                                    Keep momentum: take the strongest fit forward or schedule a counselor review.
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="outline" asChild size="sm">
                                        <Link href={`/course/${universities[0]?.id}`}>Open best fit</Link>
                                    </Button>
                                    <Button size="sm" onClick={onClose}>
                                        Close & continue browsing
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
