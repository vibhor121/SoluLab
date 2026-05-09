export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'timeout';

export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

export type Currency = 'INR' | 'USD';

export interface PaymentFormValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

export interface FormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  amount?: string;
}

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  cardLast4: string;
  expiry: string;
  amount: number;
  currency: Currency;
}

export interface GatewayResponse {
  success: boolean;
  transactionId: string;
  failureReason?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: 'success' | 'failed' | 'timeout';
  timestamp: string;
  failureReason?: string;
  attempts: number;
  cardLast4: string;
  cardholderName: string;
}
