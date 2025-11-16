'use client';

import { useCallback, useEffect, useState } from 'react';

export interface ShortlistItem {
  id: string;
  name: string;
  program: string;
  stage: string;
  fitScore: number;
  nextAction: string;
  due: string;
  location?: string;
}

const STORAGE_KEY = 'ascenda-university-shortlist';

const seedShortlist: ShortlistItem[] = [
  {
    id: 'yale-epe',
    name: 'Yale University',
    program: 'Ethics, Politics & Economics',
    stage: 'Researching',
    fitScore: 88,
    nextAction: 'Schedule counselor debrief to prioritize essays.',
    due: 'Plan by May 12',
    location: 'New Haven, USA'
  },
  {
    id: 'melbourne-design',
    name: 'University of Melbourne',
    program: 'Design + Innovation',
    stage: 'Shortlisted',
    fitScore: 84,
    nextAction: 'Confirm portfolio pieces and prep storytelling video.',
    due: 'Upload draft by May 24',
    location: 'Melbourne, Australia'
  },
  {
    id: 'hkust-gbus',
    name: 'HKUST',
    program: 'Global Business',
    stage: 'Active',
    fitScore: 81,
    nextAction: 'Line up teacher recommendations and test scores.',
    due: 'Locker synced by June 02',
    location: 'Hong Kong'
  }
];

export const useShortlist = () => {
  const [items, setItems] = useState<ShortlistItem[]>(seedShortlist);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems(seedShortlist);
      }
    } else if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedShortlist));
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
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, addItem, removeItem, ready };
};
