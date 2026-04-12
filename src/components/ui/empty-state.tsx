'use client';

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    hint?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    hint,
    action,
    className,
}: EmptyStateProps) {
    return (
        <motion.div
            className={cn(
                "flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-10 text-center",
                className
            )}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {Icon && (
                <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 ring-1 ring-primary/10"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                >
                    <Icon className="h-7 w-7 text-primary/40" />
                </motion.div>
            )}
            <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground leading-relaxed">
                    {description}
                </p>
            )}
            {hint && (
                <p className="mt-1.5 max-w-sm text-center text-xs text-muted-foreground/60">
                    {hint}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </motion.div>
    );
}
