'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, type Variants, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export function DemoSection() {
    const shouldReduceMotion = useReducedMotion();
    return (
        <section className="section-fade w-full bg-secondary/40 py-24 sm:py-32">
            <motion.div
                className="max-w-7xl mx-auto px-6 grid gap-12 md:grid-cols-[0.9fr_1.1fr] items-center"
                initial={shouldReduceMotion ? false : 'hidden'}
                whileInView={shouldReduceMotion ? undefined : 'visible'}
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
            >
                <div className="space-y-8">
                    <div className="space-y-4">
                        <p className="text-sm font-medium uppercase tracking-widest text-primary/80">Quick demo</p>
                        <h2 className="text-4xl font-heading font-bold text-foreground tracking-tight">Aim higher. Land smarter.</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Paste predicted grades, hit enter, and Ascenda animates Fit Scores, timelines, and required actions in real time. No extra UI
                            noise, just the next move.
                        </p>
                    </div>

                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-accent" />
                            Live Fit Score recalculations
                        </li>
                        <li className="flex items-center gap-3 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-accent" />
                            Scholarships + visa checks in-line
                        </li>
                        <li className="flex items-center gap-3 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-accent" />
                            Notes stay synced automatically
                        </li>
                    </ul>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
                            <Link href="/demo">Watch 45s demo</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="rounded-full border-border hover:bg-background/80">
                            <Link href="/stories">See student reels</Link>
                        </Button>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[28px] border border-border/50 bg-black/5 dark:bg-white/5 p-4 shadow-2xl">
                    <div className="absolute inset-x-4 top-4 h-12 rounded-full bg-primary/20 blur-3xl opacity-50" />
                    <Image
                        src="/demo-loop.gif"
                        alt="Ascenda demo loop"
                        width={960}
                        height={540}
                        className="relative h-auto w-full rounded-2xl border border-border/20 shadow-sm"
                        priority
                    />
                </div>
            </motion.div>
        </section>
    );
}
