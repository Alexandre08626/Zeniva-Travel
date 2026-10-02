import { NextResponse } from "next/server";
import { createFlightOrder } from "../../../../src/lib/duffelClient";
import { isInternalOrStaff, forbidden, internalHeaders } from "@/lib/internal-auth";

/**
 * POST /api/bookings/execute
 * Books with partners after a payment is confirmed (ZeniPay webhook) or by HQ/agents.
 * - Duffel: one order per selected offer (outbound / inbound), paid from the Zeniva balance
 * - LiteAPI: prebook → book, only when the selection carries a LiteAPI offerId
 *
 * Nothing is invented: a segment missing traveler data (date of birth, gender, phone…) or a
 * bookable offer id comes back as "needs_info" / "needs_agent" for the team to finish.
 *
 * Body: { proposalId, selections: { flight, hotel }, passengers?, hotelGuests?, tripDraft? }
 * (selections is the store's selection object — singular `flight` / `hotel` keys.)
 */

type Passenger = {
  firstName?: string; given_name?: string;
  lastName?: string; family_name?: string;
  dob?: string; born_on?: string;
  gender?: string;
  email?: string;
  phone?: string; phone_number?: string;
};

const DUFFEL_BASE = () => process.env.DUFFEL_API_URL || "https://api.duffel.com";

