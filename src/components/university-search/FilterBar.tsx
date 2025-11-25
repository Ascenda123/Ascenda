import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MatchTier } from '@/lib/matching/engine';
import { cn } from '@/lib/utils';
import { Grid, LayoutList, Search, X } from 'lucide-react';

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedTiers: MatchTier[];
    onTierChange: (tier: MatchTier) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    resultCount: number;
}

const TIERS: MatchTier[] = ['Reach', 'Match', 'Safe'];

export function FilterBar({
    searchQuery,
    onSearchChange,
    selectedTiers,
    onTierChange,
    viewMode,
    onViewModeChange,
    resultCount
}: FilterBarProps) {
    return (
        <div className="sticky top-4 z-20 mb-6 flex flex-col gap-4 rounded-[24px] border border-border bg-card/80 p-4 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            {/* Search & Filters */}
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search universities..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-10 rounded-xl border-border bg-background pl-9 pr-8"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {TIERS.map((tier) => {
                        const isSelected = selectedTiers.includes(tier);
                        return (
                            <button
                                key={tier}
                                onClick={() => onTierChange(tier)}
                                className={cn(
                                    'flex h-9 items-center rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                                    isSelected
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                                )}
                                aria-pressed={isSelected}
                                role="switch"
                                aria-checked={isSelected}
                                aria-label={`${tier} tier filter ${isSelected ? 'on' : 'off'}`}
                            >
                                {tier}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* View Toggle & Count */}
            <div className="flex items-center justify-between gap-4 border-t border-border pt-3 md:border-t-0 md:pt-0">
                <span className="text-sm font-medium text-muted-foreground">
                    {resultCount} result{resultCount !== 1 && 's'}
                </span>
                <div className="flex items-center rounded-xl border border-border bg-background p-1">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
                            viewMode === 'grid' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                        aria-label="Grid view"
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
                            viewMode === 'list' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                        aria-label="List view"
                    >
                        <LayoutList className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
