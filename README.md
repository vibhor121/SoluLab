# Payment Gateway UI

A full payment gateway interface built with Next.js (App Router) and TypeScript. No third-party payment SDKs — all gateway behaviour is simulated via a Next.js API Route. The UI is styled after PhonePe's design language.

## Features

- **Live card preview** — updates in real time as the user types
- **Card detection** — auto-detects Visa, Mastercard, and Amex from the first few digits and shows a badge
- **Smart formatting** — card number auto-formats with spaces (4-4-4-4 for Visa/MC, 4-6-5 for Amex)
- **Real-time validation** — per-field errors on blur, not all at once on submit
- **CVV length** — 3 digits for Visa/Mastercard, 4 for Amex
- **Expiry check** — rejects past dates
- **Currency selector** — INR and USD with live symbol on the pay button
- **Full payment lifecycle** — Idle → Processing → Success / Failed / Timeout
- **Retry logic** — up to 3 attempts per transaction, attempt count shown to the user
- **Idempotency** — `crypto.randomUUID()` generates one transaction ID per payment; retries reuse it
- **Timeout handling** — AbortController cancels the request after 6 seconds; server simulates a timeout at 8 seconds
- **Transaction history** — persisted in localStorage, survives page refresh; click any row to see full details
- **Accessibility** — visible labels, `aria-describedby` on all inputs, focus managed after state transitions
- **Responsive** — works on 375px mobile and 1280px desktop

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict, no `any`) |
| State | Zustand with `persist` middleware |
| Styling | Tailwind CSS |
| Icons | lucide-react |

**Why Zustand over Redux Toolkit?** This project needs shared state (payment lifecycle, transaction history) but doesn't need the full Redux ceremony of slices, reducers, and selectors. Zustand gives the same guarantees with far less boilerplate and is straightforward to justify at the mid-level.

## Project Structure

```
src/
├── app/
│   ├── api/pay/route.ts        # Mock gateway — 60% success, 25% fail, 15% timeout
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── PaymentForm.tsx          # Form state, validation, submit handler
│   ├── CardInput.tsx            # All form fields with formatting and error display
│   ├── CardPreview.tsx          # Live card visual
│   ├── CurrencySelector.tsx     # INR / USD dropdown
│   ├── StatusScreen.tsx         # Processing, success, failed, timeout views
│   └── TransactionHistory.tsx   # Accordion list + detail modal
├── hooks/
│   └── usePayment.ts            # Payment lifecycle, retry logic, AbortController
├── store/
│   └── paymentStore.ts          # Zustand store (history persisted, status not)
├── utils/
│   ├── cardUtils.ts             # Card detection, formatting, Luhn check
│   ├── validation.ts            # Per-field validators
│   └── apiClient.ts             # fetch wrapper with 6s AbortController timeout
└── types/
    └── index.ts                 # All shared interfaces and types
```

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are needed — the mock gateway runs entirely inside the Next.js API Route.

## Test Card Numbers

| Card | Number | CVV |
|---|---|---|
| Visa | 4242 4242 4242 4242 | 123 |
| Mastercard | 5105 1051 0510 5100 | 123 |
| Amex | 3782 822463 10005 | 1234 |

Use any future expiry date (e.g. 12/26) and any valid CVV.

## Gateway Simulation

The `/api/pay` route randomises outcomes on every request:

- **60%** — success (returns after ~500ms)
- **25%** — failure with a reason string (e.g. "Insufficient funds")
- **15%** — timeout simulation (responds after 8 seconds; the frontend AbortController fires at 6 seconds so the user sees a timeout)

## Assumptions

- Card numbers are validated client-side with the Luhn algorithm. The API only receives the last 4 digits — sending full card data to a backend over plain HTTP would be a PCI violation even in a demo.
- The transaction ID is generated with `crypto.randomUUID()` before the first attempt and reused on all retries, so history never contains duplicate entries for the same payment.
- LocalStorage is the persistence layer. In production this would be a server-side database with proper auth.
- The 3-attempt limit is per transaction (per UUID). Starting a new payment resets the counter.

## What I'd improve given more time

- **Animations** — smooth transitions between the form and status screens (Framer Motion)
- **More currencies** — EUR, GBP, AED with proper locale formatting
- **Backend persistence** — store transactions in a database instead of localStorage so history works across devices
- **Unit tests** — validators and card utilities are pure functions, easy to test with Vitest
- **E2E tests** — Playwright to cover the full payment flow including timeout and retry paths
- **Keyboard trap on modal** — the transaction detail modal needs a proper focus trap for full accessibility compliance
- **Rate limiting** — the API route has no protection against rapid retries; would add in production
