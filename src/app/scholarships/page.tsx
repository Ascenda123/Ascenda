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
    deadline: '2024-10-01',
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
    deadline: '2024-09-15',
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
    deadline: '2024-11-20',
    category: 'STEM',
    url: 'https://example.com/stem'
  }
];

export default async function ScholarshipsPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from('scholarships').select('*').order('deadline', { ascending: true });

  const scholarships: Scholarship[] =
    data && data.length > 0
      ? data.map((item: Record<string, any>, index: number) => ({
        id: item.id ?? item.slug ?? `scholarship-${index}`,
        name: item.name ?? 'Scholarship',
        country: item.country ?? item.region ?? 'Global',
        region: item.region,
        level: item.level ?? item.eligibility_level ?? 'Any level',
        category: item.category ?? item.type ?? 'General',
        amount: typeof item.amount === 'number' ? item.amount : Number(item.amount) || null,
        currency: item.currency ?? 'USD',
        deadline: item.deadline ?? item.deadline_date ?? null,
        url: item.url ?? item.website ?? null
      }))
      : fallbackScholarships;

  const heroStats = [
    { label: 'Tracked scholarships', value: `${scholarships.length}`, detail: 'Active' },
    {
      label: 'Avg award',
      value: `${scholarships.length
        ? `USD ${Math.round(
          scholarships.reduce((sum, item) => sum + (item.amount ?? 0), 0) / scholarships.length
        ).toLocaleString()}`
        : '—'
        }`,
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
