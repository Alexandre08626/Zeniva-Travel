import { NextResponse } from "next/server";
import { z } from "zod";
import { liteApiFetchJson, liteApiIsConfigured } from "../../../../../../src/lib/liteapiClient";
import { applyHotelMarkupLabel } from "../../../../../../src/lib/partnerMarkup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  destination: z.string().trim().min(1),
  checkIn: z.string().trim().min(1),
  checkOut: z.string().trim().min(1),
  guests: z.coerce.number().int().min(1).default(2),
  rooms: z.coerce.number().int().min(1).default(1),
});

function getStr(...vals: any[]): string {
  for (const v of vals) if (typeof v === "string" && v.trim()) return v.trim();
  return "";
}
function getNum(...vals: any[]): number | null {
  for (const v of vals) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

// Map common city names to LiteAPI-compatible names + country codes
const CITY_MAP: Record<string, { city: string; country: string }> = {
  miami: { city: "Miami", country: "US" },
  paris: { city: "Paris", country: "FR" },
  london: { city: "London", country: "GB" },
  tokyo: { city: "Tokyo", country: "JP" },
  barcelona: { city: "Barcelona", country: "ES" },
  rome: { city: "Rome", country: "IT" },
  dubai: { city: "Dubai", country: "AE" },
  "new york": { city: "New York", country: "US" },
  cancun: { city: "Cancun", country: "MX" },
  tulum: { city: "Tulum", country: "MX" },
  phuket: { city: "Phuket", country: "TH" },
  bali: { city: "Bali", country: "ID" },
  maldives: { city: "Male", country: "MV" },
  punta_cana: { city: "Punta Cana", country: "DO" },
  "punta cana": { city: "Punta Cana", country: "DO" },
  "republique dominicaine": { city: "Punta Cana", country: "DO" },
  "republic dominicaine": { city: "Punta Cana", country: "DO" },
  "dominican republic": { city: "Punta Cana", country: "DO" },
  amsterdam: { city: "Amsterdam", country: "NL" },
  lisbon: { city: "Lisbon", country: "PT" },
  sydney: { city: "Sydney", country: "AU" },
  toronto: { city: "Toronto", country: "CA" },
  montreal: { city: "Montreal", country: "CA" },
  singapore: { city: "Singapore", country: "SG" },
  bangkok: { city: "Bangkok", country: "TH" },
  "los angeles": { city: "Los Angeles", country: "US" },
  "las vegas": { city: "Las Vegas", country: "US" },
  orlando: { city: "Orlando", country: "US" },
  hawaii: { city: "Honolulu", country: "US" },
  maui: { city: "Maui", country: "US" },
  athens: { city: "Athens", country: "GR" },
  mykonos: { city: "Mykonos", country: "GR" },
  santorini: { city: "Santorini", country: "GR" },
  istanbul: { city: "Istanbul", country: "TR" },
  mexico: { city: "Mexico City", country: "MX" },
  "mexico city": { city: "Mexico City", country: "MX" },
  "costa rica": { city: "San Jose", country: "CR" },
  "puerto rico": { city: "San Juan", country: "PR" },
};

function resolveCityAndCountry(destination: string): { city: string; country: string } {
  const key = destination.toLowerCase().replace(/-/g, " ").trim();
  if (CITY_MAP[key]) return CITY_MAP[key];
  // Try partial match
  for (const [k, v] of Object.entries(CITY_MAP)) {
    if (key.includes(k) || k.includes(key.split(" ")[0])) return v;
  }
  // Default: use destination as city name, US as country
  return { city: destination, country: "US" };
}

function formatPrice(amount: number, nights: number): string {
  const total = Math.round(amount);
  return `USD ${total}`;
}

export async function GET(req: Request) {
  if (!liteApiIsConfigured()) {
    return NextResponse.json({ ok: false, error: "LiteAPI not configured" }, { status: 500 });
  }

  const url = new URL(req.url);
  const parsed = schema.safeParse({
    destination: url.searchParams.get("destination") || "",
    checkIn: url.searchParams.get("checkIn") || "",
    checkOut: url.searchParams.get("checkOut") || "",
    guests: url.searchParams.get("guests") || "2",
    rooms: url.searchParams.get("rooms") || "1",
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid params" }, { status: 400 });
  }

  const { destination, checkIn, checkOut, guests, rooms } = parsed.data;
  const nights = Math.max(1, Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
  ));
  const { city, country } = resolveCityAndCountry(destination);

  try {
    // ── Step 1: Get hotel IDs for the city ────────────────────────────────
    const hotelListRes = await liteApiFetchJson<any>({
      path: "/data/hotels",
      method: "GET",
      query: { cityName: city, countryCode: country, limit: 30 },
      timeoutMs: 15000,
    });

    let hotelIds: string[] = [];
    if (hotelListRes.ok) {
      const items: any[] = Array.isArray(hotelListRes.data?.data)
        ? hotelListRes.data.data
        : Array.isArray(hotelListRes.data) ? hotelListRes.data : [];
      hotelIds = items.map((h: any) => getStr(h?.id, h?.hotelId)).filter(Boolean).slice(0, 25);
    }

    if (hotelIds.length === 0) {
      return NextResponse.json({ ok: true, offers: [], source: "no-hotels" });
    }

    // ── Step 2: Get rates for those hotels ────────────────────────────────
    const occupancies = Array.from({ length: rooms }, () => ({ adults: guests, children: [] }));
    const ratesRes = await liteApiFetchJson<any>({
      path: "/hotels/rates",
      method: "POST",
      body: {
        hotelIds,
        occupancies,
        guestNationality: "US",
        currency: "USD",
        checkin: checkIn,
        checkout: checkOut,
        maxRatesPerHotel: 1,
        includeHotelData: true,
      },
      timeoutMs: 30000,
    });

    if (!ratesRes.ok) {
      return NextResponse.json({ ok: false, error: `Rates failed: ${ratesRes.status}`, offers: [] });
    }

    const ratesData: any[] = Array.isArray(ratesRes.data?.data) ? ratesRes.data.data : [];
    const hotelsMeta: any[] = Array.isArray(ratesRes.data?.hotels) ? ratesRes.data.hotels : [];
    const metaById = new Map<string, any>();
    for (const h of hotelsMeta) {
      const id = getStr(h?.id, h?.hotelId);
      if (id) metaById.set(id, h);
    }

    const offers = ratesData
      .map((item: any, idx: number) => {
        const hotelId = getStr(item?.hotelId, item?.id);
        if (!hotelId) return null;
        const meta = metaById.get(hotelId);
        const rt = Array.isArray(item?.roomTypes) ? item.roomTypes[0] : null;
        if (!rt) return null;

        const priceObj = rt?.suggestedSellingPrice || rt?.offerRetailRate || rt?.offerInitialPrice;
        const priceAmount = getNum(priceObj?.amount);
        if (priceAmount === null) return null; // Skip hotels with no price

        const rawPrice = formatPrice(priceAmount, nights);
        const price = applyHotelMarkupLabel(rawPrice);

        const name = getStr(meta?.name) || `Hotel ${idx + 1}`;
        const cityStr = getStr(meta?.city);
        const countryStr = getStr(meta?.country);
        const location = [cityStr, countryStr].filter(Boolean).join(", ") || city;
        const image = getStr(meta?.main_photo, meta?.mainPhoto, meta?.thumbnail)
          || "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80";
        const rating = getNum(meta?.rating, meta?.stars) || 0;
        const room = getStr(rt?.rates?.[0]?.name, rt?.name, rt?.roomTypeName) || "Room";
        const perNight = Math.round(priceAmount / nights);

        const perks: string[] = [
          `$${perNight}/night`,
          `${nights} night${nights > 1 ? "s" : ""}`,
          rt?.rates?.[0]?.boardName || "",
          rt?.rates?.[0]?.cancellationPolicies?.refundableTag === "RFN" ? "Free cancellation" : "",
        ].filter(Boolean).slice(0, 4);

        return {
          id: hotelId,
          name,
          location,
          price,
          room: room.slice(0, 60),
          perks,
          rating,
          badge: rating >= 5 ? "5★" : rating >= 4 ? "4★ Premium" : undefined,
          image,
          provider: "liteapi",
        };
      })
      .filter(Boolean);

    // Sort by price ascending
    offers.sort((a: any, b: any) => {
      const pa = getNum(a?.price?.replace(/[^0-9.]/g, "")) || 0;
      const pb = getNum(b?.price?.replace(/[^0-9.]/g, "")) || 0;
      return pa - pb;
    });

    return NextResponse.json({ ok: true, offers, rawCount: offers.length, source: "rates" });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err), offers: [] }, { status: 502 });
  }
}
