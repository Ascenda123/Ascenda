'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowUpRight, Clock, MapPin, Sparkles, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { useShortlist } from '@/components/university-search/shortlist-store';
import { cn } from '@/lib/utils';

const stageTone = {
  Researching: 'bg-amber-100 text-amber-900 border-amber-200',
  Shortlisted: 'bg-blue-100 text-blue-900 border-blue-200',
  Active: 'bg-emerald-100 text-emerald-900 border-emerald-200'
};

export default function UniversitySearchShortlistPage() {
  const { items, removeItem, ready } = useShortlist();

  const metrics = useMemo(() => {
    const count = items.length;
    const avgFit = count ? Math.round(items.reduce((sum, item) => sum + item.fitScore, 0) / count) : 0;
    return { count, avgFit };
  }, [items]);

  if (!ready) {
    return (
      <div className="rounded-3xl border border-border bg-muted/40 p-8 text-sm text-muted-foreground">
        Loading your shortlist...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-6">
        <Breadcrumbs className="mb-2" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Explore · Shortlist</p>
            <h1 className="text-3xl font-bold text-foreground">Shortlist</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Courses you saved from search and matches. Track fit, next actions, and reopen them in results to compare.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href="/university-search/results">Add more courses</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/matches">View matches</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-dashed border-border/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shortlisted</span>
              <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{metrics.count}</p>
              <p className="text-xs text-muted-foreground">Saved from search</p>
            </CardContent>
          </Card>
          <Card className="border-dashed border-border/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Avg fit</span>
              <Target className="h-5 w-5 text-emerald-500" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{metrics.avgFit}%</p>
              <p className="text-xs text-muted-foreground">Across shortlisted programs</p>
            </CardContent>
          </Card>
          <Card className="border-dashed border-border/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Next steps</span>
              <Clock className="h-5 w-5 text-indigo-500" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">
                {items[0]?.due ? items[0].due : 'Set due dates'}
              </p>
              <p className="text-xs text-muted-foreground">Use next actions to keep momentum</p>
            </CardContent>
          </Card>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Saved programs</p>
            <h2 className="text-xl font-semibold text-foreground">Shortlist board</h2>
            <p className="text-sm text-muted-foreground">Refine your picks, open them in results, or remove them here.</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/university-search/results">
              Jump back to results <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40 px-8 py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Sparkles className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No courses saved yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Shortlist directly from results to track actions and compare programs.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/university-search/results">Browse results</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} className="border border-border/80 bg-card">
                <CardHeader className="space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                        {item.location ?? 'Location TBC'}
                      </p>
                      <CardTitle className="text-xl text-foreground">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.program}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                      {item.fitScore}% fit
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2',
                        stageTone[item.stage as keyof typeof stageTone] ?? 'bg-muted text-foreground border-border'
                      )}
                      role="switch"
                      aria-checked
                      tabIndex={0}
                      aria-label={`Stage ${item.stage}`}
                    >
                      {item.stage}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <span>{item.due}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Next action</p>
                    <p className="mt-1 text-sm text-foreground">{item.nextAction}</p>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item.id)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Remove
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/university-search/results?q=${encodeURIComponent(item.name)}`}>
                        View in results
                      </Link>
                    </Button>
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/matches" className="gap-2">
                      Match insights <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
