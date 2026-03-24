'use client';

import { motion, type Variants, useReducedMotion } from 'framer-motion';
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
    const shouldReduceMotion = useReducedMotion();
    return (
        <section id="features" className="section-fade w-full py-24 bg-secondary/40 sm:py-32">
            <div className="max-w-7xl mx-auto px-6 space-y-12">
                <div className="max-w-3xl space-y-3">
                    <p className="text-sm font-medium uppercase tracking-widest text-primary/80">Why Ascenda</p>
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight">Four ways to make your application journey easier</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                        Everything in Ascenda is tuned to blend calm clarity with clear actions—so you and your team can move through the cycle with
                        confidence and zero guesswork.
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="group flex flex-col gap-5 rounded-3xl border border-border/50 bg-background/60 backdrop-blur-sm p-8 shadow-sm hover:shadow-md hover:bg-background/80 transition-all duration-300"
                            initial={shouldReduceMotion ? false : 'hidden'}
                            whileInView={shouldReduceMotion ? undefined : 'visible'}
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeIn}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <span className="text-4xl font-bold text-black/5 dark:text-white/5 font-heading">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-foreground tracking-tight">{feature.title}</h3>
                                <p className="text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
