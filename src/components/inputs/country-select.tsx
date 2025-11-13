'use client';

import type { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { DESTINATION_COUNTRIES } from '@/lib/validation/profile';

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
        'w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50'
      )}
    >
      {DESTINATION_COUNTRIES.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
};
