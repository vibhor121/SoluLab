import type { PaymentPayload, GatewayResponse } from '@/types';

const TIMEOUT_MS = 6000;

export async function submitPayment(payload: PaymentPayload): Promise<GatewayResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new APIError(body.message ?? 'Payment request failed', 'API_ERROR');
    }

    return (await res.json()) as GatewayResponse;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new APIError('Request timed out. Please try again.', 'TIMEOUT');
    }
    if (err instanceof APIError) throw err;
    throw new APIError('Network error. Check your connection.', 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly code: 'TIMEOUT' | 'NETWORK_ERROR' | 'API_ERROR'
  ) {
    super(message);
    this.name = 'APIError';
  }
}
