import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = body;
    console.log(`[DEV] Partner connect attempt for: ${email} with code: ${code || '(none)'} `);
    // Here you'd verify the code and attach partner role; for dev we just return success
    return NextResponse.json({ ok: true, message: 'Partner connect request received (dev)' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
