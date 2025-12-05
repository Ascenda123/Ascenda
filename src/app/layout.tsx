import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Outfit, Inter } from 'next/font/google';
import '@/app/globals.css';
import '@radix-ui/themes/styles.css';
import { Providers } from './providers';
import messages from '@/messages/en.json';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme/theme-provider';
import Script from 'next/script';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ascenda — Admissions studio for global students',
  description: 'Plan essays, scholarships, and counselor updates in one playful workspace built for ambitious students.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        outfit.variable,
        inter.variable
      )}>

        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'ascenda-theme-preference';
                  var userSetKey = 'ascenda-theme-user-set';
                  var stored = window.localStorage.getItem(storageKey);
                  var userSet = window.localStorage.getItem(userSetKey) === 'manual';
                  
                  var preference = 'system';
                  if (stored && userSet && (stored === 'light' || stored === 'dark')) {
                    preference = stored;
                  }
                  
                  var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                  var mode = preference === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : preference;
                  
                  document.documentElement.dataset.theme = mode;
                  document.documentElement.style.colorScheme = mode;
                } catch (_) {}
              })();
            `
          }}
        />
        <a
          href="#main-content"
          className="absolute left-4 top-4 -translate-y-16 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground shadow focus-visible:translate-y-0 z-50"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
            <Providers messages={messages}>{children}</Providers>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
