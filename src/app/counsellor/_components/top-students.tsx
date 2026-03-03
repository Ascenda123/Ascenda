import Link from 'next/link';
import { Trophy } from 'lucide-react';
import type { CounsellorStudent } from '@/lib/data/counsellor-dummy-data';

interface TopStudentsProps {
  students: CounsellorStudent[];
}

function getAvgMatchScore(student: CounsellorStudent) {
  if (student.matches.length === 0) return 0;
  return Math.round(student.matches.reduce((acc, m) => acc + m.score, 0) / student.matches.length);
}

function getInitials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}

const AVATAR_COLORS = [
  'bg-violet-500/20 text-violet-700 dark:text-violet-300',
  'bg-sky-500/20 text-sky-700 dark:text-sky-300',
  'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  'bg-rose-500/20 text-rose-700 dark:text-rose-300'
];

const RANK_STYLES = [
  'text-amber-500', // Gold
  'text-slate-400',  // Silver
  'text-amber-700'   // Bronze
];

export const TopStudents = ({ students }: TopStudentsProps) => {
  const ranked = [...students]
    .filter((s) => s.matches.length > 0)
    .sort((a, b) => getAvgMatchScore(b) - getAvgMatchScore(a))
    .slice(0, 5);

  return (
    <div className="space-y-2">
      {ranked.map((student, idx) => {
        const score = getAvgMatchScore(student);
        const initials = getInitials(student.personal.firstName, student.personal.lastName);
        const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

        return (
          <Link
            key={student.id}
            href={`/counsellor/students/${student.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 transition hover:bg-muted/40"
          >
            <span className={`w-5 shrink-0 text-center text-xs font-bold ${RANK_STYLES[idx] ?? 'text-muted-foreground'}`}>
              {idx + 1}
            </span>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor}`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {student.personal.firstName} {student.personal.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {student.academic.programmeType === 'IB'
                  ? `IB ${student.academic.ibPoints} pts`
                  : `A-Level ${student.academic.aLevelGrades}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">{score}</p>
              <p className="text-[11px] text-muted-foreground">avg score</p>
            </div>
            {idx < 3 && <Trophy className={`h-4 w-4 shrink-0 ${RANK_STYLES[idx]}`} />}
          </Link>
        );
      })}
    </div>
  );
};
