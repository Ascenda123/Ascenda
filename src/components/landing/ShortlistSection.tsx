'use client';

import { motion } from 'framer-motion';

const steps = [
    {
        title: 'Start Ascenda',
        copy: 'Create your profile once: predicted grades, subjects, languages, interests, and vibe.'
    },
    {
        title: 'Explore ranked results',
        copy: 'See Fit Scores, compare modules & requirements, and tune lifestyle filters.'
    },
    {
        title: 'Build & share your plan',
        copy: 'Automatic timelines for essays, tests, references, and direct apply quirks. Share with collaborators instantly.'
    }
];

export function ShortlistSection() {
    return (
        <section className="w-full py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight">Your shortlist in 3 steps</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">The easiest way to see what’s next, why it matters, and how to act.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            className="group relative flex flex-col justify-between rounded-3xl border border-border/40 bg-secondary/10 p-8 hover:bg-secondary/30 transition-all duration-500"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } }
                            }}
                        >
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/50 text-sm font-bold text-foreground shadow-sm">
                                        {index + 1}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Step {index + 1}</span>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{step.copy}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
