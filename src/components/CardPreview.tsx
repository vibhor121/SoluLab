'use client';

import type { CardType } from '@/types';

interface Props {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cardType: CardType;
}

function maskDisplay(cardNumber: string, cardType: CardType): string {
  const raw = cardNumber.replace(/\s/g, '');
  if (cardType === 'amex') {
    const filled = raw.padEnd(15, '•');
    return `${filled.slice(0, 4)} ${filled.slice(4, 10)} ${filled.slice(10, 15)}`;
  }
  const filled = raw.padEnd(16, '•');
  return `${filled.slice(0, 4)} ${filled.slice(4, 8)} ${filled.slice(8, 12)} ${filled.slice(12, 16)}`;
}

const cardGradients: Record<CardType, string> = {
  visa:       'linear-gradient(135deg, #1a1f71 0%, #2563eb 100%)',
  mastercard: 'linear-gradient(135deg, #1c1c1c 0%, #eb5757 100%)',
  amex:       'linear-gradient(135deg, #1a6b4a 0%, #22c55e 100%)',
  unknown:    'linear-gradient(135deg, #5F259F 0%, #7b35c1 100%)',
};

export default function CardPreview({ cardholderName, cardNumber, expiry, cardType }: Props) {
  const gradient = cardGradients[cardType];
  const displayNumber = maskDisplay(cardNumber, cardType);
  const displayName = cardholderName.trim().toUpperCase() || 'FULL NAME';
  const displayExpiry = expiry || 'MM/YY';

  return (
    <div
      className="relative w-full mx-auto rounded-2xl p-5 text-white shadow-xl select-none overflow-hidden"
      style={{ background: gradient, aspectRatio: '1.586 / 1' }}
      aria-label="Card preview"
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-white/5" />

      {/* Top row: chip + brand */}
      <div className="relative flex justify-between items-start mb-5">
        {/* EMV chip */}
        <div className="w-9 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-sm">
          <div className="w-5 h-3.5 rounded-sm border border-yellow-600/40 grid grid-cols-2 gap-0.5 p-0.5">
            <div className="bg-yellow-600/30 rounded-sm" />
            <div className="bg-yellow-600/30 rounded-sm" />
            <div className="bg-yellow-600/30 rounded-sm" />
            <div className="bg-yellow-600/30 rounded-sm" />
          </div>
        </div>

        {/* Card brand mark */}
        {cardType === 'mastercard' && (
          <div className="flex">
            <div className="w-8 h-8 rounded-full bg-red-500 opacity-90" />
            <div className="w-8 h-8 rounded-full bg-yellow-400 opacity-90 -ml-4" />
          </div>
        )}
        {cardType === 'visa' && (
          <span className="text-white font-black italic text-xl tracking-tight drop-shadow">VISA</span>
        )}
        {cardType === 'amex' && (
          <span className="text-white font-black text-sm tracking-widest drop-shadow">AMEX</span>
        )}
      </div>

      {/* Card number */}
      <p className="relative text-lg font-mono tracking-widest mb-5 drop-shadow-sm">
        {displayNumber}
      </p>

      {/* Bottom row */}
      <div className="relative flex justify-between items-end">
        <div>
          <p className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">Card Holder</p>
          <p className="text-sm font-semibold tracking-wide truncate max-w-[160px]">{displayName}</p>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">Expires</p>
          <p className="text-sm font-semibold font-mono">{displayExpiry}</p>
        </div>
      </div>
    </div>
  );
}
