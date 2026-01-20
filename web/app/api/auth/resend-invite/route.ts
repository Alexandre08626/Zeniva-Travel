import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    console.log(`[DEV] Resend partner invite requested for: ${email}`);
    return NextResponse.json({ ok: true, message: 'Invite resent (dev)' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
