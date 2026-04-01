import { NextResponse } from "next/server";
import { createFlightOrder } from "../../../../src/lib/duffelClient";

/**
 * POST /api/bookings/execute
 * Orchestrates booking with partners after payment succeeds.
 * - Duffel: create flight order
 * - LiteAPI: prebook → book hotel
 * Returns confirmation references.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { proposalId, selections, passengers, hotelGuests, tripDraft } = body;
    const confirmations: Record<string, any> = {};

    // 1. Book flights via Duffel (if selected)
    const outbound = selections?.flights?.outbound;
    const inbound = selections?.flights?.inbound;
    if ((outbound?.id || inbound?.id) && passengers?.length > 0) {
      try {
        const offerIds = [outbound?.id, inbound?.id].filter(Boolean);
        const totalAmount = (
          (parseFloat(outbound?.price || "0") + parseFloat(inbound?.price || "0")) *
          passengers.length
        ).toFixed(2);

        const duffelPassengers = passengers.map((p: any, i: number) => ({
          type: "adult",
          given_name: p.firstName || p.given_name || "Guest",
          family_name: p.lastName || p.family_name || "Traveler",
          born_on: p.dob || p.born_on || "1990-01-01",
          gender: (p.gender || "m").charAt(0).toLowerCase(),
          title: p.gender === "female" ? "ms" : "mr",
          email: p.email || `guest${i}@zeniva.ca`,
          phone_number: p.phone || "+15145550000",
        }));

        const order = await createFlightOrder({
          selected_offers: offerIds,
          passengers: duffelPassengers,
          payments: [{ type: "balance", amount: totalAmount, currency: "USD" }],
        });

        confirmations.flight = {
          orderId: order?.data?.id,
          bookingReference: order?.data?.booking_reference,
          status: "confirmed",
        };
      } catch (err: any) {
        confirmations.flight = { status: "failed", error: err?.message };
      }
    }

    // 2. Book hotel via LiteAPI (if selected)
    const hotel = selections?.hotels?.[0];
    if (hotel?.id) {
      try {
        // Step 1: Prebook
        const prebookRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.zenivatravel.com"}/api/partners/liteapi/rates/prebook`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ offerId: hotel.id }),
          }
        );
        const prebookData = await prebookRes.json();
        const prebookId = prebookData?.data?.prebookId || prebookData?.data?.id;

        if (prebookId) {
          // Step 2: Book
          const holder = hotelGuests?.[0] || passengers?.[0] || {};
          const bookRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.zenivatravel.com"}/api/partners/liteapi/rates/book`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prebookId,
                holder: {
                  firstName: holder.firstName || "Guest",
                  lastName: holder.lastName || "Traveler",
                  email: holder.email || "guest@zeniva.ca",
                },
                guests: (hotelGuests || passengers || []).map((g: any) => ({
                  firstName: g.firstName || "Guest",
                  lastName: g.lastName || "Traveler",
                  email: g.email || "",
                })),
                payment: {},
              }),
            }
          );
          const bookData = await bookRes.json();
          confirmations.hotel = {
            bookingId: bookData?.data?.id,
            confirmationNumber: bookData?.data?.confirmationNumber,
            status: "confirmed",
          };
        }
      } catch (err: any) {
        confirmations.hotel = { status: "failed", error: err?.message };
      }
    }

    return NextResponse.json({ ok: true, confirmations, proposalId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Booking execution failed" },
      { status: 500 }
    );
  }
}
