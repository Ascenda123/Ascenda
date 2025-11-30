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
    quickFilters: {
        budgetFriendly: boolean;
        englishOnly: boolean;
        testOptional: boolean;
    };
    onQuickFilterChange: (key: keyof FilterBarProps['quickFilters']) => void;
    isSticky?: boolean;
    showViewToggle?: boolean;
}

const TIERS: MatchTier[] = ['Reach', 'Match', 'Safe'];

export function FilterBar({
    searchQuery,
    onSearchChange,
    selectedTiers,
    onTierChange,
    viewMode,
    onViewModeChange,
    resultCount,
    quickFilters,
    onQuickFilterChange,
    isSticky = true,
    showViewToggle = true
}: FilterBarProps) {
    return (
        <div
            className={cn(
                'mb-6 flex flex-col gap-4 rounded-[24px] border border-border bg-card/80 p-4 shadow-sm backdrop-blur-xl',
                {
                    'sticky top-4 z-20': isSticky,
                    'relative z-0': !isSticky
                }
            )}
        >
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search universities..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-10 w-full rounded-xl border-border bg-background pl-9 pr-8"
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

                    <div className="flex items-center gap-3 self-start md:self-auto">
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            {resultCount} result{resultCount !== 1 && 's'}
                        </span>
                        {showViewToggle ? (
                            <div className="flex items-center rounded-xl border border-border bg-background p-1 shadow-sm">
                                <button
                                    onClick={() => onViewModeChange('grid')}
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                                        viewMode === 'grid' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                    aria-label="Grid view"
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onViewModeChange('list')}
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                                        viewMode === 'list' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                    aria-label="List view"
                                >
                                    <LayoutList className="h-4 w-4" />
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
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
                                    role="switch"
                                    aria-checked={isSelected}
                                    aria-label={`${tier} tier filter ${isSelected ? 'on' : 'off'}`}
                                >
                                    {tier}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        {([
                            { key: 'budgetFriendly', label: 'Budget' },
                            { key: 'englishOnly', label: 'English' },
                            { key: 'testOptional', label: 'Test-optional' }
                        ] as const).map((filter) => {
                            const active = quickFilters[filter.key];
                            return (
                                <button
                                    key={filter.key}
                                    onClick={() => onQuickFilterChange(filter.key)}
                                    className={cn(
                                        'flex h-9 items-center rounded-xl border px-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                                        active
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                                    )}
                                    role="switch"
                                    aria-checked={active}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
