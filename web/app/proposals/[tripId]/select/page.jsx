"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, PREMIUM_BLUE, TITLE_TEXT } from "../../../../src/design/tokens";
import { useTripsStore, generateProposal, setProposalSelection, applyTripPatch } from "../../../../lib/store/tripsStore";
import SelectedSummary from "../../../../src/components/SelectedSummary";
import { getImagesForDestination, getPartnerHotelImages } from "../../../../src/lib/images";
import { applyFlightMarkupLabel, applyHotelMarkupLabel } from "../../../../src/lib/partnerMarkup";
import yachtsData from "../../../../src/data/ycn_packages.json";
import residencesData from "../../../../src/data/airbnbs.json";
import { activities as activitiesData } from "../../../../src/data/activities";
import { transfers as transfersData } from "../../../../src/data/transfers";

// Mock hotels fallback when Duffel stays fails (404 in sandbox) - declare ONLY ONCE at the top of the file!
const getMockHotels = (destination) => {
  const dest = destination?.toLowerCase() || "";
  if (dest.includes("paris")) {
    return [
      { id: "mock-paris-1", name: "Hotel Ritz Paris", location: "Place Vendôme, Paris", price: applyHotelMarkupLabel("USD 1260/night"), room: "Deluxe Suite", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
      { id: "mock-paris-2", name: "Hotel Plaza Athénée", location: "Avenue Montaigne, Paris", price: applyHotelMarkupLabel("USD 998/night"), room: "Superior Room", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80" },
    ];
  } else if (dest.includes("miami") || dest.includes("mia")) {
    return [
      { id: "mock-miami-1", name: "The Ritz-Carlton South Beach", location: "South Beach, Miami", price: applyHotelMarkupLabel("USD 600/night"), room: "Ocean View Suite", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
      { id: "mock-miami-2", name: "Fontainebleau Miami Beach", location: "Miami Beach, FL", price: applyHotelMarkupLabel("USD 450/night"), room: "Standard Room", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80" },
    ];
  } else {
    return [
      { id: "mock-stay-1", name: "Hotel Playa", location: "Resort Area", price: applyHotelMarkupLabel("USD 420/night"), room: "King Room", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
      { id: "mock-stay-2", name: "Central Hotel", location: "City Center", price: applyHotelMarkupLabel("USD 380/night"), room: "Suite", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80" },
    ];
  }
};

const iataMap = {
  "Quebec": "YQB",
  "Québec": "YQB",
  "Montreal": "YUL",
  "Montréal": "YUL",
  "Toronto": "YYZ",
  "Vancouver": "YVR",
  "Miami": "MIA",
  "Paris": "CDG",
  "New York": "JFK",
  "London": "LHR",
  "Cancun": "CUN",
};

function resolveIATA(city) {
  if (!city) return "";
  const normalized = city.trim().toLowerCase();
  // Case-insensitive lookup in iataMap
  for (const [k, v] of Object.entries(iataMap)) {
    const key = k.toLowerCase();
    if (key === normalized || normalized.includes(key) || key.includes(normalized)) {
      return v;
    }
  }
  const upper = city.toUpperCase();
  // If already 3 letters, assume IATA
  if (upper.length === 3 && /^[A-Z]{3}$/.test(upper)) return upper;
  return upper.slice(0, 3); // fallback
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function residenceMatchesDestination(residence, destination) {
  const normalizedDestination = normalizeText(destination);
  if (!normalizedDestination) return false;

  const destinationIata = resolveIATA(destination);
  const destinationCandidates = Object.keys(iataMap).filter(
    (city) => iataMap[city] === destinationIata
  );

  const haystack = normalizeText(
    [
      residence?.location,
      residence?.title,
      residence?.description,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (!haystack) return false;
  if (haystack.includes(normalizedDestination)) return true;

  return destinationCandidates.some((city) => haystack.includes(normalizeText(city)));
}

function parsePriceValue(value) {
  if (value === null || value === undefined) return Number.NaN;
  const normalized = String(value).replace(/[^0-9.,]/g, "").replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function getStopsCount(stopsLabel) {
  if (!stopsLabel) return 0;
  if (/nonstop/i.test(stopsLabel)) return 0;
  const m = String(stopsLabel).match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

function getAirlineLogoFromFlight(flight) {
  const explicit = String(flight?.carrierCode || "").trim().toUpperCase();
  const fromNumber = String(flight?.flightNumber || flight?.code || "")
    .trim()
    .toUpperCase()
    .match(/^([A-Z0-9]{2})/)?.[1] || "";
  const code = explicit || fromNumber;
  return code ? `https://images.kiwi.com/airlines/64/${code}.png` : "";
}

function getPartnerLogo(partner) {
  const key = String(partner || "").trim().toLowerCase();
  if (!key) return "";
  const map = {
    duffel: "https://logo.clearbit.com/duffel.com",
    hotelbeds: "https://logo.clearbit.com/hotelbeds.com",
    airbnb: "https://logo.clearbit.com/airbnb.com",
    ycn: "https://logo.clearbit.com/yachtcharternetwork.com",
    zeniva: "https://logo.clearbit.com/zenivatravel.com",
  };
  return map[key] || "";
}

function getTimeBucket(timeLabel) {
  const raw = String(timeLabel || "").trim().toUpperCase();
  if (!raw) return "any";

  let hour = Number(raw.match(/^(\d{1,2})/)?.[1] || Number.NaN);
  const isPM = raw.includes("PM");
  const isAM = raw.includes("AM");
  if (Number.isFinite(hour)) {
    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }

  if (raw.includes("MORNING")) return "morning";
  if (raw.includes("AFTERNOON")) return "afternoon";
  if (raw.includes("EVENING")) return "evening";
  if (raw.includes("NIGHT")) return "night";
  return "any";
}

export default function ProposalSelectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const mode = searchParams?.get("mode") || "";
  const isAgentMode = mode === "agent";
  const modeSuffix = isAgentMode ? "?mode=agent" : "";

  const [flights, setFlights] = useState([]);
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [flightLeg, setFlightLeg] = useState("outbound");
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [activities, setActivities] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [errorFlights, setErrorFlights] = useState(null);
  const [errorHotels, setErrorHotels] = useState(null);
  const [errorActivities, setErrorActivities] = useState(null);
  const [errorTransfers, setErrorTransfers] = useState(null);
  const [selectedTransferKey, setSelectedTransferKey] = useState("");
  const [expandedFlightId, setExpandedFlightId] = useState("");
  const [filters, setFilters] = useState({
    flightQuery: "",
    flightDirectOnly: false,
    flightMaxStops: "",
    flightMaxPrice: "",
    flightCabin: "all",
    flightSort: "best",
    selectedAirlines: [],
    hotelQuery: "",
    hotelProvider: "all",
    hotelType: "all",
    hotelMaxPrice: "",
    hotelMinRating: "",
    activityQuery: "",
    activitySupplier: "all",
    activityMaxPrice: "",
    activityWhen: "any",
    transferQuery: "",
    transferSupplier: "all",
    transferType: "any",
    transferMaxPrice: "",
  });

  const { proposal, selection, tripDraft, snapshot } = useTripsStore((s) => ({
    proposal: s.proposals[tripId],
    selection: s.selections[tripId] || { flight: null, hotel: null, activity: null, transfer: null },
    tripDraft: s.tripDrafts[tripId] || {},
    snapshot: s.snapshots[tripId] || {},
  }));

  useEffect(() => {
    if (tripId && !proposal) {
      generateProposal(tripId);
    }
    
    // Auto-initialize tripDraft with snapshot data if missing
    if (snapshot && Object.keys(snapshot).length > 0) {
      const missingData = {};
      if (!tripDraft.departureCity && snapshot.departure) {
        missingData.departureCity = snapshot.departure.split(' - ')[0] || snapshot.departure;
      }
      if (!tripDraft.destination && snapshot.destination) {
        missingData.destination = snapshot.destination.split(' - ')[0] || snapshot.destination;
      }
      if (!tripDraft.checkIn && snapshot.dates) {
        const dates = snapshot.dates.split(' → ');
        if (dates[0]) missingData.checkIn = dates[0];
        if (dates[1]) missingData.checkOut = dates[1];
      }
      if (!tripDraft.adults && snapshot.travelers) {
        const adultsMatch = snapshot.travelers.match(/(\d+)\s+adult/);
        if (adultsMatch) missingData.adults = parseInt(adultsMatch[1]);
      }
      
      if (Object.keys(missingData).length > 0) {
        applyTripPatch(tripId, missingData);
      }
    }
  }, [tripId, proposal, snapshot, tripDraft]);

  const heroImage = useMemo(() => {
    // Use selected accommodation image if available, otherwise fallback to destination images
    if (selection?.hotel?.image) {
      return selection.hotel.image;
    }
    const dest = tripDraft?.destination || proposal?.title || "trip";
    return getImagesForDestination(dest)[0];
  }, [tripDraft, proposal, selection]);

  // Basic date parsing from tripDraft.checkIn/checkOut
  const parsedDates = useMemo(() => {
    const depart = tripDraft?.checkIn || "";
    const ret = tripDraft?.checkOut || "";
    return { depart, ret };
  }, [tripDraft]);

  const hasReturnLeg = Boolean(String(tripDraft?.checkOut || parsedDates.ret || "").trim());

  const flightSearchContext = useMemo(() => {
    const origin =
      resolveIATA(tripDraft?.departureCity) ||
      resolveIATA(snapshot?.departure?.split(" - ")[0]) ||
      "";
    const destination =
      resolveIATA(tripDraft?.destination) ||
      resolveIATA(snapshot?.destination?.split(" - ")[0]) ||
      "";
    const date =
      tripDraft?.checkIn ||
      parsedDates.depart ||
      (snapshot?.dates?.split(" → ")[0]) ||
      selection?.flight?.outbound?.date ||
      selection?.flight?.date ||
      "";

    const returnDate =
      tripDraft?.checkOut ||
      parsedDates.ret ||
      (snapshot?.dates?.split(" → ")[1]) ||
      selection?.flight?.inbound?.date ||
      "";

    return {
      origin: String(origin || "").toUpperCase(),
      destination: String(destination || "").toUpperCase(),
      date: String(date || "").trim(),
      returnDate: String(returnDate || "").trim(),
    };
  }, [
    tripDraft?.departureCity,
    tripDraft?.destination,
    tripDraft?.checkIn,
    tripDraft?.checkOut,
    snapshot?.departure,
    snapshot?.destination,
    snapshot?.dates,
    parsedDates.depart,
    parsedDates.ret,
    selection?.flight?.date,
    selection?.flight?.outbound?.date,
    selection?.flight?.inbound?.date,
  ]);

  useEffect(() => {
    const origin = flightSearchContext.origin;
    const destination = flightSearchContext.destination;
    const date = flightSearchContext.date;
    const returnDate = flightSearchContext.returnDate;

    if (!origin || !destination || !date) {
      setFlights([]);
      setOutboundFlights([]);
      setReturnFlights([]);
      setSelectedOutbound(null);
      setErrorFlights("Missing origin, destination, or departure date in trip data");
      setLoadingFlights(false);
      return;
    }

    const mapOffer = (o, idx, originFallback, destinationFallback) => {
      const slice = o?.slices?.[0];
      const firstSeg = slice?.segments?.[0];
      const lastSeg = slice?.segments?.[slice?.segments?.length - 1];
      const segments = Array.isArray(slice?.segments)
        ? slice.segments.map((seg) => ({
            marketingCarrier: seg?.marketing_carrier?.name,
            operatingCarrier: seg?.operating_carrier?.name,
            marketingFlightNumber: seg?.marketing_carrier_flight_number,
            operatingFlightNumber: seg?.operating_carrier_flight_number,
            departingAt: seg?.departing_at,
            arrivingAt: seg?.arriving_at,
            origin: {
              code: seg?.origin?.iata_code,
              name: seg?.origin?.iata_city_name || seg?.origin?.name || seg?.origin?.iata_code,
              airport: seg?.origin?.name,
            },
            destination: {
              code: seg?.destination?.iata_code,
              name: seg?.destination?.iata_city_name || seg?.destination?.name || seg?.destination?.iata_code,
              airport: seg?.destination?.name,
            },
            aircraft: seg?.aircraft?.name || seg?.aircraft?.iata_code,
          }))
        : [];

      const departureTime = firstSeg?.departing_at ? new Date(firstSeg.departing_at) : null;
      const arrivalTime = lastSeg?.arriving_at ? new Date(lastSeg.arriving_at) : null;
      const durationMs = departureTime && arrivalTime ? arrivalTime - departureTime : 0;
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const duration = durationMs > 0 ? `${durationHours}h ${durationMinutes}m` : "";
      const dateLabel = departureTime ? departureTime.toLocaleDateString() : "";

      const flightNumber = firstSeg?.marketing_carrier_flight_number || firstSeg?.operating_carrier_flight_number || "";
      const originCode = String(firstSeg?.origin?.iata_code || originFallback || "").toUpperCase();
      const destinationCode = String(lastSeg?.destination?.iata_code || destinationFallback || "").toUpperCase();
      const originName = firstSeg?.origin?.iata_city_name || firstSeg?.origin?.name || originCode;
      const destinationName = lastSeg?.destination?.iata_city_name || lastSeg?.destination?.name || destinationCode;

      return {
        id: o?.id || `offer-${idx}`,
        airline: firstSeg?.marketing_carrier?.name || firstSeg?.operating_carrier?.name || "Airline",
        carrierCode: firstSeg?.marketing_carrier?.iata_code || firstSeg?.operating_carrier?.iata_code || "",
        route: `${originCode} → ${destinationCode}`,
        times: `${firstSeg?.departing_at?.slice(11, 16) || ""} – ${lastSeg?.arriving_at?.slice(11, 16) || ""}`,
        fare: o?.cabin_class || o?.cabin || "",
        price: o?.total_currency && o?.total_amount ? applyFlightMarkupLabel(`${o.total_currency} ${o.total_amount}`) : "Price on request",
        bags: o?.baggage?.included || "",
        flightNumber,
        duration,
        date: dateLabel,
        originName,
        destinationName,
        layovers: (slice?.segments?.length || 1) - 1,
        carrierLogo: getAirlineLogoFromFlight({
          carrierCode: firstSeg?.marketing_carrier?.iata_code || firstSeg?.operating_carrier?.iata_code || "",
          flightNumber,
        }),
        segments,
      };
    };

    const run = async () => {
      setLoadingFlights(true);
      setErrorFlights(null);
      try {
        const outQs = new URLSearchParams({ origin, destination, date });
        const outRes = await fetch(`/api/partners/duffel?${outQs.toString()}`);
        const outJson = await outRes.json();
        if (!outRes.ok || !outJson?.ok) throw new Error(outJson?.error || outRes.statusText);
        const outOffers = outJson?.result?.data?.offers || outJson?.result?.offers || outJson?.offers || [];
        const outMapped = outOffers.map((o, idx) => mapOffer(o, idx, origin, destination));
        setOutboundFlights(outMapped);

        let inMapped = [];
        if (returnDate) {
          const inQs = new URLSearchParams({ origin: destination, destination: origin, date: returnDate });
          const inRes = await fetch(`/api/partners/duffel?${inQs.toString()}`);
          const inJson = await inRes.json();
          if (inRes.ok && inJson?.ok) {
            const inOffers = inJson?.result?.data?.offers || inJson?.result?.offers || inJson?.offers || [];
            inMapped = inOffers.map((o, idx) => mapOffer(o, idx, destination, origin));
          }
        }
        setReturnFlights(inMapped);
      } catch (e) {
        setFlights([]);
        setOutboundFlights([]);
        setReturnFlights([]);
        setSelectedOutbound(null);
        setErrorFlights(e?.message || "Failed to load flights");
      } finally {
        setLoadingFlights(false);
      }
    };

    run();
  }, [flightSearchContext.origin, flightSearchContext.destination, flightSearchContext.date, flightSearchContext.returnDate]);

  useEffect(() => {
    const next = flightLeg === "return" ? returnFlights : outboundFlights;
    setFlights(Array.isArray(next) ? next : []);
    setExpandedFlightId("");
  }, [flightLeg, outboundFlights, returnFlights]);

  // Auto-select first outbound option for the user.
  useEffect(() => {
    if (selection?.flight) return;
    if (outboundFlights.length === 0) return;
    setSelectedOutbound(outboundFlights[0]);
    setProposalSelection(tripId, { flight: outboundFlights[0] });
  }, [outboundFlights, selection?.flight, tripId]);

  useEffect(() => {
    const accommodationType = tripDraft?.accommodationType;
    const style = tripDraft?.style || "";
    const destination = tripDraft?.destination || "Paris";
    const checkIn = tripDraft?.checkIn || "2026-02-01";
    const checkOut = tripDraft?.checkOut || "2026-02-03";

    // Check if yachts should be loaded based on accommodationType or style
    const shouldLoadYachts = accommodationType === "Yacht" || 
                            style.toLowerCase().includes('yacht') || 
                            style.toLowerCase().includes('boat') || 
                            style.toLowerCase().includes('charter');

    if (shouldLoadYachts) {
      // Load yachts from Zeniva inventory
      const filteredYachts = yachtsData.filter(y => y.destination.toLowerCase().includes(destination.toLowerCase()) || !destination);
      const mappedYachts = filteredYachts.map(y => ({
        id: y.id,
        name: y.title,
        location: y.destination,
        price: y.prices?.[0] || "Price on request",
        rating: 4.9,
        provider: "YCN",
        type: "yacht",
        room: "Yacht",
        image: y.images?.[0] || y.thumbnail || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
        images: y.images || [y.thumbnail].filter(Boolean), // Include all images for gallery
        specs: y.specs,
        amenities: y.amenities,
      }));
      setHotels(mappedYachts);
      const currentId = String(selection?.hotel?.id || "").trim();
      const stillExists = currentId ? mappedYachts.some((h) => String(h?.id || "").trim() === currentId) : false;
      if (!selection?.hotel || !stillExists) {
        setProposalSelection(tripId, { hotel: mappedYachts[0] || null });
      }
      // Ensure accommodationType is set to "Yacht" in trip draft
      if (tripDraft?.accommodationType !== "Yacht") {
        applyTripPatch(tripId, { accommodationType: "Yacht" });
      }
      setLoadingHotels(false);
      return;
    }

    const normalizedStyle = (style || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (accommodationType === "Residence" || accommodationType === "Airbnb" || normalizedStyle.includes('private') || normalizedStyle.includes('residence')) {
      // Load residences linked to trip destination only
      const filteredResidences = residencesData.filter((residence) =>
        residenceMatchesDestination(residence, destination)
      );
      const mappedResidences = filteredResidences.map(a => {
        const desc = a.description;
        const bedroomsMatch = desc.match(/Bedrooms\s*\n\s*(\d+)/i);
        const bathroomsMatch = desc.match(/Bathrooms\s*\n\s*(\d+)/i);
        const bedrooms = bedroomsMatch ? bedroomsMatch[1] : '?';
        const bathrooms = bathroomsMatch ? bathroomsMatch[1] : '?';
        return {
          id: a.id,
          name: a.title,
          location: a.location,
          price: "Price on request", // or parse from description
          rating: 4.8,
          provider: "Airbnb",
          type: "residence",
          room: `${bedrooms} bed • ${bathrooms} bath`,
          image: a.images?.[0] || a.thumbnail,
        };
      });
      setHotels(mappedResidences);
      const currentId = String(selection?.hotel?.id || "").trim();
      const stillExists = currentId ? mappedResidences.some((h) => String(h?.id || "").trim() === currentId) : false;
      if (!selection?.hotel || !stillExists) {
        setProposalSelection(tripId, { hotel: mappedResidences[0] || null });
      }
      // Ensure accommodationType is set to "Residence" in trip draft
      if (tripDraft?.accommodationType !== "Residence") {
        applyTripPatch(tripId, { accommodationType: "Residence" });
      }
      if (mappedResidences.length === 0) {
        setErrorHotels(`No short-term rentals found for ${destination}.`);
      } else {
        setErrorHotels(null);
      }
      setLoadingHotels(false);
      return;
    }

    // Default to Hotel: use LiteAPI (live)
    if (!destination || !checkIn || !checkOut) {
      setHotels([]);
      setErrorHotels("Missing destination or dates in trip draft");
      return;
    }

    if (tripDraft?.accommodationType !== "Hotel") {
      applyTripPatch(tripId, { accommodationType: "Hotel" });
    }

    const run = async () => {
      setLoadingHotels(true);
      setErrorHotels(null);
      try {
        const qs = new URLSearchParams({
          destination: String(destination),
          checkIn,
          checkOut,
          guests: String(tripDraft?.adults || 2),
          rooms: "1",
        }).toString();

        const res = await fetch(`/api/partners/liteapi/hotels/search?${qs}`);
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText);

        const list = Array.isArray(json?.offers) ? json.offers : [];
        const normalizedHotels = list.map((h) => ({
          id: h.id,
          name: h.name,
          location: h.location,
          price: h.price,
          room: h.room || "Room",
          rating: Number(h.rating || 0),
          badge: h.badge,
          image: h.image,
          images: [h.image].filter(Boolean),
          type: "hotel",
          provider: "liteapi",
          perks: Array.isArray(h.perks) ? h.perks : [],
        }));

        setHotels(normalizedHotels);
        const currentId = String(selection?.hotel?.id || "").trim();
        const stillExists = currentId ? normalizedHotels.some((h) => String(h?.id || "").trim() === currentId) : false;
        if (!selection?.hotel || !stillExists) {
          setProposalSelection(tripId, { hotel: normalizedHotels[0] || null });
        }
      } catch (e) {
        console.error("Hotels fetch error:", e);
        setHotels([]);
        setProposalSelection(tripId, { hotel: null });
        setErrorHotels(e?.message || "Failed to load hotels");
      } finally {
        setLoadingHotels(false);
      }
    };

    run();
  }, [tripDraft?.accommodationType, tripDraft?.destination, tripDraft?.checkIn, tripDraft?.checkOut, tripDraft?.adults, tripDraft?.budget, tripId, selection?.hotel?.location]);

  // Load activities from Hotelbeds API
  useEffect(() => {
    const destination = tripDraft?.destination || selection?.hotel?.location || "";
    const checkIn = tripDraft?.checkIn || "";
    const checkOut = tripDraft?.checkOut || "";

    if (!destination || !checkIn || !checkOut) {
      setActivities([]);
      setErrorActivities("Missing destination or dates in trip draft");
      return;
    }

    const run = async () => {
      setLoadingActivities(true);
      setErrorActivities(null);
      try {
        console.log(`🔄 Loading activities for ${destination}`);
        const response = await fetch('/api/partners/hotelbeds/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: destination,
            from: checkIn,
            to: checkOut,
            adults: tripDraft?.adults || 2,
            children: 0,
            language: "en"
          })
        });

        const data = await response.json();
        if (!response.ok || !data?.ok) {
          throw new Error(data?.error || `API returned ${response.status}`);
        }

        const mappedActivities = (data.activities || []).map(a => ({
          id: a.id,
          name: a.title,
          location: a.location,
          date: a.startDateTime ? new Date(a.startDateTime).toLocaleDateString() : "",
          time: a.startDateTime ? new Date(a.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
          price: a.price,
          supplier: a.supplierRef,
          provider: "Hotelbeds",
          rating: Number(a?.content?.rating || 4.6),
          category: a?.type || "activity",
          description: a.description || a.title,
          image: a.images?.[0] || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
          images: a.images || [],
          type: 'activity',
          rawPayload: a
        }));

        setActivities(mappedActivities);
        console.log(`✅ Loaded ${mappedActivities.length} activities`);

        // Auto-select first activity if none selected and activities were requested
        if (mappedActivities.length > 0 && !selection?.activity && tripDraft?.includeActivities) {
          setProposalSelection(tripId, { activity: mappedActivities[0] });
        }
      } catch (e) {
        console.error('Failed to load activities:', e);
        setActivities([]);
        setErrorActivities(e?.message || "Failed to load activities");
      } finally {
        setLoadingActivities(false);
      }
    };

    run();
  }, [tripDraft?.destination, tripDraft?.checkIn, tripDraft?.checkOut, tripDraft?.adults, tripDraft?.includeActivities, tripId, selection?.hotel?.location, selection?.activity]);

  // Load transfers from Hotelbeds API
  useEffect(() => {
    const destination = tripDraft?.destination || selection?.hotel?.location || "";
    const checkIn = tripDraft?.checkIn || "";

    if (!destination || !checkIn) {
      setTransfers([]);
      setErrorTransfers("Missing destination or check-in date in trip draft");
      return;
    }

    const run = async () => {
      setLoadingTransfers(true);
      setErrorTransfers(null);
      try {
        console.log(`🔄 Loading transfers for ${destination}`);
        const response = await fetch('/api/partners/hotelbeds/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pickupLocation: `${destination} Airport`,
            dropoffLocation: `${destination} City Center`,
            pickupDate: checkIn,
            pickupTime: "10:00",
            adults: tripDraft?.adults || 2,
            children: 0,
            transferType: "PRIVATE",
            direction: "ONE_WAY"
          })
        });

        const data = await response.json();
        if (!response.ok || !data?.ok) {
          throw new Error(data?.error || `API returned ${response.status}`);
        }

        const mappedTransfers = (data.transfers || []).map((t, idx) => ({
          id: t.id || `${t.supplierRef || "transfer"}-${t.title || "item"}-${t.startDateTime || idx}`,
          name: t.title,
          route: t.location,
          date: t.startDateTime ? new Date(t.startDateTime).toLocaleDateString() : "",
          price: t.price,
          supplier: t.supplierRef,
          provider: "Hotelbeds",
          vehicle: t.vehicle?.name || t.transferType,
          shared: t.transferType === "SHARED",
          image: t.images?.[0] || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
          images: t.images || [],
          type: 'transfer',
          rawPayload: t
        }));

        setTransfers(mappedTransfers);
        console.log(`✅ Loaded ${mappedTransfers.length} transfers`);

        // Auto-select first transfer if none selected and transfers were requested
        if (mappedTransfers.length > 0 && !selection?.transfer && tripDraft?.includeTransfers) {
          setProposalSelection(tripId, { transfer: mappedTransfers[0] });
        }
      } catch (e) {
        console.error('Failed to load transfers:', e);
        setTransfers([]);
        setErrorTransfers(e?.message || "Failed to load transfers");
      } finally {
        setLoadingTransfers(false);
      }
    };

    run();
  }, [tripDraft?.destination, tripDraft?.checkIn, tripDraft?.adults, tripDraft?.includeTransfers, tripId, selection?.hotel?.location]);

  const onSelectFlight = (flight) => {
    const parsePrice = (raw) => {
      const s = String(raw || "").trim();
      const m = s.match(/^([A-Z]{3})\s*([0-9,.]+)/i);
      if (!m) return null;
      const currency = m[1].toUpperCase();
      const amount = Number(String(m[2]).replace(/,/g, ""));
      if (!Number.isFinite(amount)) return null;
      return { currency, amount };
    };

    const buildRoundTripFlight = (outbound, inbound) => {
      const outPrice = parsePrice(outbound?.price);
      const inPrice = parsePrice(inbound?.price);
      const canSum = outPrice && inPrice && outPrice.currency === inPrice.currency;
      const totalPrice = canSum ? `${outPrice.currency} ${(outPrice.amount + inPrice.amount).toFixed(2)}` : "Price on request";

      return {
        id: `${outbound?.id || "out"}__${inbound?.id || "in"}`,
        outbound,
        inbound,
        airline: outbound?.airline || "Airline",
        route: `${outbound?.route || ""}${inbound?.route ? ` / ${inbound.route}` : ""}`.trim(),
        times: `${outbound?.times || ""}${inbound?.times ? ` / ${inbound.times}` : ""}`.trim(),
        fare: outbound?.fare || inbound?.fare || "",
        bags: outbound?.bags || "",
        price: totalPrice,
      };
    };

    if (hasReturnLeg && flightLeg === "outbound") {
      setSelectedOutbound(flight);
      setProposalSelection(tripId, { flight });
      setFlightLeg("return");
      return;
    }

    if (hasReturnLeg && flightLeg === "return" && selectedOutbound) {
      setProposalSelection(tripId, { flight: buildRoundTripFlight(selectedOutbound, flight) });
      return;
    }

    setProposalSelection(tripId, { flight });
  };

  const onSelectHotel = (hotel) => {
    setProposalSelection(tripId, { hotel });
  };

  const onSelectActivity = (activity) => {
    setProposalSelection(tripId, { activity });
  };

  const onSelectTransfer = (transfer) => {
    const normalizedTransfer = {
      ...transfer,
      id: transfer?.id || `${transfer?.supplier || "transfer"}-${transfer?.name || "item"}-${transfer?.date || Date.now()}`,
    };
    setSelectedTransferKey(normalizedTransfer.id);
    setProposalSelection(tripId, { transfer: normalizedTransfer });
  };

  useEffect(() => {
    if (selection?.transfer?.id) {
      setSelectedTransferKey(selection.transfer.id);
    }
  }, [selection?.transfer?.id]);

  // Auto-select the first loaded flight if none chosen yet so the summary shows the live route/pricing.
  useEffect(() => {
    if (!selection?.flight && flights.length > 0) {
      setProposalSelection(tripId, { flight: flights[0] });
    }
  }, [flights, selection?.flight, tripId]);

  const airlineOptions = useMemo(
    () => Array.from(new Map(
      flights.map((flight) => {
        const code = String(flight?.carrierCode || "").toUpperCase();
        return [code || flight.airline, {
          code,
          name: flight.airline,
          logo: flight.carrierLogo || getAirlineLogoFromFlight(flight),
        }];
      })
    ).values()).filter((item) => item.name),
    [flights]
  );

  const hotelProviders = useMemo(() => ["all"], []);
  const activitySuppliers = useMemo(
    () => ["all", ...Array.from(new Set(activities.map((activity) => String(activity?.supplier || activity?.provider || "").trim()).filter(Boolean)))],
    [activities]
  );
  const transferSuppliers = useMemo(
    () => ["all", ...Array.from(new Set(transfers.map((transfer) => String(transfer?.supplier || transfer?.provider || "").trim()).filter(Boolean)))],
    [transfers]
  );

  const filteredFlights = useMemo(() => {
    const list = flights
      .filter((flight) => {
        const query = filters.flightQuery.trim().toLowerCase();
        if (query) {
          const hay = `${flight.airline} ${flight.route} ${flight.flightNumber} ${flight.fare}`.toLowerCase();
          if (!hay.includes(query)) return false;
        }

        if (filters.flightDirectOnly && getStopsCount(flight.stops) > 0) return false;
        if (filters.flightMaxStops !== "" && getStopsCount(flight.stops) > Number(filters.flightMaxStops)) return false;
        if (filters.flightMaxPrice !== "") {
          const p = parsePriceValue(flight.price);
          if (Number.isFinite(p) && p > Number(filters.flightMaxPrice)) return false;
        }
        if (filters.flightCabin !== "all" && String(flight.fare || "").toLowerCase() !== String(filters.flightCabin).toLowerCase()) return false;
        if (filters.selectedAirlines.length > 0 && !filters.selectedAirlines.includes(String(flight.carrierCode || "").toUpperCase())) return false;
        return true;
      })
      .slice();

    if (filters.flightSort === "price") {
      list.sort((a, b) => (parsePriceValue(a.price) || Number.MAX_SAFE_INTEGER) - (parsePriceValue(b.price) || Number.MAX_SAFE_INTEGER));
    } else if (filters.flightSort === "duration") {
      list.sort((a, b) => (Number(a.duration?.match(/(\d+)h/)?.[1] || 99) * 60 + Number(a.duration?.match(/(\d+)m/)?.[1] || 0)) - (Number(b.duration?.match(/(\d+)h/)?.[1] || 99) * 60 + Number(b.duration?.match(/(\d+)m/)?.[1] || 0)));
    }

    return list;
  }, [flights, filters]);

  const fmtTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };
  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };
  const diffMinutes = (a, b) => {
    if (!a || !b) return null;
    const da = new Date(a);
    const db = new Date(b);
    if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return null;
    const ms = db.getTime() - da.getTime();
    if (!Number.isFinite(ms) || ms <= 0) return null;
    return Math.round(ms / 60000);
  };
  const fmtDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (!h) return `${m}m`;
    if (!m) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const filteredHotels = useMemo(() => hotels.filter((hotel) => {
    const query = filters.hotelQuery.trim().toLowerCase();
    if (query) {
      const hay = `${hotel.name} ${hotel.location} ${hotel.room}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }

    const hotelType = String(hotel?.type || (hotel?.room === "Yacht" ? "yacht" : "hotel")).toLowerCase();
    if (filters.hotelType !== "all" && hotelType !== filters.hotelType) return false;

    if (filters.hotelMaxPrice !== "") {
      const p = parsePriceValue(hotel.price);
      if (Number.isFinite(p) && p > Number(filters.hotelMaxPrice)) return false;
    }
    if (filters.hotelMinRating !== "") {
      const rating = Number(hotel?.rating || 0);
      if (Number.isFinite(rating) && rating < Number(filters.hotelMinRating)) return false;
    }
    return true;
  }), [hotels, filters]);

  const filteredActivities = useMemo(() => activities.filter((activity) => {
    const query = filters.activityQuery.trim().toLowerCase();
    if (query) {
      const hay = `${activity.name} ${activity.supplier} ${activity.description || ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    if (filters.activitySupplier !== "all") {
      const supplier = String(activity?.supplier || activity?.provider || "").toLowerCase();
      if (supplier !== String(filters.activitySupplier).toLowerCase()) return false;
    }
    if (filters.activityMaxPrice !== "") {
      const p = parsePriceValue(activity.price);
      if (Number.isFinite(p) && p > Number(filters.activityMaxPrice)) return false;
    }
    if (filters.activityWhen !== "any") {
      const bucket = getTimeBucket(activity.time);
      if (bucket !== filters.activityWhen) return false;
    }
    return true;
  }), [activities, filters]);

  const filteredTransfers = useMemo(() => transfers.filter((transfer) => {
    const query = filters.transferQuery.trim().toLowerCase();
    if (query) {
      const hay = `${transfer.name} ${transfer.route} ${transfer.vehicle || ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    if (filters.transferSupplier !== "all") {
      const supplier = String(transfer?.supplier || transfer?.provider || "").toLowerCase();
      if (supplier !== String(filters.transferSupplier).toLowerCase()) return false;
    }
    if (filters.transferType === "private" && transfer.shared) return false;
    if (filters.transferType === "shared" && !transfer.shared) return false;
    if (filters.transferMaxPrice !== "") {
      const p = parsePriceValue(transfer.price);
      if (Number.isFinite(p) && p > Number(filters.transferMaxPrice)) return false;
    }
    return true;
  }), [transfers, filters]);

  const onContinue = () => {
    router.push(`/proposals/${tripId}/review${modeSuffix}`);
  };

  const inferredStaysKind = useMemo(() => {
    const list = Array.isArray(hotels) ? hotels : [];
    if (list.some((item) => String(item?.type || "").toLowerCase() === "yacht")) return "yacht";
    if (list.some((item) => String(item?.type || "").toLowerCase() === "hotel")) return "hotel";
    if (list.some((item) => ["residence", "villa", "airbnb"].includes(String(item?.type || "").toLowerCase()))) return "villa";
    return "";
  }, [hotels]);

  const normalizedAccommodationType = String(tripDraft?.accommodationType || "").trim().toLowerCase();
  const staysKind = inferredStaysKind ||
    (normalizedAccommodationType === "yacht" || normalizedAccommodationType.includes("yacht")
      ? "yacht"
      : normalizedAccommodationType === "airbnb" ||
          normalizedAccommodationType === "residence" ||
          normalizedAccommodationType.includes("villa") ||
          normalizedAccommodationType.includes("residence") ||
          normalizedAccommodationType.includes("airbnb")
        ? "villa"
        : "hotel");
  const staysTitle = staysKind === "yacht" ? "Yachts" : staysKind === "villa" ? "Villas" : "Hotels";
  const staysTitleLower = staysKind === "yacht" ? "yacht" : staysKind === "villa" ? "villa" : "hotel";

  if (!tripId) return null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="w-full px-4 xl:px-6 2xl:px-8 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
              Proposal {tripId}
            </div>
            <h1 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>
              Select your flights and {staysTitleLower}
            </h1>
          </div>
          <button
            onClick={() => router.push(isAgentMode ? `/agent/lina/chat/${tripId}` : `/chat/${tripId}`)}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold"
            style={{ color: PREMIUM_BLUE }}
          >
            {isAgentMode ? "Back to Lina" : "Back to chat"}
          </button>
        </header>

        <div className="relative h-56 w-full overflow-hidden rounded-2xl">
          <img src={heroImage} alt="Destination" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-black/5" />
          <div className="absolute left-6 bottom-6 text-white">
            <div className="text-sm font-semibold">{tripDraft?.destination || "Your trip"}</div>
            <div className="text-2xl font-extrabold">Pick your combo</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_320px] gap-4 items-start">
          <aside className="xl:sticky xl:top-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Zeniva Travel</p>
              <h2 className="text-lg font-black text-slate-900">Advanced filters</h2>
              <p className="text-xs text-slate-500 mt-1">
                Flights {filteredFlights.length} · Stays {filteredHotels.length} · Activities {filteredActivities.length} · Transfers {filteredTransfers.length}
              </p>
            </div>

            <section className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Flights</p>
              <input
                value={filters.flightQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, flightQuery: e.target.value }))}
                placeholder="Airline, route, fare"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  value={filters.flightMaxPrice}
                  onChange={(e) => setFilters((prev) => ({ ...prev, flightMaxPrice: e.target.value }))}
                  placeholder="Max price"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <select
                  value={filters.flightMaxStops}
                  onChange={(e) => setFilters((prev) => ({ ...prev, flightMaxStops: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Any stops</option>
                  <option value="0">Nonstop</option>
                  <option value="1">Up to 1 stop</option>
                  <option value="2">Up to 2 stops</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.flightCabin}
                  onChange={(e) => setFilters((prev) => ({ ...prev, flightCabin: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="all">All cabins</option>
                  <option value="economy">Economy</option>
                  <option value="premium economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First</option>
                </select>
                <select
                  value={filters.flightSort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, flightSort: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="best">Sort: Best</option>
                  <option value="price">Sort: Price</option>
                  <option value="duration">Sort: Duration</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.flightDirectOnly}
                  onChange={(e) => setFilters((prev) => ({ ...prev, flightDirectOnly: e.target.checked }))}
                />
                Direct flights only
              </label>
              {airlineOptions.length > 0 && (
                <div className="max-h-36 overflow-auto rounded-lg border border-slate-200 p-2 space-y-1">
                  {airlineOptions.map((airline) => (
                    <label key={`${airline.code}-${airline.name}`} className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={filters.selectedAirlines.includes(String(airline.code || "").toUpperCase())}
                        onChange={(e) => {
                          const code = String(airline.code || "").toUpperCase();
                          setFilters((prev) => ({
                            ...prev,
                            selectedAirlines: e.target.checked
                              ? Array.from(new Set([...prev.selectedAirlines, code]))
                              : prev.selectedAirlines.filter((item) => item !== code),
                          }));
                        }}
                      />
                      {airline.logo ? <img src={airline.logo} alt={airline.name} className="h-5 w-5 rounded-full border border-slate-200 bg-white" loading="lazy" /> : null}
                      <span>{airline.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Hotels / Stays</p>
              <input value={filters.hotelQuery} onChange={(e) => setFilters((prev) => ({ ...prev, hotelQuery: e.target.value }))} placeholder="Hotel, location, room" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <div className="grid grid-cols-1 gap-2">
                <select value={filters.hotelType} onChange={(e) => setFilters((prev) => ({ ...prev, hotelType: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="all">All types</option>
                  <option value="hotel">Hotel</option>
                  <option value="yacht">Yacht</option>
                  <option value="residence">Residence</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min={0} value={filters.hotelMaxPrice} onChange={(e) => setFilters((prev) => ({ ...prev, hotelMaxPrice: e.target.value }))} placeholder="Max price" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <select value={filters.hotelMinRating} onChange={(e) => setFilters((prev) => ({ ...prev, hotelMinRating: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">Any rating</option>
                  <option value="3">3.0+</option>
                  <option value="4">4.0+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </div>
            </section>

            <section className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Activities</p>
              <input value={filters.activityQuery} onChange={(e) => setFilters((prev) => ({ ...prev, activityQuery: e.target.value }))} placeholder="Name or keyword" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <select value={filters.activitySupplier} onChange={(e) => setFilters((prev) => ({ ...prev, activitySupplier: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {activitySuppliers.map((supplier) => <option key={supplier} value={supplier}>{supplier === "all" ? "All suppliers" : supplier}</option>)}
                </select>
                <select value={filters.activityWhen} onChange={(e) => setFilters((prev) => ({ ...prev, activityWhen: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="any">Any time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <input type="number" min={0} value={filters.activityMaxPrice} onChange={(e) => setFilters((prev) => ({ ...prev, activityMaxPrice: e.target.value }))} placeholder="Max price" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </section>

            <section className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Transfers</p>
              <input value={filters.transferQuery} onChange={(e) => setFilters((prev) => ({ ...prev, transferQuery: e.target.value }))} placeholder="Route, vehicle" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <select value={filters.transferSupplier} onChange={(e) => setFilters((prev) => ({ ...prev, transferSupplier: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {transferSuppliers.map((supplier) => <option key={supplier} value={supplier}>{supplier === "all" ? "All suppliers" : supplier}</option>)}
                </select>
                <select value={filters.transferType} onChange={(e) => setFilters((prev) => ({ ...prev, transferType: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="any">Any type</option>
                  <option value="private">Private</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
              <input type="number" min={0} value={filters.transferMaxPrice} onChange={(e) => setFilters((prev) => ({ ...prev, transferMaxPrice: e.target.value }))} placeholder="Max price" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </section>

            <button
              onClick={() => setFilters({
                flightQuery: "",
                flightDirectOnly: false,
                flightMaxStops: "",
                flightMaxPrice: "",
                flightCabin: "all",
                flightSort: "best",
                selectedAirlines: [],
                hotelQuery: "",
                hotelProvider: "all",
                hotelType: "all",
                hotelMaxPrice: "",
                hotelMinRating: "",
                activityQuery: "",
                activitySupplier: "all",
                activityMaxPrice: "",
                activityWhen: "any",
                transferQuery: "",
                transferSupplier: "all",
                transferType: "any",
                transferMaxPrice: "",
              })}
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Reset filters
            </button>
          </aside>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Flights</div>
                  <h2 className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>Pick one</h2>
                </div>
              </div>

              {hasReturnLeg ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFlightLeg("outbound")}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${flightLeg === "outbound" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}
                  >
                    Outbound
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlightLeg("return")}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${flightLeg === "return" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}
                  >
                    Return
                  </button>
                </div>
              ) : null}

              {loadingFlights && <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700">Loading flights…</div>}
              {errorFlights && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">{errorFlights}</div>}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredFlights.map((f) => {
                  const selectedFlightId = selection?.flight?.inbound?.id || selection?.flight?.outbound?.id || selection?.flight?.id;
                  const active = selectedFlightId === f.id;
                  const airlineLogo = f.carrierLogo || getAirlineLogoFromFlight(f);
                  const isExpanded = expandedFlightId === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => onSelectFlight(f)}
                      className={`w-full text-left rounded-xl border px-4 py-3 shadow-sm transition ${
                        active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {airlineLogo ? (
                            <img
                              src={airlineLogo}
                              alt={f.airline}
                              className="h-10 w-10 rounded-full border border-slate-200 bg-white p-1 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-xs font-bold text-slate-700">
                              {String(f.airline || "A").slice(0, 1)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="text-sm font-bold truncate" style={{ color: TITLE_TEXT }}>
                              {f.airline} • {f.route}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm font-extrabold" style={{ color: PREMIUM_BLUE }}>{f.price}</div>
                      </div>
                      <div className="mt-1 text-xs" style={{ color: MUTED_TEXT }}>
                        {f.times} • {f.fare} • {f.bags}
                      </div>

                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedFlightId((prev) => (prev === f.id ? "" : f.id));
                          }}
                          className="text-xs font-semibold text-blue-700 hover:underline"
                        >
                          Flight details
                        </button>
                      </div>

                      {isExpanded && Array.isArray(f.segments) && f.segments.length > 0 ? (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700">
                          {f.segments.map((seg, segIdx) => {
                            const next = f.segments[segIdx + 1];
                            const layoverMin = next ? diffMinutes(seg.arrivingAt, next.departingAt) : null;
                            const operatedBy = seg.operatingCarrier && seg.marketingCarrier && seg.operatingCarrier !== seg.marketingCarrier
                              ? seg.operatingCarrier
                              : "";

                            return (
                              <div key={`${f.id}-seg-${segIdx}`} className={segIdx === 0 ? "" : "mt-3 pt-3 border-t border-slate-200"}>
                                <div className="font-semibold text-slate-900">Flight {segIdx + 1} of {f.segments.length}</div>
                                <div className="mt-1">
                                  <span className="font-semibold">{seg.marketingCarrier || f.airline}</span>
                                  {seg.marketingFlightNumber ? ` · ${seg.marketingFlightNumber}` : (f.flightNumber ? ` · ${f.flightNumber}` : "")}
                                </div>
                                {operatedBy ? <div className="text-slate-600">Operated by {operatedBy}</div> : null}

                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div>
                                    <div className="font-semibold text-slate-700">{seg.origin?.name || seg.origin?.code}</div>
                                    <div className="text-slate-600">{seg.origin?.airport ? `${seg.origin.airport} ` : ""}{seg.origin?.code ? `(${seg.origin.code})` : ""}</div>
                                    <div className="text-slate-600">{fmtTime(seg.departingAt)}{seg.departingAt ? ` · ${fmtDate(seg.departingAt)}` : ""}</div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-700">{seg.destination?.name || seg.destination?.code}</div>
                                    <div className="text-slate-600">{seg.destination?.airport ? `${seg.destination.airport} ` : ""}{seg.destination?.code ? `(${seg.destination.code})` : ""}</div>
                                    <div className="text-slate-600">{fmtTime(seg.arrivingAt)}{seg.arrivingAt ? ` · ${fmtDate(seg.arrivingAt)}` : ""}</div>
                                  </div>
                                </div>

                                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-slate-600">
                                  {seg.aircraft ? <div>Aircraft: {seg.aircraft}</div> : null}
                                  {f.fare ? <div>Cabin: {f.fare}</div> : null}
                                  {f.duration ? <div>Travel time: {f.duration}</div> : null}
                                </div>

                                {layoverMin !== null ? (
                                  <div className="mt-2 text-slate-600">{fmtDuration(layoverMin)} layover</div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
                {!loadingFlights && filteredFlights.length === 0 && !errorFlights && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-600">
                    <div>No flights yet. Ensure trip draft has origin/destination/date.</div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          const defaultOrigin = "Paris";
                          const defaultDestination = "New York";
                          const defaultCheckIn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          const defaultCheckOut = new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          applyTripPatch(tripId, { departureCity: defaultOrigin, destination: defaultDestination, checkIn: defaultCheckIn, checkOut: defaultCheckOut });
                        }}
                        className="rounded-full px-3 py-1 text-xs font-semibold border border-slate-200 bg-white"
                      >
                        Auto-fill sample trip
                      </button>
                      {/* Editing whole trip details is disabled for organized featured trips; only departure is editable here */}
                      <button
                        onClick={() => alert('Editing full trip details is disabled on this page. Change only the departure city.')}
                        className="rounded-full px-3 py-1 text-xs font-semibold border border-slate-200 bg-white"
                      >
                        Edit trip details (locked)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>{staysTitle}</div>
                  <h2 className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>Pick one</h2>
                </div>
              </div>
              {loadingHotels && <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700">Loading stays…</div>}
              {errorHotels && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">{errorHotels}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredHotels.map((h) => {
                  const active = selection?.hotel?.id === h.id;
                  const hotelImages = getPartnerHotelImages(tripDraft?.destination || h.location || h.name);
                  const image = h.image || hotelImages[0];
                  const isYacht = h.room === "Yacht";
                  const images = isYacht ? (h.images || [image]) : [image];
                  const ratingLabel = h.rating ? `${Number(h.rating).toFixed(1)}★` : "";
                  
                  return (
                    <button
                      key={h.id}
                      onClick={() => onSelectHotel(h)}
                      className={`text-left rounded-xl border overflow-hidden shadow-sm transition ${
                        active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="h-32 w-full overflow-hidden relative">
                        {images.length > 1 ? (
                          <div className="flex h-full">
                            <img src={images[0]} alt={h.name} className="h-full w-2/3 object-cover" />
                            <div className="flex-1 grid grid-cols-1 gap-0.5 p-0.5">
                              {images.slice(1, 4).map((img, idx) => (
                                <img key={idx} src={img} alt={`${h.name} ${idx + 2}`} className="h-full w-full object-cover rounded-sm" />
                              ))}
                              {images.length > 4 && (
                                <div className="h-full w-full bg-black bg-opacity-50 flex items-center justify-center rounded-sm">
                                  <span className="text-white text-xs font-bold">+{images.length - 4}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <img src={image} alt={h.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{h.name}</div>
                        <div className="text-xs" style={{ color: MUTED_TEXT }}>{h.room} • {h.location}</div>
                        {ratingLabel ? <div className="text-xs" style={{ color: MUTED_TEXT }}>{ratingLabel}</div> : null}
                        <div className="text-sm font-extrabold" style={{ color: PREMIUM_BLUE }}>{h.price}</div>
                      </div>
                    </button>
                  );
                })}
                {!loadingHotels && filteredHotels.length === 0 && !errorHotels && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-600">No stays yet. Ensure destination + check-in/check-out are set.</div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Activities</div>
                  <h2 className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>Optional experiences</h2>
                </div>
              </div>
              {loadingActivities && <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700">Loading activities…</div>}
              {errorActivities && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">{errorActivities}</div>}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredActivities.map((a) => {
                  const active = selection?.activity?.id === a.id;
                  const providerLogo = getPartnerLogo(a.provider || a.supplier);
                  return (
                    <button
                      key={a.id}
                      onClick={() => onSelectActivity(a)}
                      className={`w-full text-left rounded-xl border px-4 py-3 shadow-sm transition ${
                        active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            <img src={a.image} alt={a.name} className="h-full w-full object-cover" loading="lazy" />
                          </div>
                          <div className="text-sm font-bold truncate" style={{ color: TITLE_TEXT }}>
                            {a.name}
                          </div>
                        </div>
                        <div className="text-sm font-extrabold" style={{ color: PREMIUM_BLUE }}>{a.price}</div>
                      </div>
                      <div className="mt-1 text-xs" style={{ color: MUTED_TEXT }}>
                        {a.date} at {a.time} • {a.supplier}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px]" style={{ color: MUTED_TEXT }}>
                        {providerLogo ? <img src={providerLogo} alt={a.provider || a.supplier} className="h-4 w-4 rounded-full border border-slate-200" loading="lazy" /> : null}
                        <span>Partner: {a.provider || a.supplier || "Activity partner"}</span>
                      </div>
                    </button>
                  );
                })}
                {!loadingActivities && filteredActivities.length === 0 && !errorActivities && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-600">No activities available for this destination.</div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Transfers</div>
                  <h2 className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>Ground transportation</h2>
                </div>
              </div>
              {loadingTransfers && <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700">Loading transfers…</div>}
              {errorTransfers && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">{errorTransfers}</div>}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredTransfers.map((t) => {
                  const transferKey = t.id || `${t.supplier || "transfer"}-${t.name || "item"}-${t.date || ""}`;
                  const active = selectedTransferKey ? selectedTransferKey === transferKey : selection?.transfer?.id === transferKey;
                  const providerLogo = getPartnerLogo(t.provider || t.supplier);
                  return (
                    <button
                      key={transferKey}
                      onClick={() => onSelectTransfer({ ...t, id: transferKey })}
                      className={`w-full text-left rounded-xl border px-4 py-3 shadow-sm transition ${
                        active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      {active && (
                        <div className="mb-2 inline-flex rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          Selected
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            <img src={t.image} alt={t.name} className="h-full w-full object-cover" loading="lazy" />
                          </div>
                          <div className="text-sm font-bold truncate" style={{ color: TITLE_TEXT }}>
                            {t.name}
                          </div>
                        </div>
                        <div className="text-sm font-extrabold" style={{ color: PREMIUM_BLUE }}>{t.price}</div>
                      </div>
                      <div className="mt-1 text-xs" style={{ color: MUTED_TEXT }}>
                        {t.route} • {t.date} • {t.supplier} • {t.shared ? "Shared" : "Private"}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px]" style={{ color: MUTED_TEXT }}>
                        {providerLogo ? <img src={providerLogo} alt={t.provider || t.supplier} className="h-4 w-4 rounded-full border border-slate-200" loading="lazy" /> : null}
                        <span>Partner: {t.provider || t.supplier || "Transfer partner"}</span>
                      </div>
                    </button>
                  );
                })}
                {!loadingTransfers && filteredTransfers.length === 0 && !errorTransfers && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-600">No transfers available for this route.</div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-3 sticky top-4">
            <SelectedSummary
              flight={selection?.flight}
              hotel={selection?.hotel}
              activity={selection?.activity}
              transfer={selection?.transfer}
              tripDraft={tripDraft}
              onProceed={onContinue}
            />
            <button
              onClick={onContinue}
              disabled={!selection?.flight || !selection?.hotel}
              className="w-full rounded-full px-4 py-3 text-sm font-extrabold text-white"
              style={{ backgroundColor: BRAND_BLUE, opacity: selection?.flight && selection?.hotel ? 1 : 0.6 }}
            >
              Continue to review
            </button>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs" style={{ color: MUTED_TEXT }}>
              Selections are saved for this proposal. You can adjust later before payment.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
