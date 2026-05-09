'use client';

import { useState, useCallback, useMemo } from 'react';
import { detectCardType } from '@/utils/cardUtils';
import {
  validateCardholderName,
  validateCardNumber,
  validateExpiry,
  validateCvv,
  validateAmount,
} from '@/utils/validation';
import type { PaymentFormValues, FormErrors, Currency } from '@/types';
import CardInput from './CardInput';
import CardPreview from './CardPreview';
import { usePayment } from '@/hooks/usePayment';
import { usePaymentStore } from '@/store/paymentStore';

const DEFAULT_VALUES: PaymentFormValues = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  amount: '',
  currency: 'INR',
};

export default function PaymentForm() {
  const [values, setValues] = useState<PaymentFormValues>(DEFAULT_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof PaymentFormValues, boolean>>>({});

  const { pay, canRetry, status } = usePayment();
  const { setCurrency } = usePaymentStore();

  const cardType = useMemo(() => detectCardType(values.cardNumber.replace(/\s/g, '')), [values.cardNumber]);

  const errors = useMemo<FormErrors>(() => ({
    cardholderName: validateCardholderName(values.cardholderName),
    cardNumber: validateCardNumber(values.cardNumber),
    expiry: validateExpiry(values.expiry),
    cvv: validateCvv(values.cvv, cardType),
    amount: validateAmount(values.amount),
  }), [values, cardType]);

  const isValid = Object.values(errors).every((e) => !e);
  const isDisabled = status === 'processing';

  const handleChange = useCallback((field: keyof PaymentFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof PaymentFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleCurrencyChange = useCallback((currency: Currency) => {
    setValues((prev) => ({ ...prev, currency }));
    setCurrency(currency);
  }, [setCurrency]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      // Mark all fields touched on submit attempt
      setTouched({
        cardholderName: true,
        cardNumber: true,
        expiry: true,
        cvv: true,
        amount: true,
      });
      if (!isValid || isDisabled) return;
      await pay(values);
    },
    [isValid, isDisabled, pay, values]
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="p-5 space-y-5">
      {/* Live Card Preview */}
      <CardPreview
        cardholderName={values.cardholderName}
        cardNumber={values.cardNumber}
        expiry={values.expiry}
        cardType={cardType}
      />

      <div className="border-t border-gray-100 pt-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Card Details</p>
        <CardInput
          values={values}
          errors={errors}
          touched={touched}
          onChange={handleChange}
          onBlur={handleBlur}
          onCurrencyChange={handleCurrencyChange}
          disabled={isDisabled}
          cardType={cardType}
        />
      </div>

      {/* PhonePe-style pay button */}
      <button
        type="submit"
        disabled={!isValid || isDisabled}
        className="w-full text-white font-bold py-3.5 rounded-xl transition-all text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5F259F] active:scale-[0.98]"
        style={{
          backgroundColor: !isValid || isDisabled ? '#c4a8e3' : '#5F259F',
          cursor: !isValid || isDisabled ? 'not-allowed' : 'pointer',
        }}
        aria-disabled={!isValid || isDisabled}
      >
        {isDisabled ? 'Processing…' : `Pay${values.amount ? ` ${values.currency === 'INR' ? '₹' : '$'}${values.amount}` : ' Now'}`}
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Payments are secure and encrypted
      </p>
    </form>
  );
}
