'use client';

import * as React from 'react';
import { AnimatePresence, motion, HTMLMotionProps } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange?.(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    {/* Content Wrapper to handle z-index and positioning */}
                    <div className="relative z-50 flex w-full items-center justify-center p-4 sm:p-6">
                        {children}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

interface DialogContentProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
    children: React.ReactNode;
    className?: string;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    'relative w-full max-w-lg overflow-hidden rounded-xl border bg-background text-foreground shadow-lg sm:rounded-2xl',
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
DialogContent.displayName = 'DialogContent';

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}
