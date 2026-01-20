import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    // In dev, just log and return success. Replace with real email sending in production.
    console.log(`[DEV] Password reset requested for: ${email}`);
    return NextResponse.json({ ok: true, message: 'Password reset link sent (dev)' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
