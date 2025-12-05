'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/types/database';

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
const TABLE_NAME = 'shortlisted_programs';

type ShortlistRow = Database['public']['Tables']['shortlisted_programs']['Row'];
type Client = SupabaseClient<Database>;

export const useShortlist = () => {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [ready, setReady] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const supabaseRef = useRef<Client | null>(null);

  const mapRowToItem = (row: ShortlistRow): ShortlistItem => {
    const numericFit =
      typeof row.fit_score === 'number'
        ? row.fit_score
        : typeof row.fit_score === 'string'
          ? Number.parseFloat(row.fit_score)
          : null;
    return {
      id: row.program_id,
      name: row.university_name ?? 'University',
      program: row.program_name ?? 'Program',
      stage: row.stage ?? 'Researching',
      fitScore: Number.isFinite(numericFit) ? numericFit : null,
      nextAction: row.next_action,
      due: row.due_date,
      location: row.location ?? undefined
    };
  };

  const persistLocal = useCallback((value: ShortlistItem[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  }, []);

  const loadLocal = useCallback((): ShortlistItem[] => {
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
    return cleaned;
  }, []);

  const upsertRemoteItem = useCallback(
    async (client: Client, userId: string, item: ShortlistItem) => {
      const payload: Database['public']['Tables']['shortlisted_programs']['Insert'] = {
        profile_id: userId,
        program_id: item.id,
        program_name: item.program,
        university_name: item.name,
        location: item.location ?? null,
        fit_score: item.fitScore ?? null,
        stage: item.stage ?? 'Researching',
        next_action: item.nextAction ?? null,
        due_date: item.due ?? null,
        metadata: null
      };
      const { error } = await client.from(TABLE_NAME).upsert(payload, { onConflict: 'profile_id,program_id' });
      if (error) {
        console.warn('Failed to upsert shortlist item', error);
      }
    },
    []
  );

  const deleteRemoteItem = useCallback(
    async (client: Client, userId: string, programId: string) => {
      const { error } = await client.from(TABLE_NAME).delete().eq('profile_id', userId).eq('program_id', programId);
      if (error) {
        console.warn('Failed to remove shortlist item', error);
      }
    },
    []
  );

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    supabaseRef.current = supabase;

    const hydrate = async () => {
      const localItems = loadLocal();
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id ?? null;
      setProfileId(userId);

      if (!userId) {
        setItems(localItems);
        setReady(true);
        return;
      }

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('program_id,program_name,university_name,location,fit_score,stage,next_action,due_date')
        .eq('profile_id', userId);

      if (error) {
        console.warn('Falling back to local shortlist due to Supabase error', error);
        setItems(localItems);
        setReady(true);
        return;
      }

      const remoteItems = (data ?? []).map(mapRowToItem);
      const merged: ShortlistItem[] = [...remoteItems];

      // Merge in any local-only items and persist them remotely
      const missingLocals = localItems.filter(
        (local) => !remoteItems.some((remote) => remote.id === local.id)
      );
      if (missingLocals.length > 0) {
        merged.push(...missingLocals);
        await Promise.all(missingLocals.map((item) => upsertRemoteItem(supabase, userId, item)));
      }

      setItems(merged);
      persistLocal(merged);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(OLD_STORAGE_KEY);
      }
      setReady(true);
    };

    void hydrate();
  }, [loadLocal, persistLocal, upsertRemoteItem]);

  useEffect(() => {
    if (ready && typeof window !== 'undefined') {
      persistLocal(items);
    }
  }, [items, persistLocal, ready]);

  const addItem = useCallback((item: ShortlistItem) => {
    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) {
        return prev;
      }
      const nextItems = [
        ...prev,
        {
          stage: 'Researching',
          due: null,
          nextAction: null,
          ...item
        }
      ];
      const client = supabaseRef.current;
      if (client && profileId) {
        void upsertRemoteItem(client, profileId, item);
      }
      return nextItems;
    });
  }, [profileId, upsertRemoteItem]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const client = supabaseRef.current;
    if (client && profileId) {
      void deleteRemoteItem(client, profileId, id);
    }
  }, [deleteRemoteItem, profileId]);

  return { items, addItem, removeItem, ready };
};
