'use client';

import type { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

type CountryOption = {
  code: string;
  label: string;
};

const FALLBACK_COUNTRIES: CountryOption[] = [
  { code: 'AU', label: 'Australia' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'IN', label: 'India' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'SG', label: 'Singapore' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'IE', label: 'Ireland' },
  { code: 'DE', label: 'Germany' }
];

const getCountryOptions = (): CountryOption[] => {
  if (typeof Intl?.supportedValuesOf === 'function' && typeof Intl.DisplayNames === 'function') {
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
      const codes = Intl.supportedValuesOf('region').filter((code) => /^[A-Z]{2}$/.test(code));
      return codes
        .map((code) => ({
          code,
          label: displayNames.of(code) ?? code
        }))
        .filter((option) => Boolean(option.label))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      // fall through to fallback list
    }
  }
  return FALLBACK_COUNTRIES;
};

const COUNTRY_OPTIONS = getCountryOptions();

interface HomeCountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
}

export const HomeCountrySelect = ({ value, onChange, id, name }: HomeCountrySelectProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      className={cn(
        'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400'
      )}
    >
      <option value="">Select a country</option>
      {COUNTRY_OPTIONS.map((country) => (
        <option key={country.code} value={country.label}>
          {country.label}
        </option>
      ))}
    </select>
  );
};
