'use client';

import { cn } from '@/lib/utils';

type FilterPillProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export const FilterPill = ({ label, active = false, onClick }: FilterPillProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
      active
        ? 'border-slate-900 bg-slate-900 text-white shadow-[0_15px_35px_rgba(15,23,42,0.18)]'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
    )}
  >
    {label}
  </button>
);
