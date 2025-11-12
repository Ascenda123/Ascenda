'use client';

import type { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

const COUNTRY_OPTIONS = [
  'Canada',
  'United States',
  'United Kingdom',
  'Singapore',
  'Australia',
  'Germany',
  'Netherlands',
  'Japan'
];

interface CountrySelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  id?: string;
  name?: string;
}

export const CountrySelect = ({ value, onChange, id, name }: CountrySelectProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    onChange(selected);
  };

  return (
    <select
      id={id}
      name={name}
      multiple
      value={value}
      onChange={handleChange}
      aria-describedby={`${id}-hint`}
      className={cn(
        'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400'
      )}
    >
      {COUNTRY_OPTIONS.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
};
