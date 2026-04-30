import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Shortlist'
};

export default function ShortlistRedirectPage() {
  redirect('/university-search/shortlist');
}
