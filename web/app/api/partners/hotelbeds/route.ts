import { NextResponse } from "next/server";
import crypto from "crypto";
import { applyHotelMarkupLabel } from "../../../../src/lib/partnerMarkup";

// Hotelbeds credentials from environment variables
const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || "REDACTED_HOTELBEDS_KEY";
const HOTELBEDS_API_SECRET = process.env.HOTELBEDS_API_SECRET || "REDACTED_HOTELBEDS_SECRET";
const HOTELBEDS_BASE_URL = process.env.HOTELBEDS_BASE_URL_TEST || "https://api.test.hotelbeds.com";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const destination = url.searchParams.get("destination") || "";
  const checkIn = url.searchParams.get("checkIn") || "";
  const checkOut = url.searchParams.get("checkOut") || "";
  const guests = parseInt(url.searchParams.get("guests") || "2");
  const rooms = parseInt(url.searchParams.get("rooms") || "1");

  if (!destination || !checkIn || !checkOut) {
    return NextResponse.json({
      ok: false,
      error: "Missing required parameters: destination, checkIn, checkOut"
    }, { status: 400 });
  }

  try {
    // First, get destination code from city name
    const destinationCode = await getDestinationCode(destination);
    if (!destinationCode) {
      throw new Error(`Could not find destination code for ${destination}`);
    }

    // Search hotel availability
    const availabilityUrl = `${HOTELBEDS_BASE_URL}/hotel-api/1.0/hotels`;

    const availabilityBody = {
      stay: {
        checkIn: checkIn,
        checkOut: checkOut
      },
      occupancies: [{
        rooms: rooms,
        adults: guests,
        children: 0
      }],
      destination: {
        code: destinationCode
      },
      filter: {
        maxRatesPerRoom: 1,
        maxResults: 20
      }
    };

    // Generate X-Signature for Hotelbeds authentication
    const signatureString = HOTELBEDS_API_KEY + HOTELBEDS_API_SECRET;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    const response = await fetch(availabilityUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': HOTELBEDS_API_KEY,
        'X-Signature': signature
      },
      body: JSON.stringify(availabilityBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hotelbeds API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Transform Hotelbeds response to our format
    const hotels = (data.hotels?.hotels || []).map((hotel: any) => ({
      id: hotel.code.toString(),
      name: hotel.name,
      location: hotel.destinationName || destination,
      price: hotel.minRate ? applyHotelMarkupLabel(`USD ${hotel.minRate}`) : "Price on request",
      room: hotel.rooms?.[0]?.name || "Standard Room",
      rating: hotel.categoryCode ? parseInt(hotel.categoryCode) : 0,
      image: hotel.images?.[0]?.url || "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80",
      amenities: hotel.facilities?.slice(0, 3).map((f: any) => f.description) || []
    }));

    return NextResponse.json({
      ok: true,
      offers: hotels
    });

  } catch (error) {
    console.error('Hotelbeds API error:', error);

    // Fallback to mock data
    const mockHotels = [
      {
        id: "mock-hotel-1",
        name: "Hotel " + destination,
        location: destination,
        price: applyHotelMarkupLabel("USD 150/night"),
        room: "Standard Room",
        rating: 4,
        image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "mock-hotel-2",
        name: "Hotel " + destination,
        location: destination,
        price: applyHotelMarkupLabel("USD 200/night"),
        room: "Deluxe Room",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80"
      }
    ];

    return NextResponse.json({
      ok: true,
      offers: mockHotels,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to get destination code from city name or airport code
async function getDestinationCode(input: string): Promise<string | null> {
  try {
    // First, try to map airport codes to city names
    const airportToCity: { [key: string]: string } = {
      'MIA': 'miami',
      'CUN': 'cancun',
      'CDG': 'paris',
      'LHR': 'london',
      'JFK': 'new york',
      'BCN': 'barcelona',
      'MAD': 'madrid',
      'FCO': 'rome',
      'AMS': 'amsterdam',
      'BER': 'berlin',
      'YQB': 'quebec',
      'YYZ': 'toronto',
      'LAX': 'los angeles',
      'SFO': 'san francisco'
    };

    // Common destination codes - in production you'd call Hotelbeds destinations API
    const destinationMap: { [key: string]: string } = {
      'miami': 'MIA',
      'cancun': 'CUN',
      'paris': 'PAR',
      'london': 'LON',
      'new york': 'NYC',
      'barcelona': 'BCN',
      'madrid': 'MAD',
      'rome': 'ROM',
      'amsterdam': 'AMS',
      'berlin': 'BER',
      'quebec': 'YQB',
      'toronto': 'YYZ',
      'los angeles': 'LAX',
      'san francisco': 'SFO'
    };

    const normalizedInput = input.toUpperCase().replace(/\s+/g, '');
    
    // If input is an airport code, convert to city name first
    const cityName = airportToCity[normalizedInput] || input.toLowerCase().replace(/\s+/g, '');
    
    return destinationMap[cityName] || null;
  } catch (error) {
    console.error('Error getting destination code:', error);
    return null;
  }
}