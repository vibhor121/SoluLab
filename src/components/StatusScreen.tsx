'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw, Plus } from 'lucide-react';
import type { PaymentStatus, Currency } from '@/types';

interface Props {
  status: PaymentStatus;
  failureReason: string | null;
  currentAttempt: number;
  maxAttempts: number;
  canRetry: boolean;
  attemptsExhausted: boolean;
  amount: string;
  currency: Currency;
  transactionId: string | null;
  onRetry: () => void;
  onNewPayment: () => void;
}

const CURRENCY_SYMBOL: Record<Currency, string> = { INR: '₹', USD: '$' };

export default function StatusScreen({
  status,
  failureReason,
  currentAttempt,
  maxAttempts,
  canRetry,
  attemptsExhausted,
  amount,
  currency,
  transactionId,
  onRetry,
  onNewPayment,
}: Props) {
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status !== 'processing') primaryBtnRef.current?.focus();
  }, [status]);

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 px-6" role="status" aria-live="polite">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-100 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5F259F' }} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">Processing Payment</p>
          <p className="text-sm text-gray-500 mt-1">Please wait, do not press back</p>
        </div>
        {currentAttempt > 1 && (
          <div className="bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full">
            Attempt {currentAttempt} of {maxAttempts}
          </div>
        )}
      </div>
    );
  }

  if (status === 'success') {
    const formatted = amount
      ? `${CURRENCY_SYMBOL[currency]}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : '';
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 px-6 text-center" role="status" aria-live="polite">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-2xl font-black text-gray-800">Payment Successful!</p>
          {formatted && <p className="text-3xl font-bold text-green-600 mt-1">{formatted}</p>}
        </div>
        {transactionId && (
          <div className="bg-gray-50 rounded-xl px-4 py-2 w-full">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Transaction ID</p>
            <p className="text-xs text-gray-600 font-mono break-all mt-0.5">{transactionId}</p>
          </div>
        )}
        <button
          ref={primaryBtnRef}
          onClick={onNewPayment}
          className="mt-2 flex items-center gap-2 text-white font-bold px-8 py-3 rounded-xl transition-all hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5F259F]"
          style={{ backgroundColor: '#5F259F' }}
        >
          <Plus className="w-4 h-4" />
          Make Another Payment
        </button>
      </div>
    );
  }

  if (status === 'failed' || status === 'timeout') {
    const isTimeout = status === 'timeout';
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 px-6 text-center" role="alert" aria-live="assertive">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isTimeout ? 'bg-amber-50' : 'bg-red-50'}`}>
          {isTimeout
            ? <Clock className="w-12 h-12 text-amber-500" strokeWidth={1.5} />
            : <XCircle className="w-12 h-12 text-red-500" strokeWidth={1.5} />
          }
        </div>

        <div>
          <p className="text-2xl font-black text-gray-800">
            {isTimeout ? 'Request Timed Out' : 'Payment Failed'}
          </p>
          {failureReason && (
            <p className="text-sm text-gray-500 mt-1">{failureReason}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          {Array.from({ length: maxAttempts }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < currentAttempt ? (isTimeout ? 'bg-amber-400' : 'bg-red-400') : 'bg-gray-200'
              }`}
            />
          ))}
          <span className="text-gray-500 text-xs ml-1">{currentAttempt}/{maxAttempts} attempts</span>
        </div>

        {attemptsExhausted && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl w-full">
            All attempts used. Please try a different card or contact support.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-1">
          {canRetry && (
            <button
              ref={primaryBtnRef}
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl transition-all hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5F259F]"
              style={{ backgroundColor: '#5F259F' }}
            >
              <RefreshCw className="w-4 h-4" />
              Retry Payment
            </button>
          )}
          <button
            ref={attemptsExhausted ? primaryBtnRef : undefined}
            onClick={onNewPayment}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            New Payment
          </button>
        </div>
      </div>
    );
  }

  return null;
}
