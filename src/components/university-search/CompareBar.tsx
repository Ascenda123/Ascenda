import { Button } from '@/components/ui/button';
import { PlaceholderResult } from './placeholder-results';
import { X, ArrowRight, Share2, Sparkles } from 'lucide-react';

interface CompareBarProps {
    selectedItems: PlaceholderResult[];
    onClear: () => void;
    onRemove: (id: string) => void;
    onCompare: () => void;
}

export function CompareBar({ selectedItems, onClear, onRemove, onCompare }: CompareBarProps) {
    if (selectedItems.length === 0) return null;

    const maxItems = 3;
    const readyState =
        selectedItems.length === maxItems ? 'Ready for a side-by-side view.' : `Add ${maxItems - selectedItems.length} more to max out diff mode.`;

    return (
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 px-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-border bg-gradient-to-r from-foreground via-foreground to-foreground/95 p-4 text-background shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/15 text-lg font-bold">
                            {selectedItems.length}/{maxItems}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Comparison tray</p>
                            <p className="text-xs text-background/80">{readyState}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-background/80">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Diff mode</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-background/10 p-2">
                    {selectedItems.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center gap-2 rounded-xl border border-background/20 bg-background/5 px-3 py-2 text-sm font-semibold shadow-sm"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/20 text-xs font-bold text-background">
                                {item.name.charAt(0)}
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-background">{item.name}</span>
                                <span className="text-[11px] text-background/70">{item.program}</span>
                            </div>
                            <button
                                onClick={() => onRemove(item.id)}
                                className="ml-1 rounded-full p-1 text-background/70 transition hover:bg-background/15 hover:text-background"
                                aria-label={`Remove ${item.name} from comparison`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs font-semibold text-background/80">
                        <button onClick={onClear} className="rounded-full bg-background/10 px-3 py-1 transition hover:bg-background/20">
                            Clear all
                        </button>
                        <span className="hidden sm:inline">Selections persist while you browse.</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="gap-2 rounded-xl bg-background text-foreground hover:bg-background/90"
                        >
                            <Share2 className="h-4 w-4" />
                            Share snapshot
                        </Button>
                        <Button
                            onClick={onCompare}
                            size="sm"
                            className="gap-2 rounded-xl bg-background text-foreground hover:bg-background/90"
                        >
                            Compare <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
