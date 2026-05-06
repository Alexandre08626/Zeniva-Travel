// Shared helpers for the daily package-prices refresh job. The public
// /api/packages/prices endpoint reads pre-computed rows from Supabase; the
// cron job is the only thing that ever talks to Duffel + LiteAPI directly.
import { searchDuffelOffers } from "../duffelClient";

export type LivePriceRow = {
  cache_key: string;
  origin_airport: string;
  trip_id: string;
  destination_airport: string;
  destination_city: string | null;
  check_in: string | null;
  check_out: string | null;
  travelers: number;
  flight_total_usd: number | null;
  hotel_total_usd: number | null;
  price_per_person_usd: number | null;
  flight_source: "duffel" | "fallback";
  hotel_source: "liteapi" | "fallback";
  source: "live" | "fallback";
  airline: string | null;
  hotel_name: string | null;
  nights: number | null;
};

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
  const rate = FX_TO_USD[currency.toUpperCase()];
  return rate ? amount * rate : null;
}

export function fallbackFlightFromOriginUSD(originIATA: string, baseFromJFK: number): number {
  const o = originIATA.toUpperCase();
  if (!baseFromJFK || baseFromJFK <= 0) return 0;
  const ratio: Record<string, number> = {
    JFK: 1.0,
    YUL: 1.08,
    YQB: 1.18,
    YYZ: 1.06,
    MIA: 0.92,
    LAX: 1.22,
    IAD: 1.04,
    DCA: 1.06,
    BOS: 1.02,
    ORD: 1.05,
    YVR: 1.30,
  };
  return Math.round(baseFromJFK * (ratio[o] ?? 1.1));
}

export async function fetchDuffelCheapest(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | null,
  travelers: number,
): Promise<{ totalUSD: number | null; airline?: string }> {
  const passengers = Array.from({ length: Math.max(1, Math.min(travelers, 9)) }, () => ({ type: "adult" }));
  const slices = [{ origin, destination, departure_date: departureDate }];
  if (returnDate) slices.push({ origin: destination, destination: origin, departure_date: returnDate });
  try {
    const result: any = await searchDuffelOffers({ passengers, slices, currency: "USD" });
    const offers: any[] = result?.data?.offers || result?.offers || [];
    if (offers.length === 0) return { totalUSD: null };
    let bestUSD: number | null = null;
    let bestAirline: string | undefined;
    for (const offer of offers) {
      const amount = parseFloat(offer?.total_amount || "0");
      const currency = String(offer?.total_currency || "USD").toUpperCase();
      if (!Number.isFinite(amount) || amount <= 0) continue;
      const usd = offerToUSD(amount, currency);
      if (usd == null) continue;
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

export async function fetchLiteApiCheapestHotel(
  baseUrl: string,
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
    const url = `${baseUrl}/api/partners/liteapi/hotels/search?${params}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(25_000) });
    if (!res.ok) return { totalUSD: null };
    const data = await res.json().catch(() => null);
    const offers: any[] = Array.isArray(data?.offers) ? data.offers : [];
    if (offers.length === 0) return { totalUSD: null };
    let cheapest: { total: number; name?: string; nights?: number } | null = null;
    for (const o of offers) {
      const t = typeof o?.priceTotal === "number" ? o.priceTotal : null;
      if (t == null || t <= 0) continue;
      if (cheapest == null || t < cheapest.total) {
        cheapest = {
          total: t,
          name: typeof o?.name === "string" ? o.name : undefined,
          nights: typeof o?.nights === "number" ? o.nights : undefined,
        };
      }
    }
    return cheapest ? { totalUSD: cheapest.total, name: cheapest.name, nights: cheapest.nights } : { totalUSD: null };
  } catch {
    return { totalUSD: null };
  }
}

export type ComputeInput = {
  origin: string;
  tripId: string;
  destinationAirport: string;
  destinationCity: string;
  checkIn: string;
  checkOut: string;
  travelers: number;
  basePrice: number;
  estimatedFlightFromJFK_USD: number;
};

export async function computeLiveRow(
  input: ComputeInput,
  baseUrl: string,
): Promise<LivePriceRow> {
  const [flightRes, hotelRes] = await Promise.all([
    fetchDuffelCheapest(input.origin, input.destinationAirport, input.checkIn, input.checkOut, input.travelers),
    fetchLiteApiCheapestHotel(baseUrl, input.destinationCity, input.checkIn, input.checkOut, input.travelers),
  ]);

  let flightTotalUSD: number | null = flightRes.totalUSD;
  let flightSource: LivePriceRow["flight_source"] = flightTotalUSD != null ? "duffel" : "fallback";
  if (flightTotalUSD == null) {
    flightTotalUSD = fallbackFlightFromOriginUSD(input.origin, input.estimatedFlightFromJFK_USD);
  }

  let hotelTotalUSD: number | null = hotelRes.totalUSD;
  let hotelSource: LivePriceRow["hotel_source"] = hotelTotalUSD != null ? "liteapi" : "fallback";
  if (hotelTotalUSD == null) {
    const hotelBasePerPerson = Math.max(0, input.basePrice - Math.round(input.estimatedFlightFromJFK_USD / input.travelers));
    hotelTotalUSD = Math.round(hotelBasePerPerson * input.travelers);
  }

  const pricePerPersonUSD =
    flightTotalUSD != null && hotelTotalUSD != null && input.travelers > 0
      ? Math.round((flightTotalUSD + hotelTotalUSD) / input.travelers)
      : input.basePrice;

  const allLive = flightSource === "duffel" && hotelSource === "liteapi";

  return {
    cache_key: `${input.origin}|${input.tripId}|${input.checkIn}|${input.checkOut}|${input.travelers}`,
    origin_airport: input.origin,
    trip_id: input.tripId,
    destination_airport: input.destinationAirport,
    destination_city: input.destinationCity || null,
    check_in: input.checkIn || null,
    check_out: input.checkOut || null,
    travelers: input.travelers,
    flight_total_usd: flightTotalUSD,
    hotel_total_usd: hotelTotalUSD,
    price_per_person_usd: pricePerPersonUSD,
    flight_source: flightSource,
    hotel_source: hotelSource,
    source: allLive ? "live" : "fallback",
    airline: flightRes.airline || null,
    hotel_name: hotelRes.name || null,
    nights: hotelRes.nights ?? null,
  };
}

export const PACKAGE_ORIGINS = ["JFK", "MIA", "LAX", "IAD", "YUL", "YQB"] as const;
