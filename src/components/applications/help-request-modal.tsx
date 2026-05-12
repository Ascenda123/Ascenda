'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useSupabase } from '@/hooks/useSupabase';
import { draftMessageForApplication } from '@/lib/demo/help-request-drafts';
import { insertHelpRequest, insertNotification } from '@/lib/demo/help-request-client';
import type { SandboxApplication, RequirementRow } from '@/lib/data/student-demo-data';

interface HelpRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: SandboxApplication;
  requirement?: RequirementRow;
}

export function HelpRequestModal({ open, onOpenChange, app, requirement }: HelpRequestModalProps) {
  const supabase = useSupabase();
  const { showToast } = useToast();

  const initialDraft = useMemo(
    () => draftMessageForApplication(app, requirement),
    [app, requirement]
  );

  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);
  const [submitting, setSubmitting] = useState(false);

  // Re-seed when the dialog reopens for a different app
  useEffect(() => {
    if (open) {
      setSubject(initialDraft.subject);
      setBody(initialDraft.body);
    }
  }, [open, initialDraft.subject, initialDraft.body]);

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

      // Also fan out a notification to the same profile so the counsellor-side
      // bell lights up after the user flips views. In the demo, student and
      // counsellor are the same Supabase user.
      try {
        await insertNotification(supabase, {
          profile_id: userId,
          kind: 'help_request',
          title: `New help request from Greg`,
          body: `${app.university} · ${app.program}`,
          href: '/counsellor'
        });
      } catch (notifError) {
        console.warn('notification insert failed', notifError);
      }

      // Stash the inserted id so the counsellor-side widget can highlight it.
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
              {app.program} · {app.platform}
              {requirement ? ` · ${requirement.progress}% complete` : null}
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
