import { NextResponse } from "next/server";
import { z } from "zod";
import { searchStays } from "../../../../src/lib/duffelClient";

const schema = z.object({
  destination: z.string().trim().min(1, "destination required"),
  checkIn: z.string().trim().min(1, "checkIn required"),
  checkOut: z.string().trim().min(1, "checkOut required"),
  guests: z.string().trim().default("2"),
  rooms: z.string().trim().default("1"),
  budget: z.string().trim().optional(),
});

function normalizeSearchResults(result: any) {
  const results = result?.data?.results || result?.data || [];
  if (!Array.isArray(results)) {
    console.error('Unexpected result structure:', result);
    return [];
  }
  return results.map((r: any, idx: number) => {
    const accommodation = r?.accommodation || {};
    const cheapestRate = r?.cheapest_rate || {};
    const searchResultId = r?.search_result_id || r?.search_result?.id || r?.id;
    return {
      id: r?.id || `result-${idx}`,
      name: accommodation?.name || "Hotel",
      location: accommodation?.location?.city || accommodation?.address?.city || "",
      price: cheapestRate?.total_amount ? `${cheapestRate.total_currency} ${cheapestRate.total_amount}` : "Price on request",
      room: accommodation?.room_types?.[0]?.name || "Room available",
      perks: accommodation?.amenities?.slice(0, 5) || [],
      rating: accommodation?.rating || 0,
      badge: cheapestRate?.refundable ? "Free cancel" : undefined,
      image: accommodation?.images?.[0]?.url || "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80",
      searchResultId, // Keep the actual search result ID for next steps
    };
  });
}

