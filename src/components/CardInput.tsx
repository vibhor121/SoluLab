'use client';

import { useCallback } from 'react';
import { detectCardType, formatCardNumber, maxCardLength, maxCvvLength } from '@/utils/cardUtils';
import type { PaymentFormValues, FormErrors, CardType, Currency } from '@/types';
import CurrencySelector from './CurrencySelector';

interface Props {
  values: PaymentFormValues;
  errors: FormErrors;
  touched: Partial<Record<keyof PaymentFormValues, boolean>>;
  onChange: (field: keyof PaymentFormValues, value: string) => void;
  onBlur: (field: keyof PaymentFormValues) => void;
  onCurrencyChange: (currency: Currency) => void;
  disabled?: boolean;
  cardType: CardType;
}

export default function CardInput({
  values,
  errors,
  touched,
  onChange,
  onBlur,
  onCurrencyChange,
  disabled,
  cardType,
}: Props) {
  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      const type = detectCardType(raw);
      const sliced = raw.slice(0, maxCardLength(type));
      onChange('cardNumber', formatCardNumber(sliced, type));
    },
    [onChange]
  );

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value.replace(/\D/g, '');
      if (raw.length > 4) raw = raw.slice(0, 4);
      if (raw.length >= 3) raw = raw.slice(0, 2) + '/' + raw.slice(2);
      onChange('expiry', raw);
    },
    [onChange]
  );

  const handleCvvChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '').slice(0, maxCvvLength(cardType));
      onChange('cvv', raw);
    },
    [onChange, cardType]
  );

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (/^\d*\.?\d{0,2}$/.test(val)) onChange('amount', val);
    },
    [onChange]
  );

  const fieldClass = (field: keyof FormErrors) =>
    `w-full rounded-xl border px-4 py-3 text-sm bg-gray-50 transition-all outline-none
    focus:bg-white focus:border-[#5F259F] focus:ring-2 focus:ring-[#5F259F]/20
    placeholder:text-gray-400 text-gray-800
    disabled:opacity-50 disabled:cursor-not-allowed
    ${touched[field] && errors[field] ? 'border-red-400 bg-red-50/30 focus:ring-red-400/20 focus:border-red-400' : 'border-gray-200'}`;

  return (
    <div className="space-y-4">
      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardholderName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Cardholder Name
        </label>
        <input
          id="cardholderName"
          type="text"
          autoComplete="cc-name"
          value={values.cardholderName}
          onChange={(e) => onChange('cardholderName', e.target.value)}
          onBlur={() => onBlur('cardholderName')}
          disabled={disabled}
          placeholder="As on card"
          className={fieldClass('cardholderName')}
          aria-describedby={errors.cardholderName ? 'cardholderName-error' : undefined}
          aria-invalid={!!(touched.cardholderName && errors.cardholderName)}
        />
        {touched.cardholderName && errors.cardholderName && (
          <p id="cardholderName-error" role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {errors.cardholderName}
          </p>
        )}
      </div>

      {/* Card Number */}
      <div>
        <label htmlFor="cardNumber" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Card Number
        </label>
        <div className="relative">
          <input
            id="cardNumber"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            value={values.cardNumber}
            onChange={handleCardNumberChange}
            onBlur={() => onBlur('cardNumber')}
            disabled={disabled}
            placeholder={cardType === 'amex' ? '3782 822463 10005' : '0000 0000 0000 0000'}
            className={`${fieldClass('cardNumber')} pr-20`}
            aria-describedby={errors.cardNumber ? 'cardNumber-error' : undefined}
            aria-invalid={!!(touched.cardNumber && errors.cardNumber)}
          />
          <CardTypeBadge cardType={cardType} />
        </div>
        {touched.cardNumber && errors.cardNumber && (
          <p id="cardNumber-error" role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="expiry" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Expiry Date
          </label>
          <input
            id="expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            value={values.expiry}
            onChange={handleExpiryChange}
            onBlur={() => onBlur('expiry')}
            disabled={disabled}
            placeholder="MM/YY"
            maxLength={5}
            className={fieldClass('expiry')}
            aria-describedby={errors.expiry ? 'expiry-error' : undefined}
            aria-invalid={!!(touched.expiry && errors.expiry)}
          />
          {touched.expiry && errors.expiry && (
            <p id="expiry-error" role="alert" className="mt-1 text-xs text-red-500">
              {errors.expiry}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cvv" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            CVV {cardType === 'amex' && <span className="normal-case text-gray-400">(4 digits)</span>}
          </label>
          <input
            id="cvv"
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            value={values.cvv}
            onChange={handleCvvChange}
            onBlur={() => onBlur('cvv')}
            disabled={disabled}
            placeholder={cardType === 'amex' ? '••••' : '•••'}
            className={fieldClass('cvv')}
            aria-describedby={errors.cvv ? 'cvv-error' : undefined}
            aria-invalid={!!(touched.cvv && errors.cvv)}
          />
          {touched.cvv && errors.cvv && (
            <p id="cvv-error" role="alert" className="mt-1 text-xs text-red-500">
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Amount
        </label>
        <div
          className={`flex rounded-xl border overflow-hidden transition-all bg-gray-50
            focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5F259F]/20 focus-within:border-[#5F259F]
            ${touched.amount && errors.amount ? 'border-red-400' : 'border-gray-200'}`}
        >
          <CurrencySelector value={values.currency} onChange={onCurrencyChange} disabled={disabled} />
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={values.amount}
            onChange={handleAmountChange}
            onBlur={() => onBlur('amount')}
            disabled={disabled}
            placeholder="0.00"
            className="flex-1 border-0 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby={errors.amount ? 'amount-error' : undefined}
            aria-invalid={!!(touched.amount && errors.amount)}
          />
        </div>
        {touched.amount && errors.amount && (
          <p id="amount-error" role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {errors.amount}
          </p>
        )}
      </div>
    </div>
  );
}

function CardTypeBadge({ cardType }: { cardType: CardType }) {
  if (cardType === 'unknown') return null;

  const config: Record<string, { label: string; color: string }> = {
    visa: { label: 'VISA', color: '#1a1f71' },
    mastercard: { label: 'MC', color: '#eb001b' },
    amex: { label: 'AMEX', color: '#007bc1' },
  };

  const item = config[cardType];
  if (!item) return null;

  return (
    <span
      className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-[10px] font-black px-2 py-0.5 rounded"
      style={{ backgroundColor: item.color }}
      aria-label={`Card type: ${cardType}`}
    >
      {item.label}
    </span>
  );
}
