import { Button } from '@/components/ui/button';
import { PlaceholderResult } from './placeholder-results';
import { X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface CompareBarProps {
    selectedItems: PlaceholderResult[];
    onClear: () => void;
    onRemove: (id: string) => void;
    onCompare: () => void;
}

export function CompareBar({ selectedItems, onClear, onRemove, onCompare }: CompareBarProps) {
    if (selectedItems.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 px-4">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-foreground p-3 text-background shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-3 pl-2">
                        {selectedItems.map((item) => (
                            <div
                                key={item.id}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground bg-muted text-xs font-bold text-foreground"
                                title={item.name}
                            >
                                {item.name.charAt(0)}
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background text-foreground hover:bg-destructive hover:text-destructive-foreground"
                                >
                                    <X className="h-2.5 w-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                            {selectedItems.length} selected
                        </span>
                        <button onClick={onClear} className="text-xs text-muted-foreground hover:text-background hover:underline text-left">
                            Clear all
                        </button>
                    </div>
                </div>

                <Button onClick={onCompare} size="sm" className="gap-2 rounded-xl px-6 font-semibold bg-background text-foreground hover:bg-background/90">
                    Compare <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
