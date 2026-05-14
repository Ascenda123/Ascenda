'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '@/lib/demo/help-request-client';
import type { Notification } from '@/lib/types/demo-tables';

// Aggressive poll while realtime hasn't confirmed subscription (cold start,
// flaky network). Once realtime says SUBSCRIBED the interval relaxes — we
// only need a safety net at that point. Numbers tuned for the live demo:
// 1.5s feels near-instant when realtime is missing, 10s is cheap insurance.
const POLL_MS_FAST = 1500;
const POLL_MS_SLOW = 10000;

export interface UseNotificationsResult {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsResult => {
  const supabase = useSupabase();
  const [items, setItems] = useState<Notification[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const realtimeOkRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    try {
      const next = await listNotifications(supabase, profileId, 25);
      setItems(next);
    } catch (err) {
      console.warn('useNotifications: refresh failed', err);
    }
  }, [supabase, profileId]);

  // Resolve current profile id once.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setProfileId(data?.user?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Initial load.
  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listNotifications(supabase, profileId, 25)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((err) => console.warn('useNotifications: initial load failed', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, profileId]);

  // Realtime: subscribe to inserts for this profile. Poll interval starts
  // fast (1.5s) and relaxes to 10s once realtime confirms SUBSCRIBED, so
  // the demo flip-moment is never gated on realtime succeeding.
  useEffect(() => {
    if (!profileId) return;

    let pollHandle: number | null = null;
    const startPoll = (intervalMs: number) => {
      if (pollHandle !== null) window.clearInterval(pollHandle);
      pollHandle = window.setInterval(() => {
        refresh();
      }, intervalMs);
    };

    startPoll(POLL_MS_FAST);

    const channel = (supabase as any)
      .channel(`notif:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${profileId}`
        },
        (payload: { new: Notification }) => {
          setItems((prev) => {
            if (prev.some((row) => row.id === payload.new.id)) return prev;
            return [payload.new, ...prev].slice(0, 25);
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${profileId}`
        },
        (payload: { new: Notification }) => {
          setItems((prev) =>
            prev.map((row) => (row.id === payload.new.id ? payload.new : row))
          );
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          realtimeOkRef.current = true;
          startPoll(POLL_MS_SLOW);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          realtimeOkRef.current = false;
          startPoll(POLL_MS_FAST);
        }
      });

    return () => {
      if (pollHandle !== null) window.clearInterval(pollHandle);
      try {
        (supabase as any).removeChannel(channel);
      } catch {
        // ignore
      }
    };
  }, [supabase, profileId, refresh]);

  const markRead = useCallback(
    async (id: string) => {
      try {
        await markNotificationRead(supabase, id);
        setItems((prev) =>
          prev.map((row) => (row.id === id ? { ...row, read_at: new Date().toISOString() } : row))
        );
      } catch (err) {
        console.warn('useNotifications: markRead failed', err);
      }
    },
    [supabase]
  );

  const markAllRead = useCallback(async () => {
    if (!profileId) return;
    try {
      await markAllNotificationsRead(supabase, profileId);
      const now = new Date().toISOString();
      setItems((prev) => prev.map((row) => (row.read_at ? row : { ...row, read_at: now })));
    } catch (err) {
      console.warn('useNotifications: markAllRead failed', err);
    }
  }, [supabase, profileId]);

  const unreadCount = items.filter((row) => !row.read_at).length;

  return { items, unreadCount, loading, markRead, markAllRead, refresh };
};
