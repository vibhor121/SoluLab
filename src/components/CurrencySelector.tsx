'use client';

import type { Currency } from '@/types';

interface Props {
  value: Currency;
  onChange: (currency: Currency) => void;
  disabled?: boolean;
}

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'INR', label: 'INR', symbol: '₹' },
  { value: 'USD', label: 'USD', symbol: '$' },
];

export default function CurrencySelector({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Currency)}
      disabled={disabled}
      className="h-full rounded-l-md border-r border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      aria-label="Currency"
    >
      {CURRENCIES.map((c) => (
        <option key={c.value} value={c.value}>
          {c.symbol} {c.label}
        </option>
      ))}
    </select>
  );
}
