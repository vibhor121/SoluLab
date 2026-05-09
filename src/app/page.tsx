'use client';

import { usePayment } from '@/hooks/usePayment';
import PaymentForm from '@/components/PaymentForm';
import StatusScreen from '@/components/StatusScreen';
import TransactionHistory from '@/components/TransactionHistory';

export default function Home() {
  const {
    status,
    failureReason,
    currentAttempt,
    maxAttempts,
    canRetry,
    attemptsExhausted,
    transactionId,
    lastAmount,
    lastCurrency,
    retry,
    startNewPayment,
  } = usePayment();

  const showForm = status === 'idle';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--pp-bg)' }}>
      {/* PhonePe-style purple header */}
      <header style={{ background: 'linear-gradient(135deg, #5F259F 0%, #7b35c1 100%)' }} className="px-4 py-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-xs font-black" style={{ color: '#5F259F' }}>P</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Secure Payment</h1>
            <p className="text-purple-200 text-xs">256-bit SSL encrypted</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <svg className="w-4 h-4 text-purple-200" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-purple-200 text-xs">Secure</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
            {showForm ? (
              <PaymentForm />
            ) : (
              <StatusScreen
                status={status}
                failureReason={failureReason}
                currentAttempt={currentAttempt}
                maxAttempts={maxAttempts}
                canRetry={canRetry}
                attemptsExhausted={attemptsExhausted}
                amount={lastAmount}
                currency={lastCurrency}
                transactionId={transactionId}
                onRetry={retry}
                onNewPayment={startNewPayment}
              />
            )}
          </div>

          <TransactionHistory />

          <p className="text-center text-xs text-gray-400 pb-4">
            Protected by PhonePe Payment Gateway · PCI DSS Compliant
          </p>
        </div>
      </main>
    </div>
  );
}
