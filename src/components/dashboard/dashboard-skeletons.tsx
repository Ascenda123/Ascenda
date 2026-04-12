import { Skeleton } from '@/components/ui/skeleton';
import { UniversityCardSkeleton } from '@/components/university-card-skeleton';

export const StatsCardSkeleton = () => (
  <div className="glass-card rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
    <div className="mt-4 space-y-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

export const TaskListSkeleton = () => (
  <div className="glass-panel rounded-[28px] p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
    <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
    <div className="mt-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const DeadlinesSkeleton = () => (
  <div className="glass-panel space-y-4 rounded-[28px] p-6">
    <Skeleton className="h-7 w-40" />
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="relative pl-6">
          <Skeleton className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  </div>
);

export const RecommendedProgramsSkeleton = () => (
  <div className="glass-panel space-y-4 rounded-[28px] p-6">
    <Skeleton className="h-7 w-56" />
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <UniversityCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
