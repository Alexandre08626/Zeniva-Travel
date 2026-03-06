import { NextResponse } from 'next/server';
import { hashPassword } from '../../../../src/lib/server/auth';
import { getSupabaseAdminClient } from '../../../../src/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 });
    }

    if (!password) {
      // No password provided — just acknowledge (future: send email link)
      return NextResponse.json({ ok: true, message: 'If account exists, reset instructions sent.' });
    }

    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { client: supabase } = getSupabaseAdminClient();
    const normalizedEmail = email.trim().toLowerCase();

    // Hash the new password using same algo as login
    const hashed = hashPassword(password);

    // Update password_hash in Supabase
    const { error, count } = await supabase
      .from('accounts')
      .update({ password_hash: hashed })
      .eq('email', normalizedEmail)
      .select('id');

    if (error) {
      console.error('[reset-password] Supabase error:', error);
      return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[reset-password]', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
