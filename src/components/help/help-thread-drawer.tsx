'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, NotebookPen, CalendarPlus, Check, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useHelpThread } from '@/hooks/use-help-thread';
import type { HelpMeetingStatus } from '@/lib/types/demo-tables';

type Side = 'student' | 'counsellor';

interface HelpThreadDrawerProps {
  open: boolean;
  requestId: string | null;
  side: Side;
  onClose: () => void;
}

const formatRelative = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(1, Math.round(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
};

const formatMeetingTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

const meetingToneClass = (status: HelpMeetingStatus): string => {
  switch (status) {
    case 'confirmed':
      return 'border-emerald-200/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    case 'cancelled':
      return 'border-border/60 bg-muted/40 text-muted-foreground line-through';
    case 'completed':
      return 'border-violet-200/60 bg-violet-500/10 text-violet-700 dark:text-violet-300';
    default:
      return 'border-sky-200/60 bg-sky-500/10 text-sky-700 dark:text-sky-300';
  }
};

const defaultMeetingSlot = (): string => {
  // Default to Tue 3pm next week in the user's local time.
  const date = new Date();
  date.setDate(date.getDate() + (7 - date.getDay() + 2) % 7 + 1);
  date.setHours(15, 0, 0, 0);
  const offsetMin = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offsetMin * 60_000);
  return local.toISOString().slice(0, 16);
};

