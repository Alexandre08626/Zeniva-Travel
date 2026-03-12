import { getAmadeusAccessToken } from "./amadeusAuth";
import { getAmadeusConfig } from "./amadeusConfig";
import { searchLocations } from "./contentService";

interface HotelOffer {
  id: string;
  name: string;
  location: string;
  price: number;
  priceText: string;
  room: string;
  rating: number;
  image: string;
  images: string[];
  badge?: string;
  perks: string[];
  provider: "amadeus";
}

export async function searchAmadeusHotels(params: {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}, requestId?: string): Promise<{ hotels: HotelOffer[] }> {
  const { baseUrl } = getAmadeusConfig();
  const token = await getAmadeusAccessToken(requestId || "hotel-search");

  // Step 1: Resolve city code
  let cityCode = "";
  if (/^[A-Z]{3}$/i.test(params.destination.trim())) {
    cityCode = params.destination.trim().toUpperCase();
  } else {
    const locs = await searchLocations({ keyword: params.destination, subType: "CITY", pageLimit: 5 }, requestId || "hotel");
    cityCode = locs.locations?.[0]?.iataCode || locs.locations?.[0]?.cityCode || "";
  }
  if (!cityCode) return { hotels: [] };

  // Step 2: Get hotel IDs for city
  const listUrl = `${baseUrl}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=10&radiusUnit=KM&ratings=3,4,5&hotelSource=ALL`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!listRes.ok) return { hotels: [] };
  const listData = await listRes.json();
  const hotelIds: string[] = (listData.data || []).slice(0, 20).map((h: any) => h.hotelId).filter(Boolean);
  if (!hotelIds.length) return { hotels: [] };

  // Step 3: Get offers for those hotels
  const offersUrl = new URL(`${baseUrl}/v3/shopping/hotel-offers`);
  offersUrl.searchParams.set("hotelIds", hotelIds.join(","));
  offersUrl.searchParams.set("adults", String(params.guests || 2));
  offersUrl.searchParams.set("checkInDate", params.checkIn);
  offersUrl.searchParams.set("checkOutDate", params.checkOut);
  offersUrl.searchParams.set("roomQuantity", String(params.rooms || 1));
  offersUrl.searchParams.set("currency", "USD");
  offersUrl.searchParams.set("bestRateOnly", "true");

  const offersRes = await fetch(offersUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!offersRes.ok) return { hotels: [] };
  const offersData = await offersRes.json();

  const hotels: HotelOffer[] = (offersData.data || []).slice(0, 15).map((item: any) => {
    const hotel = item.hotel || {};
    const offer = item.offers?.[0] || {};
    const price = Number(offer.price?.total || offer.price?.base || 0);
    const name = hotel.name || "Hotel";
    const stars = hotel.rating ? Number(hotel.rating) : 0;
    const room = offer.room?.description?.text || offer.room?.type || "Standard Room";
    const nights = Math.max(1, Math.round((new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / 86400000));
    const perNight = nights > 0 ? price / nights : price;

    return {
      id: `amadeus-${hotel.hotelId || name.replace(/\s+/g, "-").toLowerCase()}`,
      name,
      location: `${hotel.cityCode || cityCode}, ${hotel.countryCode || ""}`.trim().replace(/,$/, ""),
      price: Math.round(price),
      priceText: `$${Math.round(price)}`,
      room: room.slice(0, 60),
      rating: stars,
      image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70`,
      images: [],
      badge: stars >= 5 ? "5★ Luxury" : stars >= 4 ? "4★ Premium" : undefined,
      perks: [
        offer.policies?.cancellation?.description?.text ? "Free cancellation" : "",
        offer.policies?.deposit?.acceptedPayments?.methods?.[0] ? "Pay at hotel" : "",
        `${nights} night${nights > 1 ? "s" : ""}`,
        `$${Math.round(perNight)}/night`,
      ].filter(Boolean),
      provider: "amadeus" as const,
    };
  });

  return { hotels };
}
