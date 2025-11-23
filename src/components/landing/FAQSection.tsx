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
    const [openFaq, setOpenFaq] = useState(faqs[0].question);

    return (
        <section className="mt-16 space-y-8 rounded-[32px] border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg">
            <div className="text-center text-muted-foreground md:text-left">
                <p className="text-xs uppercase tracking-[0.4em] text-accent">Frequently asked questions</p>
                <h2 className="mt-2 text-3xl font-heading font-semibold text-foreground">Answers before you even ask.</h2>
                <p className="text-sm">
                    We keep the playbook simple: transparent timelines, privacy controls, and human support whenever you need it.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {faqs.map((faq) => (
                    <motion.div
                        key={faq.question}
                        className="rounded-[24px] border border-border bg-card/70 p-5 hover:bg-muted/60 transition-colors"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeIn}
                    >
                        <button
                            type="button"
                            className="flex w-full items-center justify-between text-left text-base font-semibold text-foreground"
                            onClick={() => setOpenFaq((prev) => (prev === faq.question ? '' : faq.question))}
                        >
                            <span>{faq.question}</span>
                            <span className="text-sm text-muted-foreground">{openFaq === faq.question ? '−' : '+'}</span>
                        </button>
                        {openFaq === faq.question && <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
