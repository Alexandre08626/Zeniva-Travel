// Server-side reader for the package_prices_cache Supabase table. Used by
// /packages and the homepage to prefetch the JFK rows during SSR so the
// FeaturedTripsByLina grid renders with real prices on first paint and the
// headline number doesn't jump after hydration.
import { getSupabaseAdminClient } from "../supabase/server";

export type CachedPriceRow = {
  tripId: string;
  flightTotalUSD: number | null;
  hotelTotalUSD: number | null;
  pricePerPersonUSD: number | null;
  source: "live" | "fallback" | "mock";
  flightSource: "duffel" | "fallback";
  hotelSource: "liteapi" | "fallback";
  airline?: string;
  hotelName?: string;
  nights?: number;
};

const FRESHNESS_MS = 24 * 60 * 60 * 1000;

export async function readPackagePriceCache(originAirport: string): Promise<Record<string, CachedPriceRow>> {
  try {
    const { client: supa } = getSupabaseAdminClient();
    const { data } = await supa
      .from("package_prices_cache")
      .select("*")
      .eq("origin_airport", originAirport.toUpperCase());
    if (!Array.isArray(data) || data.length === 0) return {};
    const out: Record<string, CachedPriceRow> = {};
    const now = Date.now();
    for (const row of data) {
      const age = row.updated_at ? now - new Date(row.updated_at).getTime() : Infinity;
      if (age > FRESHNESS_MS) continue; // stale rows skipped — heuristic on client
      out[row.trip_id] = {
        tripId: row.trip_id,
        flightTotalUSD: row.flight_total_usd != null ? Number(row.flight_total_usd) : null,
        hotelTotalUSD: row.hotel_total_usd != null ? Number(row.hotel_total_usd) : null,
        pricePerPersonUSD: row.price_per_person_usd != null ? Number(row.price_per_person_usd) : null,
        source: row.source || "fallback",
        flightSource: row.flight_source || "fallback",
        hotelSource: row.hotel_source || "fallback",
        airline: row.airline || undefined,
        hotelName: row.hotel_name || undefined,
        nights: row.nights ?? undefined,
      };
    }
    return out;
  } catch {
    return {};
  }
}
