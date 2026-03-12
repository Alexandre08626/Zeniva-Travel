import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RAPIDAPI_KEY = "d419651e5cmsh76cbc669953ebcdp12735cjsn05db8e98a883";
const BOOKING_HOST = "booking-com15.p.rapidapi.com";

// IATA → Google Place ID map for airports
const AIRPORT_PLACE_IDS: Record<string, string> = {
  MIA: "ChIJwUq5Tk232YgR4fiiy-Dan5g",
  JFK: "ChIJaZ6Hg3BRwokRsIGQXpCqR08",
  EWR: "ChIJzVSsJhpXwokRWBOgb1LeCRY",
  LAX: "ChIBxd20g6nTwoARF26M0g8BAAAA",
  ORD: "ChIJ3TFaLLnTD4gROPMNKqICpFE",
  LHR: "ChIJz4mewBhidkgRdPEOEQ4q80s",
  LGW: "ChIJx3QGAT4EdkgRMWFlqQ01-0o",
  CDG: "ChIJA1LOlOhv5kcRQKMiM7vHnKI",
  ORY: "ChIJCRGcFbZv5kcRsBjv8BoQFTQ",
  DXB: "ChIJrdifLD9t5kcRIkNDqnXnSu0",
  AUH: "ChIJE1sEKe9sXj4RUqNJnq0kEHA",
  NRT: "ChIJiUclnHiLGGARNTKoP-iVigU",
  HND: "ChIJO2ZCoElLGGARiEQvBOEpVlQ",
  SIN: "ChIJt0YaW3EZ2jER1WfZSc2Gdtk",
  BCN: "ChIJdZ1RJmjipBIR-0MUm0XQpW0",
  FCO: "ChIJi2Qua0b_fkcR0k8zBXIpEIo",
  MXP: "ChIJzaKgFpfIhkcRjKL_APVNHXA",
  AMS: "ChIJiUVzICHVxkcRPQT8g3sE1dU",
  YUL: "ChIJFTEE-UFGw0wRL1BimjJmSdI",
  YYZ: "ChIJTVuLTkM3K4gRSfaOBD_MQ1E",
  YVR: "ChIJ7dMXT6tYhlQRVdmzPkFEGkE",
  CUN: "ChIJiywYiKetTI8RqiSYE4bLMZQ",
  PUJ: "ChIJG6OQJM8UrI8R1qx2fA_RFNM",
  BKK: "ChIJO08Jg5yF4jAROHJFEHxsEps",
  HKG: "ChIJE__pDVgX4jER9qYp-x0uGbE",
  ICN: "ChIJ4RCnFm8vZTURgF9-S9zSVxc",
  SYD: "ChIJjcSjG3-UEmsRIDFEJaFNgCk",
  MEL: "ChIJSV2M92Zd1moRTPNGu8yBpEA",
  GRU: "ChIJAUVANv5XzpQRoKU3pU2MzJI",
  EZE: "ChIJXxbkHI1WtZURPFzO5C0ysFk",
  IST: "ChIJW3pFBzEX1EcRfFJdlAjB4EI",
  SAW: "ChIJVQ7SdkWxyhQRExrGSXA7O3o",
  MAD: "ChIJwW_OIu4oQQ0RD0i7z2fvIzU",
  ATH: "ChIJxYGJ5rR0SRUR0Bov52EEeS4",
  CPH: "ChIJr0oNvKFSUkYRs5CfPcmO_Xk",
  ARN: "ChIJofOsZbN3X0YR64KaJgG2KxQ",
  VIE: "ChIJ2S5tR6sHbUcRAQrUCzQJirU",
  ZRH: "ChIJBYOCCMZGkEcRJl0kcGXbJ0I",
  PRG: "ChIJbf5JRdCVC0cRLBnpOqOVtN0",
  MUC: "ChIJpTvG15DWnkcRBi5bQCVbGC8",
  FRA: "ChIJ-TFyQAGHvUcRODPH5CTQOEQ",
  LIS: "ChIJI6pj30A_GQ0RtAzFEFhkZ6M",
  OSL: "ChIJK_JWBVxRQUYRkv_CcWFtpE4",
  HEL: "ChIJCQxR0ZrWjUYRnNQ1w87XbUw",
  DUB: "ChIJnYY4Ar8OZ0gRfKcnEjWefpQ",
  PEK: "ChIJGyBw9t0F8TURVL4jTjr1fEk",
  PKX: "ChIJ1dTxBZaL8TURxKLUjAEIqIQ",
  PVG: "ChIJN2_2TbeIzzUR_D7P9yGsb-g",
  SHA: "ChIJxfnTe2CL8TURK-v4mDMl0HY",
  KUL: "ChIJ0-oS3YtIzTER2VDPkxZQyoU",
  MNL: "ChIJ_1xsD-0VqTMR0jaTakbg3wQ",
  CGK: "ChIJOVcSo4eCaS4RkdQs_jjJCVg",
  BOM: "ChIJ0czY2OFWxzsR4fFLOoNLsAA",
  DEL: "ChIJKQmFMjrjDDkRkJAIgO-UDsQ",
  DPS: "ChIJNxxRFcxH0i0R0sHiGUYYJCM",
  CMB: "ChIJ_9NqL0hS4ToRSqKnA1k73jI",
  JNB: "ChIJFfFy5eTI3RoR95PjRMhBiTE",
  CPT: "ChIJ5QRYo5-QzB0Rh0dBKFN2PtE",
  CAI: "ChIJk6cSJMSH_BQRpI5XDxhJkG4",
  CMN: "ChIJV0ZMvwfaGQ0R_WnuApCHrF8",
  RAK: "ChIJwX1mG5DvGQ0RZMF6c3-R08Y",
  NBO: "ChIJFEKLMFy6LxgRAnD2Ik0fPcw",
  BOG: "ChIJORhWiVcJRo4R1yNFoXqNBm8",
  LIM: "ChIJtXKcSScFCZIRQJ3a3U2r1iA",
  MEX: "ChIJEW_BXfP4D4gRVhMoU0I_0II",
  HAV: "ChIJ66mODifAbQwRiR-GHX_0M2Y",
  MBJ: "ChIJB4MtKqluAowRfNGEZdD-MNY",
};

