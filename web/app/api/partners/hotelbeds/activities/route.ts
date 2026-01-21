import { NextResponse } from "next/server";
import crypto from "crypto";

// Hotelbeds test environment credentials
const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || "REDACTED_HOTELBEDS_KEY";
const HOTELBEDS_API_SECRET = process.env.HOTELBEDS_API_SECRET || "REDACTED_HOTELBEDS_SECRET";
const HOTELBEDS_BASE_URL = process.env.HOTELBEDS_BASE_URL_TEST || "https://api.test.hotelbeds.com";

// Generate X-Signature for Hotelbeds authentication
function generateXSignature(apiKey: string, secret: string): { signature: string, timestamp: number } {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
  return { signature, timestamp };
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID().substring(0, 8);
  const startTime = Date.now();

  console.log(`[${requestId}] 🏃 Activities API called`);

  try {
    const body = await req.json();
    const {
      destination,
      from,
      to,
      adults = 2,
      children = 0,
      language = "en"
    } = body;

    if (!destination) {
      return NextResponse.json({
        ok: false,
        error: "Missing required parameter: destination"
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
      language: language,
      pagination: {
        itemsPerPage: 20,
        page: 1
      },
      filters: [{
        searchFilterItems: [{
          type: "destination",
          value: destination
        }]
      }],
      from: from,
      to: to,
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

    console.log(`[${requestId}] Searching activities for destination: ${destination}, dates: ${from} to ${to}`);

    const availabilityUrl = `${HOTELBEDS_BASE_URL}/activity-api/3.0/activities`;

    const response = await fetch(availabilityUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(availabilityBody)
    });

    const responseTime = Date.now() - startTime;
    console.log(`[${requestId}] Activities API response: ${response.status} (${responseTime}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] Activities API error:`, errorText);

      // Return fallback data for testing
      return NextResponse.json({
        ok: true,
        activities: getMockActivities(destination),
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
        activities: getMockActivities(destination),
        fallback: true,
        error: `JSON parse error: ${String(parseError).substring(0, 200)}`,
        requestId,
        responseTime
      });
    }
    console.log(`[${requestId}] Found ${data.activities?.length || 0} activities`);

    // Transform Hotelbeds response to UnifiedItem format
    const activities = (data.activities || []).map((activity: any) => ({
      type: 'activity',
      id: activity.code,
      title: activity.name,
      location: `${activity.destination?.name || destination}, ${activity.country?.name || ''}`,
      startDateTime: from,
      endDateTime: to,
      price: activity.amountsFrom?.[0]?.amount ? `USD ${activity.amountsFrom[0].amount}` : "Price on request",
      currency: 'USD',
      cancellationPolicy: activity.cancellationPolicies?.[0]?.description || "Standard cancellation policy",
      importantNotes: activity.importantNotes || [],
      images: activity.images?.map((img: any) => img.url) || [],
      supplierRef: activity.code,
      rateKey: activity.rateKey,
      bookingToken: null,
      rawPayload: activity,
      // Additional activity-specific fields
      duration: activity.duration,
      modality: activity.modality,
      category: activity.category,
      description: activity.description
    }));

    return NextResponse.json({
      ok: true,
      activities,
      requestId,
      responseTime,
      totalResults: data.total || activities.length
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[${requestId}] Activities API error:`, error);

    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      activities: getMockActivities("MIA"),
      fallback: true,
      requestId,
      responseTime
    }, { status: 500 });
  }
}

// Mock data for testing when API fails
function getMockActivities(destination: string) {
  return [
    {
      type: 'activity',
      id: `mock-activity-1-${destination}`,
      title: `City Tour of ${destination}`,
      location: destination,
      startDateTime: "2026-03-15T09:00:00",
      endDateTime: "2026-03-15T17:00:00",
      price: "USD 85",
      currency: "USD",
      cancellationPolicy: "Free cancellation up to 24 hours before",
      importantNotes: ["Meeting point at central station", "Includes lunch"],
      images: [
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80"
      ],
      supplierRef: "mock-1",
      rateKey: "mock-rate-1",
      bookingToken: null,
      duration: "8 hours",
      modality: "GUIDED_TOUR",
      category: "TOUR",
      description: "Explore the highlights of the city with a professional guide"
    },
    {
      type: 'activity',
      id: `mock-activity-2-${destination}`,
      title: `Food Tour Experience in ${destination}`,
      location: destination,
      startDateTime: "2026-03-16T18:00:00",
      endDateTime: "2026-03-16T22:00:00",
      price: "USD 65",
      currency: "USD",
      cancellationPolicy: "Free cancellation up to 12 hours before",
      importantNotes: ["Tasting menu included", "Vegetarian options available"],
      images: [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80"
      ],
      supplierRef: "mock-2",
      rateKey: "mock-rate-2",
      bookingToken: null,
      duration: "4 hours",
      modality: "FOOD_TOUR",
      category: "GASTRONOMY",
      description: "Discover local cuisine with a food expert guide"
    }
  ];
}