export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-36 animate-pulse rounded-[28px] bg-muted/50" />
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
