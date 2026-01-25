import { NextResponse } from "next/server";
import crypto from "crypto";

// Amadeus test environment credentials
const AMADEUS_API_KEY = "REDACTED_AMADEUS_KEY";
const AMADEUS_API_SECRET = "REDACTED_AMADEUS_SECRET";
const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

export async function GET(req: Request) {
  console.log('🚀 Amadeus API endpoint called!');
  
  const url = new URL(req.url);

  const cityCode = url.searchParams.get("cityCode") || "";
  const checkIn = url.searchParams.get("checkIn") || "";
  const checkOut = url.searchParams.get("checkOut") || "";
  const adults = parseInt(url.searchParams.get("adults") || "2");
  const radius = parseInt(url.searchParams.get("radius") || "5");

  if (!cityCode) {
    return NextResponse.json({
      ok: false,
      error: "Missing required parameter: cityCode"
    }, { status: 400 });
  }

  try {
    console.log('Amadeus API called with cityCode:', cityCode);
    
    // First, get access token
    const tokenResponse = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      }),
    });

    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token error:', errorText);
      throw new Error('Failed to get Amadeus access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('Access token obtained successfully');

    // Search hotels by city first to get hotel IDs
    const hotelsUrl = `${AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=${radius}&hotelSource=ALL`;
    console.log('Hotels URL:', hotelsUrl);

    const hotelsResponse = await fetch(hotelsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('Hotels response status:', hotelsResponse.status);
    
    if (!hotelsResponse.ok) {
      const errorText = await hotelsResponse.text();
      console.error('Hotels API error:', errorText);
      throw new Error(`Amadeus API error: ${hotelsResponse.status} ${errorText}`);
    }

    const hotelsData = await hotelsResponse.json();
    console.log('Hotels data received:', hotelsData.data?.length || 0, 'hotels');

    // Get hotel IDs for detailed search
    const hotelIds = (hotelsData.data || []).slice(0, 10).map((hotel: any) => hotel.hotelId);
    
    if (hotelIds.length === 0) {
      throw new Error('No hotels found for this city');
    }

    // Get detailed hotel offers with photos
    const hotelIdsParam = hotelIds.join(',');
    const offersUrl = `${AMADEUS_BASE_URL}/v2/shopping/hotel-offers?hotelIds=${hotelIdsParam}&adults=${adults}&checkInDate=${checkIn}&checkOutDate=${checkOut}&roomQuantity=1&currencyCode=USD`;
    console.log('Hotel offers URL:', offersUrl);

    const offersResponse = await fetch(offersUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('Hotel offers response status:', offersResponse.status);
    
    let offersData = { data: [] };
    if (offersResponse.ok) {
      offersData = await offersResponse.json();
      console.log('Hotel offers data received:', offersData.data?.length || 0, 'offers');
    } else {
      console.log('Hotel offers API failed, using basic hotel data only');
    }

    // Transform Amadeus response to our format
    const hotels = (hotelsData.data || []).slice(0, 20).map((hotel: any) => {
      // Find corresponding offer data for this hotel
      const offerData = (offersData.data as any[])?.find((offer: any) => offer.hotel?.hotelId === hotel.hotelId);
      
      // Extract photos from offer data
      let image = `https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80`; // Default placeholder
      
      if (offerData?.hotel?.media) {
        const photos = offerData.hotel.media.filter((media: any) => media.type === 'PICTURE');
        if (photos.length > 0) {
          image = photos[0].uri;
        }
      }

      // Get price from offers
      let price = "Price on request";
      let room = "Standard Room";
      
      if (offerData?.offers && offerData.offers.length > 0) {
        const firstOffer = offerData.offers[0];
        if (firstOffer.price) {
          price = `USD ${firstOffer.price.total}`;
        }
        if (firstOffer.room) {
          room = firstOffer.room.typeEstimated?.category || firstOffer.room.description?.text || "Standard Room";
        }
      }

      return {
        id: hotel.hotelId,
        name: hotel.name,
        location: `${hotel.iataCode}, ${hotel.address?.countryCode || ''}`,
        price: price,
        room: room,
        rating: 4, // Default rating
        image: image,
        amenities: [],
        chainCode: hotel.chainCode,
        geoCode: hotel.geoCode,
        distance: hotel.distance,
        photos: offerData?.hotel?.media ? offerData.hotel.media.filter((media: any) => media.type === 'PICTURE').map((media: any) => media.uri) : []
      };
    });

    return NextResponse.json({
      ok: true,
      offers: hotels
    });

  } catch (error) {
    console.error('Amadeus API error:', error);

    // Fallback to mock data
    const mockHotels = [
      {
        id: "mock-amadeus-1",
        name: "Hotel " + cityCode,
        location: cityCode,
        price: "USD 150/night",
        room: "Standard Room",
        rating: 4,
        image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "mock-amadeus-2",
        name: "Hotel " + cityCode,
        location: cityCode,
        price: "USD 200/night",
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