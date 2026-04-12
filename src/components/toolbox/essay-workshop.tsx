'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PenTool, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger, childFade } from '@/lib/motion';
import type { EssayBuildingBlock, EssayPrompt } from '@/lib/data/student-demo-data';

const PLATFORMS = ['UCAS', 'Common App', 'UC PIQs', 'Custom'] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_LIMITS: Record<Platform, { unit: 'characters' | 'words'; max: number }> = {
  'UCAS': { unit: 'characters', max: 4000 },
  'Common App': { unit: 'words', max: 650 },
  'UC PIQs': { unit: 'words', max: 350 },
  'Custom': { unit: 'words', max: 1000 },
};

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

interface EssayWorkshopProps {
  blocks: EssayBuildingBlock[];
  prompts: EssayPrompt[];
}

export function EssayWorkshop({ blocks, prompts }: EssayWorkshopProps) {
  const [platform, setPlatform] = useState<Platform>('UCAS');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const draftText = drafts[platform] ?? '';
  const limit = PLATFORM_LIMITS[platform];
  const current = limit.unit === 'words' ? countWords(draftText) : draftText.length;
  const ratio = limit.max > 0 ? current / limit.max : 0;

  const filteredPrompts = useMemo(
    () => prompts.filter((p) => p.platform === platform || platform === 'Custom'),
    [prompts, platform]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ascenda-essay-drafts');
      if (saved) setDrafts(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('ascenda-essay-drafts', JSON.stringify(drafts));
  }, [drafts]);

  const toggleBlock = (id: string) => {
    setSelectedBlocks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px,1fr,240px]">
      {/* Left: Block picker */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Building Blocks</p>
        <motion.div className="space-y-2 max-h-[600px] overflow-y-auto pr-1" variants={stagger} initial="hidden" animate="show">
          {blocks.map((block) => (
            <motion.button
              key={block.id}
              variants={childFade}
              onClick={() => toggleBlock(block.id)}
              className={cn(
                'w-full text-left rounded-xl border px-3 py-2 text-sm transition-colors',
                selectedBlocks.has(block.id)
                  ? 'border-primary/40 bg-primary/5 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/30'
              )}
            >
              <span className="font-medium text-foreground">{block.label}</span>
              {selectedBlocks.has(block.id) && block.detail && (
                <p className="mt-1 text-xs text-muted-foreground">{block.detail}</p>
              )}
            </motion.button>
          ))}
        </motion.div>
        {selectedBlocks.size > 0 && (
          <p className="text-xs text-muted-foreground">{selectedBlocks.size} block{selectedBlocks.size !== 1 ? 's' : ''} selected</p>
        )}
      </div>

      {/* Center: Editor */}
      <div className="space-y-4">
        {/* Platform tabs */}
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                platform === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="surface-subcard p-0 overflow-hidden">
          <textarea
            value={draftText}
            onChange={(e) => setDrafts((prev) => ({ ...prev, [platform]: e.target.value }))}
            placeholder={`Start writing your ${platform} essay...`}
            className="w-full min-h-[380px] resize-y bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        {/* Count bar */}
        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            'font-semibold',
            ratio < 0.8 ? 'text-emerald-600' : ratio < 0.95 ? 'text-amber-600' : 'text-rose-600'
          )}>
            {current} / {limit.max} {limit.unit}
          </span>
          <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                ratio < 0.8 ? 'bg-emerald-500' : ratio < 0.95 ? 'bg-amber-500' : 'bg-rose-500'
              )}
              style={{ width: `${Math.min(ratio * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Selected blocks reference */}
        {selectedBlocks.size > 0 && (
          <div className="surface-subcard p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Selected blocks for reference</p>
            <div className="flex flex-wrap gap-1.5">
              {blocks.filter((b) => selectedBlocks.has(b.id)).map((b) => (
                <span key={b.id} className="surface-chip text-xs">{b.label}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Prompt sidebar */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Prompts</p>
        {filteredPrompts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No prompts for this platform yet.</p>
        ) : (
          <div className="space-y-2">
            {filteredPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                className="w-full text-left surface-subcard p-3 space-y-1 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{prompt.title}</span>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', expandedPrompt === prompt.id && 'rotate-180')} />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">{prompt.platform}</span>
                {expandedPrompt === prompt.id && (
                  <p className="text-xs text-muted-foreground mt-2">{prompt.prompt}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