async function getDuffelOffer(offerId: string) {
  const key = process.env.DUFFEL_API_KEY;
  if (!key) throw new Error("DUFFEL_API_KEY not configured");
  const res = await fetch(`${DUFFEL_BASE()}/air/offers/${encodeURIComponent(offerId)}`, {
    headers: { Authorization: `Bearer ${key}`, "Duffel-Version": process.env.DUFFEL_VERSION || "v2", Accept: "application/json" },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data) throw new Error(json?.errors?.[0]?.message || `offer ${offerId} unavailable (HTTP ${res.status})`);
  return json.data as { id: string; total_amount: string; total_currency: string; passengers: { id: string; type?: string }[] };
}

function toDuffelPassenger(p: Passenger) {
  const given = String(p.firstName || p.given_name || "").trim();
  const family = String(p.lastName || p.family_name || "").trim();
  const born = String(p.dob || p.born_on || "").trim();
  const gender = String(p.gender || "").trim().toLowerCase();
  const email = String(p.email || "").trim();
  const phone = String(p.phone || p.phone_number || "").trim();
  const g = gender.startsWith("f") ? "f" : gender.startsWith("m") ? "m" : "";
  if (!given || !family || !/^\d{4}-\d{2}-\d{2}$/.test(born) || !g || !email.includes("@") || !/^\+\d{7,15}$/.test(phone)) return null;
  return { given_name: given, family_name: family, born_on: born, gender: g, title: g === "f" ? "ms" : "mr", email, phone_number: phone };
}

export async function POST(request: Request) {
  if (!isInternalOrStaff(request)) return forbidden();
  try {
    const body = await request.json();
    const { proposalId, selections, passengers, hotelGuests, tripDraft } = body || {};
    const confirmations: Record<string, any> = {};
    const travelers: Passenger[] = Array.isArray(passengers) ? passengers : [];

    // 1. Flights via Duffel — one order per offer (round trips are two one-way offers).
    const fl = selections?.flight;
    if (fl) {
      const offerIds: string[] = (fl.outbound || fl.inbound
        ? [fl.outbound?.id, fl.inbound?.id]
        : [fl.id]
      ).filter((id: unknown): id is string => typeof id === "string" && id.startsWith("off_"));

      if (offerIds.length === 0) {
        confirmations.flight = { status: "needs_agent", reason: "no bookable Duffel offer id in the selection" };
      } else {
        const people = travelers.map(toDuffelPassenger);
        if (people.length === 0 || people.some((p) => !p)) {
          confirmations.flight = { status: "needs_info", reason: "traveler name, date of birth, gender, email and phone (+E.164) required for every passenger" };
        } else {
          const orders: any[] = [];
          for (const offerId of offerIds) {
            try {
              // Price and passenger ids come from Duffel itself, never from the client-side selection
              // (the displayed price includes Zeniva's markup and already covers all passengers).
              const offer = await getDuffelOffer(offerId);
              if (offer.passengers.length !== people.length) {
                orders.push({ offerId, status: "needs_info", reason: `offer is for ${offer.passengers.length} passenger(s), ${people.length} provided` });
                continue;
              }
              const order = await createFlightOrder({
                selected_offers: [offer.id],
                passengers: offer.passengers.map((op, i) => ({ id: op.id, type: op.type || "adult", ...people[i]! })) as any,
                payments: [{ type: "balance", amount: offer.total_amount, currency: offer.total_currency }],
              });
              orders.push({ offerId, orderId: order?.data?.id, bookingReference: order?.data?.booking_reference, status: "confirmed" });
            } catch (err: any) {
              orders.push({ offerId, status: "failed", error: err?.message || String(err) });
            }
          }
          const allOk = orders.every((o) => o.status === "confirmed");
          confirmations.flight = {
            status: allOk ? "confirmed" : orders.some((o) => o.status === "confirmed") ? "partial" : orders[0]?.status || "failed",
            bookingReference: orders.map((o) => o.bookingReference).filter(Boolean).join(" / ") || undefined,
            orders,
          };
        }
      }
    }

    // 2. Hotel via LiteAPI — only with a real offerId (search results carry a hotelId, not an offer).
    const hotel = selections?.hotel;
    if (hotel) {
      const offerId = hotel.offerId || hotel.rateOfferId;
      const guests = (Array.isArray(hotelGuests) && hotelGuests.length ? hotelGuests : travelers)
        .map((g: Passenger) => ({ firstName: String(g.firstName || g.given_name || "").trim(), lastName: String(g.lastName || g.family_name || "").trim(), email: String(g.email || "").trim() }))
        .filter((g: { firstName: string; lastName: string; email: string }) => g.firstName && g.lastName && g.email.includes("@"));

      if (hotel.provider !== "liteapi" || !offerId) {
        confirmations.hotel = {
          status: "needs_agent",
          reason: "no LiteAPI offer id — book with the supplier for the selected dates",
          hotelId: hotel.id || null,
          name: hotel.name || null,
          checkIn: tripDraft?.checkIn || null,
          checkOut: tripDraft?.checkOut || null,
        };
      } else if (guests.length === 0) {
        confirmations.hotel = { status: "needs_info", reason: "guest first name, last name and email required" };
      } else {
        try {
          const base = process.env.NEXT_PUBLIC_BASE_URL || "https://www.zenivatravel.com";
          const prebookRes = await fetch(`${base}/api/partners/liteapi/rates/prebook`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...internalHeaders() },
            body: JSON.stringify({ offerId }),
          });
          const prebookData = await prebookRes.json().catch(() => null);
          const prebookId = prebookData?.data?.prebookId || prebookData?.data?.id;
          if (!prebookId) {
            confirmations.hotel = { status: "failed", error: prebookData?.error || `prebook HTTP ${prebookRes.status}` };
          } else {
            const bookRes = await fetch(`${base}/api/partners/liteapi/rates/book`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...internalHeaders() },
              body: JSON.stringify({
                prebookId,
                clientReference: proposalId ? String(proposalId).slice(0, 60) : undefined,
                holder: guests[0],
                guests,
                payment: { method: "ACC_CREDIT_CARD" },
              }),
            });
            const bookData = await bookRes.json().catch(() => null);
            confirmations.hotel = bookRes.ok && bookData?.data?.id
              ? { bookingId: bookData.data.id, confirmationNumber: bookData.data.confirmationNumber || bookData.data.hotelConfirmationCode, status: "confirmed" }
              : { status: "failed", error: bookData?.error || `book HTTP ${bookRes.status}` };
          }
        } catch (err: any) {
          confirmations.hotel = { status: "failed", error: err?.message };
        }
      }
    }

    return NextResponse.json({ ok: true, confirmations, proposalId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Booking execution failed" },
      { status: 500 },
    );
  }
}
