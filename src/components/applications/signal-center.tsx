import { Button } from '@/components/ui/button';

export interface SignalItem {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  type: 'deadline' | 'scholarship' | 'portal' | 'task';
}

const TYPE_COLOR: Record<SignalItem['type'], string> = {
  deadline: 'text-rose-600',
  scholarship: 'text-emerald-600',
  portal: 'text-blue-600',
  task: 'text-amber-600'
};

export const SignalCenter = ({ signals }: { signals: SignalItem[] }) => {
  return (
    <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Signal inbox</h2>
          <p className="text-xs text-slate-500">Deadline shifts, portal pings, and scholarships in one stream.</p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
          Live
        </span>
      </div>
      <ul className="space-y-3">
        {signals.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400">
            You are all caught up.
          </li>
        ) : (
          signals.map((signal) => (
            <li
              key={signal.id}
              className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${TYPE_COLOR[signal.type]}`}>{signal.type}</p>
                <Button size="xs" variant="ghost">
                  View
                </Button>
              </div>
              <p className="text-sm font-semibold text-slate-900">{signal.title}</p>
              <p className="text-xs text-slate-500">{signal.detail}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400">{signal.timeAgo}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
