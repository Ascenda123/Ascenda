import type { Metadata } from 'next';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ScholarshipExplorer } from '@/components/scholarships/scholarship-explorer';
import type { Scholarship } from '@/components/scholarships/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Scholarships | Ascenda'
};

const fallbackScholarships: Scholarship[] = [
  {
    id: 'global-innovators',
    name: 'Global Innovators Fellowship',
    country: 'United States',
    region: 'North America',
    level: 'Undergraduate',
    amount: 40000,
    currency: 'USD',
    deadline: '2025-10-01',
    category: 'Merit',
    url: 'https://example.com/innovators'
  },
  {
    id: 'asean-leaders',
    name: 'ASEAN Leaders Award',
    country: 'Singapore',
    region: 'Asia',
    level: 'Undergraduate',
    amount: 25000,
    currency: 'USD',
    deadline: '2025-09-15',
    category: 'Regional',
    url: 'https://example.com/asean'
  },
  {
    id: 'women-in-stem',
    name: 'Women in STEM Excellence',
    country: 'Canada',
    region: 'North America',
    level: 'Graduate',
    amount: 30000,
    currency: 'USD',
    deadline: '2025-11-20',
    category: 'STEM',
    url: 'https://example.com/stem'
  }
];

export default async function ScholarshipsPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from('scholarships' as never).select('*').order('deadline', { ascending: true });

  const scholarships: Scholarship[] =
    data && data.length > 0
      ? (data as Record<string, unknown>[]).map((item, index: number) => ({
        id: (item.id as string) ?? (item.slug as string) ?? `scholarship-${index}`,
        name: (item.name as string) ?? 'Scholarship',
        country: (item.country as string) ?? (item.region as string) ?? 'Global',
        region: (item.region as string) ?? null,
        level: (item.level as string) ?? (item.eligibility_level as string) ?? 'Any level',
        category: (item.category as string) ?? (item.type as string) ?? 'General',
        amount: typeof item.amount === 'number' ? item.amount : Number(item.amount) || null,
        currency: (item.currency as string) ?? 'USD',
        deadline: (item.deadline as string) ?? (item.deadline_date as string) ?? null,
        url: (item.url as string) ?? (item.website as string) ?? null
      }))
      : fallbackScholarships;

  const heroStats = [
    { label: 'Tracked scholarships', value: `${scholarships.length}`, detail: 'Active' },
    {
      label: 'Avg award',
      value: scholarships.length
        ? `$${Math.round(
            scholarships.reduce((sum, item) => sum + (item.amount ?? 0), 0) / scholarships.length
          ).toLocaleString('en-US')} USD`
        : '—',
      detail: 'Per program'
    },
    { label: 'Regions', value: `${new Set(scholarships.map((item) => item.country ?? 'Global')).size}`, detail: 'Covered' }
  ];

  return (
    <DashboardShell>
      <PageHero
        eyebrow="Scholarships"
        title="Scholarship tracker"
        description="Filter by country, level, and award size. Save the grants that matter and push them to your planner."
        highlight="Updated hourly"
        stats={heroStats}
        breadcrumbs={<Breadcrumbs />}
      />
      <ScholarshipExplorer scholarships={scholarships} />
    </DashboardShell>
  );
}
