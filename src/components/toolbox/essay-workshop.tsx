'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import {
  PenTool, ChevronDown, Bold, Italic, List, ListOrdered, Undo, Redo,
  GripVertical, FileText, RotateCcw, Copy, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger, childFade } from '@/lib/motion';
import type { EssayBuildingBlock, EssayPrompt } from '@/lib/data/student-demo-data';
import { EssayAIPanel } from './essay-ai-panel';

const PLATFORMS = ['UCAS', 'Common App', 'UC PIQs', 'Custom'] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_LIMITS: Record<Platform, { unit: 'characters' | 'words'; max: number }> = {
  'UCAS': { unit: 'characters', max: 4000 },
  'Common App': { unit: 'words', max: 650 },
  'UC PIQs': { unit: 'words', max: 350 },
  'Custom': { unit: 'words', max: 1000 },
};

const PLATFORM_NOTES: Record<Platform, string> = {
  'UCAS': 'UCAS counts characters including spaces. Keep your statement focused and specific.',
  'Common App': 'Common App counts words. The sweet spot is 600–650 words.',
  'UC PIQs': 'Each PIQ has a strict 350-word limit. Be concise and direct.',
  'Custom': 'Custom essays — set your own target word count.',
};


interface EssayWorkshopProps {
  blocks: EssayBuildingBlock[];
  prompts: EssayPrompt[];
}

