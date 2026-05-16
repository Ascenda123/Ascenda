'use client';

import { useEffect, useMemo, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useSupabase } from '@/hooks/useSupabase';
import { insertHelpRequest, insertHelpMessage } from '@/lib/demo/help-request-client';

// Counsellor-initiated message context. Slim by design: the modal just needs
// who it's going to and an optional reason hint to pre-fill the draft.
export interface SendMessageStudent {
  id: string;             // profiles.id for the student (same auth user in demo)
  firstName: string;
  lastName: string;
}

export type SendMessageReason = 'general' | 'portfolio_balance' | 'document_chase' | 'profile_gap';

interface SendMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: SendMessageStudent | null;
  reason?: SendMessageReason;
}

const COUNSELLOR_FIRST_NAME = 'Sarah';

const draftFor = (
  student: SendMessageStudent,
  reason: SendMessageReason
): { subject: string; body: string } => {
  const greeting = `Hi ${student.firstName},`;
  const sign = `\n\nBest,\n${COUNSELLOR_FIRST_NAME}`;

  switch (reason) {
    case 'portfolio_balance':
      return {
        subject: 'Let’s review your application list',
        body: `${greeting}\n\nI’ve been looking through your applications and want to talk through the balance — a few of your picks are stretches and I think we should make sure you have strong middle-ground options too.\n\nCould we book 15 minutes this week?${sign}`
      };
    case 'document_chase':
      return {
        subject: 'Quick chase on outstanding documents',
        body: `${greeting}\n\nI noticed a couple of documents are still outstanding for your applications. Could you upload them this week so we stay ahead of the deadlines?${sign}`
      };
    case 'profile_gap':
      return {
        subject: 'A few profile sections to wrap up',
        body: `${greeting}\n\nA quick reminder — your profile is missing a few sections. Filling them in will unlock better match suggestions and keep your application strategy on track.${sign}`
      };
    case 'general':
    default:
      return {
        subject: 'Touching base',
        body: `${greeting}\n\n${sign}`
      };
  }
};

export function SendMessageModal({
  open,
  onOpenChange,
  student,
  reason = 'general'
}: SendMessageModalProps) {
  const supabase = useSupabase();
  const { showToast } = useToast();

  const initialDraft = useMemo(
    () => (student ? draftFor(student, reason) : { subject: '', body: '' }),
    [student, reason]
  );

  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && student) {
      const next = draftFor(student, reason);
      setSubject(next.subject);
      setBody(next.body);
    }
  }, [open, student, reason]);

  if (!student) return null;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const counsellorId = userData?.user?.id;
      if (!counsellorId) {
        showToast({ title: 'Please sign in to send a message', variant: 'error' });
        return;
      }

      const finalSubject = subject.trim() || initialDraft.subject;
      const finalBody = body.trim() || initialDraft.body;

      // Demo model: counsellor + student are the same auth user, so the
      // notification routes back to the same profile (audience='student').
      // student.id is the dummy roster slug ('student-1' etc) and is only
      // used for the modal's display label.
      const request = await insertHelpRequest(supabase, {
        student_profile_id: counsellorId,
        subject: finalSubject,
        body: finalBody,
        initiated_by: 'counsellor'
      });

      // Seed the thread with the first message so the inbox view has content.
      await insertHelpMessage(supabase, {
        request_id: request.id,
        author_profile_id: counsellorId,
        author_role: 'counsellor',
        body: finalBody
      });

      showToast({
        title: `Sent to ${student.firstName}`,
        description: 'They’ll see it in their inbox.',
        variant: 'success'
      });
      onOpenChange(false);
    } catch (err) {
      console.error('counsellor message submit failed', err);
      showToast({
        title: 'Couldn’t send message',
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
            Message {student.firstName} {student.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-1">
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
            {submitting ? 'Sending…' : `Send to ${student.firstName}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
