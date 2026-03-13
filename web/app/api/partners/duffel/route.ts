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
    // Canada
    "Quebec": "YQB", "Québec": "YQB",
    "Montreal": "YUL", "Montréal": "YUL",
    "Toronto": "YYZ",
    "Vancouver": "YVR",
    "Calgary": "YYC",
    "Ottawa": "YOW",
    "Edmonton": "YEG",
    // USA
    "Miami": "MIA",
    "New York": "JFK", "New York City": "JFK",
    "Los Angeles": "LAX",
    "Chicago": "ORD",
    "San Francisco": "SFO",
    "Las Vegas": "LAS",
    "Orlando": "MCO",
    "Boston": "BOS",
    "Seattle": "SEA",
    "Houston": "IAH",
    "Atlanta": "ATL",
    "Dallas": "DFW",
    // Europe
    "Paris": "CDG",
    "London": "LHR",
    "Rome": "FCO", "Roma": "FCO",
    "Barcelona": "BCN",
    "Madrid": "MAD",
    "Amsterdam": "AMS",
    "Frankfurt": "FRA",
    "Lisbon": "LIS", "Lisbonne": "LIS",
    "Dublin": "DUB",
    "Athens": "ATH", "Athènes": "ATH",
    "Greece": "ATH", "Grèce": "ATH", "Grece": "ATH", "GRÈ": "ATH",
    "Santorini": "JTR",
    "Mykonos": "JMK",
    "Crete": "HER", "Crète": "HER", "Heraklion": "HER",
    "Rhodes": "RHO",
    "Corfu": "CFU", "Corfou": "CFU",
    "Vienna": "VIE", "Vienne": "VIE",
    "Prague": "PRG",
    "Budapest": "BUD",
    "Warsaw": "WAW", "Varsovie": "WAW",
    "Brussels": "BRU", "Bruxelles": "BRU",
    "Copenhagen": "CPH", "Copenhague": "CPH",
    "Stockholm": "ARN",
    "Oslo": "OSL",
    "Helsinki": "HEL",
    "Zurich": "ZRH",
    "Geneva": "GVA", "Genève": "GVA",
    "Milan": "MXP", "Milano": "MXP",
    "Venice": "VCE", "Venise": "VCE",
    "Florence": "FLR", "Firenze": "FLR",
    "Istanbul": "IST",
    "Dubrovnik": "DBV",
    // Caribbean / Latin America
    "Cancun": "CUN", "Cancún": "CUN",
    "Punta Cana": "PUJ",
    "Havana": "HAV", "La Havane": "HAV",
    "Nassau": "NAS",
    "Montego Bay": "MBJ",
    "San Jose": "SJO", "San José": "SJO",
    "Mexico City": "MEX", "Mexico": "MEX",
    "Bogota": "BOG", "Bogotá": "BOG",
    "Lima": "LIM",
    "Buenos Aires": "EZE",
    "Rio de Janeiro": "GIG", "Rio": "GIG",
    "São Paulo": "GRU", "Sao Paulo": "GRU",
    // Asia
    "Tokyo": "NRT",
    "Osaka": "KIX",
    "Bangkok": "BKK",
    "Bali": "DPS",
    "Singapore": "SIN",
    "Hong Kong": "HKG",
    "Seoul": "ICN",
    "Beijing": "PEK",
    "Shanghai": "PVG",
    "Dubai": "DXB",
    "Abu Dhabi": "AUH",
    "Doha": "DOH",
    "Maldives": "MLE", "Maldives (Male)": "MLE",
    "Phuket": "HKT",
    "Kuala Lumpur": "KUL",
    "Manila": "MNL",
    // Africa / Middle East
    "Cairo": "CAI", "Le Caire": "CAI",
    "Marrakech": "RAK",
    "Casablanca": "CMN",
    "Nairobi": "NBO",
    "Cape Town": "CPT", "Le Cap": "CPT",
    "Johannesburg": "JNB",
    // Oceania
    "Sydney": "SYD",
    "Melbourne": "MEL",
    "Auckland": "AKL",
    "Fiji": "NAN",
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
    // Fallback: return empty string (will trigger validation error with clear message)
    return "";
  }

  const origin = resolveIATA(originInput);
  const destination = resolveIATA(destinationInput);

  // Validate basic shape before calling Duffel (Duffel -> 422 if invalid destination)
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return NextResponse.json({ ok: false, error: `Invalid origin or destination; expected 3-letter IATA codes (got origin='${originInput}', destination='${destinationInput}')` }, { status: 400 });
  }

  // Support optional passengers count (defaults to 1)
  const passengersCount = Math.max(1, Math.min(9, parseInt(url.searchParams.get('passengers') || '1', 10)));
  const body = {
    passengers: Array.from({ length: passengersCount }, () => ({ type: 'adult' })),
    slices: [{ origin, destination, departure_date }],
  };

  try {
    const result = await searchDuffelOffers(body);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    // If Duffel not configured, return rich mock flights
    if (!duffelIsConfigured()) {
      const dest = (body?.slices?.[0]?.destination || "CUN").toUpperCase();
      const orig = (body?.slices?.[0]?.origin || "JFK").toUpperCase();
      const depDate = body?.slices?.[0]?.departure_date || new Date().toISOString().slice(0,10);
      const pax = body?.passengers?.length || 1;
      const AIRLINES: Record<string, { name: string; iata: string }> = {
        "CUN": { name: "American Airlines", iata: "AA" }, "MIA": { name: "Delta Air Lines", iata: "DL" },
        "CDG": { name: "Air France", iata: "AF" }, "LHR": { name: "British Airways", iata: "BA" },
        "DXB": { name: "Emirates", iata: "EK" }, "BKK": { name: "Thai Airways", iata: "TG" },
        "NRT": { name: "Japan Airlines", iata: "JL" }, "GRU": { name: "LATAM", iata: "LA" },
        "SYD": { name: "Qantas", iata: "QF" }, "SIN": { name: "Singapore Airlines", iata: "SQ" },
      };
      const al = AIRLINES[dest] || { name: "United Airlines", iata: "UA" };
      const basePrice = { "CUN": 380, "MIA": 290, "CDG": 720, "LHR": 680, "DXB": 1100, "NRT": 1400, "BKK": 1300 }[dest] || 450;
      const mockOffers = [
        { id: `mock-${dest}-1`, owner: { name: al.name, iata_code: al.iata }, total_amount: String(Math.round(basePrice * pax)), total_currency: "USD", base_amount: String(Math.round(basePrice * pax * 0.8)), slices: [{ segments: [{ origin: { iata_code: orig }, destination: { iata_code: dest }, departing_at: `${depDate}T08:00:00`, arriving_at: `${depDate}T13:30:00`, operating_carrier: { name: al.name, iata_code: al.iata }, operating_carrier_flight_number: `${al.iata}${Math.floor(100 + Math.random()*900)}`, passengers: Array(pax).fill({ cabin_class_marketing_name: "Economy" }) }] }] },
        { id: `mock-${dest}-2`, owner: { name: "Delta Air Lines", iata_code: "DL" }, total_amount: String(Math.round((basePrice + 60) * pax)), total_currency: "USD", base_amount: String(Math.round((basePrice + 60) * pax * 0.8)), slices: [{ segments: [{ origin: { iata_code: orig }, destination: { iata_code: dest }, departing_at: `${depDate}T11:00:00`, arriving_at: `${depDate}T16:45:00`, operating_carrier: { name: "Delta Air Lines", iata_code: "DL" }, operating_carrier_flight_number: `DL${Math.floor(100 + Math.random()*900)}`, passengers: Array(pax).fill({ cabin_class_marketing_name: "Economy" }) }] }] },
        { id: `mock-${dest}-3`, owner: { name: "Air Canada", iata_code: "AC" }, total_amount: String(Math.round((basePrice + 30) * pax)), total_currency: "USD", base_amount: String(Math.round((basePrice + 30) * pax * 0.8)), slices: [{ segments: [{ origin: { iata_code: orig }, destination: { iata_code: dest }, departing_at: `${depDate}T06:30:00`, arriving_at: `${depDate}T12:00:00`, operating_carrier: { name: "Air Canada", iata_code: "AC" }, operating_carrier_flight_number: `AC${Math.floor(100 + Math.random()*900)}`, passengers: Array(pax).fill({ cabin_class_marketing_name: "Economy" }) }] }] },
      ];
      return NextResponse.json({ ok: true, mock: true, result: { data: { offers: mockOffers } } });
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
