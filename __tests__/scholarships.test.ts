import { filterScholarships } from '@/components/scholarships/utils';
import type { Scholarship } from '@/components/scholarships/types';

const sampleScholarships: Scholarship[] = [
  {
    id: 'award-1',
    name: 'Global STEM Excellence',
    country: 'United States',
    level: 'Undergraduate',
    category: 'STEM',
    amount: 40000,
    currency: 'USD'
  },
  {
    id: 'award-2',
    name: 'Women in Finance',
    country: 'Canada',
    level: 'Graduate',
    category: 'Business',
    amount: 25000,
    currency: 'USD'
  },
  {
    id: 'award-3',
    name: 'ASEAN Community Leaders',
    country: 'Singapore',
    level: 'Undergraduate',
    category: 'Regional',
    amount: 15000,
    currency: 'USD'
  }
];

describe('filterScholarships', () => {
  it('filters by country', () => {
    const result = filterScholarships(sampleScholarships, { country: 'Canada' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('award-2');
  });

  it('filters by search query case-insensitively', () => {
    const result = filterScholarships(sampleScholarships, { query: 'finance' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toContain('Finance');
  });

  it('filters by award amount ceiling', () => {
    const result = filterScholarships(sampleScholarships, { maxAmount: 20000 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('award-3');
  });

  it('returns all scholarships when no filters are provided', () => {
    const result = filterScholarships(sampleScholarships, {});
    expect(result).toHaveLength(sampleScholarships.length);
  });
});
