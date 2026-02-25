import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rvlcgtlcjylozbihtpkr.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, destination, phone, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Check if lead already exists
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Welcome back! We already have your info.', existing: true });
    }

    // Parse name
    const parts = (name || '').split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    // Insert new lead
    const { data, error } = await supabase.from('leads').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || '',
      destination: destination || '',
      source: source || 'website_capture',
      status: 'new',
      language: 'en',
    }).select().single();

    if (error) {
      console.error('Lead capture error:', error);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    // Notify VPS API to trigger immediate outreach
    try {
      await fetch('https://vmi3097009.contaboserver.net/webhook/lead-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: data.id, action: 'new_capture' }),
      });
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({ 
      message: 'Thanks! Check your email for exclusive deals.',
      success: true 
    });

  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