export function EssayWorkshop({ blocks, prompts }: EssayWorkshopProps) {
  const [platform, setPlatform] = useState<Platform>('UCAS');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  const draftText = drafts[platform] ?? '';
  const limit = PLATFORM_LIMITS[platform];

  // Tiptap editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `Start writing your ${platform} essay...`,
      }),
      CharacterCount.configure({
        limit: limit.unit === 'characters' ? limit.max : undefined,
      }),
    ],
    content: draftText ? `<p>${draftText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>` : '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[350px] px-5 py-4 text-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setDrafts((prev) => ({ ...prev, [platform]: text }));
    },
  });

  // Calculate counts from editor
  const editorText = editor?.getText() ?? '';
  const wordCount = editorText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editorText.length;
  const current = limit.unit === 'words' ? wordCount : charCount;
  const ratio = limit.max > 0 ? current / limit.max : 0;

  const filteredPrompts = useMemo(
    () => prompts.filter((p) => p.platform === platform || platform === 'Custom'),
    [prompts, platform]
  );

  // Load saved drafts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ascenda-essay-drafts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDrafts(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Save drafts
  useEffect(() => {
    if (Object.keys(drafts).length > 0) {
      localStorage.setItem('ascenda-essay-drafts', JSON.stringify(drafts));
    }
  }, [drafts]);

  // Sync editor content when platform changes
  useEffect(() => {
    if (editor) {
      const text = drafts[platform] ?? '';
      const currentText = editor.getText();
      if (text !== currentText) {
        editor.commands.setContent(
          text ? `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>` : ''
        );
      }
    }
  }, [platform, editor, drafts]);

  const toggleBlock = (id: string) => {
    setSelectedBlocks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const insertBlock = useCallback((block: EssayBuildingBlock) => {
    if (!editor) return;
    const text = block.detail || block.label;
    editor.chain().focus().insertContent(`<p><em>[${block.label}]</em> ${text}</p>`).run();
    setSelectedBlocks((prev) => new Set(prev).add(block.id));
  }, [editor]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    editor?.commands.clearContent();
    setDrafts((prev) => ({ ...prev, [platform]: '' }));
  };

  return (
    <div className="space-y-5">
      {/* Platform switcher + stats */}
      <div className="flex flex-wrap items-center gap-3">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              platform === p
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {p}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{PLATFORM_LIMITS[platform].max} {PLATFORM_LIMITS[platform].unit} max</span>
        </div>
      </div>

      {/* Platform note */}
      <p className="text-xs text-muted-foreground/70 italic">{PLATFORM_NOTES[platform]}</p>

      {/* Main 3-column layout */}
      <div className="grid gap-5 lg:grid-cols-[240px,1fr,260px]">

        {/* Left: Block picker with drag */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Building Blocks</p>
          <p className="text-[11px] text-muted-foreground">Click to select, double-click to insert into essay</p>
          <motion.div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin" variants={stagger} initial="hidden" animate="show">
            {blocks.map((block) => {
              const isSelected = selectedBlocks.has(block.id);
              return (
                <motion.div
                  key={block.id}
                  variants={childFade}
                  draggable
                  onDragStart={() => setDraggedBlock(block.id)}
                  onDragEnd={() => setDraggedBlock(null)}
                  className="group"
                >
                  <button
                    onClick={() => toggleBlock(block.id)}
                    onDoubleClick={() => insertBlock(block)}
                    className={cn(
                      'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-all',
                      isSelected
                        ? 'border-primary/40 bg-primary/5 text-foreground ring-1 ring-primary/20'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/20 hover:bg-muted/30',
                      draggedBlock === block.id && 'opacity-50 scale-95'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground text-[13px] leading-snug">{block.label}</span>
                        {isSelected && block.detail && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-1.5 text-xs text-muted-foreground leading-relaxed overflow-hidden"
                          >
                            {block.detail}
                          </motion.p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
          {selectedBlocks.size > 0 && (
            <div className="surface-subcard px-3 py-2">
              <p className="text-[11px] font-semibold text-muted-foreground">{selectedBlocks.size} block{selectedBlocks.size !== 1 ? 's' : ''} selected</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {blocks.filter((b) => selectedBlocks.has(b.id)).map((b) => (
                  <span key={b.id} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Rich text editor */}
        <div className="space-y-3">
          {/* Toolbar */}
          <div className="surface-subcard flex items-center gap-1 px-2 py-1.5 rounded-xl overflow-x-auto">
            <ToolbarButton
              icon={Bold}
              active={editor?.isActive('bold') ?? false}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              title="Bold"
            />
            <ToolbarButton
              icon={Italic}
              active={editor?.isActive('italic') ?? false}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              title="Italic"
            />
            <div className="w-px h-5 bg-border mx-1" />
            <ToolbarButton
              icon={List}
              active={editor?.isActive('bulletList') ?? false}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            />
            <ToolbarButton
              icon={ListOrdered}
              active={editor?.isActive('orderedList') ?? false}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            />
            <div className="w-px h-5 bg-border mx-1" />
            <ToolbarButton
              icon={Undo}
              active={false}
              onClick={() => editor?.chain().focus().undo().run()}
              title="Undo"
              disabled={!editor?.can().undo()}
            />
            <ToolbarButton
              icon={Redo}
              active={false}
              onClick={() => editor?.chain().focus().redo().run()}
              title="Redo"
              disabled={!editor?.can().redo()}
            />
            <div className="flex-1" />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              title="Copy plain text"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
              title="Clear essay"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
          </div>

          {/* Editor area */}
          <div
            className="surface-subcard rounded-2xl overflow-hidden ring-1 ring-border/50 focus-within:ring-primary/30 transition-all"
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedBlock) {
                const block = blocks.find((b) => b.id === draggedBlock);
                if (block) insertBlock(block);
              }
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-4">
            {/* Circular progress */}
            <div className="relative h-12 w-12 shrink-0">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                <circle
                  cx="24" cy="24" r="20" fill="none" strokeWidth="3"
                  strokeDasharray={`${Math.min(ratio, 1) * 125.66} 125.66`}
                  strokeLinecap="round"
                  className={cn(
                    'transition-all duration-500',
                    ratio < 0.8 ? 'stroke-emerald-500' : ratio < 0.95 ? 'stroke-amber-500' : 'stroke-rose-500'
                  )}
                />
              </svg>
              <span className={cn(
                'absolute inset-0 flex items-center justify-center text-[10px] font-bold',
                ratio < 0.8 ? 'text-emerald-600' : ratio < 0.95 ? 'text-amber-600' : 'text-rose-600'
              )}>
                {Math.round(ratio * 100)}%
              </span>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={cn(
                  'font-semibold',
                  ratio < 0.8 ? 'text-emerald-600' : ratio < 0.95 ? 'text-amber-600' : 'text-rose-600'
                )}>
                  {current.toLocaleString()} / {limit.max.toLocaleString()} {limit.unit}
                </span>
                <span className="text-muted-foreground">
                  {limit.unit === 'characters' ? `${wordCount} words` : `${charCount.toLocaleString()} characters`}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    ratio < 0.8 ? 'bg-emerald-500' : ratio < 0.95 ? 'bg-amber-500' : 'bg-rose-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(ratio * 100, 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Selected blocks reference strip */}
          {selectedBlocks.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="overflow-hidden"
            >
              <div className="surface-subcard p-3 rounded-xl">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2">Blocks in use</p>
                <div className="flex flex-wrap gap-1.5">
                  {blocks.filter((b) => selectedBlocks.has(b.id)).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => insertBlock(b)}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                      title={`Click to insert "${b.label}" into your essay`}
                    >
                      <PenTool className="h-3 w-3" />
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: AI Assistant + Prompts */}
        <div className="space-y-5">
          {/* AI Essay Assistant */}
          <EssayAIPanel
            essay={editorText}
            platform={platform}
            selectedBlocks={blocks.filter((b) => selectedBlocks.has(b.id))}
            allBlocks={blocks}
            onInsertText={(text) => {
              if (editor) {
                editor.chain().focus().insertContent(`<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`).run();
              }
            }}
          />

          {/* Prompts */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 inline mr-1 align-text-bottom" />
              Prompts
            </p>
            {filteredPrompts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No prompts for this platform yet.</p>
            ) : (
              <div className="space-y-2">
                {filteredPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                    className="w-full text-left surface-subcard p-3 space-y-1.5 hover:bg-muted/30 transition-colors rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-foreground leading-snug">{prompt.title}</span>
                      <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0', expandedPrompt === prompt.id && 'rotate-180')} />
                    </div>
                    <span className="inline-block rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {prompt.platform}
                    </span>
                    <AnimatePresence>
                      {expandedPrompt === prompt.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{prompt.prompt}</p>
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

// ─── Toolbar Button ─────────────────────────────────────────────────────────

function ToolbarButton({
  icon: Icon,
  active,
  onClick,
  title,
  disabled,
}: {
  icon: typeof Bold;
  active: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
