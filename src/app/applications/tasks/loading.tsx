import { DashboardShell } from '@/components/layout/shell';
import { SectionNav } from '@/components/layout/section-nav';
import { PLANNER_SECTION_ITEMS } from '@/components/layout/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function TasksLoading() {
    return (
        <DashboardShell>
            <SectionNav items={PLANNER_SECTION_ITEMS} />

            <div className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                        <Skeleton className="h-5 w-5 rounded" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                ))}
            </div>
        </DashboardShell>
    );
}
