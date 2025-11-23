'use client';

import { useCallback, useEffect, useState } from 'react';

export interface CompareItem {
  id: string;
  program: string;
  university: string;
  location?: string;
  guardianRank?: string | number | null;
  qsRank?: string | number | null;
  timesRank?: string | number | null;
}

const STORAGE_KEY = 'ascenda-compare-list';

export const useCompareStore = () => {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  const addItem = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, addItem, removeItem, ready };
};
