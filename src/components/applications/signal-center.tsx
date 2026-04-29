import { cn } from '@/lib/utils';
import { SIGNAL_VISUAL, type SignalType } from '@/lib/theme/categories';

export interface SignalItem {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  type: SignalType;
}

const TYPE_LABEL: Record<SignalType, string> = {
  deadline: 'Deadline',
  scholarship: 'Scholarship',
  portal: 'Portal update',
  task: 'Task'
};

export const SignalCenter = ({ signals }: { signals: SignalItem[] }) => {
  return (
    <div className="space-y-4 rounded-[28px] border border-border bg-card p-6 text-sm text-muted-foreground shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Updates</h2>
          <p className="text-xs text-muted-foreground">Deadline shifts, portal pings, and scholarships in one stream.</p>
        </div>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground">
          Live
        </span>
      </div>
      <ul className="space-y-3">
        {signals.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            You are all caught up.
          </li>
        ) : (
          signals.map((signal) => {
            const visual = SIGNAL_VISUAL[signal.type];
            const Icon = visual.icon;
            return (
              <li
                key={signal.id}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border border-l-4 bg-muted/40 px-4 py-3 transition-colors',
                  visual.border,
                  visual.accent
                )}
              >
                <div className={visual.swatch}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-[10px] font-semibold uppercase tracking-[0.3em]', visual.text)}>
                    {TYPE_LABEL[signal.type]}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{signal.title}</p>
                  <p className="text-xs text-muted-foreground">{signal.detail}</p>
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
                  {signal.timeAgo}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};
