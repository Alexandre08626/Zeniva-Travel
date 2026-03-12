import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RAPIDAPI_KEY = "d419651e5cmsh76cbc669953ebcdp12735cjsn05db8e98a883";
const BOOKING_HOST = "booking-com15.p.rapidapi.com";

async function resolveDestinationId(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://${BOOKING_HOST}/api/v1/attraction/searchLocation?query=${encodeURIComponent(query)}&languagecode=en-us`,
      { headers: { "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": BOOKING_HOST } }
    );
    const data = await res.json();
    const destinations: any[] = data?.data?.destinations || [];
    if (destinations.length > 0) return destinations[0].id;
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const destination = url.searchParams.get("destination") || "";
  const limit = parseInt(url.searchParams.get("limit") || "12", 10);

  if (!destination) {
    return NextResponse.json({ ok: false, error: "Missing destination" }, { status: 400 });
  }

  try {
    // Step 1: Resolve destination ID
    const destId = await resolveDestinationId(destination);
    if (!destId) {
      return NextResponse.json({ ok: true, activities: [], message: "Destination not found" });
    }

    // Step 2: Search attractions
    const res = await fetch(
      `https://${BOOKING_HOST}/api/v1/attraction/searchAttractions?id=${encodeURIComponent(destId)}&sortBy=trending&page=1&currency_code=USD&languagecode=en-us`,
      {
        headers: { "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": BOOKING_HOST },
        signal: AbortSignal.timeout(10000),
      }
    );

    const data = await res.json();
    const products: any[] = data?.data?.products || [];

    const activities = products.slice(0, limit).map((p: any, i: number) => {
      const photo = p?.primaryPhoto?.small || p?.primaryPhoto?.url || "";
      const price = p?.representativePrice;
      const amount = price?.chargeAmount || price?.publicAmount || 0;
      const currency = price?.currency || "USD";

      // Booking.com prices are sometimes EUR, convert
      const usdAmount = currency === "EUR" ? Math.round(amount * 1.08) :
                        currency === "GBP" ? Math.round(amount * 1.27) :
                        Math.round(amount);

      return {
        id: p.productId || p.id || `activity-${i}`,
        name: p.name || p.title || "Activity",
        description: p.shortDescription || p.description || "",
        price: usdAmount > 0 ? `USD ${usdAmount}` : "Price on request",
        priceNum: usdAmount,
        image: photo.startsWith("http") ? photo : `https://q-xx.bstatic.com${photo}`,
        images: [photo.startsWith("http") ? photo : `https://q-xx.bstatic.com${photo}`],
        rating: p.reviewsStats?.combinedNumericStats?.average || 4.5,
        reviewCount: p.reviewsStats?.allReviewsCount || 0,
        category: p.taxonomySlug || "activity",
        slug: p.productSlug || "",
        provider: "booking",
        supplier: "Booking.com",
      };
    });

    return NextResponse.json({ ok: true, activities, destId });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to load activities", activities: [] });
  }
}
