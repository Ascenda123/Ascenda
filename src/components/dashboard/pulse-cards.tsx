'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Compass, Target, Zap } from 'lucide-react';
import { stagger, cardFade as cardVariant } from '@/lib/motion';

const ICON_MAP = {
  CheckCircle2,
  Compass,
  Target,
  Zap,
} as const;

export type PulseCardIcon = keyof typeof ICON_MAP;

interface PulseCard {
  label: string;
  value: string;
  detail: string;
  icon: PulseCardIcon;
  accentClass: string;
}

interface PulseCardsProps {
  cards: PulseCard[];
}

export function PulseCards({ cards }: PulseCardsProps) {
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {cards.map((card) => {
        const Icon = ICON_MAP[card.icon];
        return (
          <motion.div
            key={card.label}
            className="surface-stat flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            variants={cardVariant}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${card.accentClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-foreground">{card.value}</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.detail}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
