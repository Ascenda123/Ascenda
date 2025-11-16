export type Scholarship = {
  id: string;
  name: string;
  country?: string | null;
  region?: string | null;
  level?: string | null;
  category?: string | null;
  amount?: number | null;
  currency?: string | null;
  deadline?: string | null;
  url?: string | null;
};

export type ScholarshipFilters = {
  country?: string;
  level?: string;
  query?: string;
  maxAmount?: number | null;
};
