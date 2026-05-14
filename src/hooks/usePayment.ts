import { useCallback } from 'react';
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
    lastFormValues,
    setStatus,
    setTransactionId,
    incrementAttempt,
    resetAttempts,
    setFailureReason,
    addOrUpdateTransaction,
    resetPayment,
    currency,
    setLastFormValues,
  } = usePaymentStore();

  const pay = useCallback(
    async (form: PaymentFormValues) => {
      setLastFormValues(form);

      let txId = transactionId;
      if (!txId) {
        txId = crypto.randomUUID();
        setTransactionId(txId);
        resetAttempts();
      }

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
      transactionId,
      currentAttempt,
      incrementAttempt,
      setStatus,
      setTransactionId,
      resetAttempts,
      setFailureReason,
      addOrUpdateTransaction,
      setLastFormValues,
    ]
  );

  const retry = useCallback(() => {
    if (lastFormValues) pay(lastFormValues);
  }, [lastFormValues, pay]);

  const startNewPayment = useCallback(() => {
    resetPayment();
  }, [resetPayment]);

  const canRetry = (status === 'failed' || status === 'timeout') && currentAttempt < maxAttempts;
  const attemptsExhausted = (status === 'failed' || status === 'timeout') && currentAttempt >= maxAttempts;

  const lastAmount = lastFormValues?.amount ?? '';
  const lastCurrency = lastFormValues?.currency ?? currency;

  return {
    status,
    transactionId,
    currentAttempt,
    maxAttempts,
    failureReason,
    canRetry,
    attemptsExhausted,
    pay,
    retry,
    startNewPayment,
    currency,
    lastAmount,
    lastCurrency,
  };
}
