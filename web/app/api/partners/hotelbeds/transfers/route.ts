import { NextResponse } from "next/server";
import crypto from "crypto";

// Hotelbeds test environment credentials
const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || "REDACTED_HOTELBEDS_KEY";
const HOTELBEDS_API_SECRET = process.env.HOTELBEDS_API_SECRET || "REDACTED_HOTELBEDS_SECRET";
const HOTELBEDS_BASE_URL = process.env.HOTELBEDS_BASE_URL_TEST || "https://api.test.hotelbeds.com";
const HOTELBEDS_USE_MTLS = process.env.HOTELBEDS_USE_MTLS === "true";

// Generate X-Signature for Hotelbeds authentication
function generateXSignature(apiKey: string, secret: string): { signature: string, timestamp: number } {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
  return { signature, timestamp };
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID().substring(0, 8);
  const startTime = Date.now();

  console.log(`[${requestId}] 🚗 Transfers API called`);

  try {
    const body = await req.json();
    const {
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      adults = 2,
      children = 0,
      transferType = "PRIVATE", // PRIVATE or SHARED
      direction = "ONE_WAY" // ONE_WAY or ROUND_TRIP
    } = body;

    if (!pickupLocation || !dropoffLocation || !pickupDate || !pickupTime) {
      return NextResponse.json({
        ok: false,
        error: "Missing required parameters: pickupLocation, dropoffLocation, pickupDate, pickupTime"
      }, { status: 400 });
    }

    // Generate authentication headers
    const { signature: xSignature, timestamp: xTimestamp } = generateXSignature(HOTELBEDS_API_KEY, HOTELBEDS_API_SECRET);

    const headers = {
      'Api-key': HOTELBEDS_API_KEY,
      'X-Signature': xSignature,
      'X-Timestamp': xTimestamp.toString(),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Prepare availability request body
    const availabilityBody: any = {
      pickup: {
        date: pickupDate,
        time: pickupTime,
        location: {
          searchType: "ATLAS",
          name: pickupLocation
        }
      },
      dropoff: {
        location: {
          searchType: "ATLAS",
          name: dropoffLocation
        }
      },
      paxes: []
    };

    // Add adults
    for (let i = 0; i < adults; i++) {
      availabilityBody.paxes.push({
        type: "ADULT",
        age: 30
      });
    }

    // Add children
    for (let i = 0; i < children; i++) {
      availabilityBody.paxes.push({
        type: "CHILD",
        age: 10
      });
    }

    // Add return transfer if round trip
    if (direction === "ROUND_TRIP" && returnDate && returnTime) {
      availabilityBody.returnPickup = {
        date: returnDate,
        time: returnTime,
        location: {
          searchType: "ATLAS",
          name: dropoffLocation
        }
      };
      availabilityBody.returnDropoff = {
        location: {
          searchType: "ATLAS",
          name: pickupLocation
        }
      };
    }

    console.log(`[${requestId}] Searching transfers: ${pickupLocation} → ${dropoffLocation} on ${pickupDate} at ${pickupTime}`);

    const availabilityUrl = `${HOTELBEDS_BASE_URL}/transfer-api/1.0/availability`;

    const response = await fetch(availabilityUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(availabilityBody)
    });

    const responseTime = Date.now() - startTime;
    console.log(`[${requestId}] Transfers API response: ${response.status} (${responseTime}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] Transfers API error:`, errorText);

      // Return fallback data for testing
      return NextResponse.json({
        ok: true,
        transfers: getMockTransfers(pickupLocation, dropoffLocation),
        fallback: true,
        error: `API returned ${response.status}: ${errorText}`,
        requestId,
        responseTime
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const errorText = await response.text();
      console.error(`[${requestId}] JSON parse error:`, parseError, `Response text (first 200 chars):`, errorText.substring(0, 200));
      return NextResponse.json({
        ok: true,
        transfers: getMockTransfers(pickupLocation, dropoffLocation),
        fallback: true,
        error: `JSON parse error: ${String(parseError).substring(0, 200)}`,
        requestId,
        responseTime
      });
    }
    console.log(`[${requestId}] Found ${data.transfers?.length || 0} transfers`);

    // Transform Hotelbeds response to UnifiedItem format
    const transfers = (data.transfers || []).map((transfer: any) => ({
      type: 'transfer',
      id: transfer.id,
      title: `${transfer.vehicle?.name || 'Private Transfer'} - ${transferType}`,
      location: `${pickupLocation} → ${dropoffLocation}`,
      startDateTime: `${pickupDate}T${pickupTime}`,
      endDateTime: returnDate && returnTime ? `${returnDate}T${returnTime}` : null,
      price: transfer.price?.totalAmount ? `${transfer.price.totalAmount} ${transfer.price.currency}` : "Price on request",
      currency: transfer.price?.currency || 'EUR',
      cancellationPolicy: transfer.cancellationPolicies?.[0]?.description || "Free cancellation up to 24 hours before",
      importantNotes: transfer.importantNotes || ["Flight tracking included", "Meet & greet service"],
      images: transfer.images?.map((img: any) => img.url) || [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80"
      ],
      supplierRef: transfer.id,
      rateKey: transfer.rateKey,
      bookingToken: null,
      rawPayload: transfer,
      // Additional transfer-specific fields
      vehicle: transfer.vehicle,
      transferType: transferType,
      direction: direction,
      duration: transfer.duration,
      distance: transfer.distance
    }));

    return NextResponse.json({
      ok: true,
      transfers,
      requestId,
      responseTime,
      totalResults: data.total || transfers.length
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[${requestId}] Transfers API error:`, error);

    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      transfers: getMockTransfers("MIA Airport", "Miami Beach Hotel"),
      fallback: true,
      requestId,
      responseTime
    }, { status: 500 });
  }
}

// Mock data for testing when API fails
function getMockTransfers(pickup: string, dropoff: string) {
  return [
    {
      type: 'transfer',
      id: `mock-transfer-1-${Date.now()}`,
      title: "Private Luxury Sedan Transfer",
      location: `${pickup} → ${dropoff}`,
      startDateTime: "2026-03-12T10:00:00",
      endDateTime: null,
      price: "EUR 95",
      currency: "EUR",
      cancellationPolicy: "Free cancellation up to 24 hours before",
      importantNotes: ["Professional chauffeur", "Flight tracking", "Bottled water included"],
      images: [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80"
      ],
      supplierRef: "mock-1",
      rateKey: "mock-rate-1",
      bookingToken: null,
      vehicle: {
        name: "Mercedes-Benz E-Class",
        category: "LUXURY",
        seats: 3
      },
      transferType: "PRIVATE",
      direction: "ONE_WAY",
      duration: "45 minutes",
      distance: "25 km"
    },
    {
      type: 'transfer',
      id: `mock-transfer-2-${Date.now()}`,
      title: "Shared Airport Shuttle",
      location: `${pickup} → ${dropoff}`,
      startDateTime: "2026-03-12T14:30:00",
      endDateTime: null,
      price: "EUR 25",
      currency: "EUR",
      cancellationPolicy: "Free cancellation up to 12 hours before",
      importantNotes: ["Multiple stops", "Air-conditioned vehicle", "Luggage assistance"],
      images: [
        "https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=900&q=80"
      ],
      supplierRef: "mock-2",
      rateKey: "mock-rate-2",
      bookingToken: null,
      vehicle: {
        name: "Mercedes Sprinter Van",
        category: "SHUTTLE",
        seats: 12
      },
      transferType: "SHARED",
      direction: "ONE_WAY",
      duration: "50 minutes",
      distance: "28 km"
    }
  ];
}