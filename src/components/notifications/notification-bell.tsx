'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';
import type { Notification } from '@/lib/types/demo-tables';

const KIND_TONE: Record<string, string> = {
  help_request: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  help_accepted: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  default: 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
};

const formatRelative = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(1, Math.round(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
};

export const NotificationBell = ({ className }: { className?: string }) => {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const handleItemClick = (notif: Notification) => {
    if (!notif.read_at) markRead(notif.id);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        title="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-[calc(100%+8px)] z-[60] w-80 overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-xl backdrop-blur-lg sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-[11px] text-muted-foreground">
                  {unreadCount === 0 ? 'All caught up' : `${unreadCount} unread`}
                </p>
              </div>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto h-5 w-5 text-muted-foreground/60" aria-hidden />
                  <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {items.map((notif) => {
                    const tone = KIND_TONE[notif.kind] ?? KIND_TONE.default;
                    const unread = !notif.read_at;
                    const content = (
                      <div
                        className={cn(
                          'group flex gap-3 px-4 py-3 transition hover:bg-muted/40',
                          unread ? 'bg-muted/20' : null
                        )}
                      >
                        <span
                          className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', unread ? 'bg-primary' : 'bg-transparent')}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                'truncate text-sm',
                                unread ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
                              )}
                            >
                              {notif.title}
                            </p>
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em]',
                                tone
                              )}
                            >
                              {notif.kind.replace('_', ' ')}
                            </span>
                          </div>
                          {notif.body ? (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">{notif.body}</p>
                          ) : null}
                          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                            {formatRelative(notif.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <li key={notif.id}>
                        {notif.href ? (
                          <Link href={notif.href} onClick={() => handleItemClick(notif)}>
                            {content}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleItemClick(notif)}
                            className="block w-full text-left"
                          >
                            {content}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
