'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';

const faqs = [
    {
        question: 'Why do real time admissions signals matter?',
        answer:
            'Requirements pivot mid cycle; Ascenda flags updates instantly so you move before a deadline slips.'
    },
    {
        question: 'Who uses Ascenda?',
        answer: 'Students, families, and universities craving one modern, polished planning space.'
    },
    {
        question: 'Is there a free plan?',
        answer:
            'Students start free with vibe profiles, five program boards, and scholarship tracking. Teams can invite collaborators on flexible plans.'
    },
    {
        question: 'Is my data private?',
        answer:
            'Yes. Ascenda stores data in region, enforces MFA, and offers permissions for every stakeholder.'
    },
    {
        question: 'Which destinations are covered?',
        answer:
            'US, Canada, UK, EU, Australia, Singapore, Hong Kong, and more regional pathways with visa insights preloaded.'
    },
    {
        question: 'Can I talk to someone?',
        answer:
            'Absolutely. Email hello@ascenda.com for a live walkthrough, expert intro, or onboarding help.'
    }
];

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export function FAQSection() {
    const [openFaq, setOpenFaq] = useState<string | null>(faqs[0].question);

    return (
        <section className="w-full py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[0.4fr_0.6fr]">
                <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-widest text-primary/80">FAQ</p>
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">Answers before you even ask.</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        We keep the playbook simple: transparent timelines, privacy controls, and human support whenever you need it.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <motion.div
                            key={faq.question}
                            className="rounded-2xl border border-border/50 bg-secondary/5 overflow-hidden transition-all hover:bg-secondary/10"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeIn}
                        >
                            <button
                                type="button"
                                className="flex w-full items-center justify-between p-6 text-left"
                                onClick={() => setOpenFaq((prev) => (prev === faq.question ? null : faq.question))}
                            >
                                <span className="text-base font-semibold text-foreground pr-4">{faq.question}</span>
                                <span className="flex-none text-muted-foreground">
                                    {openFaq === faq.question ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                                    )}
                                </span>
                            </button>
                            {openFaq === faq.question && (
                                <div className="px-6 pb-6 pt-0">
                                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
