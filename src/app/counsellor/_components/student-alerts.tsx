import Link from 'next/link';
import { AlertTriangle, UserX, Clock, TrendingDown } from 'lucide-react';
import type { CounsellorStudent, StudentFlag } from '@/lib/data/counsellor-dummy-data';

interface StudentAlertsProps {
  students: CounsellorStudent[];
}

const FLAG_CONFIG: Record<StudentFlag, { label: string; icon: typeof AlertTriangle; color: string; bg: string }> = {
  profile_incomplete: { label: 'Profile incomplete', icon: UserX, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  deadline_urgent: { label: 'Deadline in ≤5 days', icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' },
  no_matches: { label: 'No matches yet', icon: TrendingDown, color: 'text-sky-600', bg: 'bg-sky-500/10' },
  stalled: { label: 'Stalled — no recent activity', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' }
};

export const StudentAlerts = ({ students }: StudentAlertsProps) => {
  const flagged = students.filter((s) => s.flags.length > 0);

  if (flagged.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <AlertTriangle className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold text-foreground">All students on track</p>
        <p className="text-xs text-muted-foreground">No attention flags at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {flagged.map((student) =>
        student.flags.map((flag) => {
          const cfg = FLAG_CONFIG[flag];
          const Icon = cfg.icon;
          return (
            <Link
              key={`${student.id}-${flag}`}
              href={`/counsellor/students/${student.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 transition hover:bg-muted/40 hover:shadow-sm"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {student.personal.flagEmoji} {student.personal.firstName} {student.personal.lastName}
                </p>
                <p className={`text-xs ${cfg.color}`}>{cfg.label}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">View →</span>
            </Link>
          );
        })
      )}
    </div>
  );
};
