import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
}

export const ProgramCard = ({ program, university, scoreBadge, onSave, saved }: ProgramCardProps) => {
  return (
    <Card className="flex flex-col border-white/10 bg-white/10">
      <CardHeader className="flex flex-col gap-2 bg-transparent">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-display text-2xl">{program.name}</CardTitle>
            <CardDescription className="text-white/70">
              {university.name} • {university.country}
            </CardDescription>
          </div>
          {scoreBadge}
        </div>
        <p className="text-sm text-white/70">
          {program.field ?? 'General program'} · {program.level ?? 'N/A'} · {program.language ?? 'Language TBD'}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm text-white/70">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Tuition</p>
            <p className="text-base font-semibold text-white">
              {program.tuition ? `${program.currency ?? 'USD'} ${program.tuition.toLocaleString()}` : 'Varies'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Ranking</p>
            <p className="text-base font-semibold text-white">
              {university.rank_overall ? `#${university.rank_overall}` : 'Top university'}
            </p>
          </div>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          {program.url ? (
            <Button asChild variant="outline" size="sm">
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
