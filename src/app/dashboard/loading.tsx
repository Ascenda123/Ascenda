import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
    return (
        <DashboardShell>
            <PageHero
                eyebrow="Mission control"
                title="Welcome back"
                description="Track every checklist, deadline, and match signal in one calm dashboard. Keep momentum rolling."
                highlight="Loading..."
                stats={[
                    { label: 'Profile', value: '...', detail: 'Loading...' },
                    { label: 'Checklist', value: '...', detail: 'Loading...' },
                    { label: 'Signals', value: '...', detail: 'Loading...' }
                ]}
                actions={
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-[24px] border border-border bg-card/50 p-6 shadow-sm backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                        <div className="mt-4">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="mt-2 h-4 w-24" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="space-y-4 rounded-[28px] border border-border bg-card/50 p-6 shadow-sm backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 rounded-xl border border-border/50 bg-background/50 p-4">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <aside className="space-y-6">
                    <div className="space-y-4 rounded-[28px] border border-border bg-card/50 p-6 shadow-sm backdrop-blur-xl">
                        <Skeleton className="h-8 w-48" />
                        <div className="space-y-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="relative pl-6">
                                    <Skeleton className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
                <div className="lg:col-span-3">
                    <div className="space-y-4 rounded-[28px] border border-border bg-card/50 p-6 shadow-sm backdrop-blur-xl">
                        <Skeleton className="h-8 w-48" />
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-[280px] rounded-[24px] border border-border bg-card/50 p-5">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </div>
                                    <div className="mt-6 grid grid-cols-2 gap-3">
                                        <Skeleton className="h-9 w-full rounded-xl" />
                                        <Skeleton className="h-9 w-full rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
