import { UniversityCardSkeleton } from '@/components/university-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function MatchesLoading() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <UniversityCardSkeleton key={item} />
        ))}
      </div>
    </div>
  );
}
