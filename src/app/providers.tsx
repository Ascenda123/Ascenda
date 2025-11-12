'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

interface ProvidersProps {
  children: ReactNode;
  messages?: Record<string, string>;
}

export const Providers = ({ children, messages }: ProvidersProps) => {
  const [client] = useState(() => new QueryClient());

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={client}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
};
