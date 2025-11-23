'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export function DemoSection() {
    return (
        <motion.section
            className="mt-16 grid gap-8 rounded-[32px] border border-border bg-card/50 backdrop-blur-sm p-6 md:grid-cols-[0.9fr_1.1fr]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
        >
            <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-accent">Quick demo</p>
                <h2 className="text-3xl font-heading font-semibold text-foreground">Aim higher. Land smarter.</h2>
                <p className="text-sm text-muted-foreground">
                    Paste predicted grades, hit enter, and Ascenda animates Fit Scores, timelines, and required actions in real time. No extra UI
                    noise, just the next move.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        Live Fit Score recalculations
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        Scholarships + visa checks in-line
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        Notes stay synced automatically
                    </li>
                </ul>
                <div className="flex flex-wrap gap-3 pt-2">
                    <Button asChild size="sm">
                        <Link href="/demo">Watch 45s demo</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="border border-border text-foreground hover:bg-card/70">
                        <Link href="/stories">See student reels</Link>
                    </Button>
                </div>
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-black/40 p-4">
                <div className="absolute inset-x-4 top-4 h-12 rounded-full bg-primary/20 blur-3xl" />
                <Image
                    src="/demo-loop.gif"
                    alt="Ascenda demo loop"
                    width={960}
                    height={540}
                    className="relative h-auto w-full rounded-[18px] border border-border opacity-90"
                    priority
                />
            </div>
        </motion.section>
    );
}
