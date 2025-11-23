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
        <section className="mt-16 space-y-6">
            <div>
                <h2 className="text-3xl font-heading font-semibold text-foreground">Your shortlist in 3 steps</h2>
                <p className="text-sm text-muted-foreground">The easiest way to see what’s next, why it matters, and how to act.</p>
            </div>
            <div className="relative space-y-4 pt-4">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.title}
                        className="flex items-start gap-4 rounded-[26px] border border-white/10 bg-card/50 backdrop-blur-sm p-5 shadow-lg"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.05 } }
                        }}
                    >
                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-foreground">
                            {index + 1}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-accent">Step {index + 1}</p>
                            <h3 className="mt-2 text-lg font-semibold text-foreground">{step.title}</h3>
                            <p className="mt-1">{step.copy}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
