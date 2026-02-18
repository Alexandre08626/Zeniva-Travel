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
  const candidates = [
    payload?.data?.hotels,
    payload?.data?.results,
    payload?.data,
    payload?.hotels,
    payload?.results,
    payload,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function getFirstString(...values: any[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function mapHotelToOffer(hotel: any, idx: number) {
  const name = getFirstString(hotel?.name, hotel?.hotel_name, hotel?.property_name) || `Hotel ${idx + 1}`;
  const city = getFirstString(hotel?.city, hotel?.location?.city, hotel?.address?.city);
  const country = getFirstString(hotel?.country, hotel?.address?.country, hotel?.location?.country);
  const location = [city, country].filter(Boolean).join(", ") || getFirstString(hotel?.location?.name, hotel?.address?.line1) || "";

  const currency = getFirstString(hotel?.currency, hotel?.price?.currency, hotel?.min_rate?.currency, hotel?.lowest_rate?.currency) || "USD";
  const amount =
    hotel?.price?.amount ??
    hotel?.min_rate?.amount ??
    hotel?.min_rate ??
    hotel?.lowest_rate?.amount ??
    hotel?.lowest_rate ??
    hotel?.rate?.amount ??
    hotel?.rate;

  const price = typeof amount === "number" || typeof amount === "string"
    ? `${currency} ${String(amount)}`
    : "Price on request";

  const image =
    getFirstString(hotel?.image, hotel?.hero_image, hotel?.images?.[0]?.url, hotel?.images?.[0], hotel?.photos?.[0]?.url, hotel?.photos?.[0]) ||
    "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80";

  const rawAmenities = hotel?.amenities || hotel?.facilities || hotel?.features || [];
  const perks = Array.isArray(rawAmenities)
    ? rawAmenities
        .map((a: any) => (typeof a === "string" ? a : a?.name || a?.label || ""))
        .filter((s: any) => typeof s === "string" && s.trim())
        .slice(0, 5)
    : [];

  const ratingRaw = hotel?.rating ?? hotel?.star_rating ?? hotel?.stars;
  const rating = typeof ratingRaw === "number" ? ratingRaw : Number(ratingRaw || 0) || 0;

  return {
    id: String(hotel?.id || hotel?.hotel_id || hotel?.property_id || `liteapi-hotel-${idx}`),
    name,
    location,
    price,
    room: getFirstString(hotel?.room_name, hotel?.room?.name, hotel?.room_type?.name) || "Room",
    perks,
    rating,
    badge: hotel?.refundable ? "Free cancel" : undefined,
    image,
    photos: Array.isArray(hotel?.images) ? hotel.images.map((p: any) => (typeof p === "string" ? p : p?.url)).filter(Boolean).slice(0, 8) : undefined,
    provider: "liteapi",
  };
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

  const body = {
    checkin: checkIn,
    checkout: checkOut,
    guests: [{ adults }],
    destination: { city: destination },
    rooms: roomsCount,
  };

  try {
    const upstream = await liteApiFetchJson<any>({ path: "/hotels/search", method: "POST", body });
    if (!upstream.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "LiteAPI request failed",
          status: upstream.status,
          data: upstream.data,
          text: upstream.text,
        },
        { status: upstream.status || 502 },
      );
    }

    const hotels = pickArray(upstream.data);
    const offers = hotels.map(mapHotelToOffer);

    return NextResponse.json({ ok: true, offers, rawCount: offers.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";
