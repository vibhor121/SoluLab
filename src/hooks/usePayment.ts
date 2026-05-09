import { useCallback, useRef } from 'react';
import { usePaymentStore } from '@/store/paymentStore';
import { submitPayment, APIError } from '@/utils/apiClient';
import type { PaymentFormValues, Transaction } from '@/types';

export function usePayment() {
  const {
    status,
    transactionId,
    currentAttempt,
    maxAttempts,
    failureReason,
    setStatus,
    setTransactionId,
    incrementAttempt,
    resetAttempts,
    setFailureReason,
    addOrUpdateTransaction,
    resetPayment,
    currency,
  } = usePaymentStore();

  const txIdRef = useRef<string | null>(null);

  const pay = useCallback(
    async (form: PaymentFormValues) => {
      // Generate transaction ID only on first attempt
      if (!txIdRef.current) {
        txIdRef.current = crypto.randomUUID();
        setTransactionId(txIdRef.current);
        resetAttempts();
      }

      const txId = txIdRef.current;
      const attempt = currentAttempt + 1;
      incrementAttempt();
      setStatus('processing');
      setFailureReason(null);

      const raw = form.cardNumber.replace(/\s/g, '');
      const cardLast4 = raw.slice(-4);

      try {
        const response = await submitPayment({
          transactionId: txId,
          cardholderName: form.cardholderName,
          cardLast4,
          expiry: form.expiry,
          amount: parseFloat(form.amount),
          currency: form.currency,
        });

        if (response.success) {
          setStatus('success');
          const tx: Transaction = {
            id: txId,
            amount: parseFloat(form.amount),
            currency: form.currency,
            status: 'success',
            timestamp: new Date().toISOString(),
            attempts: attempt,
            cardLast4,
            cardholderName: form.cardholderName,
          };
          addOrUpdateTransaction(tx);
          txIdRef.current = null;
        } else {
          const reason = response.failureReason ?? 'Payment failed';
          setStatus('failed');
          setFailureReason(reason);
          const tx: Transaction = {
            id: txId,
            amount: parseFloat(form.amount),
            currency: form.currency,
            status: 'failed',
            timestamp: new Date().toISOString(),
            failureReason: reason,
            attempts: attempt,
            cardLast4,
            cardholderName: form.cardholderName,
          };
          addOrUpdateTransaction(tx);
        }
      } catch (err) {
        const isTimeout = err instanceof APIError && err.code === 'TIMEOUT';
        const message =
          err instanceof APIError ? err.message : 'Something went wrong. Please try again.';

        setStatus(isTimeout ? 'timeout' : 'failed');
        setFailureReason(message);

        const tx: Transaction = {
          id: txId,
          amount: parseFloat(form.amount),
          currency: form.currency,
          status: isTimeout ? 'timeout' : 'failed',
          timestamp: new Date().toISOString(),
          failureReason: message,
          attempts: attempt,
          cardLast4,
          cardholderName: form.cardholderName,
        };
        addOrUpdateTransaction(tx);
      }
    },
    [
      currentAttempt,
      incrementAttempt,
      setStatus,
      setTransactionId,
      resetAttempts,
      setFailureReason,
      addOrUpdateTransaction,
    ]
  );

  const startNewPayment = useCallback(() => {
    txIdRef.current = null;
    resetPayment();
  }, [resetPayment]);

  const canRetry = (status === 'failed' || status === 'timeout') && currentAttempt < maxAttempts;
  const attemptsExhausted = (status === 'failed' || status === 'timeout') && currentAttempt >= maxAttempts;

  return {
    status,
    transactionId,
    currentAttempt,
    maxAttempts,
    failureReason,
    canRetry,
    attemptsExhausted,
    pay,
    startNewPayment,
    currency,
  };
}
