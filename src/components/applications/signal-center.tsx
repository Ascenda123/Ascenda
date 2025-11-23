import { Button } from '@/components/ui/button';

export interface SignalItem {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  type: 'deadline' | 'scholarship' | 'portal' | 'task';
}

const TYPE_COLOR: Record<SignalItem['type'], string> = {
  deadline: 'text-rose-400',
  scholarship: 'text-emerald-400',
  portal: 'text-blue-400',
  task: 'text-amber-400'
};

export const SignalCenter = ({ signals }: { signals: SignalItem[] }) => {
  return (
    <div className="space-y-4 rounded-[28px] border border-border bg-card p-6 text-sm text-muted-foreground shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Signal inbox</h2>
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
          signals.map((signal) => (
            <li
              key={signal.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/60 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${TYPE_COLOR[signal.type]}`}>{signal.type}</p>
                <Button size="xs" variant="ghost">
                  View
                </Button>
              </div>
              <p className="text-sm font-semibold text-foreground">{signal.title}</p>
              <p className="text-xs text-muted-foreground">{signal.detail}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground">{signal.timeAgo}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
