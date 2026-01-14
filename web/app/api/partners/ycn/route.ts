import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const p = path.join(process.cwd(), 'src', 'data', 'ycn_packages.json');
    if (!fs.existsSync(p)) return NextResponse.json([], { status: 200 });
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('API /api/partners/ycn error', err);
    return NextResponse.json({ error: 'failed to read ycn data' }, { status: 500 });
  }
}
