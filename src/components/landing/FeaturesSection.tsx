'use client';

import { motion, type Variants } from 'framer-motion';
import { Sparkles, Search, Mail, NotepadText } from 'lucide-react';

const features = [
    {
        title: 'Fit Score · Find your perfect match',
        description: 'Instant, data driven matches that feel like they were tailored for your story.',
        icon: Sparkles
    },
    {
        title: 'Centralized university database',
        description: 'All universities. One place. Compare programs without the doom scroll.',
        icon: Search
    },
    {
        title: 'Campus insights',
        description: 'Real stories from real students show what life actually feels like.',
        icon: Mail
    },
    {
        title: 'Application companion',
        description: 'Personalized timelines, tips, and steps for every part of your application.',
        icon: NotepadText
    }
];

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export function FeaturesSection() {
    return (
        <section className="mt-16 space-y-8">
            <div className="max-w-2xl space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-accent">Why Ascenda</p>
                <h2 className="text-3xl font-heading font-semibold text-foreground">Four ways to make your application journey easier</h2>
                <p className="text-sm text-muted-foreground">
                    Everything in Ascenda is tuned to blend calm clarity with clear actions—so you and your team can move through the cycle with
                    confidence and zero guesswork.
                </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        className="flex flex-col gap-4 rounded-[28px] border border-border bg-card/50 backdrop-blur-sm px-6 py-7 shadow-lg hover:bg-card/80 transition-colors"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeIn}
                    >
                        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-muted-foreground">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card/70 text-base font-semibold text-foreground">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            Pillar
                        </div>
                        <div>
                            <feature.icon className="mb-4 h-9 w-9 text-primary" />
                            <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
