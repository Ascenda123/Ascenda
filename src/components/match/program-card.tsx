import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MatchTier } from '@/lib/matching/engine';
import Link from 'next/link';

export interface ProgramCardProps {
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
  };
  scoreBadge: React.ReactNode;
  onSave?: () => void;
  saved?: boolean;
  tier?: MatchTier;
}

const TIER_STYLES: Record<MatchTier, string> = {
  Reach: 'bg-rose-500/15 text-rose-100 ring-rose-200/40 border border-rose-200/30',
  Match: 'bg-amber-500/15 text-amber-100 ring-amber-200/40 border border-amber-200/30',
  Safe: 'bg-emerald-500/15 text-emerald-100 ring-emerald-200/40 border border-emerald-200/30'
};

export const ProgramCard = ({ program, university, scoreBadge, onSave, saved, tier }: ProgramCardProps) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col gap-2 bg-transparent">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">{program.name}</CardTitle>
            <CardDescription>
              {university.name} • {university.country}
            </CardDescription>
          </div>
          {scoreBadge}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <p className="flex-1">
            {program.field ?? 'General program'} · {program.level ?? 'N/A'} · {program.language ?? 'Language TBD'}
          </p>
          {tier ? (
            <span
              className={cn(
                'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ring-1',
                TIER_STYLES[tier]
              )}
            >
              {tier}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tuition</p>
            <p className="text-base font-semibold text-foreground">
              {program.tuition ? `${program.currency ?? 'USD'} ${program.tuition.toLocaleString()}` : 'Varies'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ranking</p>
            <p className="text-base font-semibold text-foreground">
              {university.rank_overall ? `#${university.rank_overall}` : 'Top university'}
            </p>
          </div>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          {program.url ? (
            <Button asChild variant="outline" size="sm" className="border-border text-foreground hover:bg-muted/60">
              <Link href={program.url} target="_blank" rel="noopener noreferrer">
                View program
              </Link>
            </Button>
          ) : null}
          {onSave ? (
            <Button type="button" size="sm" onClick={onSave} variant={saved ? 'secondary' : 'default'}>
              {saved ? 'Saved' : 'Save program'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
