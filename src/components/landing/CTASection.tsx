'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export function CTASection() {
    return (
        <motion.section
            className="mt-16 space-y-4 rounded-[36px] border border-border bg-card/50 backdrop-blur-sm px-8 py-10 text-center text-foreground shadow-2xl"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
        >
            <p className="text-xs uppercase tracking-[0.5em] text-accent">Plan confidently</p>
            <h2 className="text-3xl font-heading font-semibold">Launch with the decisions that matter.</h2>
            <p className="text-sm text-muted-foreground">
                Tie programs, essays, scholarships, and deadlines together—so every action is tied to the right school and nothing slips through the cracks.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button
                    asChild
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                    <Link href="/signup">Create free account</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="border border-border text-foreground hover:bg-card/70">
                    <Link href="/demo">Book live demo</Link>
                </Button>
            </div>
        </motion.section>
    );
}
