'use client';

import { Button } from '@/components/ui/button';
import { ProgramSearchResult } from './types';
import { X, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface CompareBarProps {
    selectedItems: ProgramSearchResult[];
    onClear: () => void;
    onRemove: (id: string) => void;
    onCompare: () => void;
    maxItems?: number;
}

export function CompareBar({ selectedItems, onClear, onRemove, onCompare, maxItems = 5 }: CompareBarProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || selectedItems.length === 0) return null;

    const readyState =
        selectedItems.length === maxItems
            ? 'Ready for a side-by-side view.'
            : `Add ${maxItems - selectedItems.length} more to max out diff mode.`;

    return createPortal(
        <div className="fixed bottom-6 left-1/2 z-[100] w-full max-w-5xl -translate-x-1/2 px-4 transition-all duration-300 ease-in-out">
            {/* Mobile Toggle Handle - Visible only on small screens when collapsed */}
            {!isExpanded && (
                <div className="flex justify-center sm:hidden">
                    <Button
                        onClick={() => setIsExpanded(true)}
                        size="sm"
                        className="rounded-full bg-foreground px-6 text-background shadow-lg"
                    >
                        Compare ({selectedItems.length}) <ChevronUp className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Main Bar Container */}
            <div
                className={cn(
                    "flex flex-col gap-1.5 rounded-[28px] border border-border/80 bg-card/90 p-2.5 text-foreground shadow-2xl backdrop-blur-xl transition-all duration-300",
                    !isExpanded ? "hidden sm:flex" : "flex",
                )}
            >
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/60 text-base font-bold text-foreground">
                            {selectedItems.length}/{maxItems}
                        </div>
                        <div className="flex flex-col text-xs font-semibold leading-tight">
                            <div className="flex items-center gap-2">
                                <p>Comparison tray</p>
                                {/* Mobile collapse button */}
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="rounded-full bg-muted/50 p-0.5 sm:hidden"
                                >
                                    <ChevronDown className="h-3 w-3" />
                                </button>
                            </div>
                            <p className="line-clamp-1 text-muted-foreground/70 sm:line-clamp-none">
                                {readyState}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClear}
                            className="whitespace-nowrap rounded-full border border-border/60 bg-background/10 px-3 py-1 text-[11px] font-semibold text-muted-foreground transition hover:border-foreground/60"
                        >
                            Clear all
                        </button>
                        <Button
                            onClick={onCompare}
                            size="sm"
                            className="gap-2 rounded-xl bg-foreground px-3 py-1 text-[11px] font-semibold text-background transition hover:bg-foreground/90"
                        >
                            Compare <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div
                        className="grid w-full min-w-[260px] gap-2 rounded-2xl border border-border/50 bg-muted/20 px-3 py-1.5 text-[12px] font-semibold shadow-inner"
                        style={{
                            gridTemplateColumns: `repeat(${selectedItems.length}, minmax(180px, 1fr))`
                        }}
                    >
                        {selectedItems.map((item) => (
                            <div
                                key={item.id}
                                className="group flex w-full items-center gap-2 rounded-xl border border-border/30 bg-background/50 px-2.5 py-1 text-foreground transition hover:border-foreground/40"
                            >
                                {item.logoUrl ? (
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-black">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.logoUrl}
                                            alt={`${item.universityName} logo`}
                                            className="h-full w-full object-contain"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-xs font-bold text-foreground">
                                        {item.universityName.charAt(0)}
                                    </div>
                                )}
                                <div className="flex min-w-0 flex-col leading-tight">
                                    <span className="truncate" title={item.universityName}>
                                        {item.universityName}
                                    </span>
                                    <span className="truncate text-[10px] text-muted-foreground/70" title={item.programName}>
                                        {item.programName}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="ml-auto rounded-full p-1 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                                    aria-label={`Remove ${item.universityName} from comparison`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
