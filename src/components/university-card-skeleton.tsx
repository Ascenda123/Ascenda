import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const UniversityCardSkeleton = ({ variant = 'default' }: { variant?: 'default' | 'compact' }) => {
  const isCompact = variant === 'compact';

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm',
        isCompact ? 'p-4' : 'p-5'
      )}
      aria-hidden
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex items-center justify-center rounded-full bg-muted/80 ring-4 ring-border/80', isCompact ? 'h-10 w-10' : 'h-12 w-12')}>
          <Skeleton className={cn('rounded-full', isCompact ? 'h-4 w-8' : 'h-5 w-10')} />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="mt-4 space-y-2">
        <Skeleton className={cn('w-3/4', isCompact ? 'h-5' : 'h-6')} />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </article>
  );
};
