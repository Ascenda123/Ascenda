'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import {
  ChevronDown, Bold, Italic, List, ListOrdered, Undo, Redo,
  GripVertical, FileText, RotateCcw, Copy, Check, PenTool,
  Globe, Star, Heart, Trophy, User, MessageSquare, Users, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger, childFade } from '@/lib/motion';
import type { EssayBuildingBlock, EssayPrompt, BlockCategory, ActivityEntry } from '@/lib/data/student-demo-data';
import { EssayAIPanel } from './essay-ai-panel';

/* ─── Config ─────────────────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<BlockCategory, { icon: typeof Globe; label: string; color: string; bg: string }> = {
  identity: { icon: User, label: 'Identity', color: 'text-violet-600', bg: 'bg-violet-500/10' },
  experience: { icon: Globe, label: 'Experience', color: 'text-sky-600', bg: 'bg-sky-500/10' },
  strength: { icon: Star, label: 'Strengths', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  interest: { icon: Heart, label: 'Interests', color: 'text-rose-600', bg: 'bg-rose-500/10' },
  achievement: { icon: Trophy, label: 'Achievements', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  counsellor_insight: { icon: MessageSquare, label: 'Counsellor', color: 'text-violet-600', bg: 'bg-violet-500/10' },
};

const CATEGORY_ORDER: BlockCategory[] = ['identity', 'experience', 'strength', 'interest', 'achievement', 'counsellor_insight'];

const PLATFORMS = ['UCAS', 'Common App', 'UC PIQs', 'Custom'] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_LIMITS: Record<Platform, { unit: 'characters' | 'words'; max: number; tip: string }> = {
  'UCAS': { unit: 'characters', max: 4000, tip: 'Characters including spaces. Stay focused and specific.' },
  'Common App': { unit: 'words', max: 650, tip: 'Sweet spot is 600-650 words.' },
  'UC PIQs': { unit: 'words', max: 350, tip: 'Strict limit. Be concise and direct.' },
  'Custom': { unit: 'words', max: 1000, tip: 'Set your own target.' },
};

/* ─── Component ──────────────────────────────────────────────────────────── */

interface EssayWorkshopProps {
  blocks: EssayBuildingBlock[];
  prompts: EssayPrompt[];
  activities?: ActivityEntry[];
}

