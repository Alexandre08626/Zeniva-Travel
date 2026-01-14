import { NextResponse } from 'next/server';
import { searchDuffelOffers, duffelIsConfigured } from '../../../../src/lib/duffelClient';

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Test mode: returns a small mock or invokes client to prove connectivity
  if (url.searchParams.has('test')) {
    const sampleBody = {
      passengers: [{ type: 'adult' }],
      slices: [
        {
          origin: 'LON',
          destination: 'PAR',
          departure_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
        },
      ],
    };
    try {
      const result = await searchDuffelOffers(sampleBody);
      return NextResponse.json({ ok: true, result });
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
    }
  }

  // Basic search proxy: accept origin/destination/date as query params
  const origin = url.searchParams.get('origin') || 'LON';
  const destination = url.searchParams.get('destination') || 'PAR';
  const departure_date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);

  const body = {
    passengers: [{ type: 'adult' }],
    slices: [{ origin, destination, departure_date }],
  };

  try {
    const result = await searchDuffelOffers(body);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    // If Duffel not configured, return a helpful mock fallback
    if (!duffelIsConfigured()) {
      return NextResponse.json({ ok: true, mock: true, message: 'Duffel not configured', sample: { offers: [] } });
    }
    return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
  }
}
