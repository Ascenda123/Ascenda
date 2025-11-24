import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    detail: string;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export function StatsCard({ label, value, detail, icon, trend, className }: StatsCardProps) {
    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-[24px] border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-floating',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {label}
                    </p>
                    <h3 className="text-3xl font-heading font-semibold text-foreground tracking-tight">
                        {value}
                    </h3>
                </div>
                {icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        {icon}
                    </div>
                )}
            </div>
            <div className="mt-4 flex items-center gap-2">
                {trend === 'up' && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                    </span>
                )}
                <p className="text-sm text-muted-foreground">{detail}</p>
            </div>
        </div>
    );
}
