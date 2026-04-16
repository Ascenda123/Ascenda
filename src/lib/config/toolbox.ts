import {
  Globe,
  Star,
  Heart,
  Trophy,
  User,
  MessageSquare,
} from 'lucide-react';
import type { BlockCategory } from '@/lib/data/student-demo-data';

export const CATEGORY_CONFIG: Record<BlockCategory, { icon: typeof Globe; label: string; color: string; bg: string }> = {
  identity: { icon: User, label: 'Identity', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-200/60 dark:border-indigo-500/20' },
  experience: { icon: Globe, label: 'Experience', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10 border-sky-200/60 dark:border-sky-500/20' },
  strength: { icon: Star, label: 'Strengths', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20' },
  interest: { icon: Heart, label: 'Interests', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20' },
  achievement: { icon: Trophy, label: 'Achievements', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20' },
  counsellor_insight: { icon: MessageSquare, label: 'Counsellor', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-200/60 dark:border-violet-500/20' },
};

export const CATEGORY_ORDER: BlockCategory[] = ['identity', 'experience', 'strength', 'interest', 'achievement', 'counsellor_insight'];
