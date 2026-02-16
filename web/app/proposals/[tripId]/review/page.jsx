"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, PREMIUM_BLUE, TITLE_TEXT } from "../../../../src/design/tokens";
import { useTripsStore, generateProposal } from "../../../../lib/store/tripsStore";
import { getImagesForDestination, getPartnerHotelImages } from "../../../../src/lib/images";
import { computePrice, formatCurrency } from "../../../../src/lib/pricing";
import yachtsData from "../../../../src/data/ycn_packages.json";
import airbnbsData from "../../../../src/data/airbnbs.json";

export default function ProposalReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const mode = searchParams?.get("mode") || "";
  const isAgentMode = mode === "agent";
  const modeSuffix = isAgentMode ? "?mode=agent" : "";
  const [shareStatus, setShareStatus] = useState("");
  const [workflow, setWorkflow] = useState({
    passengersComplete: false,
    seatsComplete: false,
    bagsComplete: false,
    hotelTravelerConfirmed: false,
    hotelPoliciesConfirmed: false,
    hotelCancellationConfirmed: false,
  });

  const { proposal, selection, tripDraft } = useTripsStore((s) => ({
    proposal: s.proposals[tripId],
    selection: s.selections[tripId] || { flight: null, hotel: null, activity: null, transfer: null },
    tripDraft: s.tripDrafts[tripId] || {},
  }));

  useEffect(() => {
    if (tripId && !proposal) {
      generateProposal(tripId);
    }
  }, [tripId, proposal]);

  const heroImage = useMemo(() => {
    // Use selected accommodation image if available, otherwise fallback to destination images
    if (selection?.hotel?.image) {
      return selection.hotel.image;
    }
    const dest = tripDraft?.destination || proposal?.title || "trip";
    return getImagesForDestination(dest)[0];
  }, [tripDraft, proposal, selection]);

  const extraHotels = tripDraft?.extraHotels || [];
  const extraActivities = tripDraft?.extraActivities || [];
  const extraTransfers = tripDraft?.extraTransfers || [];

  const allHotels = [selection?.hotel, ...extraHotels].filter(Boolean);
  const uniqueHotels = allHotels.filter((item, idx, arr) => {
    const key = `${item?.id || item?.name || idx}`;
    return arr.findIndex((h) => `${h?.id || h?.name || idx}` === key) === idx;
  });

  const getAccommodationType = (item) => {
    const rawType = item?.accommodationType || tripDraft?.accommodationType || "";
    if (typeof rawType === "string" && rawType.toLowerCase() === "airbnb") return "Residence";
    return rawType || (item?.room?.toLowerCase?.().includes("yacht") ? "Yacht" : item?.room?.toLowerCase?.().includes("residence") ? "Residence" : "Hotel");
  };

  const getAccommodationImages = (item, type) => {
    if (item?.images && item.images.length) return item.images;
    if (type === 'Yacht') {
      const yacht = yachtsData.find((y) => y.id === item?.id || y.title === item?.name);
      return yacht?.images || [item?.image].filter(Boolean);
    }
    if (type === 'Residence') {
      const airbnb = airbnbsData.find((a) => a.id === item?.id || a.title === item?.name);
      return airbnb?.images || [item?.image].filter(Boolean);
    }
    const fallback = getPartnerHotelImages(tripDraft?.destination || item?.location || item?.name).slice(0, 6);
    return fallback.length ? fallback : [item?.image].filter(Boolean);
  };

  const flight = selection?.flight || { airline: "Airline", route: "YUL → CUN", times: "19:20 – 08:45", fare: "Business", bags: "2 checked", flightNumber: "AC 456", duration: "4h 30m", date: "Dec 15, 2025", layovers: 0 };
  const hotel = selection?.hotel || { name: "Hotel Playa", room: "Junior Suite", location: "Beachfront", rating: 4.6 };
  const activity = selection?.activity;
  const transfer = selection?.transfer;
  const activityList = [activity, ...extraActivities].filter(Boolean);
  const transferList = [transfer, ...extraTransfers].filter(Boolean);

  const pricing = computePrice({ flight: selection?.flight, hotel: selection?.hotel, activity, transfer }, {
    ...tripDraft,
    extraHotels,
    extraActivities,
    extraTransfers,
  });
  const breakdown = [
    { label: "Flights", value: pricing.hasFlightPrice ? formatCurrency(pricing.flightTotal) : "On request" },
    { label: "Accommodation", value: pricing.hasHotelPrice ? formatCurrency(pricing.hotelTotal) : "On request" },
    ...(activityList.length ? [{ label: "Activities", value: pricing.hasActivityPrice ? formatCurrency(pricing.activityTotal) : "Included" }] : []),
    ...(transferList.length ? [{ label: "Transfers", value: pricing.hasTransferPrice ? formatCurrency(pricing.transferTotal) : "Included" }] : []),
    { label: "Fees & services", value: pricing.hasAnyPrice ? formatCurrency(pricing.fees) : "Included" },
  ];

  const onPay = () => router.push(`/checkout/${tripId}`);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/checkout/${tripId}` : "";

  const allWorkflowComplete =
    workflow.passengersComplete &&
    workflow.seatsComplete &&
    workflow.bagsComplete &&
    workflow.hotelTravelerConfirmed &&
    workflow.hotelPoliciesConfirmed &&
    workflow.hotelCancellationConfirmed;

  const refreshWorkflow = () => {
    if (typeof window === "undefined") return;
    const expectedPax = Math.max(1, Number(tripDraft?.adults || 1));

    let pax = [];
    let seats = [];
    let bags = null;
    let localChecklist = {};

    const parseStoredValue = (key, fallbackValue) => {
      try {
        const fromSession = window.sessionStorage.getItem(key);
        if (fromSession) return JSON.parse(fromSession);
      } catch {
        // ignore
      }
      try {
        const fromLocal = window.localStorage.getItem(key);
        if (fromLocal) return JSON.parse(fromLocal);
      } catch {
        // ignore
      }
      return fallbackValue;
    };

    pax = parseStoredValue("flight_passengers", []);
    seats = parseStoredValue("flight_seats", []);
    bags = parseStoredValue("flight_bags", null);

    try {
      localChecklist = JSON.parse(window.localStorage.getItem(`proposal_review_checklist_${tripId}`) || "{}");
    } catch {
      localChecklist = {};
    }

    const normalizedPax = Array.isArray(pax) ? pax : [];
    const normalizedSeats = Array.isArray(seats) ? seats : [];

    const passengersComplete =
      normalizedPax.length >= expectedPax &&
      normalizedPax.slice(0, expectedPax).every((item) =>
        String(item?.firstName || "").trim() &&
        String(item?.lastName || "").trim() &&
        String(item?.dob || "").trim()
      );

    const seatsComplete =
      normalizedSeats.length >= expectedPax &&
      normalizedSeats.slice(0, expectedPax).every((seat) => String(seat || "").trim());

    const bagsComplete = Boolean(
      bags &&
      Number.isFinite(Number(bags?.carryOn)) &&
      Number.isFinite(Number(bags?.checked))
    );

    setWorkflow({
      passengersComplete,
      seatsComplete,
      bagsComplete,
      hotelTravelerConfirmed: Boolean(localChecklist?.hotelTravelerConfirmed),
      hotelPoliciesConfirmed: Boolean(localChecklist?.hotelPoliciesConfirmed),
      hotelCancellationConfirmed: Boolean(localChecklist?.hotelCancellationConfirmed),
    });
  };

  useEffect(() => {
    refreshWorkflow();
    const onFocus = () => refreshWorkflow();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [tripId, tripDraft?.adults]);

  const persistHotelChecklist = (patch) => {
    if (typeof window === "undefined") return;
    const key = `proposal_review_checklist_${tripId}`;
    let current = {};
    try {
      current = JSON.parse(window.localStorage.getItem(key) || "{}");
    } catch {
      current = {};
    }
    const next = { ...current, ...patch };
    window.localStorage.setItem(key, JSON.stringify(next));
    setWorkflow((prev) => ({ ...prev, ...patch }));
  };

  const openFlightStep = (path) => {
    if (typeof window !== "undefined") {
      const routeParts = String(selection?.flight?.route || "")
        .split("→")
        .map((item) => item.trim());
      const flightNumber = String(selection?.flight?.flightNumber || "").trim();
      const inferredCarrierCode = flightNumber.match(/^([A-Z0-9]{2})/)?.[1] || "";
      const fromCode = routeParts[0] || (tripDraft?.departureCity || "").toUpperCase();
      const toCode = routeParts[1] || (tripDraft?.destination || "").toUpperCase();
      const cabinRaw = String(selection?.flight?.fare || tripDraft?.travelClass || "Economy").toLowerCase();
      const cabin = cabinRaw.includes("business") ? "Business" : cabinRaw.includes("first") ? "First" : cabinRaw.includes("premium") ? "Premium Economy" : "Economy";

      const flightSelectionDraft = {
        offers: [
          {
            id: selection?.flight?.id || `proposal-flight-${tripId}`,
            carrier: selection?.flight?.airline || "Airline",
            code: flightNumber,
            carrierCode: inferredCarrierCode,
            depart: String(selection?.flight?.times || "").split("–")[0]?.trim() || "",
            arrive: String(selection?.flight?.times || "").split("–")[1]?.trim() || "",
            duration: selection?.flight?.duration || "",
            stops: selection?.flight?.layovers ? `${selection.flight.layovers} stop` : "Nonstop",
            cabin,
            price: selection?.flight?.price || "Price on request",
            bags: selection?.flight?.bags || "",
          },
        ],
        searchContext: {
          from: fromCode,
          to: toCode,
          depart: tripDraft?.checkIn || "",
          ret: tripDraft?.checkOut || "",
          passengers: String(tripDraft?.adults || 1),
          cabin,
          proposalTripId: tripId,
          proposalMode: isAgentMode ? "agent" : "",
        },
      };

      window.sessionStorage.setItem("flight_selection", JSON.stringify(flightSelectionDraft));
    }

    router.push(path);
  };

  const openHotelStep = () => {
    const search = new URLSearchParams({
      destination: String(tripDraft?.destination || "").trim(),
      checkIn: String(tripDraft?.checkIn || "").trim(),
      checkOut: String(tripDraft?.checkOut || "").trim(),
      guests: String(tripDraft?.adults || 1),
      rooms: "1",
      proposalTripId: String(tripId || ""),
    });

    if (isAgentMode) {
      search.set("mode", "agent");
    }

    router.push(`/search/hotels?${search.toString()}`);
  };

  const handleShare = async () => {
    const url = shareUrl || `/checkout/${tripId}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("Payment link copied.");
    } catch {
      setShareStatus("Copy failed. Please copy the link manually.");
    }
  };

  if (!tripId) return null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <header className="flex items-center justify-between text-sm">
          <button
            onClick={() => router.push(isAgentMode ? `/agent/proposals` : `/proposals`)}
            className="text-blue-700 font-semibold"
          >
            {isAgentMode ? "Back to agent proposals" : "Back to proposals"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/proposals/${tripId}/select${modeSuffix}`)}
              className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
            >
              Edit selections
            </button>
            <button
              onClick={() => router.push(isAgentMode ? `/agent/lina/chat/${tripId}` : `/chat/${tripId}`)}
              className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
            >
              {isAgentMode ? "Back to Lina" : "Back to chat"}
            </button>
          </div>
        </header>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Zeniva travel</p>
          <h1 className="text-3xl font-black text-slate-900">Your tailored trip</h1>
          <div className="text-sm text-blue-800">
            {tripDraft?.destination || "Your trip"} · {isAgentMode ? "Review before sending to client" : "Review before payment"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-2 rounded-3xl overflow-hidden">
          <div className="lg:col-span-2 lg:row-span-2 h-80 lg:h-full">
            <img src={heroImage} alt="Destination" className="h-full w-full object-cover" />
          </div>
          {((uniqueHotels[0]
            ? getAccommodationImages(uniqueHotels[0], getAccommodationType(uniqueHotels[0]))
            : [heroImage, heroImage, heroImage, heroImage]
          ).slice(0, 4)).map((img, i) => (
            <div key={i} className="h-40 lg:h-full">
              <img src={img} alt={`Trip ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-blue-100 bg-white p-6">
          <p className="text-lg font-bold text-slate-900">Trip overview</p>
          <p className="mt-1 text-sm text-slate-600">
            {tripDraft?.departureCity || "Departure"} → {tripDraft?.destination || "Destination"} · {tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} to ${tripDraft.checkOut}` : "Flexible dates"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-blue-800">
            <span className="font-semibold">4.92</span>
            <span>· 52 reviews</span>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-white p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Required before payment</p>
            <h2 className="text-xl font-black text-slate-900">Booking process checklist</h2>
            <p className="text-sm text-slate-600">Complete all required steps for flights and accommodation before final payment.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <p className="text-sm font-extrabold text-slate-900">Flights process</p>
              <div className="space-y-2 text-sm">
                <div className={`flex items-center justify-between ${workflow.passengersComplete ? "text-emerald-700" : "text-slate-700"}`}>
                  <span>Passenger + passport details</span>
                  <span>{workflow.passengersComplete ? "✓" : "Required"}</span>
                </div>
                <div className={`flex items-center justify-between ${workflow.seatsComplete ? "text-emerald-700" : "text-slate-700"}`}>
                  <span>Seat selection</span>
                  <span>{workflow.seatsComplete ? "✓" : "Required"}</span>
                </div>
                <div className={`flex items-center justify-between ${workflow.bagsComplete ? "text-emerald-700" : "text-slate-700"}`}>
                  <span>Baggage selection</span>
                  <span>{workflow.bagsComplete ? "✓" : "Required"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openFlightStep("/booking/flights/passengers")}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Passengers & passport
                </button>
                <button
                  onClick={() => openFlightStep("/booking/flights/seats")}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Seats
                </button>
                <button
                  onClick={() => openFlightStep("/booking/flights/bags")}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Bags
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <p className="text-sm font-extrabold text-slate-900">Accommodation process</p>
              <div className="space-y-2 text-sm text-slate-700">
                <label className="flex items-center justify-between gap-2">
                  <span>Traveler details complete (name/email/phone)</span>
                  <input
                    type="checkbox"
                    checked={workflow.hotelTravelerConfirmed}
                    onChange={(event) => persistHotelChecklist({ hotelTravelerConfirmed: event.target.checked })}
                  />
                </label>
                <label className="flex items-center justify-between gap-2">
                  <span>Property policies reviewed</span>
                  <input
                    type="checkbox"
                    checked={workflow.hotelPoliciesConfirmed}
                    onChange={(event) => persistHotelChecklist({ hotelPoliciesConfirmed: event.target.checked })}
                  />
                </label>
                <label className="flex items-center justify-between gap-2">
                  <span>Cancellation terms acknowledged</span>
                  <input
                    type="checkbox"
                    checked={workflow.hotelCancellationConfirmed}
                    onChange={(event) => persistHotelChecklist({ hotelCancellationConfirmed: event.target.checked })}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openHotelStep}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Validate hotel details
                </button>
              </div>
            </div>
          </div>

          {!allWorkflowComplete && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Complete all required steps above before proceeding to payment.
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={refreshWorkflow}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Refresh checklist
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <section className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
              <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Flight</div>
              <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                {flight.airline} • {flight.route}
              </div>
              <div className="text-sm" style={{ color: MUTED_TEXT }}>
                {flight.times} • {flight.fare} • {flight.bags}
              </div>
              {flight.flightNumber && (
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  Flight: {flight.flightNumber}
                </div>
              )}
              {flight.date && (
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  Date: {flight.date}
                </div>
              )}
              {flight.duration && (
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  Duration: {flight.duration}
                </div>
              )}
              {flight.layovers > 0 && (
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  Layovers: {flight.layovers}
                </div>
              )}
              <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                Fare rules: flexible changes with fee, cancellation subject to airline policy.
              </div>
            </section>

            {uniqueHotels.map((stay, idx) => {
              const type = getAccommodationType(stay);
              const label = type === 'Yacht' ? 'Yacht' : type === 'Residence' ? 'Short-term rental' : 'Hotel';
              const stayImages = getAccommodationImages(stay, type);
              return (
                <section key={`${stay?.id || stay?.name || idx}`} className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
                  <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>{label}</div>
                  <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                    {stay.name} • {stay.location || "Central"}
                  </div>
                  <div className="text-sm" style={{ color: MUTED_TEXT }}>
                    {type === 'Yacht'
                      ? `Specs: ${stay.specs || "Yacht specs"}`
                      : type === 'Residence'
                        ? `Stay: ${stay.room || "Private stay"} • Rating: ${stay.rating || "4.9"}`
                        : `Room: ${stay.room || "Deluxe"} • Board: Breakfast • Rating: ${stay.rating || "4.5"}`}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                    {type === 'Yacht'
                      ? `Amenities: ${stay.amenities?.join(" • ") || "Yacht amenities"}`
                      : "Policies: Free cancellation until 7 days before arrival; pay at property or prepaid per partner terms."}
                  </div>
                  {stayImages.length > 0 && (
                    <div className="pt-4">
                      <div className="text-xs font-semibold mb-2" style={{ color: MUTED_TEXT }}>Photo gallery</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {stayImages.slice(0, 6).map((src, i) => (
                          <div key={i} className="aspect-square overflow-hidden rounded-lg">
                            <img src={src} alt={`${label} ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}

            {activityList.map((act, idx) => (
              <section key={`activity-${idx}-${act?.id || act?.name || "item"}`} className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
                <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Activity</div>
                <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                  {act.name}
                </div>
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  {act.date} at {act.time} • {act.supplier}
                </div>
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Includes: Guided tour, entrance fees, transportation.
                </div>
                {act.images && act.images.length > 0 && (
                  <div className="pt-4">
                    <div className="text-xs font-semibold mb-2" style={{ color: MUTED_TEXT }}>Photo gallery</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {act.images.slice(0, 6).map((src, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-lg">
                          <img src={src} alt={`Activity ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}

            {transferList.map((item, idx) => (
              <section key={`transfer-${idx}-${item?.id || item?.name || "item"}`} className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
                <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Transfer</div>
                <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                  {item.name}
                </div>
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  {item.route} • {item.date} • {item.supplier}
                </div>
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Vehicle: {item.vehicle} • {item.shared ? "Shared transfer" : "Private transfer"}.
                </div>
                {item.images && item.images.length > 0 && (
                  <div className="pt-4">
                    <div className="text-xs font-semibold mb-2" style={{ color: MUTED_TEXT }}>Photo gallery</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {item.images.slice(0, 6).map((src, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-lg">
                          <img src={src} alt={`Transfer ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}

            <section className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
              <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Price breakdown</div>
              <div className="space-y-1">
                {breakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm" style={{ color: TITLE_TEXT }}>
                    <span>{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Total</span>
                <span className="text-xl font-extrabold" style={{ color: PREMIUM_BLUE }}>
                  {pricing.hasAnyPrice ? formatCurrency(pricing.total) : "On request"}
                </span>
              </div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>
                Based on {pricing.travelers} traveler(s) and {pricing.nights} nights. Final pricing is confirmed at payment with live availability.
              </div>
            </section>
          </div>

          <aside className="space-y-4 sticky top-4">
            <div className="rounded-2xl border border-blue-200 bg-white shadow-sm p-5 space-y-2">
              <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Travel summary</div>
              <div className="text-sm" style={{ color: TITLE_TEXT }}>
                {tripDraft?.departureCity || "Departure TBC"} → {tripDraft?.destination || "Destination"}
              </div>
              <div className="text-sm" style={{ color: MUTED_TEXT }}>
                Dates: {tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} to ${tripDraft.checkOut}` : "Flexible"}
              </div>
              <div className="text-sm" style={{ color: MUTED_TEXT }}>
                Travelers: {tripDraft?.adults || "2"}
              </div>
            </div>

            {isAgentMode ? (
              <>
                <button
                  onClick={handleShare}
                  disabled={!allWorkflowComplete}
                  className="w-full rounded-xl px-4 py-3 text-sm font-extrabold text-white"
                  style={{ backgroundColor: BRAND_BLUE, opacity: allWorkflowComplete ? 1 : 0.6 }}
                >
                  Send to client for payment
                </button>
                <button
                  onClick={onPay}
                  disabled={!allWorkflowComplete}
                  className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700"
                  style={{ opacity: allWorkflowComplete ? 1 : 0.6 }}
                >
                  Preview client payment page
                </button>
                <div className="rounded-xl border border-blue-200 bg-white p-3 text-xs" style={{ color: MUTED_TEXT }}>
                  Share link: {shareUrl || `/checkout/${tripId}`}
                  {shareStatus ? ` • ${shareStatus}` : ""}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={onPay}
                  disabled={!allWorkflowComplete}
                  className="w-full rounded-xl px-4 py-3 text-sm font-extrabold text-white"
                  style={{ backgroundColor: BRAND_BLUE, opacity: allWorkflowComplete ? 1 : 0.6 }}
                >
                  {allWorkflowComplete ? "Proceed to payment" : "Complete required steps first"}
                </button>
                <div className="rounded-xl border border-blue-200 bg-white p-3 text-xs" style={{ color: MUTED_TEXT }}>
                  You can adjust selections before paying. Passenger/passport, seats, bags, and accommodation checks are required.
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
