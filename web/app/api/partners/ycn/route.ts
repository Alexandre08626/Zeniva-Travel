import { NextResponse } from 'next/server';
import ycnData from '@/src/data/ycn_packages.json';

export async function GET() {
  try {
    return NextResponse.json(ycnData, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('API /api/partners/ycn error', err);
    return NextResponse.json({ error: 'failed to read ycn data' }, { status: 500 });
  }
}
