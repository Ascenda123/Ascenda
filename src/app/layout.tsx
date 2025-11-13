import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';
import '@/app/globals.css';
import { Providers } from './providers';
import messages from '@/messages/en.json';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700']
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
  weight: ['400', '500', '600', '700']
});

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
      <body className={`${plusJakarta.variable} ${spaceGrotesk.variable} bg-night text-white antialiased`}>
        <a
          href="#main-content"
          className="absolute left-4 top-4 -translate-y-16 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <Providers messages={messages}>{children}</Providers>
      </body>
    </html>
  );
}
