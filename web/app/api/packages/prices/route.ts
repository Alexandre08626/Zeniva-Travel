import { NextResponse } from "next/server";
import { searchDuffelOffers, duffelIsConfigured } from "../../../../src/lib/duffelClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TripQuery = {
  tripId: string;
  destinationAirport: string;
  destinationCity?: string;  // human-readable city for LiteAPI ("Cancun", "Reykjavik")
  checkIn: string;           // YYYY-MM-DD
  checkOut: string;          // YYYY-MM-DD (return)
  estimatedFlightFromJFK_USD?: number;
  basePrice?: number;        // JSON `price` per-person fallback if APIs miss
  travelers?: number;        // default 2
};

type PriceRow = {
  tripId: string;
  flightTotalUSD: number | null;     // Duffel: cheapest round-trip × travelers
  hotelTotalUSD: number | null;      // LiteAPI: cheapest hotel × full stay
  pricePerPersonUSD: number | null;  // (flight + hotel) / travelers
  source: "live" | "mock" | "fallback";
  flightSource: "duffel" | "fallback";
  hotelSource: "liteapi" | "fallback";
  airline?: string;
  hotelName?: string;
  nights?: number;
};

// 30-min in-memory cache. Vercel function cold starts will reset it; that's
// acceptable for a "live deal pricing" surface where stale-by-30min beats
// hammering Duffel on every page reload.
const cache = new Map<string, { value: PriceRow; ts: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function fallbackFlightFromOriginUSD(originIATA: string, destIATA: string, baseFromJFK: number): number {
  // Cheap heuristic when Duffel is unavailable: same as NYC for nearby USA
  // origins, +10% for Canada, -5% for warm-weather origins (MIA), etc.
  // Total round-trip × 2 passengers, USD.
  const o = originIATA.toUpperCase();
  if (!baseFromJFK || baseFromJFK <= 0) return 0;
  const ratio: Record<string, number> = {
    JFK: 1.0,
    YUL: 1.08,   // Montréal — small premium for trans-border
    YQB: 1.18,   // Québec City — fewer direct flights
    YYZ: 1.06,
    MIA: 0.92,   // closer to most Caribbean
    LAX: 1.22,   // West Coast
    IAD: 1.04,   // DC/Virginia
    DCA: 1.06,
    BOS: 1.02,
    ORD: 1.05,
    YVR: 1.30,
  };
  const factor = ratio[o] ?? 1.10;
  return Math.round(baseFromJFK * factor);
}

// Static FX rates for converting Duffel offers to USD. Duffel's default
// account currency is often GBP, and many corridors return EUR or local
// currencies — strict USD-only filtering was rejecting every live offer.
// These rates are intentionally rough (no live FX); the goal is "live-ish
// pricing within ~5%" which is more accurate than the heuristic fallback.
const FX_TO_USD: Record<string, number> = {
  USD: 1.0,
  GBP: 1.27,
  EUR: 1.08,
  CAD: 0.74,
  AUD: 0.66,
  JPY: 0.0067,
  CHF: 1.13,
  MXN: 0.057,
  AED: 0.27,
  SGD: 0.74,
  THB: 0.028,
  IDR: 0.000063,
  INR: 0.012,
  ZAR: 0.054,
};

function offerToUSD(amount: number, currency: string): number | null {
  const cur = currency.toUpperCase();
  const rate = FX_TO_USD[cur];
  if (!rate) return null;
  return amount * rate;
}

async function fetchLiteApiCheapestHotel(
  origin: string,
  destinationCity: string,
  checkIn: string,
  checkOut: string,
  guests: number,
): Promise<{ totalUSD: number | null; name?: string; nights?: number }> {
  if (!destinationCity || !checkIn || !checkOut) return { totalUSD: null };
  try {
    const params = new URLSearchParams({
      destination: destinationCity,
      checkIn,
      checkOut,
      guests: String(guests),
      rooms: "1",
    });
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
    const res = await fetch(`${baseUrl}/api/partners/liteapi/hotels/search?${params}`, {
      // 25s budget — LiteAPI 2-step (hotel list + rates) can take a while.
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return { totalUSD: null };
    const data = await res.json().catch(() => null);
    const offers: any[] = Array.isArray(data?.offers) ? data.offers : [];
    if (offers.length === 0) return { totalUSD: null };
    let cheapest: { total: number; name?: string; nights?: number } | null = null;
    for (const o of offers) {
      const t = typeof o?.priceTotal === "number" ? o.priceTotal : null;
      if (t == null || t <= 0) continue;
      if (cheapest == null || t < cheapest.total) {
        cheapest = { total: t, name: typeof o?.name === "string" ? o.name : undefined, nights: typeof o?.nights === "number" ? o.nights : undefined };
      }
    }
    return cheapest ? { totalUSD: cheapest.total, name: cheapest.name, nights: cheapest.nights } : { totalUSD: null };
  } catch {
    return { totalUSD: null };
  }
}

async function fetchDuffelCheapest(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | null,
  travelers: number,
): Promise<{ totalUSD: number | null; airline?: string }> {
  const passengers = Array.from({ length: Math.max(1, Math.min(travelers, 9)) }, () => ({ type: "adult" }));
  const slices = [{ origin, destination, departure_date: departureDate }];
  if (returnDate) slices.push({ origin: destination, destination: origin, departure_date: returnDate });
  // Ask Duffel to price in USD when possible — falls back to account
  // currency for routes the API can't price in USD natively.
  const payload = { passengers, slices, currency: "USD" };
  try {
    const result: any = await searchDuffelOffers(payload);
    const offers: any[] = result?.data?.offers || result?.offers || [];
    if (offers.length === 0) return { totalUSD: null };
    let bestUSD: number | null = null;
    let bestAirline: string | undefined;
    for (const offer of offers) {
      const amount = parseFloat(offer?.total_amount || "0");
      const currency = String(offer?.total_currency || "USD").toUpperCase();
      if (!Number.isFinite(amount) || amount <= 0) continue;
      const usd = offerToUSD(amount, currency);
      if (usd == null) continue; // unknown currency — skip rather than mis-price
      if (bestUSD == null || usd < bestUSD) {
        bestUSD = Math.round(usd);
        bestAirline = offer?.owner?.name || offer?.owner?.iata_code;
      }
    }
    return { totalUSD: bestUSD, airline: bestAirline };
  } catch {
    return { totalUSD: null };
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const originAirport = String(body?.originAirport || "").trim().toUpperCase();
  const trips: TripQuery[] = Array.isArray(body?.trips) ? body.trips : [];
  const travelers = Math.max(1, Math.min(parseInt(body?.travelers, 10) || 2, 9));
  if (!/^[A-Z]{3}$/.test(originAirport)) {
    return NextResponse.json({ ok: false, error: "invalid_origin" }, { status: 400 });
  }
  if (trips.length === 0) {
    return NextResponse.json({ ok: true, prices: {} });
  }

  const duffelOn = duffelIsConfigured();

  const requestOrigin = new URL(req.url).origin;

  const lookups = await Promise.all(
    trips.map(async (t): Promise<PriceRow> => {
      const dest = String(t.destinationAirport || "").trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(dest)) {
        return {
          tripId: t.tripId,
          flightTotalUSD: null,
          hotelTotalUSD: null,
          pricePerPersonUSD: typeof t.basePrice === "number" ? t.basePrice : null,
          source: "fallback",
          flightSource: "fallback",
          hotelSource: "fallback",
        };
      }
      const cacheKey = `${originAirport}-${dest}-${t.destinationCity || ""}-${t.checkIn || ""}-${t.checkOut || ""}-${travelers}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        return { ...cached.value, tripId: t.tripId };
      }

      // Run flight + hotel lookups in parallel — they're independent.
      const [flightRes, hotelRes] = await Promise.all([
        duffelOn && t.checkIn
          ? fetchDuffelCheapest(originAirport, dest, t.checkIn, t.checkOut || null, travelers)
          : Promise.resolve({ totalUSD: null }),
        fetchLiteApiCheapestHotel(requestOrigin, t.destinationCity || "", t.checkIn || "", t.checkOut || "", travelers),
      ]);

      let flightTotalUSD: number | null = flightRes.totalUSD;
      let flightSource: PriceRow["flightSource"] = flightTotalUSD != null ? "duffel" : "fallback";
      const airline = (flightRes as any).airline;

      // Heuristic fallback for the flight when Duffel returned nothing.
      if (flightTotalUSD == null && typeof t.estimatedFlightFromJFK_USD === "number") {
        flightTotalUSD = fallbackFlightFromOriginUSD(originAirport, dest, t.estimatedFlightFromJFK_USD);
        flightSource = "fallback";
      }

      let hotelTotalUSD: number | null = hotelRes.totalUSD;
      let hotelSource: PriceRow["hotelSource"] = hotelTotalUSD != null ? "liteapi" : "fallback";
      const hotelName = (hotelRes as any).name;
      const hotelNights = (hotelRes as any).nights;

      // Heuristic hotel baseline if LiteAPI returned nothing — derive from
      // JSON `basePrice` minus the assumed NYC flight portion (per person).
      if (
        hotelTotalUSD == null &&
        typeof t.basePrice === "number" &&
        typeof t.estimatedFlightFromJFK_USD === "number"
      ) {
        const hotelBasePerPerson = Math.max(0, t.basePrice - Math.round(t.estimatedFlightFromJFK_USD / travelers));
        hotelTotalUSD = Math.round(hotelBasePerPerson * travelers);
        hotelSource = "fallback";
      }

      // Final per-person package price.
      let pricePerPersonUSD: number | null = null;
      if (flightTotalUSD != null && hotelTotalUSD != null && travelers > 0) {
        pricePerPersonUSD = Math.round((flightTotalUSD + hotelTotalUSD) / travelers);
      } else if (typeof t.basePrice === "number") {
        pricePerPersonUSD = t.basePrice;
      }

      const allLive = flightSource === "duffel" && hotelSource === "liteapi";
      const allFallback = flightSource === "fallback" && hotelSource === "fallback";
      const source: PriceRow["source"] = allLive ? "live" : allFallback ? (duffelOn ? "fallback" : "mock") : "fallback";

      const row: PriceRow = {
        tripId: t.tripId,
        flightTotalUSD,
        hotelTotalUSD,
        pricePerPersonUSD,
        source,
        flightSource,
        hotelSource,
        airline,
        hotelName,
        nights: hotelNights,
      };
      cache.set(cacheKey, { value: row, ts: Date.now() });
      return row;
    }),
  );

  const prices: Record<string, PriceRow> = {};
  for (const row of lookups) prices[row.tripId] = row;

  return NextResponse.json({ ok: true, originAirport, travelers, prices });
}
