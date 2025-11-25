import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlaceholderResult } from './placeholder-results';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    universities: PlaceholderResult[];
    onRemove: (id: string) => void;
    maxItems?: number;
}

export function ComparisonModal({ isOpen, onClose, universities, onRemove, maxItems = 3 }: ComparisonModalProps) {
    if (!isOpen) return null;

    const columnsStyle = {
        gridTemplateColumns: `200px repeat(${Math.max(1, universities.length)}, minmax(240px, 1fr))`
    };

    const metricLabels = ['Fit Score', 'Location', 'Program', 'Highlights', 'Next Action', 'Due Date'];
    const rowTemplate = '180px repeat(6, minmax(0, 1fr))';
    const isEmpty = universities.length === 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl overflow-hidden p-0 sm:rounded-[32px]">
                <div className="flex h-[80vh] flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border bg-card px-8 py-6">
                        <div>
                            <DialogTitle className="text-2xl font-bold">Compare Universities</DialogTitle>
                            <p className="text-muted-foreground">
                                {isEmpty
                                    ? 'Select programs from results to compare side-by-side'
                                    : `Comparing ${universities.length} program${universities.length > 1 ? 's' : ''} side-by-side${universities.length >= maxItems ? ' · remove one to add another' : ''}`}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-auto bg-muted/30 p-8">
                        {isEmpty ? (
                            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/50 p-10 text-center">
                                <div className="mb-4 h-12 w-12 rounded-full bg-card text-2xl">🔍</div>
                                <h3 className="text-lg font-semibold text-foreground">No selections yet</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Choose up to {maxItems} programs from search results and tap Compare to see them here.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6" style={columnsStyle}>
                            {/* Labels Column */}
                            <div
                                className="sticky left-0 grid gap-6 self-start bg-muted/30 text-sm font-semibold text-muted-foreground"
                                style={{ gridTemplateRows: rowTemplate }}
                            >
                                <div aria-hidden />
                                {metricLabels.map((label) => (
                                    <div key={label} className="flex min-h-[2.5rem] items-center">
                                        {label}
                                    </div>
                                ))}
                            </div>

                            {/* University Columns */}
                            {universities.map((uni) => (
                                <div
                                    key={uni.id}
                                    className="grid gap-6 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border"
                                    style={{ gridTemplateRows: rowTemplate }}
                                >
                                    {/* Header Card */}
                                    <div className="relative flex flex-col items-center text-center">
                                        <button
                                            onClick={() => onRemove(uni.id)}
                                            className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm ring-1 ring-border hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <X className="h-3 w-3" />
                                            Remove
                                        </button>
                                        <div className="mb-4 h-16 w-16 rounded-2xl bg-muted" />
                                        <h3 className="font-bold text-foreground">{uni.name}</h3>
                                        <p className="text-sm text-muted-foreground">{uni.program}</p>
                                        <Button asChild size="sm" className="mt-4 w-full" variant="secondary">
                                            <Link href={`/course/${uni.id}`}>Open course page</Link>
                                        </Button>
                                    </div>

                                    {/* Data Points */}
                                    <div className="flex min-h-[2.5rem] flex-col items-center justify-center text-center text-foreground">
                                        <span
                                            className={
                                                uni.fitScore >= 88
                                                    ? 'text-emerald-600'
                                                    : uni.fitScore >= 80
                                                    ? 'text-amber-600'
                                                    : 'text-rose-600'
                                            }
                                        >
                                            {uni.fitScore}%
                                        </span>
                                        <span className="text-xs text-muted-foreground">{uni.tier}</span>
                                    </div>
                                    <div className="flex min-h-[2.5rem] items-center justify-center text-sm text-foreground">
                                        {uni.location}
                                    </div>
                                    <div className="flex min-h-[2.5rem] items-center justify-center text-sm text-foreground">
                                        {uni.program}
                                    </div>
                                    <div className="flex min-h-[2.5rem] flex-wrap justify-center gap-1">
                                        {uni.highlights.slice(0, 2).map((h) => (
                                            <span
                                                key={h}
                                                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                                            >
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex min-h-[2.5rem] items-center justify-center text-center text-xs text-muted-foreground">
                                        {uni.nextAction}
                                    </div>
                                    <div className="flex min-h-[2.5rem] items-center justify-center text-sm font-medium text-foreground">
                                        {uni.due}
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
