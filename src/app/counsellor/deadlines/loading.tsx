export default function DeadlinesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-36 animate-pulse rounded-[28px] bg-muted/50" />
      <div className="h-14 animate-pulse rounded-2xl bg-muted/50" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
      ))}
    </div>
  );
}
