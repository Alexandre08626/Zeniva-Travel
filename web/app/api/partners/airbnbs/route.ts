import { NextResponse } from 'next/server';
import airbnbsData from '@/src/data/airbnbs.json';

export async function GET() {
  try {
    return NextResponse.json(airbnbsData, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('API /api/partners/airbnbs error', err);
    return NextResponse.json({ error: 'failed to read airbnbs data' }, { status: 500 });
  }
}
