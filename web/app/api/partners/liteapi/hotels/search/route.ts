import { NextResponse } from "next/server";
import { z } from "zod";
import { liteApiFetchJson, liteApiIsConfigured } from "../../../../../../src/lib/liteapiClient";
import { applyHotelMarkupLabel } from "../../../../../../src/lib/partnerMarkup";

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
    if (c && typeof c === "object" && !Array.isArray(c)) return c;
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
  const rawPrice = priceAmount !== null ? `${priceCurrency || "USD"} ${priceAmount}` : "Price on request";
  const price = rawPrice === "Price on request" ? rawPrice : applyHotelMarkupLabel(rawPrice);

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

function pickRatesPayload(payload: any) {
  // LiteAPI v3 can return different shapes depending on query type.
  // - When searching by filters (aiSearch/city/etc), the payload may be: { data: [ { hotelId, roomTypes } ], ... }
  // - When searching by hotelIds (and/or includeHotelData=true), it may be: { data: { data: [...], hotels: [...] } }
  // We return the most useful object root while avoiding arrays.
  return pickFirstObject(payload);
}

function pickRatesList(ratesPayload: any): any[] {
  const candidates = [ratesPayload?.data?.data, ratesPayload?.data, ratesPayload?.results];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function pickHotelsMetaList(ratesPayload: any): any[] {
  const candidates = [ratesPayload?.data?.hotels, ratesPayload?.hotels];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function extractHotelIdsFromRatesPayload(ratesPayload: any): string[] {
  const ids = new Set<string>();
  for (const item of pickRatesList(ratesPayload)) {
    const hotelId = getFirstString(item?.hotelId, item?.id);
    if (hotelId) ids.add(hotelId);
  }
  return Array.from(ids);
}

function mapRatesPayloadToOffers(ratesPayload: any, input?: { fallbackMetaById?: Map<string, any> }) {
  const hotelMetaList = pickHotelsMetaList(ratesPayload);
  const hotelMetaById = new Map<string, any>();
  for (const h of hotelMetaList) {
    const id = getFirstString(h?.id, h?.hotelId, h?.hotel_id);
    if (id) hotelMetaById.set(id, h);
  }

  const ratesList = pickRatesList(ratesPayload);
  return ratesList
    .map((item: any, idx: number) => {
      const hotelId = getFirstString(item?.hotelId, item?.id);
      if (!hotelId) return null;
      return mapRatesToOffer({
        idx,
        hotelId,
        ratesItem: item,
        hotelMeta: hotelMetaById.get(hotelId),
        semanticMeta: input?.fallbackMetaById?.get(hotelId),
      });
    })
    .filter(Boolean);
}

async function getHotelsMetaByIds(hotelIds: string[]) {
  const ids = (hotelIds || []).filter((x) => typeof x === "string" && x.trim());
  if (ids.length === 0) return { ok: false as const, byId: new Map<string, any>() };

  const res = await liteApiFetchJson<any>({
    path: "/data/hotels",
    method: "GET",
    query: {
      hotelIds: ids.join(","),
      limit: Math.min(ids.length, 200),
    },
    timeoutMs: 20000,
  });

  const byId = new Map<string, any>();
  if (res.ok) {
    const items = pickArray(res.data);
    for (const item of items) {
      const id = getFirstString(item?.id, item?.hotelId, item?.hotel_id);
      if (id) byId.set(id, item);
    }
  }

  return { ok: res.ok as boolean, byId, res };
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
      query: { query: destination, limit: 100, min_rating: 0 },
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
    // Primary strategy: use LiteAPI v3 rates endpoint for listing pages (returns pricing + hotel data).
    const occupancies = Array.from({ length: roomsCount }, () => ({ adults, children: [] }));
    const baseRatesBody: Record<string, any> = {
      occupancies,
      guestNationality: "US",
      currency: "USD",
      checkin: checkIn,
      checkout: checkOut,
      maxRatesPerHotel: 1,
      includeHotelData: true,
      roomMapping: true,
      limit: 100,
    };

    const aiSearchCandidates = [
      `hotels in ${destination}`,
      destination,
    ];

    for (const aiSearch of aiSearchCandidates) {
      const rates = await liteApiFetchJson<any>({
        path: "/hotels/rates",
        method: "POST",
        query: { rm: true },
        body: { ...baseRatesBody, aiSearch },
        timeoutMs: 30000,
      });

      if (!rates.ok) continue;

      const ratesPayload = pickRatesPayload(rates.data);
      const hotelIdsFromRates = extractHotelIdsFromRatesPayload(ratesPayload);

      let fallbackMetaById: Map<string, any> | undefined = undefined;
      const hotelsMetaPresent = pickHotelsMetaList(ratesPayload).length > 0;
      if (!hotelsMetaPresent && hotelIdsFromRates.length > 0) {
        const meta = await getHotelsMetaByIds(hotelIdsFromRates);
        if (meta.byId.size > 0) fallbackMetaById = meta.byId;
      }

      const offers = mapRatesPayloadToOffers(ratesPayload, { fallbackMetaById });
      if (offers.length > 0) {
        return NextResponse.json({ ok: true, offers, rawCount: offers.length, source: "rates" });
      }
    }

    // Fallback: semantic-search (content-only) if rates returns no availability
    const { res: semantic, attempts } = await getSemanticHotels(destination);
    if (!semantic?.ok) {
      const status = semantic?.status || 502;
      const detail = semantic ? extractUpstreamError(semantic) : "";
      const msg = `LiteAPI semantic search failed (HTTP ${status})${detail}`;
      return NextResponse.json({ ok: false, error: msg, status, attempts }, { status });
    }

    const semanticResults = pickArray(semantic.data);
    const baseOffers = semanticResults.map((item: any, idx: number) => mapSemanticToBaseOffer(item, idx));
    return NextResponse.json({ ok: true, offers: baseOffers, rawCount: baseOffers.length, source: "semantic" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";
