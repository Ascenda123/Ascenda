import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center animate-in fade-in-50",
                className
            )}
            {...props}
        >
            {Icon && (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 ring-8 ring-muted/20">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                </div>
            )}
            <h3 className="mt-6 text-xl font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
