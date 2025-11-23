'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeMode } from './theme-provider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export const ThemeToggle = ({ compact = false, className }: ThemeToggleProps) => {
  const { mode, setMode, toggleMode } = useThemeMode();

  if (compact) {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          'h-9 w-9 rounded-full border border-border/60 bg-card/80 text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/60',
          className
        )}
        onClick={toggleMode}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-2 shadow-sm',
        className
      )}
    >
      <div className="inline-flex items-center gap-1 rounded-full bg-background/60 p-1">
        <Button
          type="button"
          size="sm"
          variant={mode === 'light' ? 'default' : 'ghost'}
          className="gap-1 px-3"
          onClick={() => setMode('light')}
          aria-pressed={mode === 'light'}
        >
          <Sun className="h-4 w-4" />
          Light
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'dark' ? 'default' : 'ghost'}
          className="gap-1 px-3"
          onClick={() => setMode('dark')}
          aria-pressed={mode === 'dark'}
        >
          <Moon className="h-4 w-4" />
          Dark
        </Button>
      </div>
    </div>
  );
};
