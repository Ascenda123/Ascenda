import Link from 'next/link';
import messages from '@/messages/en.json';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const t = messages;
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-24 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="space-y-6">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
            Admissions intelligence
          </span>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            {t['marketing.hero.title']}
          </h1>
          <p className="text-lg text-white/80 sm:text-xl">{t['marketing.hero.subtitle']}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
            <Link href="/signup">{t['marketing.hero.cta']}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
