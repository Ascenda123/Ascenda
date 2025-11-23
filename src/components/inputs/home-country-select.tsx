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
      const codes = (Intl as any).supportedValuesOf('region').filter((code: string) => /^[A-Z]{2}$/.test(code));
      return codes
        .map((code: string) => ({
          code,
          label: displayNames.of(code) ?? code
        }))
        .filter((option: { code: string; label: string }) => Boolean(option.label))
        .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
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
    <Select.Root value={value || undefined} onValueChange={onChange} name={name} size="3">
      <Select.Trigger
        id={id}
        className={cn(
          'w-full rounded-full border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground'
        )}
        radius="full"
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
