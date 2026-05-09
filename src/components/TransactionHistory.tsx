'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { usePaymentStore } from '@/store/paymentStore';
import type { Transaction, Currency } from '@/types';

const CURRENCY_SYMBOL: Record<Currency, string> = { INR: '₹', USD: '$' };

function StatusBadge({ status }: { status: Transaction['status'] }) {
  if (status === 'success') return (
    <span className="flex items-center gap-1 text-green-700 bg-green-50 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-100">
      <CheckCircle className="w-3 h-3" /> Success
    </span>
  );
  if (status === 'timeout') return (
    <span className="flex items-center gap-1 text-amber-700 bg-amber-50 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-100">
      <Clock className="w-3 h-3" /> Timeout
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-red-700 bg-red-50 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-100">
      <XCircle className="w-3 h-3" /> Failed
    </span>
  );
}

function TransactionDetail({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Transaction details"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #5F259F 0%, #7b35c1 100%)' }}>
          <h3 className="text-base font-bold text-white">Transaction Details</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-0.5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Status banner */}
          <div className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${
            tx.status === 'success' ? 'bg-green-50' : tx.status === 'timeout' ? 'bg-amber-50' : 'bg-red-50'
          }`}>
            {tx.status === 'success' && <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />}
            {tx.status === 'timeout' && <Clock className="w-8 h-8 text-amber-500 shrink-0" />}
            {tx.status === 'failed' && <XCircle className="w-8 h-8 text-red-500 shrink-0" />}
            <div>
              <p className="font-bold text-gray-800">
                {CURRENCY_SYMBOL[tx.currency]}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {tx.currency}
              </p>
              <StatusBadge status={tx.status} />
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <Row label="Transaction ID" value={<span className="font-mono text-xs break-all text-gray-600">{tx.id}</span>} />
            <Row label="Cardholder" value={tx.cardholderName} />
            <Row label="Card" value={`•••• •••• •••• ${tx.cardLast4}`} />
            <Row label="Attempts" value={`${tx.attempts}`} />
            <Row label="Date & Time" value={new Date(tx.timestamp).toLocaleString()} />
            {tx.failureReason && (
              <Row label="Reason" value={<span className="text-red-600">{tx.failureReason}</span>} />
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
      <dt className="text-gray-400 text-xs font-semibold uppercase tracking-wide shrink-0">{label}</dt>
      <dd className="text-gray-800 font-medium text-right text-xs">{value}</dd>
    </div>
  );
}

export default function TransactionHistory() {
  const { transactions, selectTransaction, selectedTransaction } = usePaymentStore();
  const [open, setOpen] = useState(false);

  if (transactions.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center px-4 py-3.5 bg-white rounded-2xl border border-purple-100 text-sm font-bold text-gray-700 transition-all hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-[#5F259F]/30 shadow-sm"
        aria-expanded={open}
        style={{ color: '#5F259F' }}
      >
        <span>Transaction History ({transactions.length})</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <ul className="mt-2 bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
          {transactions.map((tx) => (
            <li key={tx.id}>
              <button
                onClick={() => selectTransaction(tx)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#5F259F]/20"
                aria-label={`View details for transaction ${tx.id.slice(0, 8)}`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-mono text-gray-400 truncate">{tx.id.slice(0, 18)}…</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-sm font-bold text-gray-800">
                    {CURRENCY_SYMBOL[tx.currency]}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <StatusBadge status={tx.status} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedTransaction && (
        <TransactionDetail tx={selectedTransaction} onClose={() => selectTransaction(null)} />
      )}
    </div>
  );
}
