'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useSupabase } from '@/hooks/useSupabase';
import { insertHelpRequest, insertNotification } from '@/lib/demo/help-request-client';

// Generic context shape — works for any caller (priority board item, rec letter,
// application detail row). Keep this small; if the modal needs more it should
// fetch it from the DB on open rather than thread props through every call site.
export interface HelpRequestModalApp {
  id: string;
  university: string;
  program: string;
  progress?: number;
  nextDeadline?: string;
  tasksRemaining?: number;
  platform?: string;
}

interface HelpRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: HelpRequestModalApp | null;
}

const COUNSELLOR_FIRST_NAME = 'Sarah';

const draftFor = (app: HelpRequestModalApp): { subject: string; body: string } => {
  const subject = `Help with my ${app.university} application`;
  const progressLine =
    typeof app.progress === 'number' && app.progress > 0
      ? `I'm about ${app.progress}% through the requirements`
      : "I'm just getting started";
  const tasksLine =
    typeof app.tasksRemaining === 'number' && app.tasksRemaining > 0
      ? ` and have ${app.tasksRemaining} open task${app.tasksRemaining === 1 ? '' : 's'}`
      : '';
  const deadlineLine = app.nextDeadline
    ? `My next deadline is ${app.nextDeadline}.`
    : "There's no hard deadline yet, but I'd like to stay ahead of it.";

  const lines = [
    `Hi ${COUNSELLOR_FIRST_NAME},`,
    '',
    `I'm working on my ${app.university} application (${app.program}). ${progressLine}${tasksLine}.`,
    deadlineLine,
    '',
    "Could we book a 15-minute call this week to talk it through? I'd like to focus on the personal statement and reference timing.",
    '',
    'Thanks,',
    'Greg'
  ];

  return { subject, body: lines.join('\n') };
};

export function HelpRequestModal({ open, onOpenChange, app }: HelpRequestModalProps) {
  const supabase = useSupabase();
  const { showToast } = useToast();

  const initialDraft = useMemo(() => (app ? draftFor(app) : { subject: '', body: '' }), [app]);

  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && app) {
      const next = draftFor(app);
      setSubject(next.subject);
      setBody(next.body);
    }
  }, [open, app]);

  if (!app) return null;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        showToast({ title: 'Please sign in to send a request', variant: 'error' });
        return;
      }

      const inserted = await insertHelpRequest(supabase, {
        student_profile_id: userId,
        application_id: app.id,
        university: app.university,
        program: app.program,
        subject: subject.trim() || initialDraft.subject,
        body: body.trim() || initialDraft.body
      });

      try {
        await insertNotification(supabase, {
          profile_id: userId,
          kind: 'help_request',
          title: `New help request from Greg`,
          body: `${app.university} · ${app.program}`,
          href: `/counsellor?help=${inserted.id}`
        });
      } catch (notifError) {
        console.warn('notification insert failed', notifError);
      }

      try {
        sessionStorage.setItem('ascenda-last-help-request-id', inserted.id);
      } catch {
        // ignore
      }

      showToast({
        title: 'Sent — Sarah will respond shortly',
        description: `Tracked under ${app.university}`,
        variant: 'success'
      });
      onOpenChange(false);
    } catch (err) {
      console.error('help request submit failed', err);
      showToast({
        title: "Couldn't send request",
        description: 'Check your connection and try again',
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            Request counsellor help
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-1">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Context
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{app.university}</p>
            <p className="text-xs text-muted-foreground">
              {app.program}
              {app.platform ? ` · ${app.platform}` : null}
              {typeof app.progress === 'number' ? ` · ${app.progress}% fit` : null}
              {typeof app.tasksRemaining === 'number' && app.tasksRemaining > 0
                ? ` · ${app.tasksRemaining} open task${app.tasksRemaining === 1 ? '' : 's'}`
                : null}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Message
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3 w-3" aria-hidden />
                AI draft · edit before sending
              </span>
            </div>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={8}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-2 px-1">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting || !body.trim()}>
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {submitting ? 'Sending…' : 'Send to counsellor'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
