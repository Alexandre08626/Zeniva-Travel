import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = "d419651e5cmsh76cbc669953ebcdp12735cjsn05db8e98a883";
const AIRBNB_HOST = "airbnb13.p.rapidapi.com";

// Property type filters
const TYPE_FILTERS: Record<string, string[]> = {
  villa: ["entire villa", "entire home", "entire house", "entire chalet", "entire cabin", "entire bungalow", "entire cottage", "entire guest suite"],
  condo: ["entire condo", "entire serviced apartment", "entire apartment", "entire loft", "entire rental unit"],
  shortterm: ["entire rental unit", "entire condo", "entire home", "entire villa", "entire apartment", "entire loft", "entire guesthouse", "entire guest suite"],
  all: [], // no filter
};

function matchesType(propertyType: string, requestedType: string): boolean {
  const pt = propertyType.toLowerCase();
  const filters = TYPE_FILTERS[requestedType] || TYPE_FILTERS["shortterm"];
  if (filters.length === 0) return true; // "all" = no filter
  return filters.some((f) => pt.includes(f.replace("entire ", "")) || pt === f);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination") || "Miami";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = parseInt(searchParams.get("guests") || "2");
  const propertyType = (searchParams.get("type") || "shortterm").toLowerCase(); // villa | condo | shortterm | all
  const keyword = (searchParams.get("keyword") || "").trim().toLowerCase(); // strict noun filter (e.g. "chalet")

  // Default dates — if dates are in the past, shift to 30 days from now
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  let arrivalDate = checkIn || new Date(today.getTime() + 30 * 86400000).toISOString().split("T")[0];
  let departureDate = checkOut || new Date(today.getTime() + 37 * 86400000).toISOString().split("T")[0];
  // If dates are in the past, use future dates
  if (arrivalDate < todayStr) {
    const nights = Math.max(1, Math.round((new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / 86400000));
    arrivalDate = new Date(today.getTime() + 30 * 86400000).toISOString().split("T")[0];
    departureDate = new Date(today.getTime() + (30 + nights) * 86400000).toISOString().split("T")[0];
  }
  const nights = Math.max(1, Math.round(
    (new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / 86400000
  ));

  try {
    const params = new URLSearchParams({
      location: `${destination}, `,
      checkin: arrivalDate,
      checkout: departureDate,
      adults: String(guests),
      currency: "USD",
      page: "1",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `https://${AIRBNB_HOST}/search-location?${params}`,
      {
        headers: {
          "x-rapidapi-host": AIRBNB_HOST,
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ villas: [], error: "API error" }, { status: 200 });
    }

    const data = await res.json();
    const raw: any[] = data?.results || [];

    if (raw.length === 0) {
      return NextResponse.json({ villas: [], destination }, { status: 200 });
    }

    // Filter by property type
    const filtered = raw.filter((r: any) => {
      const pt = String(r.type || "").toLowerCase();
      const name = String(r.name || "").toLowerCase();
      // Exclude hotel rooms and private rooms for short-term/villa/condo
      if (propertyType !== "all") {
        if (pt.includes("room in hotel") || pt.includes("private room")) return false;
      }
      if (!matchesType(pt, propertyType)) return false;
      // Strict keyword filter (e.g. "chalet" → only listings whose type or name mentions chalet)
      if (keyword && !pt.includes(keyword) && !name.includes(keyword)) return false;
      return true;
    });

    const villas = filtered.map((r: any) => {
      const images: string[] = r.images || [];
      const priceInfo = r.price || {};
      const priceTotal = priceInfo.total || priceInfo.rate || 0;
      const perNight = priceTotal ? Math.round(priceTotal / nights) : 0;

      // Apply 10% Zeniva markup on all Airbnb prices
      const markupFactor = 1.10;
      const markedUpTotal = priceTotal > 0 ? Math.round(priceTotal * markupFactor) : 0;
      const markedUpPerNight = perNight > 0 ? Math.round(perNight * markupFactor) : 0;

      return {
        id: String(r.id || ""),
        name: r.name || "Property",
        city: r.city || destination,
        propertyType: r.type || "Short-term rental",
        bedrooms: r.bedrooms || null,
        beds: r.beds || null,
        bathrooms: r.bathrooms || null,
        maxGuests: r.persons || guests,
        rating: r.rating ? Number(r.rating).toFixed(2) : null,
        reviews: r.reviewsCount || 0,
        photo: images[0] || null,
        photos: images.slice(0, 12), // Up to 12 photos for gallery
        pricePerNight: markedUpPerNight > 0 ? `USD ${markedUpPerNight.toLocaleString()}` : "Price on request",
        priceTotal: markedUpTotal > 0 ? `USD ${markedUpTotal.toLocaleString()}` : "Price on request",
        nights,
        superhost: r.isSuperhost || false,
        instantBook: r.isInstantBook || false,
        bookUrl: null, // Keep clients on Zeniva — no external links
      };
    });

    // Sort by rating desc, then reviews
    villas.sort((a: any, b: any) => {
      const rDiff = (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      if (Math.abs(rDiff) > 0.1) return rDiff;
      return (b.reviews || 0) - (a.reviews || 0);
    });

    return NextResponse.json({
      villas: villas.slice(0, 15),
      destination,
      propertyType,
      keyword: keyword || null,
      total: villas.length,
    });
  } catch (err: any) {
    console.error("Villa/shortterm search error:", err.message);
    return NextResponse.json({ villas: [], error: "Search failed" }, { status: 200 });
  }
}
