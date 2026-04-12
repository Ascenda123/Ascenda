'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EssayBuildingBlock, EssayPrompt } from '@/lib/data/student-demo-data';

// ─── Component ───────────────────────────────────────────────────────────────

interface EssayPromptMatcherProps {
  prompts: EssayPrompt[];
  blocks: EssayBuildingBlock[];
}

export function EssayPromptMatcher({ prompts, blocks }: EssayPromptMatcherProps) {
  const [expandedId, setExpandedId] = useState<string | null>(prompts[0]?.id ?? null);

  const blockMap = new Map(blocks.map((b) => [b.id, b]));

  return (
    <div className="space-y-3">
      {prompts.map((prompt) => {
        const isExpanded = expandedId === prompt.id;
        const related = prompt.relatedBlockIds.map((id) => blockMap.get(id)).filter(Boolean) as EssayBuildingBlock[];

        return (
          <div
            key={prompt.id}
            className="surface-subcard rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
              className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/30"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {prompt.platform}
                  </span>
                  <p className="text-sm font-semibold text-foreground truncate">{prompt.title}</p>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground line-clamp-2">{prompt.prompt}</p>
              </div>
              <ChevronDown className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform mt-1',
                isExpanded && 'rotate-180'
              )} />
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border/40 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
                      Relevant building blocks ({related.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {related.map((block) => (
                        <span
                          key={block.id}
                          className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"
                        >
                          {block.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
