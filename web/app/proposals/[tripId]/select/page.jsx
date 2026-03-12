"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, PREMIUM_BLUE, TITLE_TEXT } from "../../../../src/design/tokens";
import { useTripsStore, generateProposal, setProposalSelection, applyTripPatch, updateSnapshot } from "../../../../lib/store/tripsStore";
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
  // Canada
  "Quebec": "YQB", "Québec": "YQB", "Quebec City": "YQB",
  "Montreal": "YUL", "Montréal": "YUL",
  "Toronto": "YYZ", "Ottawa": "YOW", "Calgary": "YYC",
  "Vancouver": "YVR", "Edmonton": "YEG", "Winnipeg": "YWG",
  "Halifax": "YHZ", "Victoria": "YYJ", "Saskatoon": "YXE",
  // USA
  "New York": "JFK", "NYC": "JFK", "Manhattan": "JFK",
  "Los Angeles": "LAX", "LA": "LAX",
  "Miami": "MIA", "Fort Lauderdale": "FLL",
  "Chicago": "ORD", "San Francisco": "SFO",
  "Las Vegas": "LAS", "Orlando": "MCO", "Dallas": "DFW",
  "Houston": "IAH", "Atlanta": "ATL", "Boston": "BOS",
  "Seattle": "SEA", "Denver": "DEN", "Phoenix": "PHX",
  "San Diego": "SAN", "Tampa": "TPA", "Honolulu": "HNL",
  "Washington": "IAD", "Philadelphia": "PHL", "Nashville": "BNA",
  "Austin": "AUS", "New Orleans": "MSY", "Portland": "PDX",
  "Salt Lake City": "SLC", "Minneapolis": "MSP", "Charlotte": "CLT",
  "Maui": "OGG", "Kona": "KOA",
  // Mexico & Caribbean
  "Cancun": "CUN", "Cancún": "CUN",
  "Mexico City": "MEX", "Ciudad de Mexico": "MEX", "CDMX": "MEX",
  "Cabo": "SJD", "Cabo San Lucas": "SJD", "Los Cabos": "SJD",
  "Playa del Carmen": "CUN", "Riviera Maya": "CUN", "Tulum": "CUN",
  "Puerto Vallarta": "PVR", "Cozumel": "CZM",
  "Punta Cana": "PUJ", "Santo Domingo": "SDQ",
  "Jamaica": "MBJ", "Montego Bay": "MBJ", "Kingston": "KIN",
  "Nassau": "NAS", "Bahamas": "NAS",
  "Havana": "HAV", "Cuba": "HAV", "La Havane": "HAV",
  "Aruba": "AUA", "Curacao": "CUR", "Curaçao": "CUR",
  "Barbados": "BGI", "St Lucia": "UVF", "Saint Lucia": "UVF",
  "Turks and Caicos": "PLS", "St Maarten": "SXM",
  "Puerto Rico": "SJU", "San Juan": "SJU",
  "Trinidad": "POS", "Antigua": "ANU", "Bermuda": "BDA",
  "Cayman Islands": "GCM", "Grand Cayman": "GCM",
  // Central & South America
  "Costa Rica": "SJO", "San Jose Costa Rica": "SJO",
  "Panama": "PTY", "Panama City": "PTY",
  "Bogota": "BOG", "Bogotá": "BOG", "Medellin": "MDE", "Medellín": "MDE", "Cartagena": "CTG",
  "Lima": "LIM", "Buenos Aires": "EZE", "Santiago": "SCL",
  "Rio de Janeiro": "GIG", "Rio": "GIG", "Sao Paulo": "GRU", "São Paulo": "GRU",
  "Quito": "UIO", "Guayaquil": "GYE",
  // Europe
  "Paris": "CDG", "London": "LHR",
  "Barcelona": "BCN", "Madrid": "MAD",
  "Rome": "FCO", "Roma": "FCO", "Milan": "MXP", "Milano": "MXP",
  "Amsterdam": "AMS", "Berlin": "BER", "Munich": "MUC", "Frankfurt": "FRA",
  "Lisbon": "LIS", "Lisbonne": "LIS", "Porto": "OPO",
  "Dublin": "DUB", "Edinburgh": "EDI",
  "Vienna": "VIE", "Vienne": "VIE", "Prague": "PRG",
  "Athens": "ATH", "Athènes": "ATH",
  "Istanbul": "IST", "Zurich": "ZRH", "Geneva": "GVA", "Genève": "GVA",
  "Brussels": "BRU", "Bruxelles": "BRU",
  "Copenhagen": "CPH", "Stockholm": "ARN", "Oslo": "OSL", "Helsinki": "HEL",
  "Budapest": "BUD", "Warsaw": "WAW", "Cracow": "KRK", "Krakow": "KRK",
  "Nice": "NCE", "Lyon": "LYS", "Marseille": "MRS",
  "Dubrovnik": "DBV", "Split": "SPU",
  "Santorini": "JTR", "Mykonos": "JMK",
  "Reykjavik": "KEF", "Iceland": "KEF",
  // Africa & Middle East
  "Dubai": "DXB", "Abu Dhabi": "AUH", "Doha": "DOH",
  "Marrakech": "RAK", "Marrakesh": "RAK", "Casablanca": "CMN",
  "Cairo": "CAI", "Le Caire": "CAI",
  "Cape Town": "CPT", "Johannesburg": "JNB",
  "Nairobi": "NBO", "Zanzibar": "ZNZ", "Dar es Salaam": "DAR",
  "Mauritius": "MRU", "Madagascar": "TNR",
  "Dakar": "DSS", "Lagos": "LOS", "Accra": "ACC",
  // Asia & Pacific
  "Tokyo": "NRT", "Osaka": "KIX", "Kyoto": "KIX",
  "Bangkok": "BKK", "Phuket": "HKT", "Bali": "DPS", "Denpasar": "DPS",
  "Singapore": "SIN", "Singapour": "SIN",
  "Hong Kong": "HKG", "Seoul": "ICN", "Séoul": "ICN",
  "Taipei": "TPE", "Shanghai": "PVG", "Beijing": "PEK", "Pékin": "PEK",
  "Delhi": "DEL", "New Delhi": "DEL", "Mumbai": "BOM", "Goa": "GOI",
  "Hanoi": "HAN", "Ho Chi Minh": "SGN", "Saigon": "SGN",
  "Kuala Lumpur": "KUL", "Manila": "MNL",
  "Sydney": "SYD", "Melbourne": "MEL", "Auckland": "AKL",
  "Fiji": "NAN", "Tahiti": "PPT", "Bora Bora": "BOB",
  "Maldives": "MLE", "Malé": "MLE",
  // Misc popular
  "Hawaii": "HNL", "Alaska": "ANC",
};

