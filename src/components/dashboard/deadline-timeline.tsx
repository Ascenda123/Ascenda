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
      <div className="rounded-[24px] border border-dashed border-border bg-muted/60 p-6 text-center text-sm text-muted-foreground">
        No upcoming deadlines yet. Track programs you plan to apply to.
      </div>
    );
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-colors">
          <div className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">{item.name}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.date}</p>
            <p className="text-sm text-muted-foreground">{item.context}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};
