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
  const describedBy = id ? `${id}-hint` : undefined;

  return (
    <select
      id={id}
      name={name}
      multiple
      value={value}
      onChange={handleChange}
      aria-describedby={describedBy}
      className={cn('w-full text-sm text-foreground', 'form-input', 'form-input--multi')}
    >
      {DESTINATION_COUNTRIES.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
};
