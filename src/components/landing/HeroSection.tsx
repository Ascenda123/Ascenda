'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
    Activity,
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

const heroBoardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }
    }
};

export function HeroSection() {
    const [typedHeadline, setTypedHeadline] = useState('');
    const [isTypingDone, setIsTypingDone] = useState(false);
    const [launchHref, setLaunchHref] = useState('/signup');
    const supabase = useSupabase();
    const { mode } = useThemeMode();

    useEffect(() => {
        let index = 0;
        const timer = window.setInterval(() => {
            index += 1;
            setTypedHeadline(heroHeadline.slice(0, index));
            if (index >= heroHeadline.length) {
                setIsTypingDone(true);
                window.clearInterval(timer);
            }
        }, 30);

        return () => {
            window.clearInterval(timer);
        };
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

    const heroRevealClass = isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2';
    const displayedHeadline = typedHeadline || ' ';

    return (
        <section className="relative min-h-[75vh] overflow-hidden">
            <div className="absolute inset-0">
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
                                className="bg-background/50 backdrop-blur-md border-white/10 text-foreground hover:bg-white/10"
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
                                <p className="text-xs uppercase tracking-[0.5em] text-accent">Admissions OS</p>
                                <h1
                                    className="text-5xl font-heading font-semibold leading-tight tracking-tight text-foreground sm:text-[3.6rem]"
                                    aria-label={heroHeadline}
                                >
                                    <span className="text-foreground">{displayedHeadline}</span>
                                    <span
                                        aria-hidden
                                        className={`ml-2 inline-block h-[1.1em] w-px bg-accent align-middle transition-opacity duration-300 ${isTypingDone ? 'opacity-0' : 'opacity-100 animate-pulse'
                                            }`}
                                    />
                                </h1>
                                <p
                                    className={`text-lg text-muted-foreground sm:text-xl transition-all duration-500 ease-out ${heroRevealClass}`}
                                    style={{ transitionDelay: isTypingDone ? '120ms' : '0ms' }}
                                >
                                    Get matched to the right universities and courses, unlock real campus insights, and receive a tailored application plan in one modern workspace.
                                </p>
                                <div
                                    className={`flex flex-wrap gap-3 transition-all duration-500 ease-out ${heroRevealClass}`}
                                    style={{ transitionDelay: isTypingDone ? '200ms' : '0ms' }}
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
                                        className="border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                                    >
                                        <Link href="/download">See product tour</Link>
                                    </Button>
                                </div>
                                <ul
                                    className={`flex flex-wrap gap-4 text-sm text-muted-foreground transition-all duration-500 ease-out ${heroRevealClass}`}
                                    style={{ transitionDelay: isTypingDone ? '260ms' : '0ms' }}
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
                                </ul>
                            </div>
                            <motion.div
                                className="rounded-[36px] border border-white/10 bg-card/50 p-6 text-card-foreground shadow-2xl backdrop-blur-xl"
                                initial="hidden"
                                animate={isTypingDone ? 'visible' : 'hidden'}
                                variants={heroBoardVariants}
                            >
                                <div className="flex items-center justify-between gap-4 text-[0.7rem] uppercase tracking-[0.4em] text-muted-foreground">
                                    <span className="flex items-center gap-2 text-foreground">
                                        <LayoutDashboard className="h-4 w-4 text-accent" />
                                        Ascenda board
                                    </span>
                                    <div className="flex gap-2">
                                        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[0.55rem] text-foreground">
                                            <ClipboardList className="h-3.5 w-3.5 text-blue-300" />
                                            Plan
                                        </span>
                                        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[0.55rem] text-foreground">
                                            <Activity className="h-3.5 w-3.5 text-emerald-300" />
                                            Signals
                                        </span>
                                        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[0.55rem] text-foreground">
                                            <NotebookPen className="h-3.5 w-3.5 text-amber-300" />
                                            Notes
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Fit score</p>
                                            <span className="text-xs uppercase tracking-[0.3em] text-emerald-400">On target</span>
                                        </div>
                                        <div className="mt-2 flex items-end justify-between">
                                            <p className="text-4xl font-semibold text-foreground">92%</p>
                                            <p className="text-sm text-muted-foreground">Parsons Paris · Strategic Design</p>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-white/10">
                                            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" style={{ width: '92%' }} />
                                        </div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
                                            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Next actions</p>
                                            <ul className="mt-3 space-y-2 text-sm text-foreground">
                                                <li className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                                        <span className="font-medium">Scholarship essay</span>
                                                    </div>
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
                                                        Due Fri
                                                    </span>
                                                </li>
                                                <li className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-amber-300 to-rose-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                                        <span className="font-medium">Portfolio upload</span>
                                                    </div>
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
                                                        Review
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
                                            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Notes sync</p>
                                            <div className="mt-3 space-y-2 text-sm text-foreground">
                                                <p className="text-base font-medium leading-relaxed">
                                                    <span className="text-2xl text-amber-300">“</span>Greenlit for ESADE interview...&rdquo;
                                                </p>
                                                <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
                                                    <span className="font-semibold text-foreground">Claire</span>
                                                    <span className="h-0.5 w-8 bg-white/10" />
                                                    <span className="">2h ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-[24px] border border-white/10 px-5 py-4 bg-white/5">
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
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    <span>Updated 1 min ago</span>
                                    <span className="h-px flex-1 bg-white/10"></span>
                                    <span>View timeline →</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </section>
                </div>
            </div>
        </section>
    );
}
