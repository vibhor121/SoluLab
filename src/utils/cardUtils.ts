import type { CardType } from '@/types';

export function detectCardType(number: string): CardType {
  const raw = number.replace(/\s/g, '');
  if (/^4/.test(raw)) return 'visa';
  if (/^3[47]/.test(raw)) return 'amex';
  if (/^5[1-5]/.test(raw) || /^2(2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720)/.test(raw)) return 'mastercard';
  return 'unknown';
}

export function formatCardNumber(value: string, cardType: CardType): string {
  const raw = value.replace(/\D/g, '');
  if (cardType === 'amex') {
    // Format: 4-6-5
    const p1 = raw.slice(0, 4);
    const p2 = raw.slice(4, 10);
    const p3 = raw.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }
  // Format: 4-4-4-4
  return raw.replace(/(.{4})/g, '$1 ').trim();
}

export function maxCardLength(cardType: CardType): number {
  return cardType === 'amex' ? 15 : 16;
}

export function maxCvvLength(cardType: CardType): number {
  return cardType === 'amex' ? 4 : 3;
}

export function maskCardNumber(cardNumber: string): string {
  const raw = cardNumber.replace(/\s/g, '');
  if (!raw) return '**** **** **** ****';
  const last4 = raw.slice(-4).padStart(raw.length, '*');
  // Re-format with spaces
  return last4.replace(/(.{4})/g, '$1 ').trim();
}

export function luhnCheck(value: string): boolean {
  const raw = value.replace(/\D/g, '');
  if (!raw.length) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = raw.length - 1; i >= 0; i--) {
    let digit = parseInt(raw[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}
