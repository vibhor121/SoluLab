import { detectCardType, luhnCheck, maxCvvLength, maxCardLength } from './cardUtils';
import type { CardType } from '@/types';

export function validateCardholderName(value: string): string | undefined {
  if (!value.trim()) return 'Cardholder name is required';
  if (value.trim().length < 3) return 'Name must be at least 3 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  return undefined;
}

export function validateCardNumber(value: string): string | undefined {
  const raw = value.replace(/\s/g, '');
  if (!raw) return 'Card number is required';
  const cardType: CardType = detectCardType(raw);
  const required = maxCardLength(cardType);
  if (raw.length < required) return `Card number must be ${required} digits`;
  if (!luhnCheck(raw)) return 'Invalid card number';
  return undefined;
}

export function validateExpiry(value: string): string | undefined {
  if (!value) return 'Expiry date is required';
  if (!/^\d{2}\/\d{2}$/.test(value)) return 'Use MM/YY format';
  const [mm, yy] = value.split('/').map(Number);
  if (mm < 1 || mm > 12) return 'Invalid month';
  const now = new Date();
  const expiry = new Date(2000 + yy, mm - 1, 1);
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (expiry < firstOfThisMonth) return 'Card has expired';
  return undefined;
}

export function validateCvv(value: string, cardType: CardType): string | undefined {
  if (!value) return 'CVV is required';
  const required = maxCvvLength(cardType);
  if (!/^\d+$/.test(value)) return 'CVV must be numeric';
  if (value.length !== required) return `CVV must be ${required} digits`;
  return undefined;
}

export function validateAmount(value: string): string | undefined {
  if (!value) return 'Amount is required';
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return 'Enter a valid positive amount';
  if (num > 1000000) return 'Amount exceeds maximum limit';
  return undefined;
}
