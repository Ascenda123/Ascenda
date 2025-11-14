import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/app/globals.css';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { Providers } from './providers';
import messages from '@/messages/en.json';

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
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <a
          href="#main-content"
          className="absolute left-4 top-4 -translate-y-16 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <Theme appearance="light" accentColor="cyan" grayColor="slate" scaling="100%">
          <div className="relative min-h-screen overflow-hidden bg-white">
            <div className="pointer-events-none absolute inset-x-0 top-[-200px] mx-auto h-[420px] w-[420px] rounded-[40%] bg-gradient-to-br from-[#E9F1FA] to-transparent blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 bottom-[-220px] mx-auto h-[480px] w-[480px] rounded-[35%] bg-gradient-to-tr from-[#F0F8FF] to-transparent blur-3xl" />
            <Providers messages={messages}>{children}</Providers>
          </div>
        </Theme>
      </body>
    </html>
  );
}
