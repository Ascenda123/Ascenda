import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import '@/app/globals.css';
import { Providers } from './providers';
import messages from '@/messages/en.json';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ascenda',
  description: 'Global pathways for ambitious students'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a
          href="#main-content"
          className="absolute left-4 top-4 -translate-y-16 rounded-md bg-slate-900 px-3 py-2 text-sm text-white focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <Providers messages={messages}>{children}</Providers>
      </body>
    </html>
  );
}
