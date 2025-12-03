import { cn } from '@/lib/utils';
import { ArrowUpRight, Minus } from 'lucide-react';
import React from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    detail: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export function StatsCard({ label, value, detail, icon, trend, className }: StatsCardProps) {
    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-[24px] border border-border bg-card/50 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]',
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/5" />

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>
                    <h3 className="text-3xl font-bold tracking-tight text-foreground">
                        {value}
                    </h3>
                </div>
                {icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/50 text-foreground shadow-sm ring-1 ring-border/50 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:text-primary">
                        {icon}
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-4 flex items-center gap-2">
                {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
                {trend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground" />}
                <p className="text-sm font-medium text-muted-foreground">{detail}</p>
            </div>
        </div>
    );
}
