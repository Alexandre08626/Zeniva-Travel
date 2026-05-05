"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, PREMIUM_BLUE, TITLE_TEXT } from "../../../../src/design/tokens";
import { useTripsStore, generateProposal } from "../../../../lib/store/tripsStore";
import { getImagesForDestination, getPartnerHotelImages } from "../../../../src/lib/images";
import { computePrice, formatCurrency } from "../../../../src/lib/pricing";
import SelectedSummary from "../../../../src/components/SelectedSummary";
import { loadTripWorkflowState, persistWorkflowStatePatch } from "../../../../src/lib/workflowPersistence";
import yachtsData from "../../../../src/data/ycn_packages.json";
import airbnbsData from "../../../../src/data/airbnbs.json";

function ProposalReviewPageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const mode = searchParams?.get("mode") || "";
  const isAgentMode = mode === "agent";
  const modeSuffix = isAgentMode ? "?mode=agent" : "";
  const [shareStatus, setShareStatus] = useState("");
  const [liteApiHotelPhotosById, setLiteApiHotelPhotosById] = useState({});
  const [expandedStayPhotos, setExpandedStayPhotos] = useState({});
  const [activePhoto, setActivePhoto] = useState(null);
  const [workflow, setWorkflow] = useState({
    passengersComplete: false,
    seatsComplete: false,
    bagsComplete: false,
    hotelTravelerConfirmed: false,
    hotelPoliciesConfirmed: false,
    hotelCancellationConfirmed: false,
  });

  const storeData = useTripsStore((s) => ({
    proposal: s.proposals[tripId],
    selection: s.selections[tripId] || { flight: null, hotel: null, activity: null, transfer: null },
    tripDraft: s.tripDrafts[tripId] || {},
  }));
  const [dbPayload, setDbPayload] = useState(null);
  useEffect(() => {
    if (storeData.proposal) return;
    fetch("/api/proposals?id=" + tripId)
      .then(r => r.json())
      .then(d => { const f = (d.data||[]).find(p => p.trip_id === tripId || p.id === tripId); if (f?.payload) setDbPayload(f.payload); })
      .catch(() => {});
  }, [tripId, storeData.proposal]);
  const proposal = dbPayload?.proposal || storeData.proposal;
  const selection = dbPayload?.selections || storeData.selection;
  const tripDraft = (dbPayload?.tripDraft && Object.keys(dbPayload.tripDraft).length > 0) ? dbPayload.tripDraft : storeData.tripDraft;

  useEffect(() => {
    if (tripId && !proposal) {
      generateProposal(tripId);
    }
  }, [tripId, proposal]);

  const heroImage = useMemo(() => {
    // Priority: villa photo > hotel images > destination photo
    const dest = tripDraft?.destination || proposal?.title || "trip";
    const destImgs = getImagesForDestination(dest);

    // ZeniStay (villa) selected — use villa photos first
    if (selection?.villa && !selection?.hotel) {
      const villaPhotos = selection.villa.photos || (selection.villa.photo ? [selection.villa.photo] : []);
      if (villaPhotos.length > 0) return villaPhotos[0];
    }

    // Hotel images
    const hotelImages = selection?.hotel?.images;
    if (Array.isArray(hotelImages) && hotelImages.length > 0) return hotelImages[0];
    if (selection?.hotel?.image) return selection.hotel.image;

    // Destination fallback
    if (destImgs && destImgs[0] && !destImgs[0].includes("picsum")) return destImgs[0];
    return destImgs[0] || "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1400&q=85";
  }, [tripDraft, proposal, selection]);

  const extraHotels = tripDraft?.extraHotels || [];
  const extraActivities = tripDraft?.extraActivities || [];
  const extraTransfers = tripDraft?.extraTransfers || [];

  // Include villa/Airbnb selection as accommodation when no hotel is selected
  const primaryAccommodation = selection?.hotel || selection?.villa || null;
  const allHotels = [primaryAccommodation, ...extraHotels].filter(Boolean);
  const uniqueHotels = allHotels.filter((item, idx, arr) => {
    const key = `${item?.id || item?.name || idx}`;
    return arr.findIndex((h) => `${h?.id || h?.name || idx}` === key) === idx;
  });

  // Is the primary accommodation an Airbnb/villa?
  const isAirbnbStay = Boolean(!selection?.hotel && selection?.villa) ||
    Boolean(selection?.hotel?.provider === "airbnb") ||
    Boolean(["airbnb", "villa", "ZeniStay", "condo", "residence"].includes(
      String(selection?.hotel?.accommodationType || selection?.villa?.accommodationType || "").toLowerCase()
    ));

  const getAccommodationType = (item) => {
    // Check if this item is the selected villa
    const isVilla = item?.id && selection?.villa?.id === item?.id;
    if (isVilla) return "Residence";
    const rawType = String(item?.accommodationType || tripDraft?.accommodationType || "").toLowerCase();
    if (["airbnb", "villa", "ZeniStay", "condo", "residence"].includes(rawType)) return "Residence";
    if (rawType === "yacht") return "Yacht";
    return item?.room?.toLowerCase?.().includes("yacht") ? "Yacht" : item?.room?.toLowerCase?.().includes("residence") ? "Residence" : "Hotel";
  };

  const getAccommodationImages = (item, type) => {
    const provider = String(item?.provider || "").trim().toLowerCase();

    // ZeniStay / villa: use all available photo fields
    if (provider === "airbnb" || type === "Residence") {
      if (Array.isArray(item?.photos) && item.photos.length > 0) return item.photos;
      if (Array.isArray(item?.images) && item.images.length > 0) return item.images;
      if (item?.photo) return [item.photo]; // single photo field from villa selection store
      if (item?.image) return [item.image];
      // Fallback: check airbnbs.json static data
      const airbnb = airbnbsData.find((a) => a.id === item?.id || a.title === item?.name);
      if (airbnb?.images?.length) return airbnb.images;
      if (airbnb?.image) return [airbnb.image];
    }

    if (provider === "liteapi") {
      const id = String(item?.id || "").trim();
      const photos = id ? liteApiHotelPhotosById?.[id] : null;
      if (Array.isArray(photos) && photos.length > 0) return photos;
    }

    if (Array.isArray(item?.images) && item.images.length > 0) return item.images;

    if (type === "Yacht") {
      const yacht = yachtsData.find((y) => y.id === item?.id || y.title === item?.name);
      return yacht?.images || [item?.image].filter(Boolean);
    }

    const fallback = getPartnerHotelImages(tripDraft?.destination || item?.location || item?.name);
    return fallback.length ? fallback : [item?.image].filter(Boolean);
  };

  useEffect(() => {
    const stays = Array.isArray(uniqueHotels) ? uniqueHotels : [];
    const liteapiIds = stays
      .map((stay) => ({
        id: String(stay?.id || "").trim(),
        provider: String(stay?.provider || "").trim().toLowerCase(),
      }))
      .filter((x) => x.provider === "liteapi" && x.id);

    if (liteapiIds.length === 0) return;

    const abort = new AbortController();

    const run = async () => {
      for (const { id } of liteapiIds) {
        if (abort.signal.aborted) return;
        if (Array.isArray(liteApiHotelPhotosById?.[id]) && liteApiHotelPhotosById[id].length > 0) continue;
        try {
          const res = await fetch(`/api/partners/liteapi/hotels/details?hotelId=${encodeURIComponent(id)}`, {
            signal: abort.signal,
          });
          const json = await res.json().catch(() => null);
          if (!res.ok || !json?.ok) continue;
          const photos = Array.isArray(json?.photos)
            ? json.photos.filter((p) => typeof p === "string" && p.trim().length > 0)
            : [];
          if (photos.length === 0) continue;
          setLiteApiHotelPhotosById((prev) => ({ ...prev, [id]: photos }));
        } catch {
          // Non-blocking
        }
      }
    };

    void run();
    return () => abort.abort();
  }, [uniqueHotels]);

  const flightSelection = selection?.flight;
  const flightOutbound = flightSelection?.outbound || flightSelection;
  const flightInbound = flightSelection?.inbound || null;
  const flight = flightOutbound || { airline: "Airline", route: "YUL → CUN", times: "19:20 – 08:45", fare: "Business", bags: "2 checked", flightNumber: "AC 456", duration: "4h 30m", date: "Dec 15, 2025", layovers: 0 };
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
    { label: "Flights", value: pricing.hasFlightPrice ? formatCurrency(pricing.flightTotal) : "Est. $800–$2,500 / person" },
    { label: "Accommodation", value: pricing.hasHotelPrice ? formatCurrency(pricing.hotelTotal) : "Est. $150–$500 / night" },
    ...(activityList.length ? [{ label: "Activities", value: pricing.hasActivityPrice ? formatCurrency(pricing.activityTotal) : "Included" }] : []),
    ...(transferList.length ? [{ label: "Transfers", value: pricing.hasTransferPrice ? formatCurrency(pricing.transferTotal) : "Included" }] : []),
    { label: "Service fee (6%)", value: pricing.hasAnyPrice ? formatCurrency(pricing.fees) : "Included" },
  ];

  const [paying, setPaying] = useState(false);
  const onPay = async () => {
    setPaying(true);
    try {
      // Calculate same total as displayed (matching the review page calculation)
      const pm = (v) => { if (!v) return 0; const s = String(v).replace(/[^0-9.-]/g, ""); return parseFloat(s) || 0; };
      const ft = pm(selection?.flight?.outbound ? (pm(selection.flight.outbound.price) + pm(selection.flight.inbound?.price)) : selection?.flight?.price) || 0;
      const ht = pm(selection?.hotel?.price) || 0;
      const vt = pm(selection?.villa?.price) || pm(selection?.shortterm?.price) || 0;
      const at = pm(selection?.activity?.price) || 0;
      const tt = pm(selection?.transfer?.price) || 0;
      const ct = pm(selection?.car?.price) || 0;
      const sub = ft + ht + vt + at + tt + ct;
      const total = sub > 0 ? Math.round((sub * 1.06) * 100) / 100 : (pricing.total || 0);
      const dest = tripDraft?.destination || "Trip";
      const dates = tripDraft?.checkIn && tripDraft?.checkOut ? `(${tripDraft.checkIn} to ${tripDraft.checkOut})` : "";
      const desc = `Zeniva Travel - ${dest} ${dates}`.trim();
      const res = await fetch("/api/zenipay/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, currency: "USD", description: desc, customerName: "", customerEmail: "" }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
    } catch {}
    setPaying(false);
  };
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/proposals/${tripId}/review` : "";

  // Only require passenger details to proceed — seat/bags/policies are optional
  const allWorkflowComplete = true;

  const refreshWorkflow = async () => {
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

    const serverWorkflow = tripId ? await loadTripWorkflowState(String(tripId)) : null;
    const serverPax = Array.isArray(serverWorkflow?.flight_passengers) ? serverWorkflow.flight_passengers : [];
    const serverSeats = Array.isArray(serverWorkflow?.flight_seats) ? serverWorkflow.flight_seats : [];
    const serverBags = serverWorkflow?.flight_bags && typeof serverWorkflow.flight_bags === "object" ? serverWorkflow.flight_bags : null;
    const serverChecklist =
      serverWorkflow?.proposal_review_checklist && typeof serverWorkflow.proposal_review_checklist === "object"
        ? serverWorkflow.proposal_review_checklist
        : {};

    try {
      localChecklist = JSON.parse(window.localStorage.getItem(`proposal_review_checklist_${tripId}`) || "{}");
    } catch {
      localChecklist = {};
    }

    const normalizedPax = Array.isArray(pax) && pax.length ? pax : serverPax;
    const normalizedSeats = Array.isArray(seats) && seats.length ? seats : serverSeats;
    const normalizedBags =
      bags && typeof bags === "object" && Object.keys(bags).length > 0
        ? bags
        : serverBags;
    const mergedChecklist = { ...serverChecklist, ...localChecklist };

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
      normalizedBags &&
      Number.isFinite(Number(normalizedBags?.carryOn)) &&
      Number.isFinite(Number(normalizedBags?.checked))
    );

    setWorkflow({
      passengersComplete,
      seatsComplete,
      bagsComplete,
      hotelTravelerConfirmed: Boolean(mergedChecklist?.hotelTravelerConfirmed),
      hotelPoliciesConfirmed: Boolean(mergedChecklist?.hotelPoliciesConfirmed),
      hotelCancellationConfirmed: Boolean(mergedChecklist?.hotelCancellationConfirmed),
    });
  };

  useEffect(() => {
    void refreshWorkflow();
    const onFocus = () => {
      void refreshWorkflow();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [tripId, tripDraft?.adults]);

  useEffect(() => {
    if (!activePhoto) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActivePhoto(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePhoto]);

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

    if (tripId) {
      void persistWorkflowStatePatch({
        [String(tripId)]: {
          proposal_review_checklist: patch,
        },
      });
    }
  };

  const openFlightStep = (path) => {
    if (typeof window !== "undefined") {
      const selected = selection?.flight;
      const out = selected?.outbound || selected;
      const inn = selected?.inbound || null;

      const routeParts = String(out?.route || "")
        .split("→")
        .map((item) => item.trim());
      const flightNumber = String(out?.flightNumber || "").trim();
      const inferredCarrierCode = flightNumber.match(/^([A-Z0-9]{2})/)?.[1] || "";
      const fromCode = routeParts[0] || (tripDraft?.departureCity || "").toUpperCase();
      const toCode = routeParts[1] || (tripDraft?.destination || "").toUpperCase();
      const cabinRaw = String(selection?.flight?.fare || tripDraft?.travelClass || "Economy").toLowerCase();
      const cabin = cabinRaw.includes("business") ? "Business" : cabinRaw.includes("first") ? "First" : cabinRaw.includes("premium") ? "Premium Economy" : "Economy";

      const makeOffer = (item, fallbackId) => ({
        id: item?.id || fallbackId,
        carrier: item?.airline || "Airline",
        code: String(item?.flightNumber || "").trim() || String(item?.code || "").trim() || flightNumber,
        carrierCode: inferredCarrierCode,
        depart: String(item?.times || "").split("–")[0]?.trim() || "",
        arrive: String(item?.times || "").split("–")[1]?.trim() || "",
        duration: item?.duration || "",
        stops: item?.layovers ? `${item.layovers} stop` : "Nonstop",
        cabin,
        price: item?.price || "Price on request",
        bags: item?.bags || "",
        slices: item?.slices,
      });

      const flightSelectionDraft = {
        offers: [makeOffer(out, `proposal-flight-out-${tripId}`), ...(inn ? [makeOffer(inn, `proposal-flight-in-${tripId}`)] : [])],
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
    const dest = String(tripDraft?.destination || "").trim();
    const checkIn = String(tripDraft?.checkIn || "").trim();
    const checkOut = String(tripDraft?.checkOut || "").trim();
    const guests = String(tripDraft?.adults || 1);
    const rooms = "1";
    const budget = String(tripDraft?.budget || "");
    const selectedStay = selection?.hotel || selection?.villa || uniqueHotels?.[0] || null;
    const isVilla = isAirbnbStay || String(selectedStay?.provider || "").toLowerCase() === "airbnb";

    if (typeof window !== "undefined" && selectedStay) {
      const rawPrice = String(selectedStay?.price || selectedStay?.priceText || "");
      const priceMatch = rawPrice.match(/([A-Z]{3})\s*([0-9.,]+)/i);
      const totalCurrency = priceMatch?.[1]?.toUpperCase() || "USD";
      const totalAmount = priceMatch?.[2]?.replace(/,/g, "") || "0.00";

      const draft = {
        selectedSearchResult: {
          id: selectedStay?.id,
          name: selectedStay?.name || selectedStay?.title || "Selected property",
          location: selectedStay?.location || selectedStay?.city || dest,
          room: selectedStay?.room || selectedStay?.roomType || (isVilla ? "Private rental" : "Room"),
          image: selectedStay?.image || (Array.isArray(selectedStay?.images) ? selectedStay.images[0] : ""),
          photos: Array.isArray(selectedStay?.images) ? selectedStay.images : [selectedStay?.image].filter(Boolean),
          provider: isVilla ? "airbnb" : (selectedStay?.provider || "liteapi"),
          rating: selectedStay?.rating,
          superhost: selectedStay?.superhost,
          bedrooms: selectedStay?.bedrooms,
          bathrooms: selectedStay?.bathrooms,
          guests: selectedStay?.guests,
        },
        selectedRateId: `proposal-rate-${tripId}`,
        selectedRate: {
          id: `proposal-rate-${tripId}`,
          room_type: { name: selectedStay?.room || selectedStay?.roomType || (isVilla ? "Private rental" : "Room") },
          refundable: isVilla ? true : false,
          conditions: isVilla
            ? "Airbnb cancellation policy applies. Contact info@zeniva.ca for assistance."
            : "Selected from proposal review. Final partner terms apply.",
          cancellation_timeline: [],
        },
        quote: isVilla ? null : {
          id: `proposal-quote-${tripId}`,
          total_amount: totalAmount,
          total_currency: totalCurrency,
          refundable: false,
        },
        priceText: rawPrice || null,
        isAirbnb: isVilla,
        searchContext: {
          destination: dest,
          checkIn,
          checkOut,
          guests,
          rooms,
          budget,
          proposalTripId: String(tripId || ""),
          proposalMode: isAgentMode ? "agent" : "",
        },
      };

      window.sessionStorage.setItem("hotel_booking_draft_v1", JSON.stringify(draft));
    }

    const search = new URLSearchParams({ destination: dest, checkIn, checkOut, guests, rooms, budget, proposalTripId: String(tripId || "") });
    if (isAgentMode) search.set("mode", "agent");
    router.push(`/booking/hotels/review?${search.toString()}`);
  };

  const handleShare = async () => {
    const url = shareUrl || `${window.location.origin}/checkout/${tripId}`;
    const clientEmail = tripDraft?.clientEmail || tripDraft?.email || proposal?.clientEmail || "";
    const clientName  = tripDraft?.clientName  || tripDraft?.name  || proposal?.clientName  || "Traveler";
    const destination = tripDraft?.destination || proposal?.title || "your trip";
    const travelDates = tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} → ${tripDraft.checkOut}` : "";
    const totalPrice  = pricing?.grandTotal ? formatCurrency(pricing.grandTotal) : (proposal?.totalPrice || "");

    // If we have the client's email, send via VPS email API
    if (clientEmail && clientEmail.includes("@")) {
      setShareStatus("Sending email…");
      try {
        const res = await fetch("https://vmi3097009.contaboserver.net/admin/send-proposal-email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer zeniva-secret-2025" },
          body: JSON.stringify({
            client_email: clientEmail,
            client_name: clientName,
            trip_id: tripId,
            destination,
            checkout_url: url,
            total_price: totalPrice,
            travel_dates: travelDates,
            agent_name: "Zeniva Travel",
            // Full trip details for rich email
            departure_city: tripDraft?.departureCity || "",
            check_in: tripDraft?.checkIn || "",
            check_out: tripDraft?.checkOut || "",
            adults: tripDraft?.adults || 1,
            budget: tripDraft?.budget || "",
            currency: tripDraft?.currency || "USD",
            accommodation_type: tripDraft?.accommodationType || "Hotel",
            transport_type: tripDraft?.transportationType || "Flights",
            travel_style: tripDraft?.style || "",
            hotel_name: tripDraft?.hotelName || "",
            notes: tripDraft?.notes || "",
            sections: proposal?.sections || [],
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setShareStatus(`✅ Email sent to ${clientEmail}`);
        } else {
          // Fallback: copy link
          await navigator.clipboard.writeText(url).catch(() => {});
          setShareStatus("⚠️ Email failed — link copied. Send manually.");
        }
      } catch {
        await navigator.clipboard.writeText(url).catch(() => {});
        setShareStatus("⚠️ Connection error — link copied. Send manually.");
      }
    } else {
      // No email found — copy link + prompt to enter email
      try {
        await navigator.clipboard.writeText(url);
        setShareStatus("🔗 Link copied — no client email on file. Paste and send manually.");
      } catch {
        setShareStatus("Copy failed. Send this link: " + url);
      }
    }
  };

  if (!tripId) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── HERO ── */}
      <div className="relative w-full h-72 sm:h-[400px] overflow-hidden">
        <img src={heroImage} alt="Destination" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />
        {/* Nav buttons */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <button
            onClick={() => router.push(isAgentMode ? `/agent/proposals` : `/proposals`)}
            className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition"
          >
            ← {isAgentMode ? "Proposals" : "Back"}
          </button>
          <button
            onClick={() => router.push(`/proposals/${tripId}/select${modeSuffix}`)}
            className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition"
          >
            ✏️ Edit selections
          </button>
          <button
            onClick={() => router.push(isAgentMode ? `/agent/lina/chat/${tripId}` : `/chat/${tripId}`)}
            className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition"
          >
            💬 {isAgentMode ? "Back to Lina" : "Back to chat"}
          </button>
        </div>
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-1">
            {isAgentMode ? "Agent Review" : "Your Trip"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">
            {tripDraft?.destination || proposal?.title || "Your tailored trip"}
          </h1>
          <div className="flex flex-wrap gap-2 mt-3">
            {tripDraft?.departureCity && (
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                ✈️ {tripDraft.departureCity} → {tripDraft.destination}
              </span>
            )}
            {tripDraft?.checkIn && (
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                📅 {tripDraft.checkIn}{tripDraft?.checkOut ? ` → ${tripDraft.checkOut}` : ""}
              </span>
            )}
            {tripDraft?.adults && (
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                👥 {tripDraft.adults} traveler{tripDraft.adults > 1 ? "s" : ""}
              </span>
            )}
            <span className="bg-amber-400/90 rounded-full px-3 py-1 text-xs font-bold text-amber-900">
              ★ 4.92 · 52 reviews
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden shadow-md h-52 md:h-64">
          {((uniqueHotels[0]
            ? getAccommodationImages(uniqueHotels[0], getAccommodationType(uniqueHotels[0]))
            : [heroImage, heroImage, heroImage, heroImage]
          ).slice(0, 4)).map((img, i) => (
            <button key={i} onClick={() => setActivePhoto(img)} className="h-full w-full overflow-hidden relative group">
              <img src={img} alt={`Trip ${i + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {i === 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+ Show all</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* BOOKING CHECKLIST */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-lg">📋</div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Booking checklist</h2>
                  <p className="text-slate-500 text-xs">{isAgentMode ? "Complete before sending to client" : "Required before payment"}</p>
                </div>
                {allWorkflowComplete && (
                  <div className="ml-auto flex items-center gap-1.5 bg-emerald-500 rounded-full px-3 py-1">
                    <span className="text-white text-xs font-bold">✓ All complete</span>
                  </div>
                )}
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Flights checklist */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center gap-2">
                    <span className="text-base">✈️</span>
                    <p className="font-bold text-slate-800 text-sm">Flights</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { label: "Passenger & passport details", done: workflow.passengersComplete, href: "/booking/flights/passengers" },
                      { label: "Seat selection", done: workflow.seatsComplete, href: "/booking/flights/seats" },
                      { label: "Baggage selection", done: workflow.bagsComplete, href: "/booking/flights/bags" },
                    ].map(({ label, done, href }) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <span className={`text-sm ${done ? "text-emerald-700 font-semibold line-through" : "text-slate-700"}`}>{label}</span>
                        <button
                          onClick={() => openFlightStep(href)}
                          className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-bold transition ${done ? "bg-emerald-100 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-500"}`}
                        >
                          {done ? "✓ Done" : "Fill →"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotel/Airbnb checklist */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-purple-50 border-b border-purple-100 px-4 py-3 flex items-center gap-2">
                    <span className="text-base">{isAirbnbStay ? "🏡" : "🏨"}</span>
                    <p className="font-bold text-slate-800 text-sm">{isAirbnbStay ? "Airbnb / Rental" : "Accommodation"}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { label: "Traveler details (name/email/phone)", key: "hotelTravelerConfirmed" },
                      { label: "Property policies reviewed", key: "hotelPoliciesConfirmed" },
                      { label: "Cancellation terms acknowledged", key: "hotelCancellationConfirmed" },
                    ].map(({ label, key }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${workflow[key] ? "bg-emerald-500 border-emerald-500" : "border-slate-300 group-hover:border-slate-400"}`}>
                          {workflow[key] && <span className="text-white text-[10px] font-black">✓</span>}
                        </div>
                        <input type="checkbox" checked={workflow[key]} onChange={(e) => persistHotelChecklist({ [key]: e.target.checked })} className="sr-only" />
                        <span className={`text-sm ${workflow[key] ? "text-emerald-700 font-medium line-through" : "text-slate-700"}`}>{label}</span>
                      </label>
                    ))}
                    <button onClick={openHotelStep} className="w-full mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                      {isAirbnbStay ? "Confirm Airbnb details →" : "Validate hotel details →"}
                    </button>
                  </div>
                </div>
              </div>

              {!allWorkflowComplete && (
                <div className="mx-5 mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
                  <span className="text-amber-500 text-lg">⚠️</span>
                  <p className="text-sm text-amber-800 font-medium">Complete all steps above before proceeding to payment.</p>
                  <button onClick={refreshWorkflow} className="ml-auto flex-shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700">↺ Refresh</button>
                </div>
              )}
            </section>

            {/* FLIGHT SECTION */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">✈️</div>
                <h2 className="text-lg font-black text-white">Your Flight</h2>
                <span className="ml-auto text-blue-200 text-sm font-bold">{flight.price || ""}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4">
                  {flight.carrierLogo && (
                    <img src={flight.carrierLogo} alt={flight.airline} className="h-14 w-14 rounded-full border border-slate-200 bg-white p-1 object-contain shadow-sm flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-black text-slate-900">{flight.airline}</span>
                      {flight.flightNumber && <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded">{flight.flightNumber}</span>}
                      {flight.layovers === 0 && <span className="bg-green-100 text-green-700 text-[10px] font-bold rounded-full px-2 py-0.5">DIRECT</span>}
                      {flight.layovers > 0 && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full px-2 py-0.5">{flight.layovers} stop{flight.layovers > 1 ? "s" : ""}</span>}
                    </div>
                    {/* Timeline */}
                    {flight.times && (
                      <div className="flex items-center gap-2 mb-2 w-full">
                        <div className="text-center flex-shrink-0">
                          <p className="text-lg font-black text-slate-900 whitespace-nowrap">{flight.times.split("–")[0]?.trim()}</p>
                          <p className="text-xs text-slate-500">Departure</p>
                        </div>
                        <div className="flex-1 relative flex items-center min-w-0">
                          <div className="h-px w-full bg-slate-200" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-white px-1 text-[10px] text-slate-400 whitespace-nowrap">{flight.duration}</span>
                          </div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <p className="text-lg font-black text-slate-900 whitespace-nowrap">{flight.times.split("–")[1]?.trim()}</p>
                          <p className="text-xs text-slate-500">Arrival</p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {flight.route && <span>📍 {flight.route}</span>}
                      {flight.fare && <span>· {flight.fare}</span>}
                      {flight.bags && <span>· {flight.bags}</span>}
                      {flight.date && <span>· 📅 {flight.date}</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                  <p className="text-xs text-blue-700 font-semibold">📜 Fare rules: Flexible changes with fee · Cancellation subject to airline policy</p>
                </div>
              </div>
            </section>

            {/* STAYS */}
            {uniqueHotels.map((stay, idx) => {
              const type = getAccommodationType(stay);
              const label = type === "Yacht" ? "Yacht" : type === "Residence" ? "ZeniStay" : "Hotel";
              const icon = type === "Yacht" ? "⛵" : type === "Residence" ? "🏡" : "🏨";
              const stayImages = getAccommodationImages(stay, type);
              const stayKey = String(stay?.id || stay?.name || idx);
              const isExpanded = Boolean(expandedStayPhotos?.[stayKey]);
              const visibleImages = isExpanded ? stayImages : stayImages.slice(0, 9);
              const gradient = type === "Yacht" ? "from-cyan-600 to-blue-700" : type === "Residence" ? "from-orange-500 to-amber-600" : "from-purple-600 to-purple-700";
              return (
                <section key={stayKey} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                  <div className={`bg-gradient-to-r ${gradient} px-6 py-4 flex items-center gap-3`}>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">{icon}</div>
                    <div>
                      <h2 className="text-lg font-black text-white">{label}</h2>
                      <p className="text-white/80 text-xs">{stay.location || "Central location"}</p>
                    </div>
                    {stay.rating && (
                      <span className="ml-auto bg-white/20 text-white text-xs font-bold rounded-full px-3 py-1">★ {stay.rating}</span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{stay.name}</h3>
                      <p className="text-slate-500 text-sm mt-1">
                        {type === "Yacht"
                          ? stay.specs || "Yacht specs"
                          : type === "Residence"
                          ? stay.room || "Private villa"
                          : `${stay.room || "Deluxe Room"} · Board: Breakfast`}
                      </p>
                      {type === "Yacht" && stay.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {stay.amenities.slice(0, 6).map((a, i) => (
                            <span key={i} className="bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs rounded-full px-2.5 py-1">{a}</span>
                          ))}
                        </div>
                      )}
                      {type !== "Yacht" && (
                        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-600">
                          📜 Free cancellation until 7 days before arrival · Pay at property or prepaid per partner terms
                        </div>
                      )}
                    </div>

                    {stayImages.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Photo gallery · {stayImages.length} photos</p>
                        <div className="grid grid-cols-3 gap-2">
                          {visibleImages.map((src, i) => (
                            <button key={i} onClick={() => setActivePhoto(src)} className="aspect-square overflow-hidden rounded-xl group relative shadow-sm">
                              <img src={src} alt={`${label} ${i + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                            </button>
                          ))}
                        </div>
                        {!isExpanded && stayImages.length > 9 && (
                          <button
                            onClick={() => setExpandedStayPhotos((prev) => ({ ...prev, [stayKey]: true }))}
                            className="mt-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            + {stayImages.length - 9} more photos
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}

            {/* ACTIVITIES */}
            {activityList.length > 0 && (
              <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🎯</div>
                  <h2 className="text-lg font-black text-white">Experiences</h2>
                </div>
                <div className="p-5 space-y-4">
                  {activityList.map((act, idx) => (
                    <div key={`activity-${idx}-${act?.id || act?.name}`} className="flex gap-4 rounded-xl border border-slate-200 overflow-hidden">
                      {act.image && (
                        <button onClick={() => setActivePhoto(act.image)} className="w-32 flex-shrink-0 overflow-hidden">
                          <img src={act.image} alt={act.name} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                        </button>
                      )}
                      <div className="flex-1 p-4">
                        <p className="font-black text-slate-900">{act.name}</p>
                        <p className="text-xs text-slate-500 mt-1">📅 {act.date} at {act.time} · {act.supplier}</p>
                        <p className="text-xs text-emerald-700 mt-1 font-semibold">✓ Includes: Guided tour, entrance fees, transportation</p>
                        {act.price && <p className="text-sm font-black text-emerald-600 mt-2">{act.price}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TRANSFERS */}
            {transferList.length > 0 && (
              <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🚗</div>
                  <h2 className="text-lg font-black text-white">Transfers</h2>
                </div>
                <div className="p-5 space-y-4">
                  {transferList.map((item, idx) => (
                    <div key={`transfer-${idx}-${item?.id || item?.name}`} className="flex gap-4 rounded-xl border border-slate-200 overflow-hidden">
                      {item.image && (
                        <button onClick={() => setActivePhoto(item.image)} className="w-32 flex-shrink-0 overflow-hidden">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                        </button>
                      )}
                      <div className="flex-1 p-4">
                        <p className="font-black text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-1">📍 {item.route} · 📅 {item.date} · {item.supplier}</p>
                        <p className="text-xs text-orange-700 mt-1 font-semibold">{item.shared ? "🚌 Shared transfer" : "🚗 Private transfer"} · {item.vehicle}</p>
                        {item.price && <p className="text-sm font-black text-orange-600 mt-2">{item.price}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PRICE BREAKDOWN — same SelectedSummary as /select page */}
            <SelectedSummary
              flight={selection?.flight}
              hotel={selection?.hotel}
              villa={selection?.villa}
              shortterm={selection?.shortterm}
              activity={selection?.activity}
              transfer={selection?.transfer}
              car={selection?.car}
              tripDraft={tripDraft}
              onProceed={onPay}
            />
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="space-y-4 sticky top-4">
            {/* Summary card */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100" style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%)" }}>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Trip Summary</p>
                <p className="text-white font-black text-lg mt-0.5">{tripDraft?.destination || "Your Trip"}</p>
              </div>
              <div className="px-5 py-4 space-y-3 bg-white">
                {[
                  { icon: "📍", label: "Route", value: `${tripDraft?.departureCity || "TBC"} → ${tripDraft?.destination || "Destination"}` },
                  { icon: "📅", label: "Dates", value: tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} → ${tripDraft.checkOut}` : "Flexible" },
                  { icon: "👥", label: "Travelers", value: `${tripDraft?.adults || "2"} traveler${(tripDraft?.adults || 2) > 1 ? "s" : ""}` },
                  { icon: "✈️", label: "Flight", value: flight?.airline ? `${flight.airline} · ${flight.route || ""}` : "Selected" },
                  { icon: isAirbnbStay ? "🏡" : "🏨", label: isAirbnbStay ? "ZeniStay" : "Stay", value: uniqueHotels[0]?.name || "Selected" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                      <p className="text-slate-800 text-xs font-semibold truncate mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total — uses SelectedSummary logic for consistency */}
              {(selection?.flight || selection?.hotel || selection?.villa || selection?.car || selection?.shortterm || selection?.activity || selection?.transfer) && (() => {
                const pm = (v) => { if (!v) return 0; const n = parseFloat(String(v).replace(/[^0-9.]/g,"")); return isNaN(n) ? 0 : n; };
                const fl = selection?.flight;
                let ft = 0;
                if (fl?.outbound && fl?.inbound) ft = pm(fl.outbound.price) + pm(fl.inbound.price);
                else if (fl) ft = pm(fl.price);
                const ht = (() => {
                  const h = selection?.hotel;
                  if (!h) return 0;
                  // Prefer explicit numeric fields (LiteAPI now exposes them).
                  if (typeof h.priceTotal === "number" && h.priceTotal > 0) return h.priceTotal;
                  const np = pm(h.price);
                  if (np <= 0) return 0;
                  if (typeof h.pricePerNight === "number" && h.pricePerNight > 0) {
                    const ni = pm(h.nights) || pm(tripDraft?.nights) || 5;
                    return h.pricePerNight * ni;
                  }
                  // Legacy fallback: only multiply if the price string mentions "/night"
                  const isPerNight = /night|nuit/i.test(String(h.price || ""));
                  if (isPerNight) {
                    const ni = pm(h.nights) || pm(tripDraft?.nights) || 5;
                    return np * ni;
                  }
                  return np;
                })();
                const vt = pm(selection?.villa?.price) || pm(selection?.shortterm?.price) || 0;
                const at = pm(selection?.activity?.price) || 0;
                const tt = pm(selection?.transfer?.price) || 0;
                const ct = pm(selection?.car?.price) || 0;
                const sub = ft + ht + vt + at + tt + ct;
                const total = sub > 0 ? Math.round((sub * 1.06) * 100) / 100 : 0;
                return total > 0 ? (
                <div className="px-5 pb-4">
                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
                    <p className="text-slate-700 text-sm font-bold">Total</p>
                    <p className="font-black text-xl text-amber-600">{formatCurrency(total)}</p>
                  </div>
                </div>
                ) : null;
              })()}

              {/* CTA */}
              <div className="px-5 pb-5 space-y-3">
                {isAgentMode ? (
                  <>
                    <button
                      onClick={handleShare}
                      disabled={!allWorkflowComplete}
                      className="w-full rounded-xl py-3.5 text-sm font-black tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white"
                      style={{ backgroundColor: "#0F6CF5" }}
                    >
                      📤 Send to client for payment
                    </button>
                    <button
                      onClick={onPay}
                      disabled={!allWorkflowComplete}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-40"
                    >
                      👁 Preview payment page
                    </button>
                    {/* Email status / fallback */}
                    {shareStatus && (
                      <div className={`rounded-xl px-3 py-2 text-[11px] font-semibold break-all ${shareStatus.startsWith("✅") ? "bg-green-50 border border-green-200 text-green-700" : shareStatus.startsWith("⚠️") ? "bg-amber-50 border border-amber-200 text-amber-700" : "bg-slate-50 border border-slate-200 text-slate-500"}`}>
                        {shareStatus}
                      </div>
                    )}
                    {/* Manual link */}
                    {shareUrl && (
                      <button onClick={() => navigator.clipboard.writeText(shareUrl).then(() => setShareStatus("🔗 Link copied!"))}
                        className="w-full rounded-xl border border-slate-200 py-2 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 transition">
                        📋 Copy checkout link
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={onPay}
                    disabled={!allWorkflowComplete}
                    className="w-full rounded-xl py-3.5 text-sm font-black tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: allWorkflowComplete
                        ? "linear-gradient(135deg, #E6B85A, #d4a442)"
                        : "#555",
                      color: allWorkflowComplete ? "#1a0f00" : "#aaa",
                      boxShadow: allWorkflowComplete ? "0 4px 15px rgba(230,184,90,0.4)" : "none",
                    }}
                  >
                    {paying ? "Redirecting to ZeniPay..." : "✓ Pay securely via ZeniPay →"}
                  </button>
                )}
                <p className="text-center text-slate-500 text-[10px]">🔒 Secure · Cancellation policy applies</p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[["🔒", "Secure Pay"], ["↩️", "Cancellation"], ["⭐", "Best Rate"]].map(([icon, label]) => (
                  <div key={label}>
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-[10px] font-bold text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit selections shortcut */}
            <button
              onClick={() => router.push(`/proposals/${tripId}/select${modeSuffix}`)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              ✏️ Edit selections
            </button>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-[92vw] max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto} alt="Enlarged" className="max-w-[92vw] max-h-[92vh] object-contain rounded-2xl shadow-2xl" />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-white text-slate-900 border border-slate-200 font-black text-lg shadow-lg hover:bg-slate-50 transition"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ProposalReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>}>
      <ProposalReviewPageInner />
    </Suspense>
  );
}
