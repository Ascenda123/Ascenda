'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

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
        <AnalyticsBridge />
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
};

const AnalyticsBridge = () => {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent('page_view', { pathname });
  }, [pathname]);

  return null;
};
