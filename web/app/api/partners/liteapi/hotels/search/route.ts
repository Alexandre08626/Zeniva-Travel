import { NextRequest, NextResponse } from "next/server";
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
  // Asia
  beijing: { city: "Beijing", country: "CN" },
  shanghai: { city: "Shanghai", country: "CN" },
  china: { city: "Beijing", country: "CN" },
  "hong kong": { city: "Hong Kong", country: "HK" },
  seoul: { city: "Seoul", country: "KR" },
  "south korea": { city: "Seoul", country: "KR" },
  osaka: { city: "Osaka", country: "JP" },
  kyoto: { city: "Kyoto", country: "JP" },
  "kuala lumpur": { city: "Kuala Lumpur", country: "MY" },
  malaysia: { city: "Kuala Lumpur", country: "MY" },
  vietnam: { city: "Ho Chi Minh City", country: "VN" },
  "ho chi minh": { city: "Ho Chi Minh City", country: "VN" },
  hanoi: { city: "Hanoi", country: "VN" },
  philippines: { city: "Manila", country: "PH" },
  manila: { city: "Manila", country: "PH" },
  taiwan: { city: "Taipei", country: "TW" },
  taipei: { city: "Taipei", country: "TW" },
  india: { city: "Mumbai", country: "IN" },
  mumbai: { city: "Mumbai", country: "IN" },
  delhi: { city: "Delhi", country: "IN" },
  "new delhi": { city: "New Delhi", country: "IN" },
  goa: { city: "Goa", country: "IN" },
  // Middle East & Africa
  riyadh: { city: "Riyadh", country: "SA" },
  doha: { city: "Doha", country: "QA" },
  "abu dhabi": { city: "Abu Dhabi", country: "AE" },
  cairo: { city: "Cairo", country: "EG" },
  egypt: { city: "Cairo", country: "EG" },
  morocco: { city: "Marrakech", country: "MA" },
  marrakech: { city: "Marrakech", country: "MA" },
  casablanca: { city: "Casablanca", country: "MA" },
  "cape town": { city: "Cape Town", country: "ZA" },
  nairobi: { city: "Nairobi", country: "KE" },
  kenya: { city: "Nairobi", country: "KE" },
  "south africa": { city: "Cape Town", country: "ZA" },
  // Europe
  prague: { city: "Prague", country: "CZ" },
  vienna: { city: "Vienna", country: "AT" },
  zurich: { city: "Zurich", country: "CH" },
  switzerland: { city: "Geneva", country: "CH" },
  geneva: { city: "Geneva", country: "CH" },
  milan: { city: "Milan", country: "IT" },
  venice: { city: "Venice", country: "IT" },
  florence: { city: "Florence", country: "IT" },
  madrid: { city: "Madrid", country: "ES" },
  seville: { city: "Seville", country: "ES" },
  berlin: { city: "Berlin", country: "DE" },
  munich: { city: "Munich", country: "DE" },
  germany: { city: "Berlin", country: "DE" },
  brussels: { city: "Brussels", country: "BE" },
  copenhagen: { city: "Copenhagen", country: "DK" },
  stockholm: { city: "Stockholm", country: "SE" },
  oslo: { city: "Oslo", country: "NO" },
  helsinki: { city: "Helsinki", country: "FI" },
  warsaw: { city: "Warsaw", country: "PL" },
  budapest: { city: "Budapest", country: "HU" },
  zagreb: { city: "Zagreb", country: "HR" },
  dubrovnik: { city: "Dubrovnik", country: "HR" },
  porto: { city: "Porto", country: "PT" },
  edinburgh: { city: "Edinburgh", country: "GB" },
  // Caribbean & Latin America
  jamaica: { city: "Montego Bay", country: "JM" },
  "montego bay": { city: "Montego Bay", country: "JM" },
  bahamas: { city: "Nassau", country: "BS" },
  nassau: { city: "Nassau", country: "BS" },
  barbados: { city: "Bridgetown", country: "BB" },
  "trinidad and tobago": { city: "Port of Spain", country: "TT" },
  "saint lucia": { city: "Castries", country: "LC" },
  argentina: { city: "Buenos Aires", country: "AR" },
  "buenos aires": { city: "Buenos Aires", country: "AR" },
  brazil: { city: "Rio de Janeiro", country: "BR" },
  "rio de janeiro": { city: "Rio de Janeiro", country: "BR" },
  "sao paulo": { city: "Sao Paulo", country: "BR" },
  peru: { city: "Lima", country: "PE" },
  lima: { city: "Lima", country: "PE" },
  colombia: { city: "Bogota", country: "CO" },
  bogota: { city: "Bogota", country: "CO" },
  cartagena: { city: "Cartagena", country: "CO" },
  cuba: { city: "Havana", country: "CU" },
  havana: { city: "Havana", country: "CU" },
  chile: { city: "Santiago", country: "CL" },
  santiago: { city: "Santiago", country: "CL" },
  // Oceania
  "new zealand": { city: "Auckland", country: "NZ" },
  auckland: { city: "Auckland", country: "NZ" },
  fiji: { city: "Nadi", country: "FJ" },
  // US (additional — miami already defined above)
  "san francisco": { city: "San Francisco", country: "US" },
  chicago: { city: "Chicago", country: "US" },
  boston: { city: "Boston", country: "US" },
  seattle: { city: "Seattle", country: "US" },
  denver: { city: "Denver", country: "US" },
  nashville: { city: "Nashville", country: "US" },
  "new orleans": { city: "New Orleans", country: "US" },
  "miami beach": { city: "Miami Beach", country: "US" },
  "fort lauderdale": { city: "Fort Lauderdale", country: "US" },
  "palm beach": { city: "Palm Beach", country: "US" },
  "key west": { city: "Key West", country: "US" },
  tampa: { city: "Tampa", country: "US" },
  phoenix: { city: "Phoenix", country: "US" },
  "san diego": { city: "San Diego", country: "US" },
  atlanta: { city: "Atlanta", country: "US" },
  dallas: { city: "Dallas", country: "US" },
  houston: { city: "Houston", country: "US" },
};

