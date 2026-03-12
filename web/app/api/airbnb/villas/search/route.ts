import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = "d419651e5cmsh76cbc669953ebcdp12735cjsn05db8e98a883";
const BOOKING_HOST = "booking-com15.p.rapidapi.com";

// Map destination → Booking.com dest_id + search_type
const DEST_MAP: Record<string, { dest_id: string; search_type: string }> = {
  miami: { dest_id: "20023181", search_type: "city" },
  "miami beach": { dest_id: "20023181", search_type: "city" },
  paris: { dest_id: "-1456928", search_type: "city" },
  london: { dest_id: "-2601889", search_type: "city" },
  barcelona: { dest_id: "-372490", search_type: "city" },
  rome: { dest_id: "-126693", search_type: "city" },
  amsterdam: { dest_id: "-2140479", search_type: "city" },
  lisbon: { dest_id: "-2167973", search_type: "city" },
  tokyo: { dest_id: "-246227", search_type: "city" },
  bali: { dest_id: "835", search_type: "region" },
  bangkok: { dest_id: "-3247115", search_type: "city" },
  singapore: { dest_id: "-73635", search_type: "city" },
  dubai: { dest_id: "-782831", search_type: "city" },
  "new york": { dest_id: "20088325", search_type: "city" },
  nyc: { dest_id: "20088325", search_type: "city" },
  cancun: { dest_id: "-996536", search_type: "city" },
  "punta cana": { dest_id: "-1217227", search_type: "city" },
  tulum: { dest_id: "893946", search_type: "city" },
  sydney: { dest_id: "-1603135", search_type: "city" },
  toronto: { dest_id: "-574890", search_type: "city" },
  montreal: { dest_id: "-574890", search_type: "city" },
  maldives: { dest_id: "156", search_type: "country" },
  "los angeles": { dest_id: "20026278", search_type: "city" },
  "san francisco": { dest_id: "20015732", search_type: "city" },
  chicago: { dest_id: "20033173", search_type: "city" },
  orlando: { dest_id: "20022809", search_type: "city" },
  "las vegas": { dest_id: "20079110", search_type: "city" },
  istanbul: { dest_id: "-755070", search_type: "city" },
  athens: { dest_id: "-815744", search_type: "city" },
  prague: { dest_id: "-553173", search_type: "city" },
  vienna: { dest_id: "-1995499", search_type: "city" },
  budapest: { dest_id: "-996264", search_type: "city" },
  "cape town": { dest_id: "-1217214", search_type: "city" },
  "mexico city": { dest_id: "-1658079", search_type: "city" },
};

async function resolveDestId(destination: string): Promise<{ dest_id: string; search_type: string } | null> {
  const lower = destination.toLowerCase().trim();

  // Direct lookup
  if (DEST_MAP[lower]) return DEST_MAP[lower];

  // Partial match
  for (const [key, val] of Object.entries(DEST_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }

  // Dynamic lookup via searchDestination
  try {
    const res = await fetch(
      `https://${BOOKING_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(destination)}`,
      {
        headers: {
          "x-rapidapi-host": BOOKING_HOST,
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      }
    );
    const data = await res.json();
    const first = data?.data?.[0];
    if (first?.dest_id) {
      return { dest_id: first.dest_id, search_type: first.search_type || first.type || "city" };
    }
  } catch {}

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination") || "Miami";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = parseInt(searchParams.get("guests") || "2");

  // Default dates if not provided
  const today = new Date();
  const arrivalDate = checkIn || new Date(today.getTime() + 30 * 86400000).toISOString().split("T")[0];
  const departureDate = checkOut || new Date(today.getTime() + 37 * 86400000).toISOString().split("T")[0];
  const nights = Math.max(1, Math.round(
    (new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / 86400000
  ));

  try {
    // Resolve destination ID
    const destInfo = await resolveDestId(destination);
    if (!destInfo) {
      return NextResponse.json({ villas: [], error: "Destination not found" }, { status: 200 });
    }

    const { dest_id, search_type } = destInfo;

    // Search properties on Booking.com
    const url = new URL(`https://${BOOKING_HOST}/api/v1/hotels/searchHotels`);
    url.searchParams.set("dest_id", dest_id);
    url.searchParams.set("search_type", search_type);
    url.searchParams.set("arrival_date", arrivalDate);
    url.searchParams.set("departure_date", departureDate);
    url.searchParams.set("adults", String(guests));
    url.searchParams.set("room_qty", "1");
    url.searchParams.set("page_number", "1");
    url.searchParams.set("languagecode", "en-us");
    url.searchParams.set("currency_code", "USD");
    url.searchParams.set("units", "metric");
    url.searchParams.set("temperature_unit", "c");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-host": BOOKING_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();
    const rawHotels = data?.data?.hotels || [];

    if (rawHotels.length === 0) {
      return NextResponse.json({ villas: [], destination }, { status: 200 });
    }

    // Map and filter for villa-style properties (good rating, has photos)
    const villas = rawHotels
      .filter((h: any) => {
        const prop = h.property || {};
        return (
          prop.photoUrls?.length > 0 &&
          prop.priceBreakdown?.grossPrice?.value > 0
        );
      })
      .map((h: any, i: number) => {
        const prop = h.property || {};
        const priceVal = prop.priceBreakdown?.grossPrice?.value || 0;
        const perNight = Math.round(priceVal / nights);
        const rating = prop.reviewScore || 0;
        const stars = prop.propertyClass || 0;

        return {
          id: h.hotel_id || `hotel-${i}`,
          name: prop.name || "Property",
          city: destination,
          stars: stars > 0 ? stars : null,
          rating: rating > 0 ? rating.toFixed(1) : null,
          reviews: prop.reviewCount || 0,
          reviewLabel: prop.reviewScoreWord || null,
          photo: prop.photoUrls?.[0] || null,
          photos: prop.photoUrls?.slice(0, 3) || [],
          pricePerNight: `USD ${perNight.toLocaleString()}`,
          priceTotal: `USD ${Math.round(priceVal).toLocaleString()}`,
          nights,
          bookUrl: `https://www.booking.com/hotel/us/${h.hotel_id}.html?checkin=${arrivalDate}&checkout=${departureDate}&group_adults=${guests}&no_rooms=1&currency=USD`,
          latitude: prop.latitude,
          longitude: prop.longitude,
        };
      })
      .slice(0, 15);

    return NextResponse.json({ villas, destination, total: villas.length });
  } catch (err: any) {
    console.error("Villa search error:", err);
    return NextResponse.json({ villas: [], error: "Search failed" }, { status: 200 });
  }
}
