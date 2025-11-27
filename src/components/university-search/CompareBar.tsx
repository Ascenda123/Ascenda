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
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-6xl -translate-x-1/2 px-4">
            <div className="flex flex-col gap-2 rounded-3xl border border-border/80 bg-card/90 p-3 text-foreground shadow-lg backdrop-blur">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/60 text-base font-bold text-foreground">
                            {selectedItems.length}/{maxItems}
                        </div>
                        <div className="text-xs font-semibold leading-tight">
                            <p>Comparison tray</p>
                            <p className="text-muted-foreground/70">{readyState}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClear}
                        className="rounded-full border border-border/60 bg-background/10 px-3 py-1 text-[11px] font-semibold text-muted-foreground transition hover:border-foreground/60"
                    >
                        Clear all
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/50 bg-muted/20 px-3 py-2 text-xs font-semibold shadow-inner">
                    {selectedItems.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center gap-2 rounded-xl border border-border/30 bg-background/50 px-3 py-1 text-foreground transition hover:border-foreground/40"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-xs font-bold text-foreground">
                                {item.name.charAt(0)}
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span>{item.name}</span>
                                <span className="text-[10px] text-muted-foreground/70">{item.program}</span>
                            </div>
                            <button
                                onClick={() => onRemove(item.id)}
                                className="ml-1 rounded-full p-1 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                                aria-label={`Remove ${item.name} from comparison`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={onCompare}
                        size="sm"
                        className="gap-2 rounded-xl bg-foreground px-3 py-1 text-xs font-semibold text-background transition hover:bg-foreground/90"
                    >
                        Compare <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
