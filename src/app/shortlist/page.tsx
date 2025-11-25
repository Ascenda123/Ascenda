import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Shortlist | Ascenda'
};

export default function ShortlistRedirectPage() {
  redirect('/university-search/shortlist');
}