export function EssayWorkshop({ blocks, prompts, activities = [] }: EssayWorkshopProps) {
  const [platform, setPlatform] = useState<Platform>('UCAS');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<BlockCategory>>(new Set());
  const [showActivities, setShowActivities] = useState(false);

  const limit = PLATFORM_LIMITS[platform];

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: `Start writing your ${platform} essay...` }),
      CharacterCount.configure({ limit: limit.unit === 'characters' ? limit.max : undefined }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-5 text-foreground leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      setDrafts((prev) => ({ ...prev, [platform]: editor.getText() }));
    },
  });

  const editorText = editor?.getText() ?? '';
  const wordCount = editorText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editorText.length;
  const current = limit.unit === 'words' ? wordCount : charCount;
  const ratio = limit.max > 0 ? current / limit.max : 0;

  const filteredPrompts = useMemo(
    () => prompts.filter((p) => p.platform === platform || platform === 'Custom'),
    [prompts, platform]
  );

  // Persist drafts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ascenda-essay-drafts');
      if (saved) setDrafts(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (Object.keys(drafts).length > 0) {
      localStorage.setItem('ascenda-essay-drafts', JSON.stringify(drafts));
    }
  }, [drafts]);

  useEffect(() => {
    if (editor) {
      const text = drafts[platform] ?? '';
      if (text !== editor.getText()) {
        editor.commands.setContent(
          text ? `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>` : ''
        );
      }
    }
  }, [platform, editor, drafts]);

  const toggleBlock = (id: string) => {
    setSelectedBlocks((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const insertBlock = useCallback((block: EssayBuildingBlock) => {
    if (!editor) return;
    editor.chain().focus().insertContent(`<p><em>[${block.label}]</em> ${block.detail || block.label}</p>`).run();
    setSelectedBlocks((prev) => new Set(prev).add(block.id));
  }, [editor]);

  const toggleCat = (cat: BlockCategory) => {
    setCollapsedCats((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  };

  const handleCopy = () => { navigator.clipboard.writeText(editorText); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleClear = () => { editor?.commands.clearContent(); setDrafts((prev) => ({ ...prev, [platform]: '' })); };

  return (
    <div className="space-y-4">
      {/* ── Top bar: platform + progress ────────────────────────────────────── */}
      <div className="surface-subcard rounded-2xl p-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5 bg-muted/40 p-1 rounded-xl">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
                platform === p
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/70 italic hidden sm:block">{limit.tip}</p>

        <div className="ml-auto flex items-center gap-3">
          {/* Compact progress */}
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/20" />
                <circle
                  cx="16" cy="16" r="13" fill="none" strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={`${Math.min(ratio, 1) * 81.68} 81.68`}
                  className={cn('transition-all duration-500', ratio < 0.8 ? 'stroke-emerald-500' : ratio < 0.95 ? 'stroke-amber-500' : 'stroke-rose-500')}
                />
              </svg>
              <span className={cn('absolute inset-0 flex items-center justify-center text-[8px] font-bold', ratio < 0.8 ? 'text-emerald-600' : ratio < 0.95 ? 'text-amber-600' : 'text-rose-600')}>
                {Math.round(ratio * 100)}%
              </span>
            </div>
            <div className="text-xs leading-tight">
              <p className={cn('font-semibold tabular-nums', ratio < 0.8 ? 'text-emerald-600' : ratio < 0.95 ? 'text-amber-600' : 'text-rose-600')}>
                {current.toLocaleString()}<span className="text-muted-foreground font-normal">/{limit.max.toLocaleString()}</span>
              </p>
              <p className="text-muted-foreground/70 text-[10px]">{limit.unit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 3-column layout ───────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[260px,1fr,280px]">

        {/* ── LEFT: Blocks + Activities ─────────────────────────────────────── */}
        <div className="space-y-1 lg:border-r lg:border-border/40 lg:pr-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">Building Blocks</p>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
            {CATEGORY_ORDER.map((cat) => {
              const catBlocks = blocks.filter((b) => b.category === cat);
              if (catBlocks.length === 0) return null;
              const cfg = CATEGORY_CONFIG[cat];
              const CatIcon = cfg.icon;
              const isCollapsed = collapsedCats.has(cat);
              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleCat(cat)}
                    className="flex items-center gap-1.5 w-full text-left mb-1 group"
                  >
                    <div className={cn('flex h-5 w-5 items-center justify-center rounded-md', cfg.bg)}>
                      <CatIcon className={cn('h-3 w-3', cfg.color)} />
                    </div>
                    <span className={cn('text-[11px] font-semibold flex-1', cfg.color)}>{cfg.label}</span>
                    <span className="text-[10px] text-muted-foreground/50">{catBlocks.length}</span>
                    <ChevronDown className={cn('h-3 w-3 text-muted-foreground/40 transition-transform', isCollapsed && '-rotate-90')} />
                  </button>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <motion.div className="space-y-1 pb-2" variants={stagger} initial="hidden" animate="show">
                          {catBlocks.map((block) => {
                            const isSelected = selectedBlocks.has(block.id);
                            return (
                              <motion.div key={block.id} variants={childFade} className="group/block">
                                <button
                                  onClick={() => toggleBlock(block.id)}
                                  onDoubleClick={() => insertBlock(block)}
                                  draggable
                                  onDragStart={() => setDraggedBlock(block.id)}
                                  onDragEnd={() => setDraggedBlock(null)}
                                  className={cn(
                                    'w-full text-left rounded-lg border px-2.5 py-1.5 text-[12px] transition-all',
                                    isSelected
                                      ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/10'
                                      : 'border-transparent hover:border-border hover:bg-muted/30',
                                    draggedBlock === block.id && 'opacity-40'
                                  )}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <GripVertical className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover/block:opacity-100 transition-opacity shrink-0" />
                                    <span className="font-medium text-foreground flex-1 truncate">{block.label}</span>
                                    {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                                  </div>
                                  {isSelected && block.detail && (
                                    <motion.p
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      className="mt-1 text-[11px] text-muted-foreground leading-relaxed pl-[18px] overflow-hidden"
                                    >
                                      {block.detail}
                                    </motion.p>
                                  )}
                                </button>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Activities */}
            {activities.length > 0 && (
              <div>
                <button
                  onClick={() => setShowActivities(!showActivities)}
                  className="flex items-center gap-1.5 w-full text-left mb-1 group"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-500/10">
                    <Users className="h-3 w-3 text-sky-600" />
                  </div>
                  <span className="text-[11px] font-semibold flex-1 text-sky-600">Activities</span>
                  <span className="text-[10px] text-muted-foreground/50">{activities.length}</span>
                  <ChevronDown className={cn('h-3 w-3 text-muted-foreground/40 transition-transform', !showActivities && '-rotate-90')} />
                </button>
                <AnimatePresence initial={false}>
                  {showActivities && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="space-y-1 pb-2">
                        {activities.map((act) => (
                          <button
                            key={act.id}
                            onClick={() => {
                              if (!editor) return;
                              editor.chain().focus().insertContent(`<p><em>[${act.name}]</em> ${act.role} at ${act.organization} — ${act.description}</p>`).run();
                            }}
                            className="w-full text-left rounded-lg px-2.5 py-1.5 text-[12px] transition-colors hover:bg-muted/30 group/act"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground flex-1 truncate">{act.name}</span>
                              <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover/act:text-sky-500 transition-colors shrink-0" />
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{act.role} · {act.organization}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Selected summary */}
          {selectedBlocks.size > 0 && (
            <div className="pt-2 border-t border-border/30">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1">{selectedBlocks.size} selected</p>
              <div className="flex flex-wrap gap-1">
                {blocks.filter((b) => selectedBlocks.has(b.id)).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => insertBlock(b)}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                    title="Click to insert"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER: Editor ───────────────────────────────────────────────── */}
        <div className="space-y-2">
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 px-1">
            <ToolbarBtn icon={Bold} active={editor?.isActive('bold') ?? false} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold" />
            <ToolbarBtn icon={Italic} active={editor?.isActive('italic') ?? false} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic" />
            <Sep />
            <ToolbarBtn icon={List} active={editor?.isActive('bulletList') ?? false} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet list" />
            <ToolbarBtn icon={ListOrdered} active={editor?.isActive('orderedList') ?? false} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered list" />
            <Sep />
            <ToolbarBtn icon={Undo} active={false} onClick={() => editor?.chain().focus().undo().run()} title="Undo" disabled={!editor?.can().undo()} />
            <ToolbarBtn icon={Redo} active={false} onClick={() => editor?.chain().focus().redo().run()} title="Redo" disabled={!editor?.can().redo()} />
            <div className="flex-1" />
            <button onClick={handleCopy} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleClear} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-colors">
              <RotateCcw className="h-3 w-3" /> Clear
            </button>
          </div>

          {/* Editor */}
          <div
            className="rounded-2xl border border-border/60 bg-card shadow-sm focus-within:border-primary/30 focus-within:shadow-md transition-all"
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
            onDrop={(e) => { e.preventDefault(); if (draggedBlock) { const b = blocks.find((bl) => bl.id === draggedBlock); if (b) insertBlock(b); } }}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Progress bar under editor */}
          <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', ratio < 0.8 ? 'bg-emerald-500' : ratio < 0.95 ? 'bg-amber-500' : 'bg-rose-500')}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(ratio * 100, 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ── RIGHT: AI + Prompts ──────────────────────────────────────────── */}
        <div className="space-y-4 lg:border-l lg:border-border/40 lg:pl-4">
          <EssayAIPanel
            essay={editorText}
            platform={platform}
            selectedBlocks={blocks.filter((b) => selectedBlocks.has(b.id))}
            allBlocks={blocks}
            onInsertText={(text) => {
              if (editor) editor.chain().focus().insertContent(`<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`).run();
            }}
          />

          {/* Prompts */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              <FileText className="h-3 w-3 inline mr-1 align-text-bottom" />
              Prompts for {platform}
            </p>
            {filteredPrompts.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/60">No prompts for this platform yet.</p>
            ) : (
              <div className="space-y-1.5">
                {filteredPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                    className="w-full text-left rounded-xl border border-border/50 p-2.5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-foreground leading-snug">{prompt.title}</span>
                      <ChevronDown className={cn('h-3 w-3 text-muted-foreground/40 transition-transform shrink-0', expandedPrompt === prompt.id && 'rotate-180')} />
                    </div>
                    <AnimatePresence>
                      {expandedPrompt === prompt.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{prompt.prompt}</p>
                          {prompt.relatedBlockIds.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {prompt.relatedBlockIds.map((id) => {
                                const block = blocks.find((b) => b.id === id);
                                return block ? (
                                  <button
                                    key={id}
                                    onClick={(e) => { e.stopPropagation(); insertBlock(block); }}
                                    className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                                  >
                                    + {block.label}
                                  </button>
                                ) : null;
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helpers ──────────────────────────────────────────────────────── */

function ToolbarBtn({ icon: Icon, active, onClick, title, disabled }: { icon: typeof Bold; active: boolean; onClick: () => void; title: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        disabled && 'opacity-25 cursor-not-allowed'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-border/50 mx-0.5" />;
}
