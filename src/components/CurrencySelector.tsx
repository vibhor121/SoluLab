'use client';

import type { Currency } from '@/types';

interface Props {
  value: Currency;
  onChange: (currency: Currency) => void;
  disabled?: boolean;
}

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'INR', label: '₹ INR' },
  { value: 'USD', label: '$ USD' },
];

export default function CurrencySelector({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Currency)}
      disabled={disabled}
      className="h-full bg-gray-100 border-r border-gray-200 px-3 text-sm font-semibold text-gray-600 focus:outline-none disabled:opacity-50 cursor-pointer"
      style={{ minWidth: '90px' }}
      aria-label="Currency"
    >
      {CURRENCIES.map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
