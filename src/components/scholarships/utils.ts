import type { Scholarship, ScholarshipFilters } from './types';

export const filterScholarships = (scholarships: Scholarship[], filters: ScholarshipFilters) => {
  return scholarships.filter((scholarship) => {
    if (filters.country && scholarship.country !== filters.country) return false;
    if (filters.level && (scholarship.level ?? 'Any') !== filters.level) return false;
    if (filters.maxAmount && scholarship.amount && scholarship.amount > filters.maxAmount) return false;

    if (filters.query) {
      const haystack = `${scholarship.name} ${scholarship.category ?? ''}`.toLowerCase();
      if (!haystack.includes(filters.query.toLowerCase())) return false;
    }

    return true;
  });
};
