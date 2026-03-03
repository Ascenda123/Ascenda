import Link from 'next/link';
import { Clock, CalendarDays } from 'lucide-react';

interface DeadlineItem {
  id: string;
  university: string;
  program: string;
  date: string;
  type: string;
  studentId: string;
  studentName: string;
  studentFlag: string;
  daysUntil: number;
}

interface DeadlineWidgetProps {
  deadlines: DeadlineItem[];
}

const TYPE_LABELS: Record<string, string> = {
  early_decision: 'Early Decision',
  regular: 'Regular',
  scholarship: 'Scholarship',
  interview: 'Interview'
};

function urgencyClass(days: number) {
  if (days <= 3) return 'text-red-600 bg-red-500/10 border-red-200/50 dark:border-red-500/20';
  if (days <= 7) return 'text-amber-600 bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20';
  return 'text-sky-600 bg-sky-500/10 border-sky-200/50 dark:border-sky-500/20';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const DeadlineWidget = ({ deadlines }: DeadlineWidgetProps) => {
  if (deadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No deadlines in the next 7 days</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {deadlines.map((d) => (
        <Link
          key={d.id}
          href={`/counsellor/students/${d.studentId}`}
          className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 transition hover:bg-muted/40"
        >
          <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border text-center text-xs font-bold leading-none ${urgencyClass(d.daysUntil)}`}>
            <Clock className="mb-0.5 h-3 w-3" />
            {d.daysUntil <= 0 ? 'Due' : `${d.daysUntil}d`}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {d.studentFlag} {d.studentName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {d.university} · {TYPE_LABELS[d.type] ?? d.type}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{formatDate(d.date)}</span>
        </Link>
      ))}
    </div>
  );
};
