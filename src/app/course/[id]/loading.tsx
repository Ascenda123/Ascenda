import { Navbar } from '@/components/layout/navbar';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourseLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pb-24">
        <div className="relative border-b border-border/40 bg-muted/10">
          <div className="relative z-10 w-full px-4 py-12 sm:px-6 lg:px-10">
            <Skeleton className="mb-8 h-4 w-48" />
            <Skeleton className="mb-8 h-9 w-32" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-12 w-full max-w-3xl" />
              <Skeleton className="h-5 w-72" />
              <div className="flex flex-wrap gap-2 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-28 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-border/40 bg-background/95">
          <div className="w-full px-4 sm:px-6 lg:px-10">
            <div className="flex gap-2 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full space-y-8 px-4 py-12 sm:px-6 lg:px-10">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </main>
    </div>
  );
}
