import { NextRequest, NextResponse } from 'next/server';

const FAILURE_REASONS = [
  'Insufficient funds',
  'Card declined by issuer',
  'Transaction limit exceeded',
  'Invalid card details',
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || !body.transactionId) {
    return NextResponse.json({ message: 'Invalid request payload' }, { status: 400 });
  }

  const roll = Math.random();

  // 15% → simulate timeout (responds after 8s, frontend cancels at 6s)
  if (roll < 0.15) {
    await sleep(8000);
    return NextResponse.json({ success: false, transactionId: body.transactionId, failureReason: 'Gateway timeout' }, { status: 200 });
  }

  // 25% → failure
  if (roll < 0.40) {
    const reason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
    return NextResponse.json({ success: false, transactionId: body.transactionId, failureReason: reason }, { status: 200 });
  }

  // 60% → success
  await sleep(500); // slight realistic delay
  return NextResponse.json({ success: true, transactionId: body.transactionId }, { status: 200 });
}