export async function GET(req: Request) {
  console.log('🏨 Duffel Stays API called!');
  
  if (!process.env.DUFFEL_STAYS_API_KEY && !process.env.DUFFEL_API_KEY) {
    console.log('❌ Duffel stays key missing');
    return NextResponse.json({ ok: false, error: "Duffel stays key missing" }, { status: 500 });
  }

  const url = new URL(req.url);
  console.log('Duffel Stays API called with destination:', url.searchParams.get("destination") || "");

  const parsed = schema.safeParse({
    destination: url.searchParams.get("destination") || "",
    checkIn: url.searchParams.get("checkIn") || "",
    checkOut: url.searchParams.get("checkOut") || "",
    guests: url.searchParams.get("guests") || "2",
    rooms: url.searchParams.get("rooms") || "1",
    budget: url.searchParams.get("budget") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid params", issues: parsed.error.issues }, { status: 400 });
  }

  const { destination, checkIn, checkOut, guests, rooms } = parsed.data;

  // Parse destination to get coordinates
  let coordinates: { latitude: number; longitude: number } | null = null;
  
  // Check if destination is already coordinates (format: lat,lng)
  const coordMatch = destination.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
  if (coordMatch) {
    coordinates = {
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2])
    };
    console.log('Using direct coordinates:', coordinates);
  } else {
    // Try to geocode the destination name
    coordinates = await getCoordinatesFromDestination(destination);
    if (!coordinates) {
      return NextResponse.json({ ok: false, error: "Could not geocode destination" }, { status: 400 });
    }
  }

  const searchParams = {
    rooms: Number(rooms),
    location: {
      radius: 100, // 100km radius
      geographic_coordinates: coordinates,
    },
    check_out_date: checkOut,
    check_in_date: checkIn,
    guests: Array.from({ length: Number(guests) }, () => ({ type: "adult" })),
  };

  try {
    console.log('Calling searchStays with params:', searchParams);
    const result = await searchStays(searchParams);
    console.log('searchStays result:', result);
    const offers = normalizeSearchResults(result);
    console.log('Normalized offers:', offers.length);
    return NextResponse.json({ ok: true, offers, rawCount: offers.length });
  } catch (err: any) {
    console.error('Duffel Stays API error:', err?.message || String(err));

    // If Duffel denies access to Live mode (403), try Amadeus fallback first so the UI can show real hotels
    if (err?.message?.includes('403') && err?.message?.toLowerCase().includes('not approved')) {
      console.warn('Duffel Stays Live access denied — attempting Amadeus fallback');
      try {
        const cityCode = (destination || '').slice(0, 3).toUpperCase();
        const amadeusUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/partners/amadeus?cityCode=${encodeURIComponent(cityCode)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${encodeURIComponent(guests)}`;
        console.log('Calling Amadeus fallback URL:', amadeusUrl);
        const amRes = await fetch(amadeusUrl);
        const amJson = await amRes.json();
        if (amRes.ok && amJson?.ok && Array.isArray(amJson.offers) && amJson.offers.length > 0) {
          console.log('Amadeus fallback returned', amJson.offers.length, 'offers');
          return NextResponse.json({ ok: true, offers: amJson.offers, fallback: 'amadeus' }, { status: 200 });
        } else {
          console.warn('Amadeus fallback failed or returned no offers, returning mock offers');
        }
      } catch (fallbackErr) {
        console.error('Amadeus fallback error:', fallbackErr);
      }

      console.warn('Duffel Stays Live access denied — returning mock offers as fallback');
      const mockOffers = [
        {
          id: `mock-stay-1-${destination}`,
          name: `Sample Hotel near ${destination}`,
          location: destination,
          price: "USD 120/night",
          room: "Standard Room",
          perks: ["Free cancellation", "Breakfast included"],
          rating: 4,
          image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80",
          searchResultId: `mock-${Date.now()}`
        }
      ];

      return NextResponse.json({ ok: true, offers: mockOffers, fallback: true, error: err?.message || String(err) }, { status: 200 });
    }

    // Check if it's a 503 service unavailable error
    if (err?.message?.includes('503') || err?.message?.includes('service_unavailable')) {
      return NextResponse.json({ 
        ok: false, 
        error: "Hotel search temporarily unavailable. Please try again later.",
        temporary: true 
      }, { status: 503 });
    }

    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

// Simple geocoding function - in production, use a proper geocoding service
async function getCoordinatesFromDestination(destination: string): Promise<{ latitude: number; longitude: number } | null> {
  // Check if destination is already coordinates (format: lat,lng or lat, lng)
  const coordMatch = destination.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const latitude = parseFloat(coordMatch[1]);
    const longitude = parseFloat(coordMatch[2]);
    console.log('Using direct coordinates:', { latitude, longitude });
    return { latitude, longitude };
  }

  // For demo purposes, using hardcoded coordinates for common destinations
  const coordinates: Record<string, { latitude: number; longitude: number }> = {
    "London": { latitude: 51.5071, longitude: -0.1416 },
    "Paris": { latitude: 48.8566, longitude: 2.3522 },
    "New York": { latitude: 40.7128, longitude: -74.0060 },
    "Tokyo": { latitude: 35.6762, longitude: 139.6503 },
    "Dubai": { latitude: 25.2048, longitude: 55.2708 },
    "Barcelona": { latitude: 41.3851, longitude: 2.1734 },
    "Amsterdam": { latitude: 52.3676, longitude: 4.9041 },
    "Rome": { latitude: 41.9028, longitude: 12.4964 },
    "Berlin": { latitude: 52.5200, longitude: 13.4050 },
    "Sydney": { latitude: -33.8688, longitude: 151.2093 },
    "Miami": { latitude: 25.7617, longitude: -80.1918 },
    "Cancun": { latitude: 21.1619, longitude: -86.8515 },
    // IATA codes
    "LHR": { latitude: 51.5071, longitude: -0.1416 }, // London
    "CDG": { latitude: 48.8566, longitude: 2.3522 }, // Paris
    "JFK": { latitude: 40.7128, longitude: -74.0060 }, // New York
    "NRT": { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
    "DXB": { latitude: 25.2048, longitude: 55.2708 }, // Dubai
    "BCN": { latitude: 41.3851, longitude: 2.1734 }, // Barcelona
    "AMS": { latitude: 52.3676, longitude: 4.9041 }, // Amsterdam
    "FCO": { latitude: 41.9028, longitude: 12.4964 }, // Rome
    "BER": { latitude: 52.5200, longitude: 13.4050 }, // Berlin
    "SYD": { latitude: -33.8688, longitude: 151.2093 }, // Sydney
    "MIA": { latitude: 25.7617, longitude: -80.1918 }, // Miami
    "CUN": { latitude: 21.1619, longitude: -86.8515 }, // Cancun
    // Additional destinations from packages
    "Bali": { latitude: -8.4095, longitude: 115.1889 }, // Denpasar
    "Santorini": { latitude: 36.3932, longitude: 25.4615 },
    "Maldives": { latitude: 3.2028, longitude: 73.2207 }, // Malé
    "Bora Bora": { latitude: -16.5004, longitude: -151.7415 },
    "Patagonia": { latitude: -50.0167, longitude: -73.0667 }, // El Calafate area
    "Kenya": { latitude: -1.2921, longitude: 36.8219 }, // Nairobi
    "Phuket": { latitude: 7.8804, longitude: 98.3923 },
    "Iceland": { latitude: 64.1466, longitude: -21.9426 }, // Reykjavik
    "Mauritius": { latitude: -20.3484, longitude: 57.5522 }, // Port Louis
    "Cape Town": { latitude: -33.9249, longitude: 18.4241 },
    "Vancouver": { latitude: 49.2827, longitude: -123.1207 },
    "Tuscany": { latitude: 43.7696, longitude: 11.2558 }, // Florence
    "Hawaii": { latitude: 21.3069, longitude: -157.8583 }, // Honolulu
    "Greece": { latitude: 37.9838, longitude: 23.7275 }, // Athens
    "Amazon": { latitude: -3.1190, longitude: -60.0217 }, // Manaus
    "Lisbon": { latitude: 38.7223, longitude: -9.1393 },
    "Prague": { latitude: 50.0755, longitude: 14.4378 },
    "Swiss Alps": { latitude: 45.9763, longitude: 7.6586 }, // Zermatt
    "Galapagos": { latitude: -0.9538, longitude: -90.9656 }, // Puerto Ayora
    "Buenos Aires": { latitude: -34.6118, longitude: -58.3966 },
    "Egypt": { latitude: 30.0444, longitude: 31.2357 }, // Cairo
    "Moscow": { latitude: 55.7558, longitude: 37.6173 },
    "Zanzibar": { latitude: -6.1659, longitude: 39.2026 }, // Zanzibar City
    "Montreal": { latitude: 45.5017, longitude: -73.5673 },
    "Seoul": { latitude: 37.5665, longitude: 126.9780 },
    "Dubrovnik": { latitude: 42.6507, longitude: 18.0944 },
    "Zermatt": { latitude: 45.9763, longitude: 7.6586 },
    "Seville": { latitude: 37.3891, longitude: -5.9845 },
    "Philippines": { latitude: 14.5995, longitude: 120.9842 }, // Manila
    "Sri Lanka": { latitude: 6.9271, longitude: 79.8612 }, // Colombo
    "Okinawa": { latitude: 26.2124, longitude: 127.6809 }, // Naha
    "Norway": { latitude: 59.9139, longitude: 10.7522 }, // Oslo
    "Mediterranean": { latitude: 41.3851, longitude: 2.1734 }, // Barcelona as central
    "Costa Rica": { latitude: 9.9281, longitude: -84.0907 }, // San Jose
    "Antarctica": { latitude: -77.8463, longitude: 166.6682 }, // McMurdo Station (not practical but for demo)
    "Suborbital": { latitude: 28.5721, longitude: -80.6490 }, // Cape Canaveral
    "Cartagena": { latitude: 10.3910, longitude: -75.4794 },
    "Budapest": { latitude: 47.4979, longitude: 19.0402 },
    "Las Vegas": { latitude: 36.1699, longitude: -115.1398 },
    "Baltic": { latitude: 59.3293, longitude: 18.0686 }, // Stockholm
    "Tanzania": { latitude: -6.7924, longitude: 39.2083 }, // Dar es Salaam
    "Douro": { latitude: 41.1496, longitude: -8.6109 }, // Porto
    "Rio de Janeiro": { latitude: -22.9068, longitude: -43.1729 },
  };

  const normalizedDestination = destination.toLowerCase();
  for (const [city, coords] of Object.entries(coordinates)) {
    if (city.toLowerCase().includes(normalizedDestination) || normalizedDestination.includes(city.toLowerCase())) {
      return coords;
    }
  }

  // If no match found, try to use a geocoding API
  try {
    const geocodingKey = process.env.GEOCODING_API_KEY; // Add this to your env
    if (geocodingKey) {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destination)}&key=${geocodingKey}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { latitude: lat, longitude: lng };
      }
    }
  } catch (error) {
    console.error('Geocoding failed:', error);
  }

  return null;
}

export const runtime = "nodejs";
