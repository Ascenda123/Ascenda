'use client';

import { useEffect } from 'react';
import { UniversityInformation } from '@/components/university-search/university-information';

export default function UniversityPageError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Surface error for observability while keeping the UI friendly.
    console.error(error);
  }, [error]);

  return <UniversityInformation error="Something went wrong while loading this university. Please retry." className="pt-6" />;
}
