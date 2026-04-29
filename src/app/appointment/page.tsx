'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CalendarPlus, Check, Mail, MessageSquare, Video, Users, Clock } from 'lucide-react';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TOPICS = [
  { id: 'university-choice', label: 'University choice', icon: Users },
  { id: 'applications', label: 'Applications & essays', icon: MessageSquare },
  { id: 'interview-prep', label: 'Interview prep', icon: Video },
  { id: 'general', label: 'General check-in', icon: CalendarPlus }
];

const TIMES = ['09:00', '11:00', '13:00', '15:00', '17:00'];

const DURATIONS = ['30 min', '45 min', '60 min'];

export default function AppointmentPage() {
  const [topic, setTopic] = useState<string>('university-choice');
  const [duration, setDuration] = useState<string>('30 min');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date || !time) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <DashboardShell>
        <PageHero
          eyebrow="Counsellor"
          title="Appointment requested"
          description="Your counsellor will confirm shortly. You'll get an email once the time is locked in."
          highlight="Pending confirmation"
          stats={[
            { label: 'Counsellor', value: 'Mrs. Sarah Mitchell', detail: 'Your assigned counsellor' },
            { label: 'When', value: `${date} ${time}`, detail: duration },
            { label: 'Topic', value: TOPICS.find((t) => t.id === topic)?.label ?? 'General', detail: 'Selected focus' }
          ]}
          breadcrumbs={<Breadcrumbs />}
          actions={
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
              <Button size="sm" onClick={() => setSubmitted(false)} variant="ghost">
                Request another time
              </Button>
            </>
          }
        />
        <div className="surface-card surface-card--static mt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
              <Check className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-foreground">Request received</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ve passed your preferred time to your counsellor. You&apos;ll get an email at the address on
                your profile when they confirm.
              </p>
              <div className="rounded-xl bg-muted/40 p-4 text-sm text-foreground">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Notes shared with your counsellor</p>
                <p className="mt-1">{notes || '— No additional notes —'}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHero
        eyebrow="Counsellor"
        title="Request an appointment"
        description="Pick a topic and a time that works for you. Your counsellor will confirm the slot by email."
        highlight="Mrs. Sarah Mitchell · usually replies within a day"
        stats={[
          { label: 'Counsellor', value: 'Mrs. Sarah Mitchell', detail: 'Your assigned counsellor' },
          { label: 'Channel', value: 'Video / In-person', detail: 'Choose at the meeting' },
          { label: 'Slots', value: 'Mon–Fri', detail: '09:00–17:00 local time' }
        ]}
        breadcrumbs={<Breadcrumbs />}
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <section className="surface-card surface-card--static space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Topic</p>
            <p className="text-sm text-muted-foreground">What would you like to discuss?</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {TOPICS.map((option) => {
              const Icon = option.icon;
              const active = topic === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTopic(option.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'border-primary/30 bg-primary/5 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl',
                      active ? 'bg-primary/10 text-primary' : 'bg-muted/60 text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-card surface-card--static space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">When works for you?</p>
            <p className="text-sm text-muted-foreground">Pick a preferred date, time, and meeting length.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                min={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Duration</span>
              <select
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {DURATIONS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Preferred time</span>
            <div className="flex flex-wrap gap-2">
              {TIMES.map((value) => {
                const active = time === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTime(value)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                      active
                        ? 'border-primary/30 bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
                    )}
                  >
                    <Clock className="h-3 w-3" aria-hidden />
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="surface-card surface-card--static space-y-3">
          <div>
            <label
              htmlFor="appointment-notes"
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground"
            >
              Notes for your counsellor
            </label>
            <p className="text-sm text-muted-foreground">Optional — anything specific you want to cover?</p>
          </div>
          <textarea
            id="appointment-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="e.g. I want to talk through my UK reach list and Imperial interview prep."
            className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            <Mail className="mr-1 inline h-3 w-3" /> You&apos;ll receive a confirmation by email.
          </p>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={!date || !time}>
              Send request
            </Button>
          </div>
        </div>
      </form>
    </DashboardShell>
  );
}
