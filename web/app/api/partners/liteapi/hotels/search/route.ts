import { NextResponse } from "next/server";
import { z } from "zod";
import { liteApiFetchJson, liteApiIsConfigured } from "../../../../../../src/lib/liteapiClient";

const schema = z.object({
  destination: z.string().trim().min(1, "destination required"),
  checkIn: z.string().trim().min(1, "checkIn required"),
  checkOut: z.string().trim().min(1, "checkOut required"),
  guests: z.string().trim().default("2"),
  rooms: z.string().trim().default("1"),
});

function pickArray(payload: any): any[] {
  const candidates = [payload?.data?.results, payload?.data?.hotels, payload?.results, payload?.hotels, payload?.data, payload];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function pickFirstObject(payload: any): any {
  const candidates = [payload?.data, payload];
  for (const c of candidates) {
    if (c && typeof c === "object") return c;
  }
  return null;
}

function getFirstString(...values: any[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getFirstNumber(...values: any[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

function mapRatesToOffer(input: {
  idx: number;
  hotelId: string;
  ratesItem: any;
  hotelMeta?: any;
  semanticMeta?: any;
}) {
  const { idx, hotelId, ratesItem, hotelMeta, semanticMeta } = input;

  const hotelName = getFirstString(hotelMeta?.name, semanticMeta?.name) || `Hotel ${idx + 1}`;
  const city = getFirstString(hotelMeta?.city, semanticMeta?.city);
  const country = getFirstString(hotelMeta?.country, semanticMeta?.country);
  const address = getFirstString(hotelMeta?.address, semanticMeta?.address);
  const location = [city, country].filter(Boolean).join(", ") || address || "";

  const image =
    getFirstString(hotelMeta?.main_photo, hotelMeta?.mainPhoto, semanticMeta?.main_photo, semanticMeta?.mainPhoto) ||
    "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80";

  const rating = getFirstNumber(hotelMeta?.rating, semanticMeta?.rating) || 0;

  const firstRoomType = Array.isArray(ratesItem?.roomTypes) ? ratesItem.roomTypes[0] : null;
  const firstRate = firstRoomType?.rates?.[0] || null;

  const priceObj = firstRoomType?.suggestedSellingPrice || firstRoomType?.offerRetailRate || firstRoomType?.offerInitialPrice || null;
  const priceAmount = priceObj ? getFirstNumber(priceObj?.amount) : null;
  const priceCurrency = priceObj ? getFirstString(priceObj?.currency) : "";
  const price = priceAmount !== null ? `${priceCurrency || "USD"} ${priceAmount}` : "Price on request";

  const perksFromTags = Array.isArray(semanticMeta?.tags)
    ? semanticMeta.tags.filter((t: any) => typeof t === "string" && t.trim()).slice(0, 5)
    : [];

  const room = getFirstString(firstRate?.name, firstRoomType?.name, firstRoomType?.roomTypeName) || "Room";

  return {
    id: hotelId,
    name: hotelName,
    location,
    price,
    room,
    perks: perksFromTags,
    rating,
    badge: firstRate?.cancellationPolicies?.refundableTag === "RFN" ? "Free cancel" : undefined,
    image,
    provider: "liteapi",
  };
}

function mapSemanticToBaseOffer(semantic: any, idx: number) {
  const id = getFirstString(semantic?.id, semantic?.hotelId, semantic?.hotel_id, semantic?.code) || `liteapi-hotel-${idx}`;
  const name = getFirstString(semantic?.name) || `Hotel ${idx + 1}`;
  const image = getFirstString(semantic?.main_photo, semantic?.mainPhoto) || "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80";
  const location = [getFirstString(semantic?.city), getFirstString(semantic?.country)].filter(Boolean).join(", ") || getFirstString(semantic?.address) || "";
  const perks = Array.isArray(semantic?.tags)
    ? semantic.tags.filter((t: any) => typeof t === "string" && t.trim()).slice(0, 5)
    : [];
  return {
    id,
    name,
    location,
    price: "Price on request",
    room: "Room",
    perks,
    rating: getFirstNumber(semantic?.rating) || 0,
    badge: undefined,
    image,
    provider: "liteapi",
  };
}

function pickMostCommonCountryCode(items: any[]): string {
  const counts = new Map<string, number>();
  for (const item of items) {
    const raw = getFirstString(item?.country, item?.countryCode, item?.country_code);
    if (!raw) continue;
    const code = raw.trim().toUpperCase();
    if (!code) continue;
    counts.set(code, (counts.get(code) || 0) + 1);
  }

  let best = "";
  let bestCount = 0;
  for (const [code, count] of counts.entries()) {
    if (count > bestCount) {
      best = code;
      bestCount = count;
    }
  }
  return best;
}

function safeOneLine(input: string, maxLen = 240) {
  const s = String(input || "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";
  return s.length <= maxLen ? s : `${s.slice(0, maxLen - 1)}…`;
}

function extractUpstreamError(res: { status: number; data?: any; text?: string }) {
  const fromText = typeof res.text === "string" ? safeOneLine(res.text) : "";
  const fromData = safeOneLine(
    res.data?.error?.message ||
      res.data?.message ||
      res.data?.error ||
      (typeof res.data === "string" ? res.data : ""),
  );
  const detail = fromText || fromData;
  return detail ? ` (upstream: ${detail})` : "";
}

async function getSemanticHotels(destination: string) {
  // LiteAPI has had a few path variants across versions; try a short list.
  const paths = [
    "/data/hotels/semantic-search",
    "/data/hotels/semantic_search",
    "/hotels/semantic-search",
    "/hotels/semantic_search",
  ];

  const attempts: Array<{ path: string; status: number; ok: boolean }> = [];
  let last: any = null;
  for (const path of paths) {
    const res = await liteApiFetchJson<any>({
      path,
      method: "GET",
      query: { query: destination, limit: 40, min_rating: 0 },
      timeoutMs: 20000,
    });
    attempts.push({ path, status: res.status, ok: res.ok });
    last = res;
    if (res.ok) return { res, attempts };
  }

  return { res: last, attempts };
}

export async function GET(req: Request) {
  if (!liteApiIsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "LiteAPI env not configured",
        missing: {
          LITEAPI_API_BASE_URL: !process.env.LITEAPI_API_BASE_URL && !process.env.LITEAPI_BASE_URL,
          LITEAPI_API_KEY: !process.env.LITEAPI_API_KEY,
        },
      },
      { status: 500 },
    );
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
    return NextResponse.json({ ok: false, error: "invalid params", issues: parsed.error.issues }, { status: 400 });
  }

  const { destination, checkIn, checkOut, guests, rooms } = parsed.data;

  const adults = Math.max(1, Number(guests) || 1);
  const roomsCount = Math.max(1, Number(rooms) || 1);

  try {
    // v3 workflow: 1) semantic search to get hotel IDs
    const { res: semantic, attempts } = await getSemanticHotels(destination);

    if (!semantic?.ok) {
      const status = semantic?.status || 502;
      const detail = semantic ? extractUpstreamError(semantic) : "";
      const msg = `LiteAPI semantic search failed (HTTP ${status})${detail}`;
      return NextResponse.json(
        {
          ok: false,
          error: msg,
          status,
          attempts,
        },
        { status },
      );
    }

    const semanticResults = pickArray(semantic.data);
    const semanticById = new Map<string, any>();
    for (const item of semanticResults) {
      const id = getFirstString(item?.id, item?.hotelId, item?.hotel_id, item?.code);
      if (id) semanticById.set(id, item);
    }

    const baseOffers = semanticResults.map((item: any, idx: number) => mapSemanticToBaseOffer(item, idx));

    if (baseOffers.length === 0) {
      return NextResponse.json({ ok: true, offers: [], rawCount: 0, note: "No hotels from semantic-search" });
    }

    // 2) rates enrichment (cityName + countryCode tends to return bookable inventory)
    const occupancies = Array.from({ length: roomsCount }, () => ({ adults, children: [] }));
    const countryCode = pickMostCommonCountryCode(semanticResults);
    const ratesBody: Record<string, any> = {
      occupancies,
      guestNationality: "US",
      currency: "USD",
      checkin: checkIn,
      checkout: checkOut,
      maxRatesPerHotel: 1,
      roomMapping: true,
      limit: 40,
      ...(countryCode ? { countryCode } : {}),
      cityName: destination,
    };

    const enrichmentById = new Map<string, any>();
    try {
      const rates = await liteApiFetchJson<any>({ path: "/hotels/rates", method: "POST", query: { rm: true }, body: ratesBody });
      if (rates.ok) {
        const ratesPayload = pickFirstObject(rates.data);

        const hotelMetaList = pickArray(ratesPayload?.hotels);
        const hotelMetaById = new Map<string, any>();
        for (const h of hotelMetaList) {
          const id = getFirstString(h?.id, h?.hotelId, h?.hotel_id);
          if (id) hotelMetaById.set(id, h);
        }

        const ratesList = pickArray(ratesPayload?.data);
        for (let idx = 0; idx < ratesList.length; idx++) {
          const item = ratesList[idx];
          const hotelId = getFirstString(item?.hotelId, item?.id);
          if (!hotelId) continue;
          enrichmentById.set(
            hotelId,
            mapRatesToOffer({
              idx,
              hotelId,
              ratesItem: item,
              hotelMeta: hotelMetaById.get(hotelId),
              semanticMeta: semanticById.get(hotelId),
            }),
          );
        }
      }
    } catch {
      // Non-blocking: still return semantic results without pricing
    }

    const baseById = new Map<string, any>();
    for (const base of baseOffers) baseById.set(base.id, base);

    const mergedBase = baseOffers.map((base: any) => ({ ...base, ...(enrichmentById.get(base.id) || {}) }));
    const extras: any[] = [];
    for (const [id, enriched] of enrichmentById.entries()) {
      if (baseById.has(id)) continue;
      extras.push(enriched);
    }

    const offers = [...mergedBase, ...extras];
    return NextResponse.json({ ok: true, offers, rawCount: offers.length, extrasCount: extras.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";
