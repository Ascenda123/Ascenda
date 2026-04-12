export default function StudentDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="h-5 w-56 animate-pulse rounded-full bg-muted/50" />
      {/* Header card */}
      <div className="h-40 animate-pulse rounded-[28px] bg-muted/50" />
      {/* Tab nav */}
      <div className="h-14 animate-pulse rounded-[28px] bg-muted/50" />
      {/* Content grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
