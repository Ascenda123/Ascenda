import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/app/globals.css';
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
        <Providers messages={messages}>{children}</Providers>
      </body>
    </html>
  );
}
