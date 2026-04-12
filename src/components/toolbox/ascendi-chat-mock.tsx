'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatConversation } from '@/lib/data/student-demo-data';

// ─── Animation ───────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

const msgFade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
};

// ─── Component ───────────────────────────────────────────────────────────────

interface AscendiChatMockProps {
  conversations: ChatConversation[];
}

export function AscendiChatMock({ conversations }: AscendiChatMockProps) {
  const [activeConv, setActiveConv] = useState(conversations[0]?.id ?? '');
  const current = conversations.find((c) => c.id === activeConv) ?? conversations[0];

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[500px]">
      {/* Conversation selector */}
      <div className="lg:w-56 shrink-0 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground px-1">
          Conversations
        </p>
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActiveConv(conv.id)}
            className={cn(
              'w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition',
              activeConv === conv.id
                ? 'border-primary/30 bg-primary/10 text-primary shadow-sm'
                : 'border-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            )}
          >
            {conv.title}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col surface-subcard rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/40 px-5 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Ascendi</p>
            <p className="text-[11px] text-muted-foreground">Your university guidance assistant</p>
          </div>
        </div>

        {/* Messages */}
        <motion.div
          key={current?.id}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {current?.messages.map((msg) => {
            const isAscendi = msg.role === 'ascendi';

            return (
              <motion.div
                key={msg.id}
                variants={msgFade}
                className={cn('flex gap-3', !isAscendi && 'justify-end')}
              >
                {isAscendi && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    isAscendi
                      ? 'bg-primary/5 border border-primary/10 text-foreground'
                      : 'bg-muted/60 text-foreground ml-auto'
                  )}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>
                      {line.split(/(\*\*[^*]+\*\*)/).map((segment, j) =>
                        segment.startsWith('**') && segment.endsWith('**') ? (
                          <strong key={j}>{segment.slice(2, -2)}</strong>
                        ) : (
                          <span key={j}>{segment}</span>
                        )
                      )}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Typing indicator */}
          <motion.div
            variants={msgFade}
            className="flex gap-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Input bar (disabled) */}
        <div className="border-t border-border/40 px-5 py-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 opacity-60">
            <input
              type="text"
              disabled
              placeholder="Chat coming soon..."
              className="flex-1 bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/50 outline-none cursor-not-allowed"
            />
            <Send className="h-4 w-4 text-muted-foreground/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
