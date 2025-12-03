import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
    return (
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                <div className="hidden lg:block lg:col-span-1">
                    <div className="space-y-6 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="mb-6 flex items-center justify-between">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-9 w-40" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-[320px] rounded-[24px] border border-border bg-card/50 p-5">
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
                                <div className="mt-8 grid grid-cols-2 gap-3">
                                    <Skeleton className="h-9 w-full rounded-xl" />
                                    <Skeleton className="h-9 w-full rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