function resolveIATA(city) {
  if (!city) return "";
  // Check for IATA code in parentheses: "Montreal (YUL)" → YUL
  const parenMatch = city.match(/\(([A-Z]{3})\)/);
  if (parenMatch) return parenMatch[1];
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
  // Section visibility overrides (allow adding sections not requested by Lina)
  const [showFlightsOverride, setShowFlightsOverride] = useState(false);
  const [showHotelsOverride, setShowHotelsOverride] = useState(false);
  const [showVillasOverride, setShowVillasOverride] = useState(false);
  const [selectedTransferKey, setSelectedTransferKey] = useState("");
  const [selectedCarKey, setSelectedCarKey] = useState("");
  const [expandedFlightId, setExpandedFlightId] = useState("");
  const [flightModal, setFlightModal] = useState(null);
  const [showMoreFlights, setShowMoreFlights] = useState(false);
  const FLIGHTS_PAGE_SIZE = 20;
  const [hotelModal, setHotelModal] = useState(null);
  const [departureCityInput, setDepartureCityInput] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
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

  // Derived section visibility — show section if Lina requested it OR user manually added it
  const showFlights = tripDraft?.transportationType === "Flights" || showFlightsOverride;
  const showHotels = (tripDraft?.accommodationType === "Hotel" || tripDraft?.accommodationType === "Yacht") || showHotelsOverride;
  const showVillas = tripDraft?.includeVillas === true
    || tripDraft?.accommodationType === "Villa"
    || tripDraft?.accommodationType === "Zeniva Home"
    || tripDraft?.accommodationType === "Zeniva Home"
    || tripDraft?.accommodationType === "Condo"
    || tripDraft?.accommodationType === "Residence"
    || showVillasOverride;

  // Recover trip data from server if localStorage is empty
  useEffect(() => {
    if (!tripId) return;
    const draft = tripDraft || {};
    const hasLocalData = draft.destination || draft.departureCity || draft.checkIn;
    if (hasLocalData) return; // Already have data locally
    
    fetch(`/api/proposals?ownerEmail=voice-call@zenivatravel.com`)
      .then(r => r.json())
      .then(d => {
        const proposals = d?.data || [];
        const match = proposals.find(p => p.id === tripId);
        if (!match?.payload) return;
        const { tripDraft: serverDraft, snapshot: serverSnap } = match.payload;
        if (serverDraft && Object.keys(serverDraft).length > 0) {
          applyTripPatch(tripId, serverDraft);
        }
        if (serverSnap && Object.keys(serverSnap).length > 0) {
          // We need updateSnapshot imported already
          updateSnapshot(tripId, serverSnap);
        }
      })
      .catch(() => {});
  }, [tripId]);

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
      const missing = [];
      if (!origin) missing.push("departure city");
      if (!destination) missing.push("destination");
      if (!date) missing.push("departure date");
      setErrorFlights("Missing: " + missing.join(", ") + ". Please fill in below.");
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
    setShowMoreFlights(false); // reset pagination on leg switch
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
    // Residence/Airbnb/STR is handled by the Villa section (Airbnb13 API) — skip hotel fetch
    if (accommodationType === "Residence" || accommodationType === "Zeniva Home" || accommodationType === "Zeniva Home" || accommodationType === "Villa" || accommodationType === "Condo") {
      setHotels([]);
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

    // Normalize date to YYYY-MM-DD format (handles "22 mars 2026", "March 22 2026", etc.)
    const normalizeDate = (raw) => {
      if (!raw) return raw;
      // Already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
      // Try to parse any format
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
      // French month names
      const frMonths = {"janvier":1,"février":2,"mars":3,"avril":4,"mai":5,"juin":6,"juillet":7,"août":8,"septembre":9,"octobre":10,"novembre":11,"décembre":12};
      const m = raw.toLowerCase().match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
      if (m) {
        const month = frMonths[m[2]] || parseInt(m[2]);
        if (month) return `${m[3]}-${String(month).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
      }
      return raw;
    };
    const normalizedCheckIn = normalizeDate(checkIn);
    const normalizedCheckOut = normalizeDate(checkOut);

    const run = async () => {
      setLoadingHotels(true);
      setErrorHotels(null);
      try {
        const qs = new URLSearchParams({
          destination: String(destination),
          checkIn: normalizedCheckIn,
          checkOut: normalizedCheckOut,
          guests: String(tripDraft?.adults || 2),
          rooms: "1",
        }).toString();

        // Fetch LiteAPI first (primary), Amadeus with 4s timeout (supplementary)
        const amadeusTimeout = new Promise((resolve) => setTimeout(() => resolve(null), 4000));
        const [liteRes, amadeusRes] = await Promise.allSettled([
          fetch(`/api/partners/liteapi/hotels/search?${qs}`).then(r => r.json()).catch(() => null),
          Promise.race([
            fetch(`/api/amadeus/hotels/search?${qs}`).then(r => r.json()).catch(() => null),
            amadeusTimeout,
          ]),
        ]);

        const liteList = liteRes.status === "fulfilled" && liteRes.value?.ok
          ? (liteRes.value.offers || []).map((h) => ({
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
            }))
          : [];

        const amadeusRaw = amadeusRes.status === "fulfilled" && amadeusRes.value?.ok
          ? (amadeusRes.value.hotels || [])
          : [];

        const amadeusNormalized = amadeusRaw.map((h) => ({
          id: h.id,
          name: h.name,
          location: h.location,
          price: h.price,
          room: h.room || "Room",
          rating: Number(h.rating || 0),
          badge: h.badge,
          image: h.image || "/branding/hotel-placeholder.jpg",
          images: h.images || [],
          type: "hotel",
          provider: "amadeus",
          perks: Array.isArray(h.perks) ? h.perks : [],
        }));

        // Deduplicate: if same hotel name exists in both, keep LiteAPI version (usually has better image/data)
        const liteNames = new Set(liteList.map(h => h.name.toLowerCase().trim()));
        const uniqueAmadeus = amadeusNormalized.filter(h => !liteNames.has(h.name.toLowerCase().trim()));

        // Merge + sort by price ascending
        const extractPriceNum = (p) => {
          if (!p) return 9999999;
          const m = String(p).replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
          return m ? parseFloat(m[1]) : 9999999;
        };
        const combined = [...liteList, ...uniqueAmadeus].sort((a, b) => extractPriceNum(a.price) - extractPriceNum(b.price));
        const normalizedHotels = combined.slice(0, 25);

        if (normalizedHotels.length === 0) {
          setHotels([]);
          setErrorHotels("No hotels available for these dates — try adjusting your travel dates");
          setLoadingHotels(false);
          return;
        }

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

  // Listen for addon enable events from SelectedSummary
  useEffect(() => {
    const handleAddon = (e) => {
      const type = e.detail?.type;
      if (type === "activities") applyTripPatch(tripId, { includeActivities: true });
      if (type === "transfers") applyTripPatch(tripId, { includeTransfers: true });
      if (type === "rentalcar") applyTripPatch(tripId, { includeRentalCar: true });
      if (type === "villas") applyTripPatch(tripId, { includeVillas: true });
    };
    window.addEventListener("zeniva:enable-addon", handleAddon);
    return () => window.removeEventListener("zeniva:enable-addon", handleAddon);
  }, [tripId]);

  // Load activities from Amadeus (Tours & Activities)
  useEffect(() => {
    const destination = String(tripDraft?.destination || selection?.hotel?.location || "").trim();
    const checkIn = String(tripDraft?.checkIn || "").trim();
    const checkOut = String(tripDraft?.checkOut || "").trim();

    // Only load when explicitly enabled
    if (tripDraft?.includeActivities !== true) {
      setActivities([]);
      setLoadingActivities(false);
      setErrorActivities(null);
      if (selection?.activity) setProposalSelection(tripId, { activity: null });
      return;
    }

    if (!destination || !checkIn || !checkOut) {
      setActivities([]);
      setLoadingActivities(false);
      setErrorActivities("Missing destination or dates in trip draft");
      return;
    }

    const run = async () => {
      setLoadingActivities(true);
      setErrorActivities(null);
      try {
        // Use Booking.com activities (reliable, global coverage, real photos + prices)
        const qs = new URLSearchParams({
          destination,
          limit: "20",
        }).toString();

        const res = await fetch(`/api/booking/activities/search?${qs}`);
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) {
          // Silent graceful fail — no scary error message
          setActivities([]);
          setErrorActivities(null);
          setLoadingActivities(false);
          return;
        }

        const mapped = (data.activities || []).map((a) => ({
          id: a.id,
          name: a.name,
          location: destination,
          date: checkIn,
          time: "10:00",
          price: a.price || "Price on request",
          priceNum: a.priceNum || 0,
          supplier: "Booking.com",
          provider: "booking",
          rating: a.rating || 4.5,
          reviewCount: a.reviewCount || 0,
          category: "activity",
          description: a.description || a.name,
          image: a.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
          images: a.images || [],
          type: "activity",
        }));

        setActivities(mapped);

        if (mapped.length > 0 && !selection?.activity) {
          setProposalSelection(tripId, { activity: mapped[0] });
        }
      } catch (e) {
        setActivities([]);
        setErrorActivities(e?.message || "Failed to load activities");
      } finally {
        setLoadingActivities(false);
      }
    };

    run();
  }, [tripDraft?.includeActivities, tripDraft?.destination, tripDraft?.checkIn, tripDraft?.checkOut, tripId, selection?.hotel?.location]);

  // Load transfers from Amadeus
  useEffect(() => {
    const destination = String(tripDraft?.destination || selection?.hotel?.location || "").trim();
    const checkIn = String(tripDraft?.checkIn || "").trim();

    const getArrivalAirport = () => {
      const flight = selection?.flight;
      const takeFrom = (f) => {
        const segs = Array.isArray(f?.segments) ? f.segments : [];
        const last = segs.length ? segs[segs.length - 1] : null;
        const code = String(last?.destination?.code || "").trim();
        return code;
      };

      // Round trip selection shape: { outbound, inbound, ... }
      const fromOutbound = takeFrom(flight?.outbound);
      if (fromOutbound) return fromOutbound;

      // One-way selection shape: { segments, ... }
      const fromFlat = takeFrom(flight);
      if (fromFlat) return fromFlat;

      // Fall back to flight search context destination IATA
      return String(flightSearchContext?.destination || "").trim();
    };

    // Only load when explicitly enabled
    if (tripDraft?.includeTransfers !== true) {
      setTransfers([]);
      setLoadingTransfers(false);
      setErrorTransfers(null);
      if (selection?.transfer) setProposalSelection(tripId, { transfer: null });
      return;
    }

    if (!destination || !checkIn) {
      setTransfers([]);
      setLoadingTransfers(false);
      setErrorTransfers("Missing destination or check-in date in trip draft");
      return;
    }

    const run = async () => {
      setLoadingTransfers(true);
      setErrorTransfers(null);
      try {
        const dateTime = `${checkIn}T10:00:00`;
        const arrivalAirport = getArrivalAirport();
        // IATA map fallback for origin airport
        const IATA_MAP = {
          "miami": "MIA", "paris": "CDG", "london": "LHR", "new york": "JFK",
          "los angeles": "LAX", "toronto": "YYZ", "montreal": "YUL", "cancun": "CUN",
          "punta cana": "PUJ", "rome": "FCO", "barcelona": "BCN", "madrid": "MAD",
          "amsterdam": "AMS", "dubai": "DXB", "tokyo": "NRT", "bangkok": "BKK",
          "bali": "DPS", "mexico city": "MEX", "havana": "HAV", "nassau": "NAS",
          "montego bay": "MBJ", "san jose": "SJO", "bogota": "BOG", "lima": "LIM",
          "buenos aires": "EZE", "rio de janeiro": "GIG", "sao paulo": "GRU",
          "cape town": "CPT", "nairobi": "NBO", "marrakech": "RAK",
          "istanbul": "IST", "athens": "ATH", "prague": "PRG", "vienna": "VIE",
          "zurich": "ZRH", "milan": "MXP", "munich": "MUC", "frankfurt": "FRA",
          "lisbon": "LIS", "porto": "OPO", "singapore": "SIN", "hong kong": "HKG",
          "seoul": "ICN", "sydney": "SYD", "melbourne": "MEL", "auckland": "AKL",
          "maldives": "MLE", "male": "MLE", "mauritius": "MRU",
        };
        const destLower = destination.toLowerCase();
        const iataFallback = IATA_MAP[destLower] || "";
        const originAirport = arrivalAirport || iataFallback;
        
        // Pass hotel info as destination address if hotel is selected
        const hotelName = selection?.hotel?.name || "";
        const hotelLocation = selection?.hotel?.location || destination;
        
        // Use Booking.com transfers (real cars, real photos)
        const qs = new URLSearchParams({
          origin: originAirport || destination,
          destination: hotelLocation,
          date: checkIn,
          time: "10:00",
          passengers: String(tripDraft?.adults || 2),
          hotelName: hotelName || "",
        }).toString();

        const res = await fetch(`/api/booking/transfers/search?${qs}`);
        const data = await res.json().catch(() => null);
        // Gracefully handle no coverage — don't throw, just show empty
        if (!res.ok || !data?.ok) {
          setTransfers([]);
          setErrorTransfers(null); // Silent — no scary error
          setLoadingTransfers(false);
          return;
        }

        const mapped = (data.transfers || []).map((t, idx) => ({
          id: t.id || `transfer-${idx}`,
          name: t.category || "Transfer",
          description: t.description,
          route: `Airport → Hotel`,
          date: checkIn,
          price: t.priceText || "Price on request",
          priceNum: t.price || 0,
          supplier: t.supplier || "Booking.com",
          provider: "booking",
          vehicle: t.category,
          imageUrl: t.imageUrl,
          seats: t.seats,
          bags: t.bags,
          duration: t.duration,
          distance: t.distance,
          cancellable: t.cancellable,
          meetGreet: t.meetGreet,
          type: "transfer",
        }));

        setTransfers(mapped);

        if (mapped.length === 0) {
          // No transfers = hide section gracefully, don't show scary error
          setErrorTransfers(null);
          setTransfers([]);
        }

        if (mapped.length > 0 && !selection?.transfer) {
          setProposalSelection(tripId, { transfer: mapped[0] });
          setSelectedTransferKey(mapped[0].id);
        }
      } catch (e) {
        setTransfers([]);
        setErrorTransfers(e?.message || "Failed to load transfers");
      } finally {
        setLoadingTransfers(false);
      }
    };

    run();
  }, [tripDraft?.includeTransfers, tripDraft?.destination, tripDraft?.checkIn, tripDraft?.adults, tripId, selection?.hotel?.location, selection?.flight, flightSearchContext?.destination]);

  // ── Rental Cars (Amadeus) ──────────────────────────────────────────────────
  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [villas, setVillas] = useState([]);
  const [loadingVillas, setLoadingVillas] = useState(false);
  const [errorVillas, setErrorVillas] = useState(null);
  const [villaPhotoModal, setVillaPhotoModal] = useState(null); // { villa } for photo gallery modal
  useEffect(() => {
    if (tripDraft?.includeRentalCar !== true) { setCars([]); setLoadingCars(false); return; }
    const destination = String(tripDraft?.destination || "").trim();
    const checkIn = tripDraft?.checkIn;
    const checkOut = tripDraft?.checkOut;
    if (!destination || !checkIn || !checkOut) return;
    setLoadingCars(true);
    const run = async () => {
      try {
        const params = new URLSearchParams({ destination, checkIn, checkOut, guests: String(tripDraft?.adults || 2) });
        const res = await fetch(`/api/amadeus/cars/search?${params}`);
        const data = await res.json();
        setCars((data.offers || []).slice(0, 6));
      } catch { setCars([]); }
      setLoadingCars(false);
    };
    run();
  }, [tripDraft?.includeRentalCar, tripDraft?.destination, tripDraft?.checkIn, tripDraft?.checkOut, tripId]);

  // ── Villas (Airbnb) ─────────────────────────────────────────────────────
  useEffect(() => {
    const shouldLoadVillas = tripDraft?.includeVillas === true
      || tripDraft?.accommodationType === "Villa"
      || tripDraft?.accommodationType === "Zeniva Home"
      || tripDraft?.accommodationType === "Zeniva Home"
      || tripDraft?.accommodationType === "Condo"
      || tripDraft?.accommodationType === "Residence"
      || showVillasOverride;
    if (!shouldLoadVillas) { setVillas([]); setLoadingVillas(false); return; }
    const dest = tripDraft?.destination;
    if (!dest) return;
    setLoadingVillas(true);
    setErrorVillas(null);
    const params = new URLSearchParams({
      destination: dest,
      ...(tripDraft?.checkIn && { checkIn: tripDraft.checkIn }),
      ...(tripDraft?.checkOut && { checkOut: tripDraft.checkOut }),
      ...(tripDraft?.adults && { guests: String(tripDraft.adults) }),
    });
    const villaType = tripDraft?.villaType || (
      tripDraft?.accommodationType === "Villa" ? "villa"
      : tripDraft?.accommodationType === "Condo" ? "condo"
      : "shortterm"
    );
    params.append("type", villaType);
    fetch(`/api/airbnb/villas/search?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.villas && data.villas.length > 0) {
          setVillas(data.villas);
          setErrorVillas(null);
        } else {
          setVillas([]);
          setErrorVillas("No villas available for this destination.");
        }
      })
      .catch(() => setErrorVillas("Unable to load villas."))
      .finally(() => setLoadingVillas(false));
  }, [tripDraft?.includeVillas, tripDraft?.villaType, tripDraft?.destination, tripDraft?.checkIn, tripDraft?.checkOut, tripDraft?.adults, tripId, showVillasOverride]);

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

  // Sync selectedCarKey with store on load
  useEffect(() => {
    if (selection?.car?.id) {
      setSelectedCarKey(selection.car.id);
    } else {
      // Clear local key if store is cleared
      setSelectedCarKey("");
    }
  }, [selection?.car?.id]);

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
    const reqOrigin = flightSearchContext.origin.toUpperCase();
    const reqDest = (flightLeg === "return" ? flightSearchContext.origin : flightSearchContext.destination).toUpperCase();

    const list = flights
      .filter((flight) => {
        // ── Route guard: only show flights matching the requested route ──
        if (reqOrigin && reqDest) {
          const route = String(flight.route || "");
          const [fOrigin, fDest] = route.split("→").map(s => s.trim().toUpperCase());
          // Allow if route matches OR if origin matches (some offers show city pair differently)
          const originMatch = !fOrigin || fOrigin === reqOrigin || fOrigin.startsWith(reqOrigin.slice(0,2));
          const destMatch = !fDest || fDest === reqDest || fDest.startsWith(reqDest.slice(0,2));
          if (!originMatch || !destMatch) return false;
        }

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
  }, [flights, filters, flightSearchContext.origin, flightSearchContext.destination, flightLeg]);

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
    <main className="min-h-screen bg-slate-50">
      {/* ── HERO ── */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden">
        <img src={heroImage} alt="Destination" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
        {/* Back button */}
        <button
          onClick={() => router.push(isAgentMode ? `/agent/lina/chat/${tripId}` : `/chat/${tripId}`)}
          className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition"
        >
          ← {isAgentMode ? "Back to Lina" : "Back to chat"}
        </button>
        {/* Destination overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-1">Your Trip</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">
            {tripDraft?.destination || proposal?.title || "Select Your Package"}
          </h1>
          {/* Stats chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {tripDraft?.departureCity && (
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                ✈️ From {tripDraft.departureCity}
              </span>
            )}
            {tripDraft?.checkIn && (
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                📅 {tripDraft.checkIn}{tripDraft?.checkOut ? ` → ${tripDraft.checkOut}` : ""}
              </span>
            )}
            {tripDraft?.adults && (
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                👥 {tripDraft.adults} adult{tripDraft.adults > 1 ? "s" : ""}
              </span>
            )}
            <span className="flex items-center gap-1 bg-amber-400/90 rounded-full px-3 py-1 text-xs font-bold text-amber-900">
              ✨ {filteredFlights.length} flights · {filteredHotels.length} stays
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-4 xl:px-6 2xl:px-8 py-6">
        {/* Missing trip data warning */}
        {(!flightSearchContext.origin || !flightSearchContext.destination || !flightSearchContext.date) && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 shadow-sm p-5 space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">⚠️</div>
              <div>
                <p className="font-bold text-amber-900">Complete your trip details to search flights</p>
                <p className="text-xs text-amber-700 mt-0.5">Fill in the missing fields below</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Departure city", key: "departureCity", placeholder: "e.g. Montreal, New York", type: "text" },
                { label: "Destination", key: "destination", placeholder: "e.g. Cancun, Paris", type: "text" },
                { label: "Departure date", key: "checkIn", placeholder: "", type: "date" },
                { label: "Return date", key: "checkOut", placeholder: "", type: "date" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
                  <input
                    type={type}
                    defaultValue={tripDraft?.[key] || ""}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
                    onBlur={(e) => { const val = e.target.value.trim(); if (val) applyTripPatch(tripId, { [key]: val, ...(key === "departureCity" ? { transportationType: "Flights" } : {}) }); }}
                    onChange={type === "date" ? (e) => { if (e.target.value) applyTripPatch(tripId, { [key]: e.target.value }); } : undefined}
                    onKeyDown={(e) => { if (e.key === "Enter") { const val = e.target.value.trim(); if (val) applyTripPatch(tripId, { [key]: val }); } }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile filter toggle */}
        <div className="xl:hidden flex items-center justify-between gap-3 mb-4">
          <p className="text-xs text-slate-500 font-medium">
            {filteredFlights.length} flights · {filteredHotels.length} stays · {filteredActivities.length} activities
          </p>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full bg-white border border-slate-200 shadow-sm px-4 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 transition"
          >
            🎛 {mobileFiltersOpen ? "Hide filters" : "Filters"}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_300px] gap-5 items-start">
          {/* ── LEFT: Filters ── */}
          <aside
            id="advanced-filters"
            className={`${mobileFiltersOpen ? "block" : "hidden"} xl:block xl:sticky xl:top-4 self-start rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden max-h-[calc(100vh-32px)] overflow-y-auto`}
          >
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zeniva Travel</p>
              <h2 className="text-lg font-black text-white mt-0.5">Filters</h2>
              <p className="text-xs text-slate-400 mt-1">
                {Math.min(filteredFlights.length, showMoreFlights ? filteredFlights.length : FLIGHTS_PAGE_SIZE)} of {filteredFlights.length} flights · {filteredHotels.length} stays · {filteredActivities.length} exp.
              </p>
            </div>

            <div className="p-4 space-y-5">
              {/* Flights */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">✈️</span>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Flights</p>
                </div>
                <input value={filters.flightQuery} onChange={(e) => setFilters((prev) => ({ ...prev, flightQuery: e.target.value }))} placeholder="Airline, route, fare…" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={0} value={filters.flightMaxPrice} onChange={(e) => setFilters((prev) => ({ ...prev, flightMaxPrice: e.target.value }))} placeholder="Max price" className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition" />
                  <select value={filters.flightMaxStops} onChange={(e) => setFilters((prev) => ({ ...prev, flightMaxStops: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
                    <option value="">Any stops</option>
                    <option value="0">Nonstop</option>
                    <option value="1">≤ 1 stop</option>
                    <option value="2">≤ 2 stops</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={filters.flightCabin} onChange={(e) => setFilters((prev) => ({ ...prev, flightCabin: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
                    <option value="all">All cabins</option>
                    <option value="economy">Economy</option>
                    <option value="premium economy">Premium Eco.</option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                  </select>
                  <select value={filters.flightSort} onChange={(e) => setFilters((prev) => ({ ...prev, flightSort: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
                    <option value="best">Best</option>
                    <option value="price">Cheapest</option>
                    <option value="duration">Fastest</option>
                  </select>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={filters.flightDirectOnly} onChange={(e) => setFilters((prev) => ({ ...prev, flightDirectOnly: e.target.checked }))} className="rounded" />
                  Direct flights only
                </label>
                {airlineOptions.length > 0 && (
                  <div className="max-h-32 overflow-auto rounded-lg border border-slate-200 p-2 space-y-1 bg-slate-50">
                    {airlineOptions.map((airline) => (
                      <label key={`${airline.code}-${airline.name}`} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={filters.selectedAirlines.includes(String(airline.code || "").toUpperCase())} onChange={(e) => { const code = String(airline.code || "").toUpperCase(); setFilters((prev) => ({ ...prev, selectedAirlines: e.target.checked ? Array.from(new Set([...prev.selectedAirlines, code])) : prev.selectedAirlines.filter((item) => item !== code) })); }} className="rounded" />
                        {airline.logo && <img src={airline.logo} alt={airline.name} className="h-5 w-5 rounded-full border border-slate-200 bg-white" loading="lazy" />}
                        <span>{airline.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Hotels */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px]">🏨</span>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Stays</p>
                </div>
                <input value={filters.hotelQuery} onChange={(e) => setFilters((prev) => ({ ...prev, hotelQuery: e.target.value }))} placeholder="Hotel, location…" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={filters.hotelType} onChange={(e) => setFilters((prev) => ({ ...prev, hotelType: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
                    <option value="all">All types</option>
                    <option value="hotel">Hotel</option>
                    <option value="yacht">Yacht</option>
                    <option value="residence">Villa</option>
                  </select>
                  <select value={filters.hotelMinRating} onChange={(e) => setFilters((prev) => ({ ...prev, hotelMinRating: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
                    <option value="">Any rating</option>
                    <option value="3">3.0+</option>
                    <option value="4">4.0+</option>
                    <option value="4.5">4.5+</option>
                  </select>
                </div>
                <input type="number" min={0} value={filters.hotelMaxPrice} onChange={(e) => setFilters((prev) => ({ ...prev, hotelMaxPrice: e.target.value }))} placeholder="Max price/night" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50" />
              </div>

              {/* Activities */}
              {tripDraft?.includeActivities === true && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-[10px]">🎯</span>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Activities</p>
                </div>
                <input value={filters.activityQuery} onChange={(e) => setFilters((prev) => ({ ...prev, activityQuery: e.target.value }))} placeholder="Activity, keyword…" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={filters.activitySupplier} onChange={(e) => setFilters((prev) => ({ ...prev, activitySupplier: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
                    {activitySuppliers.map((s) => <option key={s} value={s}>{s === "all" ? "All suppliers" : s}</option>)}
                  </select>
                  <select value={filters.activityWhen} onChange={(e) => setFilters((prev) => ({ ...prev, activityWhen: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
                    <option value="any">Any time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>
              )}

              {/* Transfers */}
              {tripDraft?.includeTransfers === true && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[10px]">🚗</span>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transfers</p>
                </div>
                <input value={filters.transferQuery} onChange={(e) => setFilters((prev) => ({ ...prev, transferQuery: e.target.value }))} placeholder="Route, vehicle…" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={filters.transferType} onChange={(e) => setFilters((prev) => ({ ...prev, transferType: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
                    <option value="any">Any type</option>
                    <option value="private">Private</option>
                    <option value="shared">Shared</option>
                  </select>
                  <input type="number" min={0} value={filters.transferMaxPrice} onChange={(e) => setFilters((prev) => ({ ...prev, transferMaxPrice: e.target.value }))} placeholder="Max price" className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50" />
                </div>
              </div>
              )}

              <button
                onClick={() => setFilters({ flightQuery: "", flightDirectOnly: false, flightMaxStops: "", flightMaxPrice: "", flightCabin: "all", flightSort: "best", selectedAirlines: [], hotelQuery: "", hotelProvider: "all", hotelType: "all", hotelMaxPrice: "", hotelMinRating: "", activityQuery: "", activitySupplier: "all", activityMaxPrice: "", activityWhen: "any", transferQuery: "", transferSupplier: "all", transferType: "any", transferMaxPrice: "" })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                ↺ Reset all filters
              </button>
            </div>
          </aside>

          {/* ── CENTER: Options ── */}
          <div className="space-y-6">

            {/* FLIGHTS */}
            {showFlights && <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">✈️</div>
                  <div>
                    <h2 className="text-lg font-black text-white">Flights</h2>
                    <p className="text-blue-200 text-xs">{filteredFlights.length} options available</p>
                  </div>
                </div>
                {hasReturnLeg && (
                  <div className="flex rounded-full overflow-hidden border border-white/30">
                    {["outbound", "return"].map((leg) => (
                      <button key={leg} type="button" onClick={() => setFlightLeg(leg)}
                        className={`px-4 py-1.5 text-xs font-bold capitalize transition ${flightLeg === leg ? "bg-white text-blue-700" : "text-white/80 hover:text-white"}`}>
                        {leg === "outbound" ? "→ Outbound" : "← Return"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
                {loadingFlights && (
                  <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-sm text-blue-700 font-medium">Searching flights…</span>
                  </div>
                )}
                {errorFlights && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                    <p className="text-sm font-semibold text-amber-800">⚠️ {errorFlights}</p>
                    {!flightSearchContext.origin && (
                      <div className="flex gap-2">
                        <input type="text" value={departureCityInput} onChange={(e) => setDepartureCityInput(e.target.value)} placeholder="Enter departure city…" className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm" onKeyDown={(e) => { if (e.key === "Enter" && departureCityInput.trim()) { applyTripPatch(tripId, { departureCity: departureCityInput.trim(), transportationType: "Flights" }); setDepartureCityInput(""); } }} />
                        <button onClick={() => { if (departureCityInput.trim()) { applyTripPatch(tripId, { departureCity: departureCityInput.trim(), transportationType: "Flights" }); setDepartureCityInput(""); } }} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-bold">Search</button>
                      </div>
                    )}
                  </div>
                )}

                {(showMoreFlights ? filteredFlights : filteredFlights.slice(0, FLIGHTS_PAGE_SIZE)).map((f) => {
                  const selectedFlightId = selection?.flight?.inbound?.id || selection?.flight?.outbound?.id || selection?.flight?.id;
                  const active = selectedFlightId === f.id;
                  const airlineLogo = f.carrierLogo || getAirlineLogoFromFlight(f);
                  const isExpanded = expandedFlightId === f.id;
                  const [depTime, arrTime] = (f.times || " – ").split(" – ");
                  return (
                    <div key={f.id} className={`rounded-2xl border-2 transition-all ${active ? "border-blue-500 bg-blue-50 shadow-md" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}>
                      <button onClick={() => onSelectFlight(f)} className="w-full text-left p-4">
                        {/* Row 1: logo + airline + price */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">
                              {airlineLogo ? (
                                <img src={airlineLogo} alt={f.airline} className="h-10 w-10 rounded-full border border-slate-200 bg-white p-1 object-contain shadow-sm" loading="lazy" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-base font-black text-blue-700">{(f.airline || "A")[0]}</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-sm font-bold text-slate-900 truncate">{f.airline}</span>
                                {f.flightNumber && <span className="text-xs text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 flex-shrink-0">{f.flightNumber}</span>}
                                {f.layovers === 0 && <span className="text-[10px] font-bold bg-green-100 text-green-700 rounded-full px-2 py-0.5 flex-shrink-0">DIRECT</span>}
                                {f.layovers > 0 && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 flex-shrink-0">{f.layovers} stop{f.layovers > 1 ? "s" : ""}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-black text-blue-600 whitespace-nowrap">{f.price}</p>
                            {active && <p className="text-[10px] font-bold text-blue-500">✓ Selected</p>}
                          </div>
                        </div>
                        {/* Row 2: full-width timeline */}
                        <div className="flex items-center gap-2 w-full">
                          <div className="text-center flex-shrink-0">
                            <p className="text-base font-black text-slate-900">{depTime?.trim() || "–"}</p>
                            <p className="text-[10px] text-slate-500 max-w-[60px] truncate">{f.originName || ""}</p>
                          </div>
                          <div className="flex-1 relative flex items-center min-w-0">
                            <div className="h-px w-full bg-slate-300" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="bg-white px-1 text-[10px] text-slate-400 font-medium whitespace-nowrap">{f.duration}</span>
                            </div>
                          </div>
                          <div className="text-center flex-shrink-0">
                            <p className="text-base font-black text-slate-900">{arrTime?.trim() || "–"}</p>
                            <p className="text-[10px] text-slate-500 max-w-[60px] truncate">{f.destinationName || ""}</p>
                          </div>
                        </div>
                        {/* Row 3: fare info */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-500">{f.fare}</span>
                          {f.bags && <span className="text-xs text-slate-400">· {f.bags}</span>}
                        </div>
                      </button>

                      {/* Details toggle → opens modal */}
                      <div className="px-4 pb-3 border-t border-slate-100 pt-2 flex items-center gap-3">
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFlightModal(f); }} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1.5">
                          🔍 Flight details
                        </button>
                        <button type="button" onClick={() => onSelectFlight(f)} className={`ml-auto text-xs font-bold rounded-full px-4 py-1.5 transition ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-blue-100"}`}>
                          {active ? "✓ Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Show more / show less */}
                {!loadingFlights && filteredFlights.length > FLIGHTS_PAGE_SIZE && (
                  <div className="flex justify-center pt-2 pb-1">
                    <button
                      onClick={() => setShowMoreFlights(v => !v)}
                      className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-700 transition shadow-sm"
                    >
                      {showMoreFlights
                        ? `▲ Show fewer flights`
                        : `▼ Show all ${filteredFlights.length} flights`}
                    </button>
                  </div>
                )}

                {!loadingFlights && filteredFlights.length === 0 && !errorFlights && (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                    <div className="text-4xl mb-3">✈️</div>
                    <p className="font-semibold text-slate-600">No flights found</p>
                    <p className="text-xs text-slate-400 mt-1">Ensure origin, destination and dates are set above</p>
                    <button onClick={() => { const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; const r = new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; applyTripPatch(tripId, { departureCity: "Montreal", destination: "Cancun", checkIn: d, checkOut: r }); }} className="mt-4 rounded-full bg-blue-600 text-white px-5 py-2 text-sm font-bold hover:bg-blue-500 transition">
                      Auto-fill sample trip
                    </button>
                  </div>
                )}
              </div>
            </section>}

            {/* HOTELS / STAYS */}
            {showHotels && <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">{staysKind === "yacht" ? "⛵" : staysKind === "villa" ? "🏡" : "🏨"}</div>
                <div>
                  <h2 className="text-lg font-black text-white">{staysTitle}</h2>
                  <p className="text-purple-200 text-xs">{filteredHotels.length} options available</p>
                </div>
              </div>

              <div className="p-4">
                {loadingHotels && <div className="flex items-center gap-3 rounded-xl bg-purple-50 border border-purple-100 px-4 py-3 mb-3"><div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /><span className="text-sm text-purple-700 font-medium">Loading stays…</span></div>}
                {errorHotels && hotels.length === 0 && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-3">⚠️ {errorHotels}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1">
                  {filteredHotels.map((h) => {
                    const active = selection?.hotel?.id === h.id;
                    const hotelImages = getPartnerHotelImages(tripDraft?.destination || h.location || h.name);
                    const image = h.image || hotelImages[0];
                    const isYacht = h.room === "Yacht";
                    const images = isYacht ? (h.images || [image]) : [image];
                    const stars = h.rating ? Math.min(5, Math.round(Number(h.rating))) : 0;

                    return (
                      <button key={h.id} onClick={() => onSelectHotel(h)}
                        className={`text-left rounded-2xl border-2 overflow-hidden shadow-sm transition-all hover:shadow-md ${active ? "border-purple-500 ring-2 ring-purple-200" : "border-slate-200 hover:border-slate-300"}`}>
                        {/* Image */}
                        <div className="h-48 w-full overflow-hidden relative">
                          {images.length > 1 ? (
                            <div className="flex h-full gap-0.5">
                              <img src={images[0]} alt={h.name} className="h-full w-2/3 object-cover" />
                              <div className="flex-1 flex flex-col gap-0.5">
                                {images.slice(1, 3).map((img, idx) => <img key={idx} src={img} alt="" className="flex-1 w-full object-cover" />)}
                              </div>
                            </div>
                          ) : (
                            <img src={image} alt={h.name} className="h-full w-full object-cover" />
                          )}
                          {/* Price overlay */}
                          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                            <p className="text-sm font-black text-purple-700">
                              {h.price && !String(h.price).startsWith("USD") && !String(h.price).startsWith("Price") ? `USD ${h.price}` : h.price}
                            </p>
                          </div>
                          {active && (
                            <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-black rounded-full px-3 py-1 shadow">✓ Selected</div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-4">
                          <h3 className="font-black text-slate-900 text-sm leading-tight">{h.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{h.location}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-600">{h.room}</p>
                            {stars > 0 && <p className="text-xs text-amber-500">{"★".repeat(stars)}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setHotelModal(h); }}
                            className="mt-2 w-full text-center text-[11px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg py-1.5 transition"
                          >
                            📷 View photos & details
                          </button>
                        </div>
                      </button>
                    );
                  })}

                  {!loadingHotels && filteredHotels.length === 0 && !errorHotels && (
                    <div className="col-span-2 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                      <div className="text-4xl mb-3">🏨</div>
                      <p className="font-semibold text-slate-600">No stays available</p>
                      <p className="text-xs text-slate-400 mt-1">Set destination and dates to find accommodations</p>
                    </div>
                  )}
                </div>
              </div>
            </section>}

            {/* ACTIVITIES */}
            {tripDraft?.includeActivities === true && (
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🎯</div>
                <div>
                  <h2 className="text-lg font-black text-white">Experiences</h2>
                  <p className="text-emerald-200 text-xs">{filteredActivities.length} optional activities</p>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
                {loadingActivities && <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3"><div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /><span className="text-sm text-emerald-700">Loading experiences…</span></div>}
                {errorActivities && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">⚠️ {errorActivities}</div>}

                {filteredActivities.map((a) => {
                  const active = selection?.activity?.id === a.id;
                  return (
                    <button key={a.id} onClick={() => onSelectActivity(a)}
                      className={`w-full text-left rounded-2xl border-2 overflow-hidden shadow-sm transition-all hover:shadow-md flex ${active ? "border-emerald-500" : "border-slate-200"}`}>
                      <div className="w-28 h-24 flex-shrink-0 overflow-hidden">
                        <img src={a.image} alt={a.name} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 p-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm leading-tight truncate">{a.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{a.date} at {a.time}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{a.supplier}</p>
                          {active && <span className="inline-flex mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">✓ Selected</span>}
                        </div>
                        <p className="font-black text-emerald-700 text-sm flex-shrink-0">{a.price}</p>
                      </div>
                    </button>
                  );
                })}

                {!loadingActivities && filteredActivities.length === 0 && !errorActivities && (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                    <div className="text-3xl mb-2">🗺️</div>
                    <p className="text-sm text-slate-500">No activities for this destination</p>
                  </div>
                )}
              </div>
            </section>
            )}

            {/* TRANSFERS */}
            {tripDraft?.includeTransfers === true && (
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🚗</div>
                <div>
                  <h2 className="text-lg font-black text-white">Transfers</h2>
                  <p className="text-orange-100 text-xs">{filteredTransfers.length} ground transport options</p>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                {loadingTransfers && <div className="col-span-2 flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3"><div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" /><span className="text-sm text-orange-700">Loading transfers…</span></div>}
                {errorTransfers && !errorTransfers.includes("No transfers") && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">⚠️ {errorTransfers}</div>}

                {filteredTransfers.map((t) => {
                  const transferKey = t.id || `${t.supplier || "transfer"}-${t.name || "item"}-${t.date || ""}`;
                  const active = selectedTransferKey ? selectedTransferKey === transferKey : selection?.transfer?.id === transferKey;
                  const carImg = t.imageUrl || t.image || "https://cdn.rideways.com/images/cars/standard.jpg";
                  return (
                    <div key={transferKey}
                      className={`rounded-2xl border-2 overflow-hidden shadow-sm transition-all hover:shadow-lg cursor-pointer ${active ? "border-orange-500 shadow-orange-100 shadow-md" : "border-slate-200 hover:border-orange-300"}`}
                      onClick={() => onSelectTransfer({ ...t, id: transferKey })}>
                      {/* Car photo */}
                      <div className="h-36 overflow-hidden relative bg-slate-100">
                        <img src={carImg} alt={t.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.src = "https://cdn.rideways.com/images/cars/standard.jpg"; }} />
                        {active && <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5">✓ Selected</div>}
                        {t.cancellable && <div className="absolute bottom-2 left-2 bg-green-600/90 text-white text-[10px] font-bold rounded-full px-2 py-0.5">Free cancellation</div>}
                        {t.meetGreet && <div className="absolute bottom-2 right-2 bg-blue-600/90 text-white text-[10px] font-bold rounded-full px-2 py-0.5">Meet & Greet</div>}
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{t.description || "Private transfer"}</p>
                            <div className="flex gap-2 mt-1.5 flex-wrap">
                              <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">👤 {t.seats || 3} passengers</span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">🧳 {t.bags || 2} bags</span>
                              {t.duration && <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">⏱ {t.duration} min</span>}
                              {t.distance && <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">📍 {t.distance} km</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">by {t.supplier}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-black text-orange-600 text-lg">{t.price}</p>
                            <button className={`mt-1 text-xs font-bold rounded-xl px-3 py-1 transition-colors ${active ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700"}`}
                              onClick={e => { e.stopPropagation(); onSelectTransfer({ ...t, id: transferKey }); }}>
                              {active ? "✓ Selected" : "Select"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!loadingTransfers && filteredTransfers.length === 0 && !errorTransfers && (
                  <div className="col-span-2 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                    <div className="text-3xl mb-2">🚗</div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Transfer not available online for this destination</p>
                    <p className="text-xs text-slate-500 mb-3">Our team will arrange your airport transfer manually.</p>
                    <a href="mailto:info@zeniva.ca?subject=Transfer request" className="inline-block rounded-xl bg-orange-500 text-white text-xs font-bold px-4 py-2 hover:bg-orange-600 transition">
                      📧 Request transfer via email
                    </a>
                  </div>
                )}
              </div>
            </section>
            )}

            {/* RENTAL CAR */}
            {tripDraft?.includeRentalCar === true && (
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🚙</div>
                <div>
                  <h2 className="text-lg font-black text-white">Rental Cars</h2>
                  <p className="text-blue-100 text-xs">{cars.length} vehicles available</p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto">
                {loadingCars && <div className="col-span-2 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3"><div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /><span className="text-sm text-blue-700">Searching vehicles…</span></div>}
                {cars.map((car, i) => {
                  const carKey = car.id || `car-${i}`;
                  // Use local selectedCarKey state to avoid stale store comparisons
                  const active = selectedCarKey ? selectedCarKey === carKey : (selection?.car?.id === carKey && !!carKey && carKey !== "");
                  const onSelectCar = (e) => {
                    if (e) e.stopPropagation();
                    setSelectedCarKey(carKey);
                    setProposalSelection(tripId, { car: { id: carKey, name: car.name, category: car.category, provider: car.provider, price: car.totalText } });
                  };
                  return (
                    <div key={carKey} className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg cursor-pointer ${active ? "border-blue-500 shadow-blue-100 shadow-md" : "border-slate-200 hover:border-blue-300"}`}
                      onClick={onSelectCar}>
                      {/* Car photo */}
                      <div className="h-36 overflow-hidden relative bg-slate-100">
                        <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover" loading="lazy" onError={e => { e.target.src = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"; }} />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-800 bg-white/90 rounded-full px-2 py-0.5">{car.provider}</span>
                        </div>
                        {active && <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5">✓ Selected</div>}
                      </div>
                      {/* Car info */}
                      <div className="p-3">
                        <p className="font-bold text-slate-900 text-sm truncate">{car.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{car.seats} seats · {car.transmission} · {car.ac ? "A/C" : "No A/C"}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {(car.features || []).slice(0,3).map((f, fi) => <span key={fi} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{f}</span>)}
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <p className="font-black text-blue-600 text-lg">{car.priceText}</p>
                            <p className="text-xs text-slate-400">{car.totalText}</p>
                          </div>
                          <button className={`text-xs font-bold rounded-xl px-3 py-1.5 transition-colors ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"}`}
                            onClick={onSelectCar}>
                            {active ? "✓ Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!loadingCars && cars.length === 0 && (
                  <div className="col-span-2 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                    <div className="text-3xl mb-2">🚙</div>
                    <p className="text-sm font-semibold text-slate-700">Rental cars available</p>
                    <p className="text-xs text-slate-400 mt-1">Contact us at <span className="text-blue-600">info@zeniva.ca</span> for vehicle availability</p>
                  </div>
                )}
              </div>
            </section>
            )}

            {/* VILLAS */}
            {showVillas && (
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🏠</div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span class="font-black text-white bg-blue-600 rounded-full px-1.5 py-0 text-xs">Z</span>
                    {tripDraft?.accommodationType === "Condo" ? "Zeniva Home Condos" 
                     : tripDraft?.accommodationType === "Villa" ? "Zeniva Home Villas" 
                     : "Zeniva Home"}
                  </h2>
                  <p className="text-purple-100 text-xs">{villas.length > 0 ? `${villas.length} properties available` : "Searching..."}</p>
                </div>
              </div>
              <div className="p-4 max-h-[700px] overflow-y-auto">
                {loadingVillas && (
                  <div className="flex items-center gap-3 rounded-xl bg-purple-50 border border-purple-100 px-4 py-3 mb-3">
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-purple-700">Searching Zeniva Home listings…</span>
                  </div>
                )}
                {!loadingVillas && villas.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🏠</div>
                    <p className="text-sm font-semibold text-slate-600">No properties found for this destination</p>
                    <p className="text-xs text-slate-400 mt-1">Try a different destination or contact us at info@zeniva.ca</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {villas.map((villa, i) => {
                  const villaKey = villa.id || `villa-${i}`;
                  const active = selection?.villa?.id === villaKey;
                  return (
                    <div key={villaKey}
                      className={`rounded-2xl border-2 transition-all overflow-hidden shadow-sm hover:shadow-lg ${active ? "border-purple-400 ring-2 ring-purple-100" : "border-slate-200 hover:border-purple-300"}`}>
                      {/* Photo principale grande */}
                      <div className="relative h-52 overflow-hidden bg-slate-100 cursor-pointer"
                        onClick={() => setVillaPhotoModal(villa)}>
                        {villa.photo ? (
                          <img src={villa.photo} alt={villa.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-purple-50 to-pink-50">🏠</div>
                        )}
                        {/* Zeniva Home badge */}
                        <div className="absolute top-3 left-3 bg-white rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-md">
                          <span class="font-black text-white bg-blue-600 rounded-full px-1 text-[10px]">Z</span>
                          <span className="text-[10px] font-bold text-slate-700">Zeniva Home</span>
                        </div>
                        {/* Selected badge */}
                        {active && (
                          <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">✓ Selected</div>
                        )}
                        {/* Photo count */}
                        {villa.photos?.length > 1 && (
                          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                            📷 {villa.photos.length}
                          </div>
                        )}
                        {/* Superhost badge */}
                        {villa.superhost && (
                          <div className="absolute bottom-3 left-3 bg-white text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                            🏆 Superhost
                          </div>
                        )}
                      </div>
                      {/* Mini photos strip */}
                      {villa.photos?.length > 1 && (
                        <div className="flex gap-1 px-3 pt-2">
                          {villa.photos.slice(1, 5).map((p, pi) => (
                            <button key={pi} onClick={() => setVillaPhotoModal(villa)}
                              className="flex-1 h-12 overflow-hidden rounded-lg bg-slate-100">
                              <img src={p} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" onError={(e) => { e.currentTarget.parentElement.style.display='none'; }} />
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">{villa.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">📍 {villa.city}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {villa.rating && (
                                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  ★ {villa.rating}
                                </span>
                              )}
                              {villa.reviews > 0 && <span className="text-xs text-slate-400">({villa.reviews.toLocaleString()} reviews)</span>}
                              {villa.bedrooms && <span className="text-xs text-slate-400">· {villa.bedrooms} bed</span>}
                              {villa.bathrooms && <span className="text-xs text-slate-400">· {villa.bathrooms} bath</span>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-black text-purple-700">{villa.priceTotal}</p>
                            <p className="text-xs text-slate-500 font-semibold">{villa.pricePerNight}/night</p>
                            <p className="text-xs text-slate-400">{villa.nights} nights</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => setVillaPhotoModal(villa)}
                            className="flex-1 text-center text-xs font-semibold text-purple-600 border border-purple-200 rounded-xl py-2.5 hover:bg-purple-50 transition">
                            View details
                          </button>
                          {active ? (
                            <button onClick={() => setProposalSelection(tripId, { villa: null })}
                              className="text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl px-4 py-2.5 hover:bg-slate-50 transition">
                              Remove
                            </button>
                          ) : (
                            <button onClick={() => setProposalSelection(tripId, { villa: { id: villaKey, name: villa.name, city: villa.city, price: villa.priceTotal, pricePerNight: villa.pricePerNight, photo: villa.photo } })}
                              className="text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl px-5 py-2.5 hover:opacity-90 transition shadow">
                              Select
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </section>
            )}
            {/* ── ADD TO YOUR TRIP ── */}
            {(() => {
              const showAddFlights = !showFlights;
              const showAddHotels = !showHotels && tripDraft?.accommodationType !== "Villa" && tripDraft?.accommodationType !== "Zeniva Home" && tripDraft?.accommodationType !== "Residence" && tripDraft?.accommodationType !== "Condo";
              const showAddZenivaHome = !showVillas;
              const showAddActivities = tripDraft?.includeActivities !== true;
              const showAddTransfers = tripDraft?.includeTransfers !== true;
              const showAddCars = tripDraft?.includeRentalCar !== true;
              const hasAnything = showAddFlights || showAddHotels || showAddZenivaHome || showAddActivities || showAddTransfers || showAddCars;
              if (!hasAnything) return null;
              return (
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">✨ Add to your trip</p>
                  <div className="flex flex-wrap gap-2">
                    {showAddFlights && (
                      <button onClick={() => setShowFlightsOverride(true)}
                        className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition">
                        ✈️ + Add Flights
                      </button>
                    )}
                    {showAddHotels && (
                      <button onClick={() => setShowHotelsOverride(true)}
                        className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 transition">
                        🏨 + Add Hotels
                      </button>
                    )}
                    {showAddZenivaHome && (
                      <button onClick={() => setShowVillasOverride(true)}
                        className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-xs font-bold text-pink-700 hover:bg-pink-100 transition">
                        🏠 + Add Zeniva Home
                      </button>
                    )}
                    {showAddActivities && (
                      <button onClick={() => { const e = new CustomEvent("zeniva:enable-addon", { detail: { type: "activities" } }); window.dispatchEvent(e); }}
                        className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition">
                        🎯 + Add Experiences
                      </button>
                    )}
                    {showAddTransfers && (
                      <button onClick={() => { const e = new CustomEvent("zeniva:enable-addon", { detail: { type: "transfers" } }); window.dispatchEvent(e); }}
                        className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100 transition">
                        🚗 + Add Transfers
                      </button>
                    )}
                    {showAddCars && (
                      <button onClick={() => { const e = new CustomEvent("zeniva:enable-addon", { detail: { type: "rentalcar" } }); window.dispatchEvent(e); }}
                        className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition">
                        🚙 + Add Rental Car
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── RIGHT: Summary ── */}
          <aside className="space-y-4 sticky top-4 self-start max-h-[calc(100vh-32px)] overflow-y-auto">
            {/* Premium summary card */}
            <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Your Selection</p>
                <p className="text-white font-black text-lg mt-0.5">{tripDraft?.destination || "Trip"}</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                {[
                  { icon: "✈️", label: "Flight", item: selection?.flight, getValue: (f) => f?.outbound ? `${f.outbound.airline} · ${f.outbound.route}` : `${f?.airline} · ${f?.route}` },
                  { icon: "🏨", label: staysTitle, item: selection?.hotel, getValue: (h) => h?.name },
                  { icon: "🎯", label: "Activity", item: selection?.activity, getValue: (a) => a?.name, optional: true },
                  { icon: "🚗", label: "Transfer", item: selection?.transfer, getValue: (t) => t?.name, optional: true },
                  { icon: "🚙", label: "Rental Car", item: selection?.car, getValue: (c) => c?.name || c?.category, optional: true },
                  { icon: "🏠", label: "Zeniva Home", item: selection?.villa, getValue: (v) => v?.name, optional: true },
                ].map(({ icon, label, item, getValue, optional }) => (
                  <div key={label} className={`flex items-start gap-3 rounded-xl p-3 ${item ? "bg-white/10 border border-white/10" : "border border-dashed border-white/10"}`}>
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                      {item ? (
                        <p className="text-white text-xs font-semibold mt-0.5 truncate">{getValue(item)}</p>
                      ) : (
                        <p className="text-slate-500 text-xs mt-0.5">{optional ? "Optional" : "Not selected"}</p>
                      )}
                    </div>
                    {item ? <span className="text-emerald-400 text-sm font-black flex-shrink-0">✓</span> : optional ? null : <span className="text-amber-400 text-sm flex-shrink-0">○</span>}
                  </div>
                ))}
              </div>

              {/* Gold CTA */}
              <div className="px-5 pb-5">
                <button
                  onClick={onContinue}
                  disabled={!selection?.flight && !selection?.hotel && !selection?.villa && !selection?.shortterm}
                  className="w-full rounded-xl py-3.5 text-sm font-black tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: (selection?.flight || selection?.hotel || selection?.villa || selection?.shortterm)
                      ? "linear-gradient(135deg, #E6B85A, #d4a442)"
                      : "#555",
                    color: "#1a0f00",
                    boxShadow: (selection?.flight || selection?.hotel || selection?.villa || selection?.shortterm) ? "0 4px 15px rgba(230,184,90,0.4)" : "none"
                  }}
                >
                  {!selection?.flight && !selection?.hotel && !selection?.villa && !selection?.shortterm ? "Select at least one option to continue →" :
                   "✓ Continue to Review →"}
                </button>
                <p className="text-center text-slate-500 text-[10px] mt-2">🔒 Selections saved automatically</p>
              </div>
            </div>

            {/* SelectedSummary component */}
            <SelectedSummary
              flight={selection?.flight}
              hotel={selection?.hotel}
              activity={selection?.activity}
              transfer={selection?.transfer}
              tripDraft={tripDraft}
              onProceed={onContinue}
            />

            {/* Trust badges */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[["🔒", "Secure"], ["↩️", "Flexible"], ["⭐", "Best Rate"]].map(([icon, label]) => (
                  <div key={label}>
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-[10px] font-bold text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      {/* ── FLIGHT DETAIL MODAL ── */}
      {flightModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setFlightModal(null)}>
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 flex items-center gap-4">
              {flightModal.carrierLogo && (
                <img src={flightModal.carrierLogo} alt={flightModal.airline} className="h-14 w-14 rounded-full border-2 border-white/30 bg-white p-1 object-contain flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Flight Details</p>
                <h2 className="text-xl font-black text-white">{flightModal.airline}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {flightModal.flightNumber && <span className="bg-white/20 text-white text-xs rounded-full px-2 py-0.5">{flightModal.flightNumber}</span>}
                  {flightModal.layovers === 0 && <span className="bg-green-400 text-green-900 text-[10px] font-black rounded-full px-2 py-0.5">DIRECT</span>}
                  {flightModal.layovers > 0 && <span className="bg-orange-300 text-orange-900 text-[10px] font-black rounded-full px-2 py-0.5">{flightModal.layovers} stop{flightModal.layovers > 1 ? "s" : ""}</span>}
                  <span className="bg-white/20 text-white text-[10px] rounded-full px-2 py-0.5">{flightModal.fare}</span>
                </div>
              </div>
              <button onClick={() => setFlightModal(null)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg hover:bg-white/30 flex-shrink-0">×</button>
            </div>

            {/* Timeline */}
            <div className="px-6 py-5 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-4">
                <div className="text-center flex-shrink-0">
                  <p className="text-xl font-black text-slate-900 whitespace-nowrap">{(flightModal.times || "").split("–")[0]?.trim()}</p>
                  <p className="text-xs font-bold text-slate-600 mt-1">{flightModal.route?.split("→")[0]?.trim() || "Departure"}</p>
                  {flightModal.date && <p className="text-[10px] text-slate-400 mt-0.5">{flightModal.date}</p>}
                </div>
                <div className="flex-1 relative">
                  <div className="h-px w-full bg-blue-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      <p className="text-xs font-bold text-blue-700">✈️ {flightModal.duration}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-xl font-black text-slate-900 whitespace-nowrap">{(flightModal.times || "").split("–")[1]?.trim()}</p>
                  <p className="text-xs font-bold text-slate-600 mt-1">{flightModal.route?.split("→")[1]?.trim() || "Arrival"}</p>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="px-6 py-4 grid grid-cols-2 gap-3">
              {[
                { icon: "🛫", label: "Route", val: flightModal.route },
                { icon: "⏱", label: "Duration", val: flightModal.duration },
                { icon: "💺", label: "Cabin", val: flightModal.fare },
                { icon: "🧳", label: "Baggage", val: flightModal.bags },
                { icon: "🔢", label: "Flight #", val: flightModal.flightNumber },
                { icon: "📅", label: "Date", val: flightModal.date },
              ].filter(item => item.val).map(({ icon, label, val }) => (
                <div key={label} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{icon} {label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            {/* Segments */}
            {Array.isArray(flightModal.segments) && flightModal.segments.length > 0 && (
              <div className="px-6 pb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">✈️ Segment details</p>
                <div className="space-y-3">
                  {flightModal.segments.map((seg, idx) => {
                    const next = flightModal.segments[idx + 1];
                    const layoverMin = next ? diffMinutes(seg.arrivingAt, next.departingAt) : null;
                    return (
                      <div key={idx}>
                        <div className="rounded-2xl border border-slate-200 overflow-hidden">
                          <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between">
                            <span className="text-white font-black text-sm">Segment {idx + 1}</span>
                            <span className="text-slate-300 text-xs">{seg.marketingCarrier || flightModal.airline}{seg.marketingFlightNumber ? ` ${seg.marketingFlightNumber}` : ""}</span>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">From</p>
                              <p className="font-black text-slate-900 text-sm mt-0.5">{seg.origin?.name || seg.origin?.code}</p>
                              <p className="text-blue-600 font-bold text-lg mt-1">{fmtTime(seg.departingAt)}</p>
                              <p className="text-slate-400 text-xs">{fmtDate(seg.departingAt)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">To</p>
                              <p className="font-black text-slate-900 text-sm mt-0.5">{seg.destination?.name || seg.destination?.code}</p>
                              <p className="text-blue-600 font-bold text-lg mt-1">{fmtTime(seg.arrivingAt)}</p>
                              <p className="text-slate-400 text-xs">{fmtDate(seg.arrivingAt)}</p>
                            </div>
                          </div>
                          {seg.aircraft && (
                            <div className="px-4 pb-3 text-xs text-slate-500">✈️ Aircraft: {seg.aircraft}</div>
                          )}
                        </div>
                        {layoverMin && (
                          <div className="flex items-center gap-2 my-2 px-4">
                            <div className="flex-1 h-px bg-amber-200" />
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">⏱ {fmtDuration(layoverMin)} layover at {seg.destination?.code || ""}</span>
                            <div className="flex-1 h-px bg-amber-200" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price + CTA */}
            <div className="px-6 pb-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-400">Total price</p>
                <p className="text-2xl font-black text-blue-600">{flightModal.price}</p>
              </div>
              <button
                onClick={() => { onSelectFlight(flightModal); setFlightModal(null); }}
                className="rounded-2xl bg-blue-600 text-white px-8 py-3 font-black text-sm hover:bg-blue-500 transition shadow-lg"
              >
                {(selection?.flight?.inbound?.id || selection?.flight?.outbound?.id || selection?.flight?.id) === flightModal.id ? "✓ Selected" : "Select this flight →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HOTEL DETAIL MODAL ── */}
      {hotelModal && (() => {
        const hImages = hotelModal.images?.length ? hotelModal.images : hotelModal.image ? [hotelModal.image] : [];
        const hotelStars = hotelModal.rating ? Math.min(5, Math.round(Number(hotelModal.rating))) : 0;
        const isSelected = selection?.hotel?.id === hotelModal.id;
        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setHotelModal(null)}>
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Hero image */}
              <div className="relative h-64 w-full overflow-hidden">
                <img src={hImages[0] || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"} alt={hotelModal.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setHotelModal(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white font-black text-lg hover:bg-black/70">×</button>
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-2xl font-black text-white">{hotelModal.name}</h2>
                  <p className="text-white/80 text-sm">{hotelModal.location}</p>
                  {hotelStars > 0 && <p className="text-amber-400 text-sm mt-1">{"★".repeat(hotelStars)}</p>}
                </div>
                {isSelected && <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-black rounded-full px-3 py-1">✓ Selected</div>}
              </div>

              {/* Photo gallery */}
              {hImages.length > 1 && (
                <div className="px-4 pt-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">📷 {hImages.length} photos</p>
                  <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                    {hImages.map((img, i) => (
                      <div key={i} className="aspect-square overflow-hidden rounded-xl">
                        <img src={img} alt={`Photo ${i + 1}`} className="h-full w-full object-cover hover:scale-110 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "🛏", label: "Room type", val: hotelModal.room },
                    { icon: "📍", label: "Location", val: hotelModal.location },
                    { icon: "💰", label: "Price", val: String(hotelModal.price || "On request") },
                    { icon: "⭐", label: "Rating", val: hotelModal.rating ? `${hotelModal.rating} / 5` : "N/A" },
                    { icon: "🏢", label: "Provider", val: hotelModal.provider },
                  ].filter(item => item.val && item.val !== "undefined").map(({ icon, label, val }) => (
                    <div key={label} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{icon} {label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Yacht specs/amenities */}
                {hotelModal.specs && (
                  <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-4">
                    <p className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-1">⛵ Specs</p>
                    <p className="text-sm text-slate-700">{hotelModal.specs}</p>
                  </div>
                )}
                {Array.isArray(hotelModal.amenities) && hotelModal.amenities.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">✨ Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {hotelModal.amenities.map((a, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-xs rounded-full px-3 py-1">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="px-5 pb-6 border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">Price</p>
                  <p className="text-2xl font-black text-purple-600">{hotelModal.price}</p>
                </div>
                <button
                  onClick={() => { onSelectHotel(hotelModal); setHotelModal(null); }}
                  className="rounded-2xl px-8 py-3 font-black text-sm transition shadow-lg"
                  style={{ background: "linear-gradient(135deg, #9333ea, #7c3aed)", color: "white" }}
                >
                  {isSelected ? "✓ Selected" : "Select this stay →"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── VILLA PHOTO GALLERY MODAL ── */}
      {villaPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6"
          onClick={() => setVillaPhotoModal(null)}>
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Zeniva Home</p>
                <h2 className="text-xl font-black text-white truncate">{villaPhotoModal.name}</h2>
                <p className="text-purple-200 text-sm mt-0.5">{villaPhotoModal.city}</p>
              </div>
              <button onClick={() => setVillaPhotoModal(null)}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg hover:bg-white/30 flex-shrink-0 ml-3">×</button>
            </div>
            {/* Photo grid */}
            <div className="p-4">
              {villaPhotoModal.photos?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {villaPhotoModal.photos.map((photo, i) => (
                    <div key={i} className={`overflow-hidden rounded-xl ${i === 0 ? "col-span-2 h-64" : "h-40"}`}>
                      <img src={photo} alt={`${villaPhotoModal.name} photo ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-6xl">🏠</div>
              )}
            </div>
            {/* Details */}
            <div className="px-6 pb-4 grid grid-cols-2 gap-3">
              {[
                villaPhotoModal.bedrooms && { icon: "🛏", label: "Bedrooms", val: villaPhotoModal.bedrooms },
                villaPhotoModal.bathrooms && { icon: "🚿", label: "Bathrooms", val: villaPhotoModal.bathrooms },
                villaPhotoModal.maxGuests && { icon: "👥", label: "Max guests", val: villaPhotoModal.maxGuests },
                villaPhotoModal.propertyType && { icon: "🏠", label: "Type", val: villaPhotoModal.propertyType },
                villaPhotoModal.rating && { icon: "⭐", label: "Rating", val: `${villaPhotoModal.rating} (${villaPhotoModal.reviews?.toLocaleString()} reviews)` },
                villaPhotoModal.superhost && { icon: "🏆", label: "Status", val: "Superhost" },
              ].filter(Boolean).map(({ icon, label, val }) => (
                <div key={label} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{icon} {label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
            {/* CTA */}
            <div className="px-6 pb-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-400">Total price</p>
                <p className="text-2xl font-black text-purple-600">{villaPhotoModal.priceTotal}</p>
                <p className="text-xs text-slate-400">{villaPhotoModal.pricePerNight}/night · {villaPhotoModal.nights} nights</p>
              </div>
              <button
                onClick={() => {
                  setProposalSelection(tripId, { villa: { id: villaPhotoModal.id, name: villaPhotoModal.name, city: villaPhotoModal.city, price: villaPhotoModal.priceTotal, pricePerNight: villaPhotoModal.pricePerNight, photo: villaPhotoModal.photo } });
                  setVillaPhotoModal(null);
                }}
                className="rounded-2xl px-8 py-3 font-black text-sm transition shadow-lg"
                style={{ background: "linear-gradient(135deg, #9333ea, #7c3aed)", color: "white" }}>
                {selection?.villa?.id === villaPhotoModal.id ? "✓ Selected" : "Select this property →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
