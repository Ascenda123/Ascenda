'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type React from 'react';
import { motion, type Variants, useMotionValue, useTransform } from 'framer-motion';
import {
    Activity,
    ChevronDown,
    ClipboardList,
    Laptop,
    LayoutDashboard,
    NotebookPen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';
import { RETURNING_USER_STORAGE_KEY } from '@/lib/constants';
import { useThemeMode } from '../theme/theme-provider';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../theme/theme-toggle';

const heroHeadline = 'The #1 University Application Companion.';

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const dashboardContainerVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.12, delayChildren: 0.25 }
    }
};

const dashboardItemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } }
};

export function HeroSection() {
    const [typedHeadline, setTypedHeadline] = useState('');
    const [isTypingDone, setIsTypingDone] = useState(false);
    const [launchHref, setLaunchHref] = useState('/signup');
    const supabase = useSupabase();
    const { mode } = useThemeMode();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-80, 80], [10, -10]);
    const rotateY = useTransform(x, [-120, 120], [-12, 12]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    useEffect(() => {
        let index = 0;
        const timer = window.setInterval(() => {
            index += 1;
            setTypedHeadline(heroHeadline.slice(0, index));
            if (index >= heroHeadline.length) {
                setIsTypingDone(true);
                window.clearInterval(timer);
            }
        }, 28);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        let isActive = true;

        const determineDestination = async () => {
            const hasVisitedBefore =
                typeof window !== 'undefined' &&
                window.localStorage.getItem(RETURNING_USER_STORAGE_KEY) === 'true';

            if (hasVisitedBefore) {
                if (isActive) {
                    setLaunchHref('/dashboard');
                }
                return;
            }

            const { data, error } = await supabase.auth.getSession();
            if (!error && data.session && isActive) {
                setLaunchHref('/dashboard');
            }
        };

        void determineDestination();

        return () => {
            isActive = false;
        };
    }, [supabase]);

    return (
        <section className="relative min-h-[75vh] overflow-hidden">
            <div className="absolute inset-0">
                <motion.div
                    className="absolute -left-24 top-[-15%] h-[55vw] w-[55vw] rounded-full bg-indigo-500/25 blur-3xl"
                    animate={{ x: [0, 50, -40, 0], y: [0, 30, 10, 0], opacity: [0.22, 0.32, 0.22] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -right-24 bottom-[-20%] h-[45vw] w-[45vw] rounded-full bg-emerald-400/20 blur-3xl"
                    animate={{ x: [0, -60, 40, 0], y: [0, -20, 30, 0], rotate: [0, 5, -5, 0], opacity: [0.18, 0.28, 0.18] }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
                />
                <Image
                    src="/Ascenda Banner.png"
                    alt="Ascenda hero banner"
                    fill
                    priority
                    sizes="100vw"
                    className={cn(
                        'object-cover transition-opacity duration-300',
                        mode === 'dark' ? 'opacity-75' : 'opacity-100'
                    )}
                />
                <div
                    className={cn(
                        'absolute inset-0 pointer-events-none transition-colors duration-300',
                        mode === 'dark'
                            ? 'bg-gradient-to-b from-background/60 via-background/45 to-background'
                            : 'bg-gradient-to-b from-transparent via-background/25 to-background'
                    )}
                />
            </div>
            <div className="relative z-10">
                <motion.header
                    className="sticky top-0 z-30 w-full mb-8 bg-transparent px-4 py-4 sm:px-6"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-foreground">
                        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground">
                            <Image
                                src="/Gemini_Generated_Image_t7l91wt7l91wt7l9-removebg-preview.png"
                                alt="Ascenda logo"
                                width={160}
                                height={160}
                                priority
                                className="h-auto w-[205px] object-contain"
                            />
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle compact className="backdrop-blur md:backdrop-blur-none" />
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="bg-background/50 backdrop-blur-md border-border text-foreground hover:bg-muted/60"
                            >
                                <Link href={launchHref} className="flex items-center gap-2">
                                    <Laptop className="h-4 w-4" />
                                    Launch Ascenda
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.header>

                <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6">
                    <section className="space-y-12 pb-16 pt-4">
                        <motion.div
                            className="grid items-center gap-10 lg:grid-cols-[0.9fr,1.1fr]"
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.5em] text-accent">Admissions OS</p>
                                    <motion.p
                                        className="text-sm font-medium text-foreground/80"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                    >
                                        You are closer than you think—let&apos;s finish your applications.
                                    </motion.p>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0.7, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <motion.h1
                                        className="text-5xl font-heading font-semibold leading-tight tracking-tight text-foreground sm:text-[3.6rem]"
                                        aria-label={heroHeadline}
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeIn}
                                    >
                                        <span className="inline-block">
                                            {typedHeadline || ' '}
                                            <span
                                                aria-hidden
                                                className={`ml-1 inline-block h-[1.1em] w-px bg-accent align-middle ${isTypingDone ? 'animate-pulse' : 'animate-pulse'
                                                    }`}
                                            />
                                        </span>
                                    </motion.h1>
                                    <motion.p
                                        className="mt-4 text-lg text-muted-foreground sm:text-xl"
                                        variants={fadeIn}
                                        initial="hidden"
                                        animate={isTypingDone ? 'visible' : 'hidden'}
                                        transition={{ delay: 0.55 }}
                                    >
                                        Get matched to the right universities and courses, unlock real campus insights, and receive a tailored application plan in one modern workspace.
                                    </motion.p>
                                </motion.div>
                                <motion.div
                                    className="flex flex-wrap gap-3"
                                    variants={fadeIn}
                                    initial="hidden"
                                    animate={isTypingDone ? 'visible' : 'hidden'}
                                    transition={{ delay: 0.9 }}
                                >
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]"
                                    >
                                        <Link href={launchHref}>Launch Ascenda</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="border-border bg-card/70 text-foreground hover:bg-muted/60"
                                    >
                                        <Link href="/download">See product tour</Link>
                                    </Button>
                                </motion.div>
                                <motion.ul
                                    className="flex flex-wrap gap-4 text-sm text-muted-foreground"
                                    variants={fadeIn}
                                    initial="hidden"
                                    animate={isTypingDone ? 'visible' : 'hidden'}
                                    transition={{ delay: 0.7 }}
                                >
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                        Fit scores auto recalibrate with every edit.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                        Notes stay perfectly in sync.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                        Timeline nudges prevent deadline drift.
                                    </li>
                                </motion.ul>
                            </div>
                            <motion.div
                                className="rounded-[36px] border border-border bg-card/50 p-6 text-card-foreground shadow-2xl backdrop-blur-xl"
                                initial="hidden"
                                animate={isTypingDone ? 'visible' : 'hidden'}
                                variants={dashboardContainerVariants}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                transition={{ delay: 1.05, staggerChildren: 0.1, delayChildren: 0.15 }}
                                style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 1200 }}
                            >
                                <motion.div
                                    className="flex items-center justify-between gap-4 text-[0.7rem] uppercase tracking-[0.4em] text-muted-foreground"
                                    variants={dashboardItemVariants}
                                >
                                    <span className="flex items-center gap-2 text-foreground">
                                        <LayoutDashboard className="h-4 w-4 text-accent" />
                                        Ascenda board
                                    </span>
                                    <div className="flex gap-2">
                                        <motion.span
                                            className="flex items-center gap-1 rounded-full border border-border bg-card/70 px-3 py-0.5 text-[0.55rem] text-foreground"
                                            animate={isTypingDone ? { scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] } : undefined}
                                            transition={{ duration: 1.2, delay: 1.4, repeat: 1 }}
                                        >
                                            <ClipboardList className="h-3.5 w-3.5 text-blue-300" />
                                            Plan
                                        </motion.span>
                                        <motion.span
                                            className="flex items-center gap-1 rounded-full border border-border bg-card/70 px-3 py-0.5 text-[0.55rem] text-foreground"
                                            animate={isTypingDone ? { scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] } : undefined}
                                            transition={{ duration: 1.2, delay: 1.6, repeat: 1 }}
                                        >
                                            <Activity className="h-3.5 w-3.5 text-emerald-300" />
                                            Signals
                                        </motion.span>
                                        <motion.span
                                            className="flex items-center gap-1 rounded-full border border-border bg-card/70 px-3 py-0.5 text-[0.55rem] text-foreground"
                                            animate={isTypingDone ? { scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] } : undefined}
                                            transition={{ duration: 1.2, delay: 1.8, repeat: 1 }}
                                        >
                                            <NotebookPen className="h-3.5 w-3.5 text-amber-300" />
                                            Notes
                                        </motion.span>
                                    </div>
                                </motion.div>
                                <div className="mt-6 space-y-4">
                                    <motion.div
                                        className="rounded-[24px] border border-border bg-card/70 px-5 py-4"
                                        variants={dashboardItemVariants}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Fit score</p>
                                            <span className="text-xs uppercase tracking-[0.3em] text-emerald-400">On target</span>
                                        </div>
                                        <div className="mt-2 flex items-end justify-between">
                                            <p className="text-4xl font-semibold text-foreground">92%</p>
                                            <p className="text-sm text-muted-foreground">Parsons Paris · Strategic Design</p>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-muted/60">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: '92%' }}
                                                transition={{ delay: 1.35, duration: 1.1, ease: 'easeOut' }}
                                            />
                                            <motion.div
                                                className="absolute inset-0 overflow-hidden rounded-full"
                                                initial={false}
                                                animate={isTypingDone ? { opacity: [0, 1, 0] } : { opacity: 0 }}
                                                transition={{ delay: 2.6, duration: 1.2 }}
                                            >
                                                <motion.div
                                                    className="h-full w-1/3 bg-white/50 blur-sm"
                                                    initial={{ x: '-120%' }}
                                                    animate={{ x: '160%' }}
                                                    transition={{ duration: 1.2, ease: 'easeInOut', delay: 2.6 }}
                                                />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <motion.div
                                            className="rounded-[24px] border border-border bg-card/70 px-5 py-4"
                                            variants={dashboardItemVariants}
                                        >
                                            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Next actions</p>
                                            <ul className="mt-3 space-y-2 text-sm text-foreground">
                                                <li className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                                        <span className="font-medium">Scholarship essay</span>
                                                    </div>
                                                    <span className="rounded-full border border-border bg-card/70 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
                                                        Due Fri
                                                    </span>
                                                </li>
                                                <li className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-amber-300 to-rose-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                                        <span className="font-medium">Portfolio upload</span>
                                                    </div>
                                                    <span className="rounded-full border border-border bg-card/70 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
                                                        Review
                                                    </span>
                                                </li>
                                            </ul>
                                        </motion.div>
                                        <motion.div
                                            className="rounded-[24px] border border-border bg-card/70 px-5 py-4"
                                            variants={dashboardItemVariants}
                                        >
                                            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Notes sync</p>
                                            <div className="mt-3 space-y-2 text-sm text-foreground">
                                                <p className="text-base font-medium leading-relaxed">
                                                    <span className="text-2xl text-amber-300">“</span>Greenlit for ESADE interview...&rdquo;
                                                </p>
                                                <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
                                                    <span className="font-semibold text-foreground">Claire</span>
                                                    <span className="h-0.5 w-8 bg-muted/60" />
                                                    <span className="">2h ago</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                    <motion.div
                                        className="rounded-[24px] border border-border px-5 py-4 bg-card/70"
                                        variants={dashboardItemVariants}
                                    >
                                        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Active signals</p>
                                        <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                                            <div>
                                                <p className="text-2xl font-semibold text-foreground">4</p>
                                                <p className="text-xs uppercase tracking-[0.3em]">Programs</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-semibold text-foreground">2</p>
                                                <p className="text-xs uppercase tracking-[0.3em]">Deadlines</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-semibold text-foreground">1</p>
                                                <p className="text-xs uppercase tracking-[0.3em]">Scholarship</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                                <motion.div
                                    className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
                                    variants={dashboardItemVariants}
                                >
                                    <span>Updated 1 min ago</span>
                                    <span className="h-px flex-1 bg-muted/60"></span>
                                    <span>View timeline →</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            className="flex justify-center pt-2 text-muted-foreground"
                            initial={{ opacity: 0, y: -4 }}
                            animate={isTypingDone ? { opacity: 0.9, y: 0 } : { opacity: 0, y: -4 }}
                            transition={{ delay: 1.3, duration: 0.6, ease: 'easeOut' }}
                        >
                            <motion.div
                                animate={{ y: [0, 6, 0], opacity: [0.9, 0.5, 0.9] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <ChevronDown className="h-5 w-5" />
                            </motion.div>
                        </motion.div>
                    </section>
                </div>
            </div>
        </section>
    );
}
