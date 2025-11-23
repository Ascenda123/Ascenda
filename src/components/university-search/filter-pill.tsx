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
        ? 'border-primary bg-primary text-primary-foreground shadow-[0_15px_35px_rgba(15,23,42,0.18)]'
        : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground'
    )}
  >
    {label}
  </button>
);
