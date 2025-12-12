'use client';

import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

const comparisons = [
    {
        title: 'Without Ascenda',
        bullets: [
            'Confusing choices → waste time on wrong universities.',
            'Scattered info → miss deadlines.',
            'Generic advice → one size fits all stress.',
            'Frustration at every step.'
        ]
    },
    {
        title: 'With Ascenda',
        bullets: [
            'Smart matches → focus on what fits you.',
            'Centralized workspace → track everything in one place.',
            'Personalized guidance → roadmap built with you.',
            'Confidence & clarity → calm, organized journey.'
        ]
    }
];

const splitComparisonCopy = (copy: string) => {
    const [headline, detail] = copy.split('→');
    return {
        headline: headline?.trim() ?? '',
        detail: detail?.trim() ?? ''
    };
};

const comparisonPairs = comparisons[0].bullets.map((bullet, index) => {
    const withBullet = comparisons[1]?.bullets[index] ?? '';
    return {
        without: splitComparisonCopy(bullet),
        with: splitComparisonCopy(withBullet)
    };
});

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export function ComparisonSection() {

    return (
        <section className="w-full py-24 bg-secondary/20">
            <motion.div
                className="max-w-7xl mx-auto px-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
            >
                <div
                    className={cn(
                        'relative overflow-hidden rounded-[30px] text-foreground transition-colors',
                        'border border-border bg-card shadow-[0_18px_45px_rgba(15,23,42,0.08)]',
                        'dark:bg-card/80 dark:shadow-2xl'
                    )}
                >
                    <div className="pointer-events-none absolute inset-0 opacity-20">
                        <div
                            className={cn(
                                'h-full w-full',
                                'bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_55%)]',
                                'dark:bg-[radial-gradient(circle_at_top,_var(--accent),_transparent_60%)]'
                            )}
                        />
                    </div>
                    <div className="relative p-6 sm:p-10">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-accent">With & without Ascenda</p>
                                <h2 className="text-3xl font-heading font-semibold text-foreground">Same student. Different outcome.</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Feel the delta between chaos and clarity, each row pairs the old grind with the Ascenda way.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                    {comparisons[0].title}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    {comparisons[1].title}
                                </span>
                            </div>
                        </div>
                        <div className="mt-10 space-y-6">
                            {comparisonPairs.map((pair, index) => (
                                <div
                                    key={`${pair.without.headline}-${pair.with.headline}-${index}`}
                                    className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]"
                                >
                                    <div
                                        className={cn(
                                            'rounded-[24px] p-5 transition-colors',
                                            'border border-border bg-muted/50 shadow-sm',
                                            'dark:bg-card/70'
                                        )}
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-destructive">
                                            {comparisons[0].title}
                                        </p>
                                        <h3 className="mt-3 text-lg font-semibold text-foreground">{pair.without.headline}</h3>
                                        {pair.without.detail && <p className="mt-1 text-sm text-muted-foreground">{pair.without.detail}</p>}
                                    </div>
                                    <div className="relative flex flex-col items-center gap-2">
                                        {index !== 0 && (
                                            <span
                                                className={cn(
                                                    'hidden h-8 w-px md:block',
                                                    'bg-border/80 dark:bg-muted/60'
                                                )}
                                            />
                                        )}
                                        <span
                                            className={cn(
                                                'flex h-12 w-12 items-center justify-center rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground transition-colors',
                                                'border border-border bg-card',
                                                'dark:bg-card/70'
                                            )}
                                        >
                                            vs
                                        </span>
                                        {index !== comparisonPairs.length - 1 && (
                                            <span
                                                className={cn(
                                                    'hidden h-8 w-px md:block',
                                                    'bg-border/80 dark:bg-muted/60'
                                                )}
                                            />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            'rounded-[24px] p-5 text-foreground transition-colors',
                                            'border border-emerald-500/25 bg-emerald-50/80 shadow-[0_12px_30px_rgba(16,185,129,0.2)]',
                                            'dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:shadow-lg'
                                        )}
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-400">
                                            {comparisons[1].title}
                                        </p>
                                        <h3 className="mt-3 text-lg font-semibold">{pair.with.headline}</h3>
                                        {pair.with.detail && <p className="mt-1 text-sm text-muted-foreground">{pair.with.detail}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
