'use client';

import { Select } from '@radix-ui/themes';
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
  return (
    <Select.Root value={value || undefined} onValueChange={onChange} name={name}>
      <Select.Trigger
        id={id}
        className={cn(
          'w-full rounded-full border border-[#E0E0E0] bg-white px-4 py-3 text-sm text-[#1C1C1C] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#F5F5F5]'
        )}
        radius="full"
        size="3"
        placeholder="Select a country"
      />
      <Select.Content>
        <Select.Group>
          <Select.Label>Countries</Select.Label>
          {COUNTRY_OPTIONS.map((country) => (
            <Select.Item key={country.code} value={country.label}>
              {country.label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
};
