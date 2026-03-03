export default function CounsellorLoading() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="h-36 animate-pulse rounded-[28px] bg-muted/50" />
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-[24px] bg-muted/50" />
        ))}
      </div>
      {/* Widget grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-[24px] bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
