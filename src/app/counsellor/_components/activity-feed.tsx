import Link from 'next/link';
import { MessageSquare, Flag, RefreshCw } from 'lucide-react';

interface ActivityItem {
  id: string;
  date: string;
  content: string;
  type: 'session' | 'flag' | 'update';
  studentName: string;
  studentId: string;
  studentFlag: string;
}

interface ActivityFeedProps {
  activity: ActivityItem[];
}

const TYPE_CONFIG = {
  session: { icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-500/10', label: 'Session' },
  flag: { icon: Flag, color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Flag' },
  update: { icon: RefreshCw, color: 'text-sky-600', bg: 'bg-sky-500/10', label: 'Update' }
};

function formatRelative(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return 'just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const ActivityFeed = ({ activity }: ActivityFeedProps) => {
  return (
    <div className="space-y-3">
      {activity.map((item) => {
        const cfg = TYPE_CONFIG[item.type];
        const Icon = cfg.icon;
        return (
          <div key={item.id} className="flex gap-3">
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/counsellor/students/${item.studentId}`}
                  className="truncate text-xs font-semibold text-foreground hover:text-primary"
                >
                  {item.studentFlag} {item.studentName}
                </Link>
                <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelative(item.date)}</span>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{item.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