async function searchLocation(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://${BOOKING_HOST}/api/v1/taxi/searchLocation?query=${encodeURIComponent(query)}&languagecode=en-us`,
      { headers: { "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": BOOKING_HOST } }
    );
    const data = await res.json();
    const results = data?.data || [];
    // Prefer airport type, then any
    const airport = results.find((r: any) => r.types === "airport");
    const first = airport || results[0];
    return first?.googlePlaceId || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.searchParams.get("origin") || ""; // IATA or city name
  const destination = url.searchParams.get("destination") || ""; // city name or hotel name
  const date = url.searchParams.get("date") || "";
  const time = url.searchParams.get("time") || "10:00";
  const passengers = url.searchParams.get("passengers") || "2";
  const hotelName = url.searchParams.get("hotelName") || "";

  if (!origin || !destination || !date) {
    return NextResponse.json({ ok: false, error: "Missing origin, destination, or date" }, { status: 400 });
  }

  try {
    // Step 1: Resolve pickup place ID (airport)
    const originUpper = origin.toUpperCase();
    let pickupId = AIRPORT_PLACE_IDS[originUpper] || null;
    if (!pickupId) {
      pickupId = await searchLocation(origin + " airport");
    }
    if (!pickupId) {
      return NextResponse.json({ ok: true, transfers: [], message: "Airport not found" });
    }

    // Step 2: Resolve dropoff place ID (hotel or city)
    const dropoffQuery = hotelName || destination;
    const dropoffId = await searchLocation(dropoffQuery);
    if (!dropoffId) {
      return NextResponse.json({ ok: true, transfers: [], message: "Destination not found" });
    }

    // Step 3: Ensure date is not in the past — shift to future if needed
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    let pickupDate = date;
    if (pickupDate < todayStr) {
      pickupDate = new Date(today.getTime() + 30 * 86400000).toISOString().split("T")[0];
    }

    // Step 4: Search taxis
    const searchRes = await fetch(
      `https://${BOOKING_HOST}/api/v1/taxi/searchTaxi?pick_up_place_id=${pickupId}&drop_off_place_id=${dropoffId}&pick_up_date=${pickupDate}&pick_up_time=${encodeURIComponent(time)}&currency_code=USD&passenger_count=${passengers}`,
      {
        headers: { "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": BOOKING_HOST },
        signal: AbortSignal.timeout(10000),
      }
    );

    const searchData = await searchRes.json();
    const results: any[] = searchData?.data?.results || [];

    const transfers = results.slice(0, 6).map((r: any, i: number) => ({
      id: r.resultId || `transfer-${i}`,
      category: r.categoryLocalised || r.category || "Transfer",
      description: r.descriptionLocalised || r.description || "",
      price: parseFloat(r.price?.amount || "0"),
      currency: r.price?.currencyCode || "USD",
      priceText: `USD ${parseFloat(r.price?.amount || "0").toFixed(2)}`,
      imageUrl: r.imageUrl || "https://cdn.rideways.com/images/cars/standard.jpg",
      seats: r.passengerCapacity || 3,
      bags: r.bags || 2,
      duration: r.duration || null,
      distance: r.drivingDistance || null,
      supplier: r.supplierName || "",
      cancellable: !r.nonRefundable,
      meetGreet: r.meetGreet || false,
      resultId: r.resultId,
      janusRef: r.janusResultReference,
    }));

    return NextResponse.json({ ok: true, transfers, pickupId, dropoffId });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Transfer search failed", transfers: [] });
  }
}
