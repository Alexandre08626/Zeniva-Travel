import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://vmi3097009.contaboserver.net';
const AUTH = 'zeniva-secret-2025';

export async function GET(req: NextRequest) {
  try {
    const r = await fetch(`${API_BASE}/social-queue`, {
      headers: { Authorization: `Bearer ${AUTH}` },
    });
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = await fetch(`${API_BASE}/social-queue/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AUTH}` },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
