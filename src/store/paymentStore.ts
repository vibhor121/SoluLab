import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentStatus, Transaction, Currency, PaymentFormValues } from '@/types';

interface PaymentState {
  status: PaymentStatus;
  transactionId: string | null;
  currentAttempt: number;
  maxAttempts: number;
  failureReason: string | null;
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  currency: Currency;
  lastFormValues: PaymentFormValues | null;

  setStatus: (status: PaymentStatus) => void;
  setTransactionId: (id: string | null) => void;
  incrementAttempt: () => void;
  resetAttempts: () => void;
  setFailureReason: (reason: string | null) => void;
  addOrUpdateTransaction: (tx: Transaction) => void;
  selectTransaction: (tx: Transaction | null) => void;
  setCurrency: (currency: Currency) => void;
  setLastFormValues: (values: PaymentFormValues | null) => void;
  resetPayment: () => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      status: 'idle',
      transactionId: null,
      currentAttempt: 0,
      maxAttempts: 3,
      failureReason: null,
      transactions: [],
      selectedTransaction: null,
      currency: 'INR',
      lastFormValues: null,

      setStatus: (status) => set({ status }),
      setTransactionId: (id) => set({ transactionId: id }),
      incrementAttempt: () => set((s) => ({ currentAttempt: s.currentAttempt + 1 })),
      resetAttempts: () => set({ currentAttempt: 0 }),
      setFailureReason: (reason) => set({ failureReason: reason }),

      addOrUpdateTransaction: (tx) =>
        set((s) => {
          const idx = s.transactions.findIndex((t) => t.id === tx.id);
          if (idx !== -1) {
            const updated = [...s.transactions];
            updated[idx] = tx;
            return { transactions: updated };
          }
          return { transactions: [tx, ...s.transactions] };
        }),

      selectTransaction: (tx) => set({ selectedTransaction: tx }),
      setCurrency: (currency) => set({ currency }),
      setLastFormValues: (values) => set({ lastFormValues: values }),

      resetPayment: () =>
        set({
          status: 'idle',
          transactionId: null,
          currentAttempt: 0,
          failureReason: null,
          lastFormValues: null,
        }),
    }),
    {
      name: 'payment-gateway-storage',
      partialize: (s) => ({ transactions: s.transactions }),
    }
  )
);
