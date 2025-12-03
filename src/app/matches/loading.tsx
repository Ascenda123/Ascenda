const SkeletonCard = () => (
  <div className="h-48 animate-pulse rounded-[24px] border border-border bg-muted/60" />
);

export default function MatchesLoading() {
  return (
    <div className="space-y-6 p-4">
      <div className="h-8 w-48 rounded-full bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <SkeletonCard key={item} />
        ))}
      </div>
    </div>
  );
}
