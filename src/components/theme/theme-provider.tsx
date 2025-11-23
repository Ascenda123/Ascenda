'use client';

import { Theme } from '@radix-ui/themes';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'ascenda-theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      setMode(stored);
      applyDocumentTheme(stored);
      return;
    }

    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode: ThemeMode = prefersDark ? 'dark' : 'light';
    setMode(initialMode);
    applyDocumentTheme(initialMode);
  }, []);

  useEffect(() => {
    applyDocumentTheme(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <Theme appearance={mode} accentColor="indigo" grayColor="slate" scaling="100%">
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

const applyDocumentTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
};
