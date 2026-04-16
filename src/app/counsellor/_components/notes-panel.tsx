'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Flag, RefreshCw, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CounsellorNote } from '@/lib/data/counsellor-dummy-data';

interface NotesPanelProps {
  notes: CounsellorNote[];
  studentId: string;
}

const TYPE_CONFIG = {
  session: { icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-500/10', label: 'Session note' },
  flag: { icon: Flag, color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Flag' },
  update: { icon: RefreshCw, color: 'text-sky-600', bg: 'bg-sky-500/10', label: 'Update' }
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function storageKey(id: string) {
  return `ascenda-notes-${id}`;
}

export const NotesPanel = ({ notes: seedNotes, studentId }: NotesPanelProps) => {
  const [notes, setNotes] = useState<CounsellorNote[]>(seedNotes);
  const [hydrated, setHydrated] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'session' | 'flag' | 'update'>('session');

  // On mount, merge any locally-persisted notes on top of the seed data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(studentId));
      if (stored) {
        const parsed: CounsellorNote[] = JSON.parse(stored);
        // Merge: stored notes first (most recent), then seed notes not already present
        const storedIds = new Set(parsed.map((n) => n.id));
        const merged = [...parsed, ...seedNotes.filter((n) => !storedIds.has(n.id))];
        setNotes(merged);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addNote = () => {
    if (!newNote.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const note: CounsellorNote = {
      id: `local-${Date.now()}`,
      date: today,
      content: newNote.trim(),
      type: noteType
    };
    const updated = [note, ...notes];
    setNotes(updated);
    setNewNote('');

    // Persist only the locally-added notes (those with id starting with 'local-')
    try {
      const localOnly = updated.filter((n) => n.id.startsWith('local-'));
      localStorage.setItem(storageKey(studentId), JSON.stringify(localOnly));
    } catch {
      // ignore storage errors
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      {/* New note composer */}
      <div className="surface-card surface-card--static space-y-3">
        <p className="text-sm font-semibold text-foreground">Add note</p>

        {/* Type selector */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1 shadow-sm">
          {(['session', 'flag', 'update'] as const).map((type) => {
            const cfg = TYPE_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => setNoteType(type)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  noteType === type
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <cfg.icon className="h-3.5 w-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write your note here…"
          rows={3}
          className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="flex justify-end">
          <button
            onClick={addNote}
            disabled={!newNote.trim()}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlusCircle className="h-4 w-4" />
            Save note
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {notes.map((note) => {
          const cfg = TYPE_CONFIG[note.type];
          const Icon = cfg.icon;
          return (
            <div key={note.id} className="flex gap-3 rounded-2xl border border-border/60 bg-background/60 p-4">
              <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', cfg.bg)}>
                <Icon className={cn('h-4 w-4', cfg.color)} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(note.date)}</span>
                </div>
                <p className="text-sm text-foreground">{note.content}</p>
              </div>
            </div>
          );
        })}
        {notes.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-border bg-muted/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">No notes yet. Add your first note above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
