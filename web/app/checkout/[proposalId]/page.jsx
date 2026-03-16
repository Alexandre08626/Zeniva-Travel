"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import ZeniPayButton from "../../../src/components/ZeniPayButton.client";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = Array.isArray(params.proposalId) ? params.proposalId[0] : params.proposalId;
  const { selection, tripDraft, trips } = useTripsStore((s) => ({
    selection: s.selections[proposalId] || { flight: null, hotel: null, activity: null, transfer: null, villa: null, shortterm: null, car: null },
    tripDraft: s.tripDrafts[proposalId] || {},
    trips: s.trips || [],
  }));
  const user = useAuthStore((s) => s.user);
  const userId = user?.email || "";
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [confirmationId, setConfirmationId] = useState("");
  const [travelerForm, setTravelerForm] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    country: "",
    loyaltyNumber: "",
    requests: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

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

  const flightSelection = selection?.flight;
  const flightOutbound = flightSelection?.outbound || flightSelection;
  const flightInbound = flightSelection?.inbound || null;
  const flight = flightOutbound || { airline: "Airline", route: "YUL → CUN", times: "19:20 – 08:45", fare: "Business", bags: "2 checked" };
  const flightRouteLabel = flightInbound?.route ? `${flight.route} / ${flightInbound.route}` : flight.route;
  const flightTimesLabel = flightInbound?.times ? `${flight.times} / ${flightInbound.times}` : flight.times;
  const hotel = selection?.hotel || extraHotels[0] || { name: "Hotel Playa", room: "Junior Suite", location: "Beachfront", rating: 4.6 };
  const activity = selection?.activity || null;
  const transfer = selection?.transfer || null;

  const pricing = computePrice({ flight: selection?.flight, hotel: selection?.hotel, activity, transfer }, {
    ...tripDraft,
    extraHotels,
    extraActivities,
    extraTransfers,
  });

  // Compute TRUE total including villa/car/shortterm (same logic as SelectedSummary)
  const trueTotal = useMemo(() => {
    // Flight total
    let flightTotal = 0;
    const fl = selection?.flight;
    if (fl?.outbound && fl?.inbound) {
      flightTotal = (parseMoney(fl.outbound.price) ?? 0) + (parseMoney(fl.inbound.price) ?? 0);
    } else if (fl) {
      flightTotal = parseMoney(fl.price) ?? 0;
    }
    // Hotel total
    const hotelTotal = (() => {
      const h = selection?.hotel;
      if (!h) return 0;
      const nightly = parseMoney(h.price) ?? 0;
      const nights = parseMoney(h.nights) ?? parseMoney(tripDraft?.nights) ?? 5;
      return nightly > 0 ? nightly * nights : 0;
    })();
    // Villa/ZeniStay total (price = priceTotal already)
    const villaTotal = parseMoney(selection?.villa?.price) ?? parseMoney(selection?.shortterm?.price) ?? 0;
    // Activity
    const activityTotal = parseMoney(selection?.activity?.price) ?? 0;
    // Transfer
    const transferTotal = parseMoney(selection?.transfer?.price) ?? 0;
    // Car
    const carTotal = parseMoney(selection?.car?.price) ?? 0;

    const subtotal = flightTotal + hotelTotal + villaTotal + activityTotal + transferTotal + carTotal;
    if (subtotal === 0) return pricing.total || 0; // fallback to computePrice
    const fee = Math.round(subtotal * 0.06 * 100) / 100;
    return Math.round((subtotal + fee) * 100) / 100;
  }, [selection, tripDraft, pricing]);

  if (!proposalId) return null;

  const canSubmitPayment =
    Boolean(travelerForm.firstName.trim()) &&
    Boolean(travelerForm.lastName.trim()) &&
    Boolean(travelerForm.email.trim()) &&
    Boolean(travelerForm.phone.trim()) &&
    Boolean(paymentForm.cardNumber.trim()) &&
    Boolean(paymentForm.cardName.trim()) &&
    Boolean(paymentForm.expiry.trim()) &&
    Boolean(paymentForm.cvc.trim());

  const handlePayNow = async () => {
    if (paymentStatus !== "idle") return;
    if (!canSubmitPayment) return;
    setPaymentStatus("processing");

    const now = new Date().toISOString();
    const bookingId = `checkout-${Date.now()}`;
    const confirmationNumber = `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const invoiceId = `${bookingId}-invoice`;
    const existingTrip = trips.find((t) => t.id === proposalId);
    const tripId = existingTrip
      ? proposalId
      : createTrip({
          title: tripDraft?.destination ? `${tripDraft.destination} Checkout` : "Hotel booking",
          destination: tripDraft?.destination || "",
          dates: tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} to ${tripDraft.checkOut}` : "",
          travelers: tripDraft?.adults ? String(tripDraft.adults) : "",
        });

    const confirmationPath = `/checkout/${proposalId}/confirmation?bookingId=${encodeURIComponent(bookingId)}&invoiceId=${encodeURIComponent(invoiceId)}&tripId=${encodeURIComponent(tripId)}&confirmationNumber=${encodeURIComponent(confirmationNumber)}`;

    const confirmationDoc = {
      id: bookingId,
      tripId,
      userId,
      type: "confirmation",
      title: `Payment confirmation (${tripDraft?.destination || "Trip"})`,
      provider: "Zeniva",
      confirmationNumber,
      url: confirmationPath,
      updatedAt: now,
      details: JSON.stringify({
        booking_reference: confirmationNumber,
        status: "confirmed",
        destination: tripDraft?.destination || "",
        travelers: tripDraft?.adults || pricing.travelers,
        paymentContact: {
          firstName: travelerForm.firstName,
          lastName: travelerForm.lastName,
          email: travelerForm.email,
          phone: travelerForm.phone,
          country: travelerForm.country,
        },
      }),
    };

    const invoiceDoc = {
      id: invoiceId,
      tripId,
      userId,
      type: "invoice",
      title: `Invoice (${tripDraft?.destination || "Trip"})`,
      provider: "Zeniva",
      confirmationNumber: `INV-${confirmationNumber}`,
      url: `/api/partners/duffel-stays/bookings/mock-pdf?docId=${encodeURIComponent(invoiceId)}`,
      updatedAt: now,
      details: JSON.stringify({
        booking_reference: confirmationNumber,
        subtotal: pricing.hasAnyPrice ? pricing.subtotal : null,
        fees: pricing.hasAnyPrice ? pricing.fees : null,
        total: pricing.hasAnyPrice ? pricing.total : null,
        currency: "USD",
      }),
    };

    const confirmationPayload = {
      bookingId,
      invoiceId,
      confirmationNumber,
      proposalId,
      tripId,
      createdAt: now,
      traveler: travelerForm,
      payment: {
        cardName: paymentForm.cardName,
        cardLast4: paymentForm.cardNumber.replace(/\s+/g, "").slice(-4),
      },
      itinerary: {
        departureCity: tripDraft?.departureCity || "",
        destination: tripDraft?.destination || "",
        checkIn: tripDraft?.checkIn || "",
        checkOut: tripDraft?.checkOut || "",
        travelers: tripDraft?.adults || pricing.travelers,
      },
      totalLabel: pricing.hasAnyPrice ? formatCurrency(pricing.total) : "On request",
      links: {
        confirmationPath,
        invoicePath: invoiceDoc.url,
      },
    };

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(`checkout_confirmation_${bookingId}`, JSON.stringify(confirmationPayload));
    }

    if (userId) {
      const existing = (getDocumentsForUser(userId) || {})[tripId] || [];
      upsertDocuments(userId, tripId, [confirmationDoc, invoiceDoc, ...existing]);

      await Promise.allSettled([
        fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: confirmationDoc.id,
            ownerEmail: userId,
            tripId,
            updatedAt: now,
            payload: confirmationDoc,
          }),
        }),
        fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: invoiceDoc.id,
            ownerEmail: userId,
            tripId,
            updatedAt: now,
            payload: invoiceDoc,
          }),
        }),
        fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: bookingId,
            ownerEmail: userId,
            status: "Invoiced",
            createdAt: now,
            updatedAt: now,
            payload: confirmationPayload,
          }),
        }),
      ]);
    }

    setConfirmationId(confirmationNumber);
    setPaymentStatus("confirmation");
    setTimeout(() => {
      router.push(confirmationPath);
    }, 700);
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
                      type={label === "Email" ? "email" : label === "Phone" ? "tel" : "text"}
                      inputMode={label === "Email" ? "email" : label === "Phone" ? "tel" : "text"}
                      autoComplete={label === "First name" ? "given-name" : label === "Last name" ? "family-name" : label === "Email" ? "email" : "tel"}
                      value={
                        label === "First name"
                          ? travelerForm.firstName
                          : label === "Last name"
                          ? travelerForm.lastName
                          : label === "Email"
                          ? travelerForm.email
                          : travelerForm.phone
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        setTravelerForm((prev) =>
                          label === "First name"
                            ? { ...prev, firstName: value }
                            : label === "Last name"
                            ? { ...prev, lastName: value }
                            : label === "Email"
                            ? { ...prev, email: value }
                            : { ...prev, phone: value }
                        );
                      }}
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
                      value={
                        label === "Country"
                          ? travelerForm.country
                          : label === "Loyalty number (optional)"
                          ? travelerForm.loyaltyNumber
                          : travelerForm.requests
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        setTravelerForm((prev) =>
                          label === "Country"
                            ? { ...prev, country: value }
                            : label === "Loyalty number (optional)"
                            ? { ...prev, loyaltyNumber: value }
                            : { ...prev, requests: value }
                        );
                      }}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>Payment</div>
                <span className="text-[11px] font-bold text-emerald-600">🔒 Secured by ZeniPay</span>
              </div>
              <p className="text-sm text-slate-600">
                Fill in your traveler details above, then click the button below to proceed to our secure payment page.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span>✅ Visa</span><span>✅ Mastercard</span><span>✅ Amex</span><span>✅ Apple Pay</span>
              </div>
            </section>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-4">
            <SelectedSummary
              flight={selection?.flight}
              hotel={selection?.hotel}
              villa={selection?.villa}
              shortterm={selection?.shortterm}
              activity={selection?.activity}
              transfer={selection?.transfer}
              car={selection?.car}
              tripDraft={tripDraft}
            />

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Flight</div>
              <div className="text-sm" style={{ color: TITLE_TEXT }}>{flight.airline} • {flightRouteLabel}</div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>{flightTimesLabel} • {flight.fare} • {flight.bags}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>{tripDraft?.accommodationType === 'Hotel' ? 'Hotel' : tripDraft?.accommodationType === 'Yacht' ? 'Yacht' : (tripDraft?.accommodationType === 'ZeniStay' || tripDraft?.accommodationType === 'Residence') ? 'ZeniStay' : 'Accommodation'}</div>
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

            {/* Helcim Payment Button */}
            {!pricing.hasAnyPrice && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 mb-3">
                💡 <strong>Price on request</strong> — Our team will confirm exact pricing within 24h and send you a payment link.
              </div>
            )}
            <ZeniPayButton
              amount={trueTotal > 0 ? trueTotal : (pricing.hasAnyPrice ? pricing.total : 500)}
              currency="USD"
              disabled={!travelerForm.firstName.trim() || !travelerForm.email.trim()}
            />
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
