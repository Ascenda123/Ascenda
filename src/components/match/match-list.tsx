'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { UniversityCard } from '@/components/university-card';
import type { MatchTier } from '@/lib/matching/engine';
import { cn } from '@/lib/utils';
import { useShortlist } from '@/components/university-search/shortlist-store';
import { Grid, LayoutList } from 'lucide-react';

export interface EnrichedMatch {
  program: {
    id: string;
    name: string;
    field?: string | null;
    level?: string | null;
    language?: string | null;
    mode?: string | null;
    tuition?: number | null;
    currency?: string | null;
    url?: string | null;
  };
  university: {
    id: string;
    name: string;
    country: string;
    rank_overall?: number | null;
    rank_source?: string | null;
    requiresTest?: boolean | null;
  };
  score: number;
  breakdown: {
    eligibility: number;
    academicFit: number;
    preferenceFit: number;
    outcomes: number;
  };
  blockingReasons: string[];
  tier: MatchTier;
}

interface MatchListProps {
  matches: EnrichedMatch[];
}

const TIER_ORDER: MatchTier[] = ['Reach', 'Match', 'Safe'];
const TIER_DESCRIPTIONS: Record<MatchTier, string> = {
  Reach: 'Highly selective universities that stretch your profile.',
  Match: 'Programs that align closely with your academic and preference fit.',
  Safe: 'Comfortable options where you exceed the entry expectations.'
};

const tierCardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as any } }
};

const staggeredGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as any } }
};

export const MatchList = ({ matches }: MatchListProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { items: shortlist, addItem, removeItem } = useShortlist();

  const tierGroups = useMemo(() => {
    const accumulator: Record<MatchTier, EnrichedMatch[]> = {
      Reach: [],
      Match: [],
      Safe: []
    };
    matches.forEach((match) => {
      accumulator[match.tier].push(match);
    });
    return TIER_ORDER.map((tier) => ({ tier, matches: accumulator[tier] }));
  }, [matches]);

  const handleToggleShortlist = (match: EnrichedMatch) => {
    const isShortlisted = shortlist.some((item) => item.id === match.program.id);
    if (isShortlisted) {
      removeItem(match.program.id);
    } else {
      addItem({
        id: match.program.id,
        name: match.university.name,
        program: match.program.name,
        stage: 'Researching',
        fitScore: match.score,
        nextAction: 'Review program details',
        due: 'TBD',
        location: match.university.country
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 rounded-[24px] border border-border bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Matches</p>
          <p className="text-sm text-muted-foreground">
            Showing {matches.length} program{matches.length === 1 ? '' : 's'} ranked by fit
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
              viewMode === 'grid' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
              viewMode === 'list' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="List view"
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      <section className="space-y-6">
        {matches.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-10 text-center text-muted-foreground">
            No matches available.
          </div>
        ) : (
          tierGroups.map(({ tier, matches }) =>
            matches.length ? (
              <motion.div
                key={tier}
                className="space-y-5 rounded-[32px] border border-border bg-card p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)] transition-colors"
                variants={tierCardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
              >
                <div className="flex flex-col gap-2 border-b border-border pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Tier</p>
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
                      {tier}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-semibold text-foreground">{tier} programs</h3>
                    <p className="text-sm text-muted-foreground">{TIER_DESCRIPTIONS[tier]}</p>
                  </div>
                </div>

                <motion.div
                  className={cn(
                    'grid gap-6',
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
                  )}
                  variants={staggeredGrid}
                >
                  {matches.map((match) => (
                    <motion.div key={match.program.id} variants={cardVariants} layout>
                      <UniversityCard
                        id={match.program.id}
                        name={match.university.name}
                        program={match.program.name}
                        location={match.university.country}
                        fitScore={match.score}
                        tier={match.tier}
                        highlights={[
                          match.program.level ?? 'Program',
                          match.program.language ?? 'English'
                        ].filter(Boolean)}
                        variant={viewMode === 'list' ? 'compact' : 'default'}
                        isShortlisted={shortlist.some((item) => item.id === match.program.id)}
                        onToggleShortlist={() => handleToggleShortlist(match)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : null
          )
        )}
      </section>
    </div>
  );
};
