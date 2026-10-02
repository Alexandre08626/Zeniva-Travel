import { NextResponse } from 'next/server';
import { sendPushToHQ } from '@/src/lib/server/pushNotify';

/**
 * Partner "connect my account" request. Codes are not verified automatically yet:
 * the request is sent to HQ, who links the partner account by hand.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    const code = String(body?.code || '').trim().slice(0, 64);
    if (!email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }
    await sendPushToHQ({
      title: 'Partenaire : demande de liaison de compte',
      body: `${email}${code ? ` (code ${code})` : ''}`,
      url: '/agent/partners',
      tag: 'partner-connect',
    }).catch(() => {});
    return NextResponse.json({ ok: true, manual: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
