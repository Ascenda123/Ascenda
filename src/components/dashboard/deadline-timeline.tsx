interface TimelineItem {
  id: string;
  name: string;
  date: string;
  context: string;
}

interface DeadlineTimelineProps {
  items: TimelineItem[];
}

export const DeadlineTimeline = ({ items }: DeadlineTimelineProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/60">
        No upcoming deadlines yet. Track programs you plan to apply to.
      </div>
    );
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mt-1 h-2 w-2 rounded-full bg-gradient-to-br from-cyan to-sunrise" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-white">{item.name}</p>
            <p className="text-xs text-white/60">{item.date}</p>
            <p className="text-sm text-white/70">{item.context}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};
