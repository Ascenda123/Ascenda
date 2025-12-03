'use client';

import { Theme } from '@radix-ui/themes';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemePreference = ThemeMode | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'ascenda-theme-preference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [mode, setMode] = useState<ThemeMode>('light');
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setPreference(stored);
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, preference);
  }, [hasHydrated, preference]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const resolveSystemMode = () => (mediaQuery.matches ? 'dark' : 'light');
    const updateFromSystem = (event: MediaQueryListEvent) => setMode(event.matches ? 'dark' : 'light');

    if (preference === 'system') {
      setMode(resolveSystemMode());
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', updateFromSystem);
        return () => mediaQuery.removeEventListener('change', updateFromSystem);
      }

      mediaQuery.addListener(updateFromSystem);
      return () => mediaQuery.removeListener(updateFromSystem);
    }

    setMode(preference);
    return undefined;
  }, [preference]);

  useEffect(() => {
    applyDocumentTheme(mode);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      preference,
      setPreference,
      setMode: (nextMode) => setPreference(nextMode),
      toggleMode: () =>
        setPreference((prev) => {
          if (prev === 'system') return mode === 'dark' ? 'light' : 'dark';
          return prev === 'dark' ? 'light' : 'dark';
        })
    }),
    [mode, preference]
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
