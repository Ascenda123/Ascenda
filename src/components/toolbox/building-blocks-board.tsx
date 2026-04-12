'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Heart,
  MessageSquare,
  Sparkles,
  Star,
  Trophy,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger, blockFade } from '@/lib/motion';
import type { BlockCategory, BlockSource, EssayBuildingBlock } from '@/lib/data/student-demo-data';

// ─── Config ──────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<BlockCategory, { icon: typeof Globe; label: string; color: string; bg: string }> = {
  experience: { icon: Globe, label: 'Experience', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10 border-sky-200/60 dark:border-sky-500/20' },
  strength: { icon: Star, label: 'Strength', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20' },
  interest: { icon: Heart, label: 'Interest', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20' },
  achievement: { icon: Trophy, label: 'Achievement', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20' },
  identity: { icon: User, label: 'Identity', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-200/60 dark:border-violet-500/20' },
  counsellor_insight: { icon: MessageSquare, label: 'Counsellor Insight', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-200/60 dark:border-violet-500/20' }
};

const SOURCE_CONFIG: Record<BlockSource, { label: string; className: string }> = {
  profile: { label: 'Profile', className: 'bg-primary/10 text-primary' },
  counsellor: { label: 'Counsellor', className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  chatbot: { label: 'Ascendi', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
};

const ALL_CATEGORIES: BlockCategory[] = ['identity', 'experience', 'strength', 'interest', 'achievement', 'counsellor_insight'];
const ALL_SOURCES: BlockSource[] = ['profile', 'counsellor', 'chatbot'];

// ─── Component ───────────────────────────────────────────────────────────────

interface BuildingBlocksBoardProps {
  blocks: EssayBuildingBlock[];
}

export function BuildingBlocksBoard({ blocks }: BuildingBlocksBoardProps) {
  const [activeCategory, setActiveCategory] = useState<BlockCategory | null>(null);
  const [activeSource, setActiveSource] = useState<BlockSource | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = blocks.filter((b) => {
    if (activeCategory && b.category !== activeCategory) return false;
    if (activeSource && b.source !== activeSource) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mr-1">Category</span>
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              !activeCategory
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  activeCategory === cat
                    ? cn('border-transparent', cfg.bg, cfg.color)
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mr-1">Source</span>
          <button
            onClick={() => setActiveSource(null)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              !activeSource
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            All
          </button>
          {ALL_SOURCES.map((src) => {
            const cfg = SOURCE_CONFIG[src];
            return (
              <button
                key={src}
                onClick={() => setActiveSource(activeSource === src ? null : src)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  activeSource === src
                    ? cn('border-transparent', cfg.className)
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span> building blocks
        </p>
      </div>

      {/* Grid */}
      <motion.div
        className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((block) => {
            const cfg = CATEGORY_CONFIG[block.category];
            const src = SOURCE_CONFIG[block.source];
            const Icon = cfg.icon;
            const isExpanded = expandedId === block.id;

            return (
              <motion.div
                key={block.id}
                layout
                variants={blockFade}
                initial="hidden"
                animate="show"
                exit="exit"
                className={cn(
                  'break-inside-avoid cursor-pointer rounded-2xl border p-4 transition-all hover:-translate-y-0.5',
                  cfg.bg
                )}
                onClick={() => setExpandedId(isExpanded ? null : block.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', cfg.color, 'bg-white/60 dark:bg-white/5')}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug">{block.label}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', src.className)}>
                        {src.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">{cfg.label}</span>
                    </div>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && block.detail && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 text-[13px] text-muted-foreground/90 leading-relaxed overflow-hidden"
                    >
                      {block.detail}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