export function HelpThreadDrawer({ open, requestId, side, onClose }: HelpThreadDrawerProps) {
  const { request, messages, notes, meetings, loading, reply, addNote, proposeMeeting, setStatus } =
    useHelpThread(requestId);
  const { showToast } = useToast();

  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('15-min check-in');
  const [meetingTime, setMeetingTime] = useState(defaultMeetingSlot);
  const [meetingLocation, setMeetingLocation] = useState('Google Meet · auto link');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'thread' | 'notes' | 'meeting'>('thread');

  // Reset when opening a different request
  useEffect(() => {
    if (open) {
      setReplyText('');
      setNoteText('');
      setMeetingTitle('15-min check-in');
      setMeetingTime(defaultMeetingSlot());
      setMeetingLocation('Google Meet · auto link');
      setTab('thread');
    }
  }, [open, requestId]);

  const isCounsellor = side === 'counsellor';
  const studentName = useMemo(() => (request ? 'Greg Franck' : ''), [request]);

  const handleReply = async () => {
    if (busy || !replyText.trim()) return;
    setBusy(true);
    try {
      await reply(replyText, side);
      setReplyText('');
      showToast({
        title: isCounsellor ? `Reply sent to ${studentName}` : 'Reply sent to Sarah',
        variant: 'success'
      });
    } catch {
      showToast({ title: "Couldn't send reply", variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleAddNote = async () => {
    if (busy || !noteText.trim()) return;
    setBusy(true);
    try {
      await addNote(noteText);
      setNoteText('');
      showToast({ title: 'Note saved', variant: 'success' });
    } catch {
      showToast({ title: "Couldn't save note", variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleProposeMeeting = async () => {
    if (busy || !meetingTitle.trim() || !meetingTime) return;
    setBusy(true);
    try {
      await proposeMeeting({
        title: meetingTitle.trim(),
        scheduledFor: new Date(meetingTime).toISOString(),
        location: meetingLocation.trim() || undefined
      });
      showToast({
        title: `Meeting proposed`,
        description: `${meetingTitle} · ${formatMeetingTime(new Date(meetingTime).toISOString())}`,
        variant: 'success'
      });
    } catch {
      showToast({ title: "Couldn't propose meeting", variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await setStatus('accepted');
      showToast({ title: 'Request accepted', variant: 'success' });
    } catch {
      showToast({ title: "Couldn't accept", variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await setStatus('resolved');
      showToast({ title: 'Request resolved', variant: 'success' });
      onClose();
    } catch {
      showToast({ title: "Couldn't resolve", variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && requestId ? (
        <motion.div
          className="fixed inset-0 z-[120] flex justify-end"
          initial={{ pointerEvents: 'none' }}
          animate={{ pointerEvents: 'auto' }}
          exit={{ pointerEvents: 'none' }}
        >
          <motion.div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="relative z-10 flex h-full w-full max-w-xl flex-col bg-background shadow-2xl"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {isCounsellor ? 'Inbox · help request' : 'Your request'}
                </p>
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {request?.university ?? 'Loading…'}
                </h2>
                {request ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {request.program ?? 'Programme'} · from {studentName} ·{' '}
                    {formatRelative(request.created_at)}
                  </p>
                ) : null}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </header>

            {/* Tab strip */}
            <div className="flex gap-1 border-b border-border/60 px-3 py-2 text-xs font-semibold">
              {(['thread', 'notes', 'meeting'] as const).map((key) => {
                const isActive = tab === key;
                // Don't surface the notes count to the student — notes are
                // counsellor-private and the count alone would leak existence.
                const notesLabel = isCounsellor && notes.length
                  ? `Notes · ${notes.length}`
                  : 'Notes';
                const label =
                  key === 'thread'
                    ? `Thread${messages.length ? ` · ${messages.length}` : ''}`
                    : key === 'notes'
                      ? notesLabel
                      : `Meeting${meetings.length ? ` · ${meetings.length}` : ''}`;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={cn(
                      'rounded-full px-3 py-1.5 transition',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading && !request ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : !request ? (
                <p className="text-sm text-muted-foreground">Request not found.</p>
              ) : tab === 'thread' ? (
                <ThreadView
                  initialBody={request.body}
                  initialSubject={request.subject}
                  initialAt={request.created_at}
                  messages={messages}
                  studentName={studentName}
                />
              ) : tab === 'notes' ? (
                <NotesView
                  notes={notes}
                  isCounsellor={isCounsellor}
                  noteText={noteText}
                  setNoteText={setNoteText}
                  onAdd={handleAddNote}
                  busy={busy}
                />
              ) : (
                <MeetingView
                  meetings={meetings}
                  isCounsellor={isCounsellor}
                  meetingTitle={meetingTitle}
                  setMeetingTitle={setMeetingTitle}
                  meetingTime={meetingTime}
                  setMeetingTime={setMeetingTime}
                  meetingLocation={meetingLocation}
                  setMeetingLocation={setMeetingLocation}
                  onPropose={handleProposeMeeting}
                  busy={busy}
                />
              )}
            </div>

            {/* Footer composer (Thread tab) */}
            {tab === 'thread' && request ? (
              <div className="border-t border-border/60 bg-card/40 px-5 py-3">
                <div className="flex items-start gap-2">
                  <textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder={
                      isCounsellor ? `Reply to ${studentName}…` : 'Reply to Sarah…'
                    }
                    rows={2}
                    className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <Button size="sm" onClick={handleReply} disabled={busy || !replyText.trim()}>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Send
                  </Button>
                </div>

                {isCounsellor ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                    {request.status === 'open' ? (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={handleAccept}
                        disabled={busy}
                        className="border-violet-300/60 text-violet-700 dark:text-violet-300"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Accept request
                      </Button>
                    ) : null}
                    {request.status !== 'resolved' ? (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={handleResolve}
                        disabled={busy}
                        className="border-emerald-300/60 text-emerald-700 dark:text-emerald-300"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Mark resolved
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                        <Check className="h-3 w-3" />
                        Resolved
                      </span>
                    )}
                    <span className="ml-auto text-muted-foreground">
                      Tabs persist · all changes save instantly
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ─── Subviews ───────────────────────────────────────────────────────────── */

function ThreadView({
  initialBody,
  initialSubject,
  initialAt,
  messages,
  studentName
}: {
  initialBody: string;
  initialSubject: string;
  initialAt: string;
  messages: ReturnType<typeof useHelpThread>['messages'];
  studentName: string;
}) {
  return (
    <div className="space-y-3">
      <article className="rounded-2xl border border-violet-200/40 bg-violet-500/5 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{studentName}</p>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {formatRelative(initialAt)}
          </span>
        </div>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {initialSubject}
        </p>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
          {initialBody}
        </p>
        <p className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
          <Sparkles className="h-3 w-3" />
          AI-drafted by student · edited before sending
        </p>
      </article>
      {messages.map((m) => (
        <article
          key={m.id}
          className={cn(
            'rounded-2xl border p-3',
            m.author_role === 'counsellor'
              ? 'border-emerald-200/40 bg-emerald-500/5'
              : 'border-violet-200/40 bg-violet-500/5'
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {m.author_role === 'counsellor' ? 'Sarah Meacha' : studentName}
            </p>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {formatRelative(m.created_at)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {m.body}
          </p>
        </article>
      ))}
    </div>
  );
}

function NotesView({
  notes,
  isCounsellor,
  noteText,
  setNoteText,
  onAdd,
  busy
}: {
  notes: ReturnType<typeof useHelpThread>['notes'];
  isCounsellor: boolean;
  noteText: string;
  setNoteText: (s: string) => void;
  onAdd: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-3">
      {isCounsellor ? (
        <div className="rounded-2xl border border-border bg-card/40 p-3">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-primary" aria-hidden />
            <p className="text-sm font-semibold text-foreground">Private note</p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Only counsellors see this. Useful for decisions, follow-ups, things to come back to.
          </p>
          <textarea
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="e.g. PS is strong on the quant side, weak on the 'why this university' question. Send the Cambridge sample for reference."
            rows={3}
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button size="sm" onClick={onAdd} disabled={busy || !noteText.trim()}>
              Save note
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          Notes are private to the counsellor — visible to Sarah, not to you.
        </p>
      )}
      {isCounsellor ? (
        <div className="space-y-2">
          {notes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
              No notes yet.
            </p>
          ) : (
            notes.map((n) => (
              <article
                key={n.id}
                className="rounded-2xl border border-border/60 bg-card/40 p-3 text-sm text-foreground/90"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Counsellor note
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {formatRelative(n.created_at)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-line">{n.body}</p>
              </article>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function MeetingView({
  meetings,
  isCounsellor,
  meetingTitle,
  setMeetingTitle,
  meetingTime,
  setMeetingTime,
  meetingLocation,
  setMeetingLocation,
  onPropose,
  busy
}: {
  meetings: ReturnType<typeof useHelpThread>['meetings'];
  isCounsellor: boolean;
  meetingTitle: string;
  setMeetingTitle: (s: string) => void;
  meetingTime: string;
  setMeetingTime: (s: string) => void;
  meetingLocation: string;
  setMeetingLocation: (s: string) => void;
  onPropose: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-3">
      {isCounsellor ? (
        <div className="rounded-2xl border border-border bg-card/40 p-3">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-primary" aria-hidden />
            <p className="text-sm font-semibold text-foreground">Propose a meeting</p>
          </div>
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={meetingTitle}
              onChange={(event) => setMeetingTitle(event.target.value)}
              placeholder="Meeting title"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <input
              type="datetime-local"
              value={meetingTime}
              onChange={(event) => setMeetingTime(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <input
              type="text"
              value={meetingLocation}
              onChange={(event) => setMeetingLocation(event.target.value)}
              placeholder="Location or video link"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <div className="flex items-center justify-end">
              <Button size="sm" onClick={onPropose} disabled={busy || !meetingTitle.trim() || !meetingTime}>
                Propose
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          Meetings proposed by Sarah appear here. You can confirm or suggest a different time.
        </p>
      )}

      <div className="space-y-2">
        {meetings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
            No meetings yet.
          </p>
        ) : (
          meetings.map((m) => (
            <article
              key={m.id}
              className={cn('flex items-start gap-3 rounded-2xl border p-3', meetingToneClass(m.status))}
            >
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{m.title}</p>
                <p className="text-xs">
                  {formatMeetingTime(m.scheduled_for)} · {m.duration_minutes} min
                  {m.location ? ` · ${m.location}` : null}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em]">
                  {m.status}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
