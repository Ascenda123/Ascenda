export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-36 animate-pulse rounded-[28px] bg-muted/50" />
      {/* Search bar */}
      <div className="h-14 animate-pulse rounded-[24px] bg-muted/50" />
      {/* Card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-52 animate-pulse rounded-[24px] bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