function resolveCityAndCountry(destination: string): { city: string; country: string } {
  const key = destination.toLowerCase().replace(/-/g, " ").trim();
  if (CITY_MAP[key]) return CITY_MAP[key];
  // Try partial match — exact word boundary
  for (const [k, v] of Object.entries(CITY_MAP)) {
    if (key === k || key.startsWith(k + " ") || key.endsWith(" " + k) || key.includes(" " + k + " ")) return v;
  }
  // Try looser partial match
  for (const [k, v] of Object.entries(CITY_MAP)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Default: use destination as city name WITHOUT defaulting to US — let LiteAPI figure out country
  return { city: destination, country: "" };
}

function formatPrice(amount: number, nights: number): string {
  const total = Math.round(amount);
  return `USD ${total}`;
}

export async function GET(req: NextRequest) {
  const skipMarkup = req.cookies.get("zeniva_zero_margin")?.value === "1";
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
      query: country ? { cityName: city, countryCode: country, limit: 20 } : { cityName: city, limit: 20 },
      timeoutMs: 15000,
    });

    let hotelIds: string[] = [];
    const starsByHotelId = new Map<string, number>();
    if (hotelListRes.ok) {
      const items: any[] = Array.isArray(hotelListRes.data?.data)
        ? hotelListRes.data.data
        : Array.isArray(hotelListRes.data) ? hotelListRes.data : [];
      hotelIds = items.map((h: any) => getStr(h?.id, h?.hotelId)).filter(Boolean).slice(0, 15);
      // Capture stars from /data/hotels (this endpoint has proper stars field)
      for (const item of items) {
        const id = getStr(item?.id, item?.hotelId);
        if (id) starsByHotelId.set(id, getNum(item?.stars) || 0);
      }
    }

    if (hotelIds.length === 0) {
      return NextResponse.json({ ok: true, offers: [], source: "no-hotels" });
    }

    // ── Step 2: Get rates for those hotels ────────────────────────────────
    // Cap adults per room at 2 (most hotels can't put 6 adults in 1 room)
    // For group bookings, split across multiple rooms automatically
    const adultsPerRoom = Math.min(guests, 2);
    const numRooms = Math.max(rooms, Math.ceil(guests / adultsPerRoom));
    const occupancies = Array.from({ length: numRooms }, (_, i) => {
      const remaining = guests - i * adultsPerRoom;
      return { adults: Math.min(adultsPerRoom, remaining), children: [] as number[] };
    });
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
        const allRoomTypes: any[] = Array.isArray(item?.roomTypes) ? item.roomTypes : [];
        if (allRoomTypes.length === 0) return null;

        // Build a normalized list of room options (one per LiteAPI roomType).
        // Each entry carries its own price, rate name, board, refundability —
        // so the UI can show real choices instead of just the cheapest.
        const rooms = allRoomTypes
          .map((rt: any, rIdx: number) => {
            const priceObj = rt?.suggestedSellingPrice || rt?.offerRetailRate || rt?.offerInitialPrice;
            const amount = getNum(priceObj?.amount);
            if (amount === null) return null;
            const rawRoomPrice = formatPrice(amount, nights);
            const roomPriceStr = skipMarkup ? rawRoomPrice : applyHotelMarkupLabel(rawRoomPrice);
            const roomTotal = (() => {
              const n = parseFloat(String(roomPriceStr).replace(/[^0-9.]/g, ""));
              return Number.isFinite(n) && n > 0 ? Math.round(n) : Math.round(amount);
            })();
            const roomPerNight = nights > 0 ? Math.round(roomTotal / nights) : roomTotal;
            const rate0 = Array.isArray(rt?.rates) ? rt.rates[0] : null;
            const roomName = getStr(rate0?.name, rt?.name, rt?.roomTypeName) || `Room ${rIdx + 1}`;
            const board = getStr(rate0?.boardName) || "";
            const refundable = rate0?.cancellationPolicies?.refundableTag === "RFN";
            const offerId = getStr(rt?.offerId, rate0?.rateId, rate0?.id) || `${hotelId}-rt-${rIdx}`;
            return {
              offerId,
              name: roomName.slice(0, 80),
              priceTotal: roomTotal,
              pricePerNight: roomPerNight,
              priceLabel: roomPriceStr,
              nights,
              currency: "USD",
              board,
              refundable,
            };
          })
          .filter(Boolean) as Array<{
            offerId: string;
            name: string;
            priceTotal: number;
            pricePerNight: number;
            priceLabel: string;
            nights: number;
            currency: string;
            board: string;
            refundable: boolean;
          }>;
        if (rooms.length === 0) return null;
        // Sort cheapest first so the headline price reflects the best rate.
        rooms.sort((a, b) => a.priceTotal - b.priceTotal);
        const cheapest = rooms[0];

        const price = cheapest.priceLabel;
        const displayedTotal = cheapest.priceTotal;

        const name = getStr(meta?.name) || `Hotel ${idx + 1}`;
        const cityStr = getStr(meta?.city);
        const countryStr = getStr(meta?.country);
        const location = [cityStr, countryStr].filter(Boolean).join(", ") || city;
        // Extract images from hotelImages array (LiteAPI v3 format)
        const hotelImagesArr: string[] = Array.isArray(meta?.hotelImages)
          ? meta.hotelImages.slice(0, 12).map((img: any) => img?.urlHd || img?.url || "").filter(Boolean)
          : [];

        // Per-hotel unique fallback images — use hotel ID hash so each hotel gets a different photo
        const HOTEL_FALLBACKS = [
          "photo-1566073771259-6a8506099945", // hotel pool
          "photo-1582719478250-c89cae4dc85b", // hotel room
          "photo-1520250497591-112f2f40a3f4", // luxury resort
          "photo-1571003123894-1f0594d2b5d9", // hotel lobby
          "photo-1445019980597-93fa8acb246c", // hotel exterior
          "photo-1455587734955-081b22074882", // hotel room 2
          "photo-1551882547-ff40c4fe1fa7", // hotel pool 2
          "photo-1578683010236-d716f9a3f461", // luxury room
          "photo-1564501049412-61c2a3083791", // hotel bar
          "photo-1542314831-068cd1dbfeeb", // hotel facade
        ];
        const fallbackIdx = Math.abs(hotelId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % HOTEL_FALLBACKS.length;
        const fallbackPhoto = `https://images.unsplash.com/${HOTEL_FALLBACKS[fallbackIdx]}?auto=format&fit=crop&w=900&q=80`;

        const image = hotelImagesArr[0]
          || getStr(meta?.main_photo, meta?.mainPhoto, meta?.thumbnail)
          || fallbackPhoto;
        const rating = starsByHotelId.get(hotelId) || getNum(meta?.stars) || 0; // stars from /data/hotels
        const room = cheapest.name;
        const perNight = cheapest.pricePerNight;

        const perks: string[] = [
          `$${perNight}/night`,
          `${nights} night${nights > 1 ? "s" : ""}`,
          cheapest.board,
          cheapest.refundable ? "Free cancellation" : "",
          rooms.length > 1 ? `${rooms.length} room types available` : "",
        ].filter(Boolean).slice(0, 5);

        return {
          id: hotelId,
          name,
          location,
          price,
          // Structured numeric fields — always trustworthy and aligned with
          // the displayed `price` string (markup included). Downstream code
          // (agent select, preview, review, computePrice) should prefer
          // these over re-parsing `price`.
          priceTotal: displayedTotal,
          pricePerNight: perNight,
          nights,
          currency: "USD",
          room: room.slice(0, 60),
          // All available room options for this hotel (cheapest first). Each
          // carries its own offerId, name, priceTotal, pricePerNight, board
          // and refundable flag so the UI can render a list of real choices.
          rooms,
          selectedOfferId: cheapest.offerId,
          perks,
          rating,
          badge: rating >= 5 ? "5★" : rating >= 4 ? "4★ Premium" : undefined,
          image,
          images: hotelImagesArr.length > 0 ? hotelImagesArr : [image],
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

    console.log(`[hotel-search] dest=${destination} city=${city} country=${country} ci=${checkIn} co=${checkOut} hotelIds=${hotelIds.length} offers=${offers.length}`);
    return NextResponse.json({ ok: true, offers, rawCount: offers.length, source: "rates" });

  } catch (err: any) {
    console.error(`[hotel-search] ERROR dest=${destination}:`, err?.message || String(err));
    return NextResponse.json({ ok: false, error: err?.message || String(err), offers: [] }, { status: 502 });
  }
}
