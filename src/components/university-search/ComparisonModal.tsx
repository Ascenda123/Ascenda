import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlaceholderResult } from './placeholder-results';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    universities: PlaceholderResult[];
    onRemove: (id: string) => void;
}

export function ComparisonModal({ isOpen, onClose, universities, onRemove }: ComparisonModalProps) {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl overflow-hidden p-0 sm:rounded-[32px]">
                <div className="flex h-[80vh] flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border bg-card px-8 py-6">
                        <div>
                            <DialogTitle className="text-2xl font-bold">Compare Universities</DialogTitle>
                            <p className="text-muted-foreground">
                                Comparing {universities.length} programs side-by-side
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>

                    {/* Comparison Grid */}
                    <div className="flex-1 overflow-auto bg-muted/30 p-8">
                        <div className="grid grid-cols-[200px_repeat(3,1fr)] gap-8">
                            {/* Labels Column */}
                            <div className="space-y-8 pt-32">
                                <div className="h-8 text-sm font-semibold text-muted-foreground">Fit Score</div>
                                <div className="h-8 text-sm font-semibold text-muted-foreground">Location</div>
                                <div className="h-8 text-sm font-semibold text-muted-foreground">Program</div>
                                <div className="h-8 text-sm font-semibold text-muted-foreground">Highlights</div>
                                <div className="h-8 text-sm font-semibold text-muted-foreground">Next Action</div>
                                <div className="h-8 text-sm font-semibold text-muted-foreground">Due Date</div>
                            </div>

                            {/* University Columns */}
                            {universities.map((uni) => (
                                <div key={uni.id} className="flex flex-col gap-8 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
                                    {/* Header Card */}
                                    <div className="relative flex flex-col items-center text-center">
                                        <button
                                            onClick={() => onRemove(uni.id)}
                                            className="absolute -right-2 -top-2 rounded-full bg-muted p-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="mb-4 h-16 w-16 rounded-2xl bg-muted" />
                                        <h3 className="font-bold text-foreground">{uni.name}</h3>
                                        <p className="text-sm text-muted-foreground">{uni.program}</p>
                                        <Button asChild size="sm" className="mt-4 w-full">
                                            <Link href={`/course/${uni.id}`}>View Details</Link>
                                        </Button>
                                    </div>

                                    {/* Data Points */}
                                    <div className="flex h-8 items-center justify-center font-bold text-foreground">
                                        <span className={
                                            uni.fitScore >= 88 ? 'text-emerald-600' :
                                                uni.fitScore >= 80 ? 'text-amber-600' : 'text-rose-600'
                                        }>
                                            {uni.fitScore}%
                                        </span>
                                    </div>
                                    <div className="flex h-8 items-center justify-center text-sm text-foreground">{uni.location}</div>
                                    <div className="flex h-8 items-center justify-center text-sm text-foreground">{uni.program}</div>
                                    <div className="flex min-h-[2rem] flex-wrap justify-center gap-1">
                                        {uni.highlights.slice(0, 2).map((h) => (
                                            <span key={h} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex h-8 items-center justify-center text-center text-xs text-muted-foreground">
                                        {uni.nextAction}
                                    </div>
                                    <div className="flex h-8 items-center justify-center text-sm font-medium text-foreground">
                                        {uni.due}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
