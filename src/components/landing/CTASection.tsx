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
        <section className="w-full py-32 bg-primary">
            <motion.div
                className="max-w-4xl mx-auto px-6 text-center space-y-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
            >
                <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/60">Plan confidently</p>
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground tracking-tight">Launch with the decisions that matter.</h2>
                    <p className="text-xl text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
                        Tie programs, essays, scholarships, and deadlines together—so every action is tied to the right school and nothing slips through the cracks.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Button
                        asChild
                        size="lg"
                        className="bg-background text-foreground hover:bg-background/90 shadow-xl h-12 px-8 text-base"
                    >
                        <Link href="/signup">Create free account</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8 text-base">
                        <Link href="/demo">Book live demo</Link>
                    </Button>
                </div>
            </motion.div>
        </section>
    );
}
