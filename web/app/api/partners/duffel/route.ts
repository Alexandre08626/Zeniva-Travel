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
  const originInput = url.searchParams.get('origin') || 'LON';
  const destinationInput = url.searchParams.get('destination') || 'PAR';
  const departure_date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);

  // Small helper to normalize common city names to a 3-letter IATA code
  const iataMap: Record<string, string> = {
    "Quebec": "YQB",
    "Québec": "YQB",
    "Montreal": "YUL",
    "Montréal": "YUL",
    "Toronto": "YYZ",
    "Vancouver": "YVR",
    "Miami": "MIA",
    "Paris": "PAR",
    "New York": "JFK",
    "London": "LON",
    "Cancun": "CUN",
  };

  function resolveIATA(val: string | null) {
    if (!val) return "";
    const s = String(val).trim();
    // If already a 3-letter code, return uppercased
    if (/^[A-Za-z]{3}$/.test(s)) return s.toUpperCase();
    // Exact match from map
    for (const [k, v] of Object.entries(iataMap)) {
      if (k.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(k.toLowerCase())) return v;
    }
    // Fallback: use first three letters uppercased (not ideal, but explicit)
    return s.toUpperCase().slice(0, 3);
  }

  const origin = resolveIATA(originInput);
  const destination = resolveIATA(destinationInput);

  // Validate basic shape before calling Duffel (Duffel -> 422 if invalid destination)
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return NextResponse.json({ ok: false, error: `Invalid origin or destination; expected 3-letter IATA codes (got origin='${originInput}', destination='${destinationInput}')` }, { status: 400 });
  }

  const body = {
    passengers: [{ type: 'adult' }],
    slices: [{ origin, destination, departure_date }],
  };

  try {
    const result = await searchDuffelOffers(body);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    // If Duffel not configured, return a helpful mock fallback
    if (!duffelIsConfigured()) {
      return NextResponse.json({ ok: true, mock: true, message: 'Duffel not configured', sample: { offers: [] } });
    }

    // Include useful debug information for 4xx errors returned by Duffel
    const errMessage = e?.message || String(e);
    console.error('Duffel proxy error for body', JSON.stringify(body), errMessage);

    // If this was a validation error from Duffel (422), surface it directly to the client
    if (errMessage.includes('422') || errMessage.includes('Invalid')) {
      return NextResponse.json({ ok: false, error: errMessage }, { status: 422 });
    }

    return NextResponse.json({ ok: false, error: errMessage }, { status: 502 });
  }
}
