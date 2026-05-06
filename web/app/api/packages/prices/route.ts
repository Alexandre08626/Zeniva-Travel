import { NextResponse } from "next/server";
import { searchDuffelOffers, duffelIsConfigured } from "../../../../src/lib/duffelClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TripQuery = {
  tripId: string;
  destinationAirport: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD (return)
  estimatedFlightFromJFK_USD?: number;
  basePrice?: number;        // JSON `price` (per-person USD baseline from NYC)
  travelers?: number;        // default 2
};

type PriceRow = {
  tripId: string;
  flightTotalUSD: number | null;     // round-trip × travelers from Duffel (or mock)
  pricePerPersonUSD: number | null;  // package per-person at the chosen origin
  source: "duffel" | "mock" | "fallback";
  airline?: string;
  error?: string;
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

  const lookups = await Promise.all(
    trips.map(async (t): Promise<PriceRow> => {
      const dest = String(t.destinationAirport || "").trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(dest)) {
        return {
          tripId: t.tripId,
          flightTotalUSD: null,
          pricePerPersonUSD: typeof t.basePrice === "number" ? t.basePrice : null,
          source: "fallback",
          error: "invalid_destination",
        };
      }
      const cacheKey = `${originAirport}-${dest}-${t.checkIn || ""}-${t.checkOut || ""}-${travelers}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        return { ...cached.value, tripId: t.tripId };
      }

      let flightTotalUSD: number | null = null;
      let source: PriceRow["source"] = "fallback";
      let airline: string | undefined;

      if (duffelOn && t.checkIn) {
        const { totalUSD, airline: a } = await fetchDuffelCheapest(
          originAirport,
          dest,
          t.checkIn,
          t.checkOut || null,
          travelers,
        );
        if (totalUSD != null) {
          flightTotalUSD = totalUSD;
          source = "duffel";
          airline = a;
        }
      }

      // If Duffel unavailable or no offer, fall back to a heuristic offset of
      // the JSON's NYC baseline so the UI still updates per-origin.
      if (flightTotalUSD == null && typeof t.estimatedFlightFromJFK_USD === "number") {
        flightTotalUSD = fallbackFlightFromOriginUSD(originAirport, dest, t.estimatedFlightFromJFK_USD);
        source = duffelOn ? "fallback" : "mock";
      }

      // Compute the package per-person price for the new origin:
      //   hotelBase per-person = trip.basePrice - estimatedFlightFromJFK_USD/travelers
      //   newPackagePerPerson  = hotelBase + flightTotalUSD/travelers
      let pricePerPersonUSD: number | null = null;
      if (
        typeof t.basePrice === "number" &&
        typeof t.estimatedFlightFromJFK_USD === "number" &&
        flightTotalUSD != null &&
        travelers > 0
      ) {
        const hotelBasePerPerson = Math.max(0, t.basePrice - Math.round(t.estimatedFlightFromJFK_USD / travelers));
        pricePerPersonUSD = Math.max(
          // Don't let it dip below an obviously-wrong floor
          Math.round(t.basePrice * 0.65),
          Math.round(hotelBasePerPerson + flightTotalUSD / travelers),
        );
      } else if (typeof t.basePrice === "number") {
        pricePerPersonUSD = t.basePrice;
      }

      const row: PriceRow = {
        tripId: t.tripId,
        flightTotalUSD,
        pricePerPersonUSD,
        source,
        airline,
      };
      cache.set(cacheKey, { value: row, ts: Date.now() });
      return row;
    }),
  );

  const prices: Record<string, PriceRow> = {};
  for (const row of lookups) prices[row.tripId] = row;

  return NextResponse.json({ ok: true, originAirport, travelers, prices });
}
