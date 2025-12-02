'use client';

import { useCallback, useEffect, useState } from 'react';

export interface ShortlistItem {
  id: string;
  name: string;
  program: string;
  stage?: string;
  fitScore?: number | null;
  nextAction?: string | null;
  due?: string | null;
  location?: string;
}

const STORAGE_KEY = 'ascenda-university-shortlist-v2';
const OLD_STORAGE_KEY = 'ascenda-university-shortlist';
const DEMO_IDS = new Set(['yale-epe', 'melbourne-design', 'hkust-gbus']);

export const useShortlist = () => {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    const legacy = typeof window !== 'undefined' ? window.localStorage.getItem(OLD_STORAGE_KEY) : null;
    const parseItems = (value: string | null) => {
      if (!value) return null;
      try {
        return JSON.parse(value) as ShortlistItem[];
      } catch {
        return null;
      }
    };

    const migrated = parseItems(stored) ?? parseItems(legacy);
    const cleaned = migrated?.filter((item) => !DEMO_IDS.has(item.id)) ?? [];
    if (cleaned.length > 0) {
      setItems(cleaned);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
    } else {
      setItems([]);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(OLD_STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  const addItem = useCallback((item: ShortlistItem) => {
    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) {
        return prev;
      }
      return [
        ...prev,
        {
          stage: 'Researching',
          due: null,
          nextAction: null,
          ...item
        }
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, addItem, removeItem, ready };
};
