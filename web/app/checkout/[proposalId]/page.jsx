"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, TITLE_TEXT } from "../../../src/design/tokens";
import { useTripsStore, createTrip } from "../../../lib/store/tripsStore";
import { getImagesForDestination, getPartnerHotelImages } from "../../../src/lib/images";
import { computePrice, formatCurrency } from "../../../src/lib/pricing";
import { useAuthStore } from "../../../src/lib/authStore";
import { getDocumentsForUser, upsertDocuments } from "../../../src/lib/documentsStore";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = Array.isArray(params.proposalId) ? params.proposalId[0] : params.proposalId;
  const { selection, tripDraft, trips } = useTripsStore((s) => ({
    selection: s.selections[proposalId] || { flight: null, hotel: null, activity: null, transfer: null },
    tripDraft: s.tripDrafts[proposalId] || {},
    trips: s.trips || [],
  }));
  const user = useAuthStore((s) => s.user);
  const userId = user?.email || "";
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [confirmationId, setConfirmationId] = useState("");

  const hero = useMemo(() => {
    // Use selected accommodation image if available, otherwise fallback to destination images
    if (selection?.hotel?.image) {
      return selection.hotel.image;
    }
    const dest = tripDraft?.destination || "destination";
    return getImagesForDestination(dest)[0];
  }, [tripDraft, selection]);

  const extraHotels = tripDraft?.extraHotels || [];
  const extraActivities = tripDraft?.extraActivities || [];
  const extraTransfers = tripDraft?.extraTransfers || [];

  const flight = selection?.flight || { airline: "Airline", route: "YUL → CUN", times: "19:20 – 08:45", fare: "Business", bags: "2 checked" };
  const hotel = selection?.hotel || extraHotels[0] || { name: "Hotel Playa", room: "Junior Suite", location: "Beachfront", rating: 4.6 };
  const activity = selection?.activity || null;
  const transfer = selection?.transfer || null;

  const pricing = computePrice({ flight: selection?.flight, hotel: selection?.hotel, activity, transfer }, {
    ...tripDraft,
    extraHotels,
    extraActivities,
    extraTransfers,
  });

  if (!proposalId) return null;

  const handlePayNow = () => {
    if (paymentStatus === "confirmed") return;
    setPaymentStatus("processing");

    const now = new Date().toISOString();
    const bookingId = `checkout-${Date.now()}`;
    const confirmationNumber = `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const existingTrip = trips.find((t) => t.id === proposalId);
    const tripId = existingTrip
      ? proposalId
      : createTrip({
          title: tripDraft?.destination ? `${tripDraft.destination} Checkout` : "Hotel booking",
          destination: tripDraft?.destination || "",
          dates: tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} to ${tripDraft.checkOut}` : "",
          travelers: tripDraft?.adults ? String(tripDraft.adults) : "",
        });

    if (userId) {
      const existing = (getDocumentsForUser(userId) || {})[tripId] || [];
      const doc = {
        id: bookingId,
        tripId,
        userId,
        type: "confirmation",
        title: `Checkout confirmation (${tripDraft?.destination || "Trip"})`,
        provider: "Zeniva",
        confirmationNumber,
        url: `/test/duffel-stays/confirmation?docId=${encodeURIComponent(bookingId)}`,
        updatedAt: now,
        details: JSON.stringify({ booking_reference: confirmationNumber, status: "confirmed" }),
      };
      upsertDocuments(userId, tripId, [doc, ...existing]);
    }

    setConfirmationId(bookingId);
    setPaymentStatus("confirmed");
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: MUTED_TEXT }}>
              Secure checkout
            </div>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>
              Finalize your trip
            </h1>
            <p className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
              Traveler details, payment, and a clear summary before you confirm.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/proposals/${proposalId}/review`)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm"
              style={{ color: BRAND_BLUE }}
            >
              Back to review
            </button>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Step 2 of 2</span>
          </div>
        </header>

        <div className="relative h-48 w-full overflow-hidden rounded-2xl shadow-sm">
          <img src={hero} alt="Destination" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/38 to-black/5" />
          <div className="absolute left-6 bottom-6 text-white space-y-1">
            <div className="text-sm font-semibold">{tripDraft?.destination || "Your trip"}</div>
            <div className="text-2xl font-extrabold">Secure payment</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr,1fr] items-start">
          <div className="space-y-4">
            {paymentStatus === "confirmed" && (
              <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm">
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>Payment received</div>
                <div className="mt-1" style={{ color: MUTED_TEXT }}>
                  Your booking is confirmed. You can find the confirmation in My Travel Documents.
                </div>
                <div className="mt-3">
                  <Link
                    href="/documents"
                    className="inline-flex rounded-full px-4 py-2 text-xs font-bold text-white"
                    style={{ backgroundColor: BRAND_BLUE }}
                  >
                    Open My Travel Documents
                  </Link>
                </div>
              </section>
            )}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>Traveler details</div>
                <span className="text-[11px] font-bold text-slate-500">Primary contact</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["First name", "Last name", "Email", "Phone"].map((label) => (
                  <label key={label} className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                    {label}
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder={label}
                    />
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {["Country", "Loyalty number (optional)", "Special requests"].map((label) => (
                  <label key={label} className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                    {label}
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder={label}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>Payment</div>
                <span className="text-[11px] font-bold text-slate-500">Card secured via mock form</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                  Card number
                  <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="4242 4242 4242 4242" />
                </label>
                <label className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                  Name on card
                  <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Traveler Name" />
                </label>
                <label className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                  Expiry
                  <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="MM/YY" />
                </label>
                <label className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                  CVC
                  <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="123" />
                </label>
              </div>
              <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 px-4 py-3 text-xs" style={{ color: MUTED_TEXT }}>
                Payments are processed securely (demo). No real charges are made.
              </div>
            </section>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Summary</div>
                <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] font-bold" style={{ color: TITLE_TEXT }}>Review</span>
              </div>
              <div className="text-sm" style={{ color: TITLE_TEXT }}>
                {tripDraft?.departureCity || "Departure"} → {tripDraft?.destination || "Destination"}
              </div>
              <div className="text-sm" style={{ color: MUTED_TEXT }}>
                {tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} to ${tripDraft.checkOut}` : "Dates TBC"} • Travelers: {tripDraft?.adults || pricing.travelers}
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1 text-sm" style={{ color: TITLE_TEXT }}>
                <div className="flex items-center justify-between">
                  <span>Flights</span>
                  <span className="font-semibold">{pricing.hasFlightPrice ? formatCurrency(pricing.flightTotal) : "On request"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Accommodation</span>
                  <span className="font-semibold">{pricing.hasHotelPrice ? formatCurrency(pricing.hotelTotal) : "On request"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Activities</span>
                  <span className="font-semibold">{pricing.hasActivityPrice ? formatCurrency(pricing.activityTotal) : "Included"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Transfers</span>
                  <span className="font-semibold">{pricing.hasTransferPrice ? formatCurrency(pricing.transferTotal) : "Included"}</span>
                </div>
                <div className="flex items-center justify-between text-xs" style={{ color: MUTED_TEXT }}>
                  <span>Fees & services</span>
                  <span>{pricing.hasAnyPrice ? formatCurrency(pricing.fees) : "Included"}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                  <span className="font-bold">Total (est.)</span>
                  <span className="text-lg font-extrabold" style={{ color: BRAND_BLUE }}>
                    {pricing.hasAnyPrice ? formatCurrency(pricing.total) : "On request"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Flight</div>
              <div className="text-sm" style={{ color: TITLE_TEXT }}>{flight.airline} • {flight.route}</div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>{flight.times} • {flight.fare} • {flight.bags}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>{tripDraft?.accommodationType === 'Hotel' ? 'Hotel' : tripDraft?.accommodationType === 'Yacht' ? 'Yacht' : tripDraft?.accommodationType === 'Airbnb' ? 'Private residence' : 'Accommodation'}</div>
              <div className="text-sm" style={{ color: TITLE_TEXT }}>{hotel.name} • {hotel.location || "Central"}</div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>
                {tripDraft?.accommodationType === 'Yacht' ? `Specs: ${hotel.specs || "Yacht specs"}` : `Room: ${hotel.room || "Deluxe"} • Rating: ${hotel.rating || "4.5"}`}
              </div>
              <div className="flex gap-2 overflow-x-auto pt-2">
                {(hotel.image ? [hotel.image] : getPartnerHotelImages(tripDraft?.destination || hotel.location || hotel.name).slice(0,2)).map((src, i) => (
                  <div key={i} className="h-20 w-28 overflow-hidden rounded-lg">
                    <img src={src} alt="Hotel" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {(activity || extraActivities.length > 0) && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
                <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Activities</div>
                <div className="text-sm" style={{ color: TITLE_TEXT }}>{activity?.name || extraActivities[0]?.name || "Selected activities"}</div>
                <div className="text-xs" style={{ color: MUTED_TEXT }}>Total: {formatCurrency(pricing.activityTotal)}</div>
              </div>
            )}

            {(transfer || extraTransfers.length > 0) && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
                <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Transfers</div>
                <div className="text-sm" style={{ color: TITLE_TEXT }}>{transfer?.name || extraTransfers[0]?.name || "Selected transfers"}</div>
                <div className="text-xs" style={{ color: MUTED_TEXT }}>Total: {formatCurrency(pricing.transferTotal)}</div>
              </div>
            )}

            <button
              className="w-full rounded-full px-4 py-3 text-sm font-extrabold text-white shadow-sm"
              style={{ backgroundColor: BRAND_BLUE }}
              onClick={handlePayNow}
            >
              {paymentStatus === "confirmed" ? "Payment confirmed" : paymentStatus === "processing" ? "Processing…" : "Pay now (mock)"}
            </button>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs" style={{ color: MUTED_TEXT }}>
              After payment, your concierge will confirm ticketing and send e-tickets via email.
              {confirmationId ? ` Ref: ${confirmationId}` : ""}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
