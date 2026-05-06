import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { computeLiveRow, PACKAGE_ORIGINS, type ComputeInput } from "../../../../src/lib/packages/livePricing";
import featuredTrips from "../../../../src/data/lina_featured_trips.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // up to 5 min — 6 origins × 22 trips × 2 APIs

function parseDates(datesStr: string): { checkIn: string; checkOut: string } {
  if (!datesStr) return { checkIn: "", checkOut: "" };
  const same = datesStr.match(/([A-Za-z]+)\s+(\d{1,2})-(\d{1,2}),\s*(\d{4})/);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (same) {
    const [, monthName, dayStartStr, dayEndStr, yearStr] = same;
    const month = new Date(`${monthName} 1, ${yearStr}`).getMonth() + 1;
    return {
      checkIn: `${yearStr}-${pad(month)}-${pad(parseInt(dayStartStr, 10))}`,
      checkOut: `${yearStr}-${pad(month)}-${pad(parseInt(dayEndStr, 10))}`,
    };
  }
  const cross = datesStr.match(/([A-Za-z]+)\s+(\d{1,2})-([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (cross) {
    const [, m1, d1, m2, d2, y] = cross;
    const month1 = new Date(`${m1} 1, ${y}`).getMonth() + 1;
    const month2 = new Date(`${m2} 1, ${y}`).getMonth() + 1;
    return {
      checkIn: `${y}-${pad(month1)}-${pad(parseInt(d1, 10))}`,
      checkOut: `${y}-${pad(month2)}-${pad(parseInt(d2, 10))}`,
    };
  }
  return { checkIn: "", checkOut: "" };
}

async function refreshAll(req: Request) {
  const url = new URL(req.url);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
  const travelers = 2;

  const tasks: ComputeInput[] = [];
  for (const origin of PACKAGE_ORIGINS) {
    for (const t of featuredTrips as any[]) {
      const { checkIn, checkOut } = parseDates(t.dates);
      if (!checkIn || !checkOut || !t.destinationAirport) continue;
      tasks.push({
        origin,
        tripId: t.id,
        destinationAirport: t.destinationAirport,
        destinationCity: String(t.destination || "").split(",")[0].trim(),
        checkIn,
        checkOut,
        travelers,
        basePrice: typeof t.price === "number" ? t.price : 0,
        estimatedFlightFromJFK_USD: typeof t.estimatedFlightFromJFK_USD === "number" ? t.estimatedFlightFromJFK_USD : 0,
      });
    }
  }

  // Concurrency cap so we don't blast Duffel and LiteAPI with 132 calls at
  // once; 8 in flight balances throughput against rate limits.
  const CONCURRENCY = 8;
  const rows: any[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const idx = cursor++;
      const t = tasks[idx];
      try {
        const row = await computeLiveRow(t, baseUrl);
        rows.push({ ...row, updated_at: new Date().toISOString() });
      } catch (err) {
        // Skip — heuristic row will be served by the public endpoint.
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  if (rows.length > 0) {
    const { client: supa } = getSupabaseAdminClient();
    const { error } = await supa
      .from("package_prices_cache")
      .upsert(rows, { onConflict: "cache_key" });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, computed: rows.length }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    origins: PACKAGE_ORIGINS.length,
    trips: featuredTrips.length,
    computed: rows.length,
    live: rows.filter((r) => r.source === "live").length,
    fallback: rows.filter((r) => r.source === "fallback").length,
  });
}

// Vercel cron hits with GET; allow POST for manual / Bearer-auth invocations.
export async function GET(req: Request) {
  return refreshAll(req);
}
export async function POST(req: Request) {
  return refreshAll(req);
}
