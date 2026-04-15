"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const AGENT_STORE_KEY = "zeniva_agent_chat_v1";
const SERVICE_FEE_RATE = 0.06;

/* ─── Destination validation ─── */
const DEST_BLACKLIST = /^(city|provide|help|plan|find|search|make|give|get|know|need|want|have|will|your|their|some|more|best|good|also|just|that|this|with|from|about|like|would|could|should|here|there|been|being|very|much|such|each|other|tailored|recommend|personalized|perfect|great|sure|hello|thank|welcome|assist|happy|today|trip|travel|luxury|let|please|certainly|absolutely|wonderful|exciting|amazing|fantastic|beautiful|stunning|explore|discover|enjoy|offer|include|option|package|suggest|information|detail)/i;
function isValidDest(d) {
  if (!d || d.length < 3 || d.length > 40) return false;
  if (DEST_BLACKLIST.test(d.trim())) return false;
  if (d.trim().split(/\s+/).length > 4) return false;
  return true;
}

/* ─── Load trip snapshot from agent chat localStorage ─── */
function loadTripData(tripId) {
  try {
    const raw = localStorage.getItem(AGENT_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[tripId] || {};
  } catch { return {}; }
}

/* ─── IATA code lookup (118 cities) ─── */
const IATA_MAP = {
  "Quebec": "YQB", "Québec": "YQB", "Montreal": "YUL", "Montréal": "YUL", "Toronto": "YYZ", "Vancouver": "YVR", "Calgary": "YYC", "Ottawa": "YOW", "Edmonton": "YEG", "Halifax": "YHZ", "Winnipeg": "YWG",
  "New York": "JFK", "Miami": "MIA", "Los Angeles": "LAX", "Chicago": "ORD", "San Francisco": "SFO", "Las Vegas": "LAS", "Orlando": "MCO", "Boston": "BOS", "Seattle": "SEA", "Houston": "IAH", "Atlanta": "ATL", "Dallas": "DFW", "Denver": "DEN", "Washington": "IAD",
  "Paris": "CDG", "London": "LHR", "Rome": "FCO", "Barcelona": "BCN", "Madrid": "MAD", "Amsterdam": "AMS", "Frankfurt": "FRA", "Lisbon": "LIS", "Dublin": "DUB", "Athens": "ATH", "Santorini": "JTR", "Mykonos": "JMK", "Vienna": "VIE", "Prague": "PRG", "Budapest": "BUD", "Brussels": "BRU", "Copenhagen": "CPH", "Stockholm": "ARN", "Oslo": "OSL", "Helsinki": "HEL", "Zurich": "ZRH", "Geneva": "GVA", "Milan": "MXP", "Venice": "VCE", "Florence": "FLR", "Istanbul": "IST", "Dubrovnik": "DBV",
  "Cancun": "CUN", "Cancún": "CUN", "Punta Cana": "PUJ", "Nassau": "NAS", "Montego Bay": "MBJ", "Havana": "HAV", "San Jose": "SJO", "Mexico City": "MEX", "Bogota": "BOG", "Lima": "LIM", "Buenos Aires": "EZE", "Rio de Janeiro": "GIG", "Sao Paulo": "GRU",
  "Tokyo": "NRT", "Bangkok": "BKK", "Bali": "DPS", "Singapore": "SIN", "Hong Kong": "HKG", "Seoul": "ICN", "Dubai": "DXB", "Maldives": "MLE", "Phuket": "HKT",
  "Cairo": "CAI", "Marrakech": "RAK", "Cape Town": "CPT", "Nairobi": "NBO",
  "Sydney": "SYD", "Melbourne": "MEL", "Auckland": "AKL", "Fiji": "NAN", "Honolulu": "HNL",
};

function getIATA(city) {
  if (!city) return null;
  for (const [name, code] of Object.entries(IATA_MAP)) {
    if (city.toLowerCase().includes(name.toLowerCase())) return code;
  }
  return null;
}

/* ─── Search APIs ─── */
async function searchFlights(origin, destination, date, cabinClass) {
  try {
    const futureDate = date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const params = new URLSearchParams({ origin, destination, date: futureDate });
    if (cabinClass) params.set("cabin_class", cabinClass);
    const res = await fetch(`/api/partners/duffel?${params}`);
    if (res.ok) {
      const data = await res.json();
      const offers = data?.result?.data?.offers || data?.result?.offers || data?.offers || data?.data || [];
      return offers.slice(0, 10).map((o, i) => {
        const slice = o.slices?.[0] || {};
        const seg = slice.segments?.[0] || {};
        const lastSeg = slice.segments?.[slice.segments?.length - 1] || seg;
        const carrier = seg.operating_carrier?.name || seg.marketing_carrier?.name || o.owner?.name || "Airline";
        const carrierIata = seg.operating_carrier?.iata_code || seg.marketing_carrier?.iata_code || o.owner?.iata_code || "";
        const flightNum = seg.operating_carrier_flight_number || seg.marketing_carrier_flight_number || "";
        const originCode = slice.origin?.iata_code || getIATA(origin) || origin;
        const destCode = slice.destination?.iata_code || getIATA(destination) || destination;
        let durationStr = "";
        if (slice.duration) {
          const hMatch = slice.duration.match(/(\d+)H/);
          const mMatch = slice.duration.match(/(\d+)M/);
          durationStr = `${hMatch?.[1] || "0"}h ${mMatch?.[1] || "00"}m`;
        }
        return {
          id: o.id || `flight-${i}`,
          name: `${carrier} ${flightNum}`.trim(),
          airline: carrier,
          carrierIata,
          flightNumber: flightNum,
          originCode,
          destCode,
          route: `${originCode} → ${destCode}`,
          price: parseFloat(o.total_amount || "0"),
          currency: o.total_currency || "CAD",
          cabinClass: cabinClass || o.cabin_class || seg.passengers?.[0]?.cabin_class_marketing_name || "economy",
          duration: durationStr,
          stops: (slice.segments?.length || 1) - 1,
          departure: seg.departing_at ? new Date(seg.departing_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          arrival: lastSeg.arriving_at ? new Date(lastSeg.arriving_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        };
      });
    }
  } catch {}
  return [];
}

async function searchHotels(destination, checkIn, checkOut, guests) {
  try {
    const fallbackCheckIn = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const fallbackCheckOut = new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10);
    const params = new URLSearchParams({
      destination,
      checkIn: checkIn || fallbackCheckIn,
      checkOut: checkOut || fallbackCheckOut,
      guests: String(guests || 2),
    });
    const res = await fetch(`/api/partners/liteapi/hotels/search?${params}`);
    if (res.ok) {
      const data = await res.json();
      const hotels = data?.offers || data?.hotels || data?.data || [];
      return hotels.slice(0, 10).map((h, i) => ({
        id: h.id || h.hotelId || `hotel-${i}`,
        name: h.name || h.hotelName || "Hotel",
        location: h.address || h.location || "",
        price: parseFloat(String(h.price || h.minRate || h.rate || "0").replace(/[^0-9.]/g, "")) || 0,
        currency: h.currency || "USD",
        stars: h.stars || h.starRating || h.category || 0,
        rating: h.rating || h.reviewScore || null,
        room: h.roomName || h.roomType || h.room || "",
        board: h.boardType || h.boardBasis || "",
        image: h.image || h.thumbnail || h.main_photo || (h.images && h.images[0]) || null,
        images: h.images || [],
        perks: h.perks || [],
        badge: h.badge || (h.stars ? `${h.stars}★` : ""),
        freeCancellation: h.freeCancellation || h.free_cancellation || false,
        provider: h.provider || "liteapi",
      }));
    }
  } catch {}
  return [];
}

async function searchActivities(destination) {
  try {
    const res = await fetch(`/api/booking/activities/search?destination=${encodeURIComponent(destination)}&limit=8`);
    if (res.ok) {
      const data = await res.json();
      return (data.activities || data.data || []).slice(0, 8).map((a, i) => ({
        id: a.id || `activity-${i}`,
        name: a.name || a.title || "Activity",
        price: a.price || a.amount || 0,
        currency: a.currency || "USD",
        duration: a.duration || "",
        category: a.category || a.type || "",
        image: a.image || a.thumbnail || a.photo || null,
        description: a.description || a.shortDescription || "",
      }));
    }
  } catch {}
  return [];
}

async function searchTransfers(destination) {
  try {
    const res = await fetch(`/api/transfers/search?destination=${encodeURIComponent(destination)}&limit=6`);
    if (res.ok) {
      const data = await res.json();
      return (data.transfers || data.data || []).slice(0, 6).map((t, i) => ({
        id: t.id || `transfer-${i}`,
        name: t.name || t.title || "Transfer",
        vehicle: t.vehicle || t.vehicleType || t.type || "Sedan",
        price: t.price || t.amount || 0,
        currency: t.currency || "USD",
        duration: t.duration || t.estimatedTime || "",
        description: t.description || "",
      }));
    }
  } catch {}
  return [];
}

/* ─── Cabin class labels ─── */
const CABIN_OPTIONS = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

function cabinLabel(val) {
  return CABIN_OPTIONS.find(c => c.value === val)?.label || "Economy";
}

/* ─── Tabs ─── */
const TABS = [
  { key: "flights", label: "Flights", icon: "✈️", gradient: "from-blue-600 to-blue-700" },
  { key: "hotels", label: "Hotels", icon: "🏨", gradient: "from-purple-600 to-purple-700" },
  { key: "activities", label: "Activities", icon: "🎯", gradient: "from-amber-500 to-orange-600" },
  { key: "transfers", label: "Transfers", icon: "🚗", gradient: "from-emerald-600 to-teal-600" },
];

/* ─── Formatting helpers ─── */
function fmtPrice(price, currency) {
  if (typeof price !== "number" || price === 0) return "—";
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function stopsLabel(stops) {
  if (stops === 0) return "Direct";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

function stopsBadgeColor(stops) {
  if (stops === 0) return "bg-green-50 text-green-700 border-green-200";
  if (stops === 1) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

/* ─── Flight Card ─── */
function FlightCard({ flight, isSelected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={`https://images.kiwi.com/airlines/64/${flight.carrierIata}.png`}
          alt={flight.airline}
          width={32}
          height={32}
          className="rounded-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{flight.airline}</p>
          <p className="text-xs text-slate-500">{flight.flightNumber}</p>
        </div>
        {isSelected && (
          <span className="text-[10px] font-bold text-teal-700 bg-teal-200 px-2 py-0.5 rounded-full shrink-0">
            Selected
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">{flight.departure || "--:--"}</p>
          <p className="text-xs font-semibold text-slate-500">{flight.originCode}</p>
        </div>
        <div className="flex-1 mx-3 flex flex-col items-center">
          <p className="text-[10px] text-slate-400 mb-1">{flight.duration}</p>
          <div className="w-full flex items-center">
            <div className="h-px flex-1 bg-slate-300" />
            <svg className="w-3 h-3 text-slate-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <div className="h-px flex-1 bg-slate-300" />
          </div>
          <span className={`text-[10px] font-semibold mt-1 px-2 py-0.5 rounded border ${stopsBadgeColor(flight.stops)}`}>
            {stopsLabel(flight.stops)}
          </span>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">{flight.arrival || "--:--"}</p>
          <p className="text-xs font-semibold text-slate-500">{flight.destCode}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-medium">
            {cabinLabel(flight.cabinClass)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-slate-900">{fmtPrice(flight.price)}</p>
          <p className="text-[10px] text-slate-400">/person</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Hotel Card ─── */
function HotelCard({ hotel, isSelected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {hotel.image && (
        <div className="relative h-40 bg-slate-100">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-40 object-cover"
            onError={(e) => { e.target.parentElement.style.display = "none"; }}
          />
          {hotel.freeCancellation && (
            <span className="absolute top-2 left-2 text-[10px] font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full border border-green-300">
              Free cancellation
            </span>
          )}
          {isSelected && (
            <span className="absolute top-2 right-2 text-[10px] font-bold text-teal-800 bg-teal-200 px-2 py-0.5 rounded-full">
              Selected
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">{hotel.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{hotel.location}</p>
          </div>
          {!hotel.image && isSelected && (
            <span className="text-[10px] font-bold text-teal-700 bg-teal-200 px-2 py-0.5 rounded-full shrink-0">
              Selected
            </span>
          )}
        </div>
        {hotel.stars > 0 && (
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(Math.min(Math.round(Number(hotel.stars)), 5))].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hotel.room && (
            <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-200">
              {hotel.room}
            </span>
          )}
          {hotel.board && (
            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
              {hotel.board}
            </span>
          )}
          {hotel.perks && hotel.perks.map((perk, i) => (
            <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              {perk}
            </span>
          ))}
          {(hotel.freeCancellation || hotel.perks?.some(p => /cancel/i.test(p))) && (
            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
              Free cancellation
            </span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-black text-slate-900">{fmtPrice(hotel.price)}</p>
            <p className="text-[10px] text-slate-400">/night</p>
          </div>
          <button
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isSelected
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Activity Card ─── */
function ActivityCard({ activity, isSelected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {activity.image && (
        <div className="relative h-36 bg-slate-100">
          <img
            src={activity.image}
            alt={activity.name}
            className="w-full h-36 object-cover"
            onError={(e) => { e.target.parentElement.style.display = "none"; }}
          />
          {isSelected && (
            <span className="absolute top-2 right-2 text-[10px] font-bold text-teal-800 bg-teal-200 px-2 py-0.5 rounded-full">
              Selected
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{activity.name}</h4>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activity.duration && (
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
              {activity.duration}
            </span>
          )}
          {activity.category && (
            <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {activity.category}
            </span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-black text-slate-900">{fmtPrice(activity.price)}</p>
            <p className="text-[10px] text-slate-400">/person</p>
          </div>
          <button
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isSelected
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Transfer Card ─── */
function TransferCard({ transfer, isSelected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">
          🚗
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-sm">{transfer.vehicle || transfer.name}</h4>
          {transfer.description && (
            <p className="text-xs text-slate-500 truncate">{transfer.description}</p>
          )}
        </div>
        {isSelected && (
          <span className="text-[10px] font-bold text-teal-700 bg-teal-200 px-2 py-0.5 rounded-full shrink-0">
            Selected
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {transfer.vehicle && (
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
            {transfer.vehicle}
          </span>
        )}
        {transfer.duration && (
          <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
            {transfer.duration}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-lg font-black text-slate-900">{fmtPrice(transfer.price)}</p>
          <p className="text-[10px] text-slate-400">/person</p>
        </div>
        <button
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            isSelected
              ? "bg-teal-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {isSelected ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
}

/* ─── Skeleton Loader ─── */
function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="h-32 bg-slate-100 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4" />
            <div className="h-3 bg-slate-100 animate-pulse rounded w-1/2" />
            <div className="h-6 bg-slate-100 animate-pulse rounded w-1/4 mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ icon, type, hasDestination }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <p className="text-5xl mb-4">{icon}</p>
      <p className="font-bold text-slate-600 text-lg">No {type} found</p>
      <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
        {!hasDestination
          ? "Enter a destination above and click Search to find options."
          : `Try adjusting your search criteria to find more ${type}.`}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ════════════════════════════════════════════════ */
export default function AgentProposalSelectPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId;

  /* ─── State ─── */
  const [tripData, setTripData] = useState({});
  const [activeTab, setActiveTab] = useState("flights");

  // Search form
  const [searchForm, setSearchForm] = useState({
    origin: "", destination: "", checkIn: "", checkOut: "",
    travelers: "2", roundTrip: true, cabinClass: "economy",
  });
  const [hasSearched, setHasSearched] = useState(false);

  // Flight direction toggle for round-trip
  const [flightDirection, setFlightDirection] = useState("outbound"); // "outbound" | "return"

  // Results
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activities, setActivities] = useState([]);
  const [transfers, setTransfers] = useState([]);

  // Loading states
  const [loadingOutbound, setLoadingOutbound] = useState(false);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  // Selected items: flights are single-select outbound/inbound; others are multi-select
  const [selected, setSelected] = useState({
    flights: { outbound: null, inbound: null },
    hotels: [],
    activities: [],
    transfers: [],
  });

  const [sending, setSending] = useState(false);

  // Client & Lead assignment (multi-select)
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // array of selected ids
  const [assignTab, setAssignTab] = useState("clients"); // "clients" | "leads"
  const [assignSearch, setAssignSearch] = useState("");
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState("");

  /* ─── Load clients (refresh session first to avoid 401) ─── */
  useEffect(() => {
    async function loadClients() {
      try {
        await fetch("/api/auth/me");
        const res = await fetch("/api/clients");
        if (res.ok) {
          const json = await res.json();
          if (json?.data) setClients(json.data);
        }
      } catch {}
    }
    loadClients();
  }, []);

  /* ─── Load leads ─── */
  useEffect(() => {
    async function loadLeads() {
      setLeadsLoading(true);
      try {
        const meRes = await fetch("/api/auth/me");
        const me = meRes.ok ? await meRes.json() : null;
        const email = me?.user?.email || me?.email || "";
        if (!email) { setLeadsLoading(false); return; }
        const p = new URLSearchParams({ path: "admin/agent-leads/" + encodeURIComponent(email) });
        const r = await fetch(`/api/agents-proxy?${p}`);
        if (r.ok) {
          const d = await r.json();
          setLeads((d?.leads || []).filter(l => l.email && !l.email.endsWith("@zeniva-lead.com")));
        }
      } catch {}
      setLeadsLoading(false);
    }
    loadLeads();
  }, []);

  /* ─── Load trip data ─── */
  useEffect(() => {
    if (!tripId) return;
    const data = loadTripData(tripId);
    const snap = data.snapshot || {};

    const applySnapshot = (s) => {
      const dates = (s.dates || "").split("→").map(d => d.trim());
      // Multi-city: take first city only (e.g. "Paris, Rome" → "Paris")
      const rawDest = s.destination || "";
      const dest = rawDest.split(/[,;/&]+/)[0].trim();
      const dep = s.departure || s.departureCity || "";
      // Fix past dates: replace with future defaults
      const today = new Date().toISOString().slice(0, 10);
      const rawCheckIn = dates[0] || s.checkIn || "";
      const rawCheckOut = dates[1] || s.checkOut || "";
      const checkIn = (rawCheckIn && rawCheckIn >= today) ? rawCheckIn : "";
      const checkOut = (rawCheckOut && rawCheckOut >= today) ? rawCheckOut : "";
      setSearchForm(f => ({
        ...f,
        origin: (dep && isValidDest(dep)) ? dep : "Montreal",
        destination: isValidDest(dest) ? dest : "",
        checkIn,
        checkOut,
        travelers: (s.travelers?.toString().match(/\d+/)?.[0]) || String(s.adults || 2),
      }));
    };

    if (snap.destination && isValidDest(snap.destination)) {
      setTripData(data);
      applySnapshot(snap);
    } else {
      fetch(`/api/proposals?id=${encodeURIComponent(tripId)}`)
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          const proposal = json?.data?.[0];
          if (!proposal) return;
          const draft = proposal.payload?.tripDraft || proposal.payload?.snapshot || {};
          const remoteSnap = proposal.payload?.snapshot || draft;
          if (remoteSnap.destination || draft.destination) {
            const merged = { ...draft, ...remoteSnap };
            setTripData({ snapshot: merged });
            applySnapshot(merged);
          }
        })
        .catch(() => {});
    }
  }, [tripId]);

  const snapshot = tripData.snapshot || {};
  const budget = parseInt((snapshot.budget || "0").toString().replace(/[^0-9]/g, "")) || 0;

  /* ─── Run search ─── */
  const runSearch = useCallback(() => {
    const dest = searchForm.destination;
    if (!dest) return;
    setHasSearched(true);
    setFlightDirection("outbound");

    const origin = searchForm.origin || "Montreal";
    const checkIn = searchForm.checkIn || "";
    const checkOut = searchForm.checkOut || "";
    const cabin = searchForm.cabinClass;

    // Outbound flights
    setLoadingOutbound(true);
    searchFlights(origin, dest, checkIn || undefined, cabin)
      .then(r => setOutboundFlights(r))
      .finally(() => setLoadingOutbound(false));

    // Return flights (if round-trip)
    if (searchForm.roundTrip) {
      setLoadingReturn(true);
      searchFlights(dest, origin, checkOut || undefined, cabin)
        .then(r => setReturnFlights(r))
        .finally(() => setLoadingReturn(false));
    } else {
      setReturnFlights([]);
    }

    // Hotels
    setLoadingHotels(true);
    searchHotels(dest, checkIn || undefined, checkOut || undefined, parseInt(searchForm.travelers) || 2)
      .then(r => setHotels(r))
      .finally(() => setLoadingHotels(false));

    // Activities
    setLoadingActivities(true);
    searchActivities(dest)
      .then(r => setActivities(r))
      .finally(() => setLoadingActivities(false));

    // Transfers
    setLoadingTransfers(true);
    searchTransfers(dest)
      .then(r => setTransfers(r))
      .finally(() => setLoadingTransfers(false));
  }, [searchForm]);

  // Auto-search on first destination load
  useEffect(() => {
    if (searchForm.destination && !hasSearched) runSearch();
  }, [searchForm.destination]);

  /* ─── Selection helpers ─── */
  const selectFlight = (direction, flight) => {
    setSelected(prev => {
      const key = direction === "outbound" ? "outbound" : "inbound";
      const current = prev.flights[key];
      const isSame = current && (current.id === flight.id);
      return {
        ...prev,
        flights: { ...prev.flights, [key]: isSame ? null : flight },
      };
    });
  };

  const toggleMulti = (type, item) => {
    setSelected(prev => {
      const list = prev[type] || [];
      const exists = list.find(i => (i.id || i.name) === (item.id || item.name));
      return {
        ...prev,
        [type]: exists
          ? list.filter(i => (i.id || i.name) !== (item.id || item.name))
          : [...list, item],
      };
    });
  };

  const isMultiSelected = (type, item) => {
    return (selected[type] || []).some(i => (i.id || i.name) === (item.id || item.name));
  };

  const removeItem = (type, item) => {
    if (type === "flights-outbound") {
      setSelected(prev => ({ ...prev, flights: { ...prev.flights, outbound: null } }));
    } else if (type === "flights-inbound") {
      setSelected(prev => ({ ...prev, flights: { ...prev.flights, inbound: null } }));
    } else {
      toggleMulti(type, item);
    }
  };

  /* ─── Pricing calculation ─── */
  // Hotels are OPTIONS (client picks one), so use cheapest hotel for estimate
  const hotelPrices = selected.hotels.map(h => h.price || 0).sort((a, b) => a - b);
  const cheapestHotel = hotelPrices[0] || 0;
  const mostExpensiveHotel = hotelPrices[hotelPrices.length - 1] || 0;

  const baseTotalNoHotel = (() => {
    let total = 0;
    if (selected.flights.outbound) total += selected.flights.outbound.price || 0;
    if (selected.flights.inbound) total += selected.flights.inbound.price || 0;
    selected.activities.forEach(a => total += (a.price || 0));
    selected.transfers.forEach(t => total += (t.price || 0));
    return total;
  })();

  const runningTotal = baseTotalNoHotel + cheapestHotel;
  const runningTotalMax = baseTotalNoHotel + mostExpensiveHotel;
  const serviceFee = Math.round(runningTotal * SERVICE_FEE_RATE);
  const serviceFeeMax = Math.round(runningTotalMax * SERVICE_FEE_RATE);
  const grandTotal = runningTotal + serviceFee;
  const grandTotalMax = runningTotalMax + serviceFeeMax;

  const totalSelectedCount = (
    (selected.flights.outbound ? 1 : 0) +
    (selected.flights.inbound ? 1 : 0) +
    selected.hotels.length +
    selected.activities.length +
    selected.transfers.length
  );

  /* ─── Create proposal ─── */
  const createProposal = async () => {
    setSending(true);
    try {
      // Find selected client/lead objects
      const allPeople = [...clients, ...leads.map(l => ({ id: l.id, name: (l.first_name || "") + " " + (l.last_name || ""), email: l.email, phone: l.phone || "", _isLead: true }))];
      const selectedPeople = allPeople.filter(p => selectedIds.includes(p.id));
      const selectedClient = selectedPeople[0] || null;
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tripId,
          ownerEmail: "agent@zeniva.ca",
          status: "Ready",
          payload: {
            trip: { title: searchForm.destination || "Trip" },
            tripDraft: {
              destination: searchForm.destination,
              departureCity: searchForm.origin,
              checkIn: searchForm.checkIn,
              checkOut: searchForm.checkOut,
              adults: parseInt(searchForm.travelers) || 2,
              budget,
              cabinClass: searchForm.cabinClass,
              roundTrip: searchForm.roundTrip,
            },
            client: selectedClient ? {
              id: selectedClient.id,
              name: selectedClient.name || selectedClient.first_name || "",
              email: selectedClient.email || "",
              phone: selectedClient.phone || "",
            } : null,
            clients: selectedPeople.map(p => ({
              id: p.id,
              name: p.name || p.first_name || "",
              email: p.email || "",
              phone: p.phone || "",
              isLead: !!p._isLead,
            })),
            selections: {
              flights: selected.flights,
              hotels: selected.hotels,
              activities: selected.activities,
              transfers: selected.transfers,
            },
            pricing: { subtotal: runningTotal, serviceFee, total: grandTotal },
            source: "agent_trip_search",
          },
        }),
      });
      if (res.ok) {
        router.push(`/agent/proposals/preview/${tripId}`);
      }
    } catch {}
    setSending(false);
  };

  /* ─── Current flight display ─── */
  const currentFlights = flightDirection === "outbound" ? outboundFlights : returnFlights;
  const currentFlightsLoading = flightDirection === "outbound" ? loadingOutbound : loadingReturn;

  /* ─── Render ─── */
  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/agent/trip-search/chat/${tripId}`}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors"
            >
              ← Back to Chat
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Image
                src="/lina-avatar.png"
                alt="Lina"
                width={28}
                height={28}
                className="rounded-full"
              />
              <h1 className="text-lg font-black text-slate-900">Build Proposal</h1>
            </div>
            {searchForm.destination && (
              <span className="text-sm text-teal-700 font-semibold bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">
                {searchForm.destination}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {totalSelectedCount > 0 && (
              <span className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {totalSelectedCount} item{totalSelectedCount > 1 ? "s" : ""} selected
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-5 py-6 flex gap-6">
        {/* ════ Main Content ════ */}
        <div className="flex-1 min-w-0">
          {/* ── Search Form ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 items-end">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">From</label>
                <input
                  value={searchForm.origin}
                  onChange={e => setSearchForm(f => ({ ...f, origin: e.target.value }))}
                  placeholder="Montreal"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">To</label>
                <input
                  value={searchForm.destination}
                  onChange={e => setSearchForm(f => ({ ...f, destination: e.target.value }))}
                  placeholder="Cancun"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Check-in</label>
                <input
                  type="date"
                  value={searchForm.checkIn}
                  onChange={e => setSearchForm(f => ({ ...f, checkIn: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Check-out</label>
                <input
                  type="date"
                  value={searchForm.checkOut}
                  onChange={e => setSearchForm(f => ({ ...f, checkOut: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Travelers</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={searchForm.travelers}
                  onChange={e => setSearchForm(f => ({ ...f, travelers: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cabin</label>
                <select
                  value={searchForm.cabinClass}
                  onChange={e => setSearchForm(f => ({ ...f, cabinClass: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 bg-white"
                >
                  {CABIN_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Round-trip</label>
                <button
                  onClick={() => setSearchForm(f => ({ ...f, roundTrip: !f.roundTrip }))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                    searchForm.roundTrip
                      ? "bg-teal-50 border-teal-300 text-teal-700"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  {searchForm.roundTrip ? "ON" : "OFF"}
                </button>
              </div>
              <div>
                <button
                  onClick={runSearch}
                  disabled={!searchForm.destination}
                  className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-violet-600 text-white text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-5">
            {TABS.map(tab => {
              let count = 0;
              if (tab.key === "flights") count = (selected.flights.outbound ? 1 : 0) + (selected.flights.inbound ? 1 : 0);
              else count = (selected[tab.key] || []).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.icon}</span> {tab.label}
                  {count > 0 && (
                    <span className={`text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center ${
                      activeTab === tab.key ? "bg-teal-400 text-slate-900" : "bg-teal-100 text-teal-700"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Results Panel ── */}

          {/* === FLIGHTS === */}
          {activeTab === "flights" && (
            <div>
              {/* Section header */}
              <div className={`rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 flex items-center justify-between`}>
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  ✈️ Flight Results
                  {searchForm.roundTrip && (
                    <span className="text-blue-200 text-xs font-medium">
                      — {flightDirection === "outbound" ? "Outbound" : "Return"}
                    </span>
                  )}
                </h2>
                {searchForm.roundTrip && (
                  <div className="flex bg-blue-800/40 rounded-lg p-0.5">
                    <button
                      onClick={() => setFlightDirection("outbound")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        flightDirection === "outbound"
                          ? "bg-white text-blue-700"
                          : "text-blue-200 hover:text-white"
                      }`}
                    >
                      Outbound ({getIATA(searchForm.origin) || searchForm.origin} → {getIATA(searchForm.destination) || searchForm.destination})
                    </button>
                    <button
                      onClick={() => setFlightDirection("return")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        flightDirection === "return"
                          ? "bg-white text-blue-700"
                          : "text-blue-200 hover:text-white"
                      }`}
                    >
                      Return ({getIATA(searchForm.destination) || searchForm.destination} → {getIATA(searchForm.origin) || searchForm.origin})
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-5">
                {/* Selected flight summary for this direction */}
                {flightDirection === "outbound" && selected.flights.outbound && (
                  <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-700">Outbound selected:</span>
                      <span className="text-xs text-teal-600">{selected.flights.outbound.name} — {selected.flights.outbound.route}</span>
                    </div>
                    <span className="text-xs font-bold text-teal-700">{fmtPrice(selected.flights.outbound.price)}</span>
                  </div>
                )}
                {flightDirection === "return" && selected.flights.inbound && (
                  <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-700">Return selected:</span>
                      <span className="text-xs text-teal-600">{selected.flights.inbound.name} — {selected.flights.inbound.route}</span>
                    </div>
                    <span className="text-xs font-bold text-teal-700">{fmtPrice(selected.flights.inbound.price)}</span>
                  </div>
                )}

                {currentFlightsLoading ? (
                  <SkeletonCards count={4} />
                ) : currentFlights.length === 0 ? (
                  <EmptyState icon="✈️" type="flights" hasDestination={!!searchForm.destination} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentFlights.map((flight, i) => {
                      const dir = flightDirection === "outbound" ? "outbound" : "inbound";
                      const sel = selected.flights[dir];
                      const isSel = sel && sel.id === flight.id;
                      return (
                        <FlightCard
                          key={flight.id || i}
                          flight={flight}
                          isSelected={isSel}
                          onToggle={() => selectFlight(dir, flight)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === HOTELS === */}
          {activeTab === "hotels" && (
            <div>
              <div className="rounded-t-2xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3">
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  🏨 Hotel Results
                  <span className="text-purple-200 text-xs font-medium">— Select one or more</span>
                </h2>
              </div>
              <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-5">
                {loadingHotels ? (
                  <SkeletonCards count={4} />
                ) : hotels.length === 0 ? (
                  <EmptyState icon="🏨" type="hotels" hasDestination={!!searchForm.destination} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.map((hotel, i) => (
                      <HotelCard
                        key={hotel.id || i}
                        hotel={hotel}
                        isSelected={isMultiSelected("hotels", hotel)}
                        onToggle={() => toggleMulti("hotels", hotel)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === ACTIVITIES === */}
          {activeTab === "activities" && (
            <div>
              <div className="rounded-t-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3">
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  🎯 Activity Results
                </h2>
              </div>
              <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-5">
                {loadingActivities ? (
                  <SkeletonCards count={4} />
                ) : activities.length === 0 ? (
                  <EmptyState icon="🎯" type="activities" hasDestination={!!searchForm.destination} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activities.map((activity, i) => (
                      <ActivityCard
                        key={activity.id || i}
                        activity={activity}
                        isSelected={isMultiSelected("activities", activity)}
                        onToggle={() => toggleMulti("activities", activity)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === TRANSFERS === */}
          {activeTab === "transfers" && (
            <div>
              <div className="rounded-t-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3">
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  🚗 Transfer Results
                </h2>
              </div>
              <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-5">
                {loadingTransfers ? (
                  <SkeletonCards count={4} />
                ) : transfers.length === 0 ? (
                  <EmptyState icon="🚗" type="transfers" hasDestination={!!searchForm.destination} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transfers.map((transfer, i) => (
                      <TransferCard
                        key={transfer.id || i}
                        transfer={transfer}
                        isSelected={isMultiSelected("transfers", transfer)}
                        onToggle={() => toggleMulti("transfers", transfer)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ════ Sidebar ════ */}
        <div className="w-80 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 sticky top-20 overflow-hidden">
            {/* Sidebar header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-sm font-black text-slate-900">Proposal Draft</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {totalSelectedCount} item{totalSelectedCount !== 1 ? "s" : ""} selected
              </p>
            </div>

            {/* Client / Lead assignment (multi-select) */}
            <div className="px-5 py-3 border-b border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                Assign To ({selectedIds.length} selected)
              </label>

              {/* Tabs: Clients / Leads */}
              <div className="flex rounded-lg bg-slate-100 p-0.5 mb-2">
                <button
                  onClick={() => setAssignTab("clients")}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${assignTab === "clients" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Clients ({clients.length})
                </button>
                <button
                  onClick={() => setAssignTab("leads")}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${assignTab === "leads" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Leads ({leads.length})
                </button>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search by name or email..."
                value={assignSearch}
                onChange={e => setAssignSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs mb-2 focus:outline-none focus:border-teal-400 bg-white"
              />

              {/* List */}
              <div className="max-h-40 overflow-y-auto space-y-1">
                {assignTab === "clients" && clients
                  .filter(c => {
                    if (!assignSearch) return true;
                    const q = assignSearch.toLowerCase();
                    return (c.name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
                  })
                  .map(c => (
                    <label key={c.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${selectedIds.includes(c.id) ? "bg-teal-50 border border-teal-200" : "border border-transparent"}`}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                        className="accent-teal-500 w-3.5 h-3.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.email}</p>
                      </div>
                    </label>
                  ))
                }
                {assignTab === "leads" && (leadsLoading ? (
                  <p className="text-[10px] text-slate-400 text-center py-3">Loading leads...</p>
                ) : leads
                  .filter(l => {
                    if (!assignSearch) return true;
                    const q = assignSearch.toLowerCase();
                    const name = ((l.first_name || "") + " " + (l.last_name || "")).toLowerCase();
                    return name.includes(q) || (l.email || "").toLowerCase().includes(q);
                  })
                  .map(l => (
                    <label key={l.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${selectedIds.includes(l.id) ? "bg-violet-50 border border-violet-200" : "border border-transparent"}`}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(l.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(l.id) ? prev.filter(x => x !== l.id) : [...prev, l.id])}
                        className="accent-violet-500 w-3.5 h-3.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{l.first_name} {l.last_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{l.email}</p>
                        {l.destination && <p className="text-[9px] text-teal-600 font-semibold">{l.destination}</p>}
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${l.status === "new" ? "bg-blue-100 text-blue-700" : l.status === "contacted" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
                        {l.status}
                      </span>
                    </label>
                  ))
                )}
                {assignTab === "clients" && clients.length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center py-3">No clients yet</p>
                )}
                {assignTab === "leads" && !leadsLoading && leads.length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center py-3">No leads yet</p>
                )}
              </div>

              {/* Selected chips */}
              {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedIds.map(id => {
                    const c = clients.find(x => x.id === id);
                    const l = leads.find(x => x.id === id);
                    const name = c ? c.name : l ? `${l.first_name || ""} ${l.last_name || ""}` : id;
                    const isLead = !!l;
                    return (
                      <span key={id} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${isLead ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"}`}>
                        {name.trim()}
                        <button onClick={() => setSelectedIds(prev => prev.filter(x => x !== id))} className="hover:opacity-70">✕</button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Budget tracker */}
            {budget > 0 && (
              <div className="px-5 py-3 border-b border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Budget</label>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Client budget</span>
                  <span className="text-xs font-bold text-slate-700">${budget.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      grandTotal > budget ? "bg-red-500" : "bg-teal-500"
                    }`}
                    style={{ width: `${Math.min((grandTotal / budget) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400">
                    {grandTotal > budget ? "Over budget" : "Within budget"}
                  </span>
                  <span className={`text-[10px] font-bold ${grandTotal > budget ? "text-red-500" : "text-teal-600"}`}>
                    ${grandTotal.toLocaleString()} / ${budget.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Selected items list */}
            <div className="px-5 py-3 max-h-[45vh] overflow-y-auto">
              {/* Outbound flight */}
              {selected.flights.outbound && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1.5">
                    ✈️ Outbound Flight
                  </p>
                  <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{selected.flights.outbound.name}</p>
                      <p className="text-[10px] text-slate-500">{selected.flights.outbound.route}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 mx-2">{fmtPrice(selected.flights.outbound.price)}</span>
                    <button
                      onClick={() => removeItem("flights-outbound")}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Return flight */}
              {selected.flights.inbound && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1.5">
                    ✈️ Return Flight
                  </p>
                  <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{selected.flights.inbound.name}</p>
                      <p className="text-[10px] text-slate-500">{selected.flights.inbound.route}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 mx-2">{fmtPrice(selected.flights.inbound.price)}</span>
                    <button
                      onClick={() => removeItem("flights-inbound")}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Hotels — OPTIONS (client picks one) */}
              {selected.hotels.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wide">
                      🏨 Hotel Options ({selected.hotels.length})
                    </p>
                    <span className="text-[8px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">PICK 1</span>
                  </div>
                  {selected.hotels.map((item, i) => {
                    const hotelTotal = baseTotalNoHotel + (item.price || 0);
                    const hotelFee = Math.round(hotelTotal * SERVICE_FEE_RATE);
                    return (
                      <div key={i} className="bg-purple-50 rounded-lg px-3 py-2 mb-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-500">{fmtPrice(item.price)} /night</p>
                          </div>
                          <button
                            onClick={() => removeItem("hotels", item)}
                            className="text-red-400 hover:text-red-600 text-xs ml-2"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="mt-1 pt-1 border-t border-purple-200/50 flex items-center justify-between">
                          <span className="text-[9px] text-purple-500 font-semibold">Total with this hotel</span>
                          <span className="text-[10px] font-black text-purple-700">${(hotelTotal + hotelFee).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Activities */}
              {selected.activities.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">
                    🎯 Activities ({selected.activities.length})
                  </p>
                  {selected.activities.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{fmtPrice(item.price)}</p>
                      </div>
                      <button
                        onClick={() => removeItem("activities", item)}
                        className="text-red-400 hover:text-red-600 text-xs ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Transfers */}
              {selected.transfers.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">
                    🚗 Transfers ({selected.transfers.length})
                  </p>
                  {selected.transfers.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.vehicle || item.name}</p>
                        <p className="text-[10px] text-slate-500">{fmtPrice(item.price)}</p>
                      </div>
                      <button
                        onClick={() => removeItem("transfers", item)}
                        className="text-red-400 hover:text-red-600 text-xs ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {totalSelectedCount === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">
                  Search and click items to add them to the proposal.
                </p>
              )}
            </div>

            {/* Pricing summary */}
            {totalSelectedCount > 0 && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <div className="space-y-1.5 mb-3">
                  {/* Base costs (flights + activities + transfers) */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Flights + extras</span>
                    <span className="text-xs font-semibold text-slate-700">${baseTotalNoHotel.toLocaleString()}</span>
                  </div>
                  {/* Hotel range */}
                  {selected.hotels.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Hotel (1 option)</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {selected.hotels.length === 1
                          ? `$${cheapestHotel.toLocaleString()}`
                          : `$${cheapestHotel.toLocaleString()} – $${mostExpensiveHotel.toLocaleString()}`
                        }
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Service fee (6%)</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {grandTotal === grandTotalMax
                        ? `$${serviceFee.toLocaleString()}`
                        : `$${serviceFee.toLocaleString()} – $${serviceFeeMax.toLocaleString()}`
                      }
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">Total</span>
                    <span className="text-sm font-black text-slate-900">
                      {grandTotal === grandTotalMax
                        ? `$${grandTotal.toLocaleString()}`
                        : `$${grandTotal.toLocaleString()} – $${grandTotalMax.toLocaleString()}`
                      }
                    </span>
                  </div>
                  {selected.hotels.length > 1 && (
                    <p className="text-[9px] text-slate-400 text-center">Price depends on hotel choice</p>
                  )}
                </div>
                <button
                  onClick={createProposal}
                  disabled={sending || totalSelectedCount === 0}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {sending ? "Creating..." : "Preview Proposal →"}
                </button>
                <button
                  onClick={() => setShowMarketingModal(true)}
                  disabled={totalSelectedCount === 0}
                  className="w-full py-3 mt-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  📣 Marketing / Facebook Ad
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Marketing / Facebook Ad Modal ── */}
      {showMarketingModal && (() => {
        const dest = searchForm.destination || "Paradise";
        const dates = (searchForm.checkIn && searchForm.checkOut) ? `${searchForm.checkIn} → ${searchForm.checkOut}` : "";
        const travelers = searchForm.travelers || "2";
        const hotelList = selected.hotels.map(h => h.name).filter(Boolean);
        const flightOut = selected.flights.outbound;
        const flightRet = selected.flights.inbound;
        const activityList = selected.activities.map(a => a.name).filter(Boolean);
        const fmtRound = (n) => "$" + Math.round(n).toLocaleString();

        // Build clean FB post (no empty double lines)
        const fbLines = [
          `✈️🌴 ${dest} — Trip Package Available!`,
          "",
        ];
        if (dates) fbLines.push(`📅 ${dates}`);
        fbLines.push(`👥 ${travelers} travelers`);
        if (flightOut) { fbLines.push(""); fbLines.push(`✈️ Flight: ${flightOut.name || ""} ${flightOut.route || ""}`); }
        if (flightRet) fbLines.push(`✈️ Return: ${flightRet.name || ""} ${flightRet.route || ""}`);
        if (hotelList.length) { fbLines.push(""); fbLines.push("🏨 Hotel options:"); hotelList.forEach(h => fbLines.push(`  • ${h}`)); }
        if (activityList.length) { fbLines.push(""); fbLines.push("🎯 Experiences:"); activityList.forEach(a => fbLines.push(`  • ${a}`)); }
        if (grandTotal > 0) {
          fbLines.push("");
          fbLines.push(grandTotal === grandTotalMax ? `💰 From ${fmtRound(grandTotal)}` : `💰 From ${fmtRound(grandTotal)} – ${fmtRound(grandTotalMax)}`);
        }
        fbLines.push("");
        fbLines.push("🔥 Limited availability — DM us or comment BOOK to reserve!");
        fbLines.push("");
        fbLines.push("💬 Chat with Lina AI to customize your trip:");
        fbLines.push("👉 zenivatravel.com/chat");
        fbLines.push("");
        fbLines.push("#ZenivaTravel #" + dest.replace(/[^a-zA-Z]/g, "") + " #TravelDeals #LuxuryTravel #AITravel #Vacation");
        const fbText = fbLines.join("\n");

        // HTML Ad for Facebook / download
        const rawImg = selected.hotels[0]?.image || selected.hotels[0]?.thumbnail || selected.hotels[0]?.photos?.[0] || "";
        // Ensure absolute URL so image works in downloaded HTML
        const hotelImg = rawImg ? (rawImg.startsWith("http") ? rawImg : "https://www.zenivatravel.com" + rawImg) : "";
        const priceStr = grandTotal > 0 ? (grandTotal === grandTotalMax ? fmtRound(grandTotal) : fmtRound(grandTotal) + " – " + fmtRound(grandTotalMax)) : "";

        const adHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F1F5F9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}</style>
</head><body>
<div style="width:100%;max-width:540px;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.15);background:white;">
  <div style="height:260px;background:${hotelImg ? "url('" + hotelImg + "') center/cover" : "linear-gradient(135deg,#0F6CF5,#0B1B4D)"};position:relative;">
    <div style="position:absolute;inset:0;background:linear-gradient(0deg,rgba(11,27,77,0.85) 0%,rgba(0,0,0,0.1) 50%);"></div>
    <div style="position:absolute;top:16px;left:16px;background:rgba(230,184,90,0.9);color:#0B1B4D;font-size:11px;font-weight:900;padding:5px 12px;border-radius:999px;letter-spacing:1px;">ZENIVA TRAVEL</div>
    <div style="position:absolute;bottom:20px;left:20px;right:20px;">
      <h1 style="font-size:28px;font-weight:900;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.3);">${dest}</h1>
      ${dates ? `<p style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">📅 ${dates} · 👥 ${travelers} travelers</p>` : ""}
    </div>
  </div>
  <div style="padding:24px;">
    ${flightOut ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:12px;background:#F8FAFC;border-radius:12px;">
      <div style="width:36px;height:36px;background:#EFF6FF;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;">✈️</div>
      <div><p style="font-size:10px;color:#6B7280;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">FLIGHT</p><p style="font-size:13px;color:#0B1B4D;font-weight:800;margin-top:2px;">${flightOut.name || ""} · ${flightOut.route || ""}</p></div>
    </div>` : ""}
    ${hotelList.map(h => `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:12px;background:#F8FAFC;border-radius:12px;">
      <div style="width:36px;height:36px;background:#F0FDF4;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;">🏨</div>
      <div><p style="font-size:10px;color:#6B7280;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">HOTEL OPTION</p><p style="font-size:13px;color:#0B1B4D;font-weight:800;margin-top:2px;">${h}</p></div>
    </div>`).join("")}
    ${activityList.map(a => `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:12px;background:#F8FAFC;border-radius:12px;">
      <div style="width:36px;height:36px;background:#FFFBEB;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;">🎯</div>
      <div><p style="font-size:10px;color:#6B7280;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">EXPERIENCE</p><p style="font-size:13px;color:#0B1B4D;font-weight:800;margin-top:2px;">${a}</p></div>
    </div>`).join("")}
    ${priceStr ? `<div style="margin-top:16px;padding:20px;background:linear-gradient(135deg,#0B1B4D,#0F3A8A);border-radius:16px;text-align:center;">
      <p style="font-size:10px;color:#E6B85A;font-weight:800;text-transform:uppercase;letter-spacing:2px;">STARTING FROM</p>
      <p style="font-size:26px;font-weight:900;color:white;margin-top:6px;">${priceStr}</p>
    </div>` : ""}
    <div style="margin-top:16px;text-align:center;">
      <a href="https://www.zenivatravel.com/chat" style="display:inline-block;background:linear-gradient(90deg,#0F6CF5,#0B1B4D);color:white;font-size:13px;font-weight:800;padding:14px 36px;border-radius:50px;text-decoration:none;">Book Now — Chat with Lina ✨</a>
      <p style="font-size:11px;color:#94A3B8;margin-top:10px;">DM or comment BOOK · zenivatravel.com</p>
    </div>
  </div>
</div>
</body></html>`;

        const copyText = async (text, label) => {
          try {
            await navigator.clipboard.writeText(text);
            setCopiedLabel(label);
            setTimeout(() => setCopiedLabel(""), 2000);
          } catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.cssText = "position:fixed;left:-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopiedLabel(label);
            setTimeout(() => setCopiedLabel(""), 2000);
          }
        };

        const downloadHtml = () => {
          const blob = new Blob([adHtml], { type: "text/html" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `zeniva-ad-${dest.replace(/\s+/g, "-").toLowerCase()}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        const shareOnFacebook = () => {
          // Copy text first, then open share dialog
          copyText(fbText, "fb");
          const shareUrl = encodeURIComponent("https://www.zenivatravel.com/chat");
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank", "width=600,height=500");
        };

        return (
          <div className="fixed inset-0 z-[9999] bg-black/60 flex items-end sm:items-center justify-center" onClick={() => setShowMarketingModal(false)}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-black text-slate-900">Marketing — {dest}</h2>
                <button onClick={() => setShowMarketingModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5">

                {/* Facebook Post Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facebook / Instagram Post</h3>
                    <button onClick={() => copyText(fbText, "post")} className={`text-xs font-bold transition ${copiedLabel === "post" ? "text-green-600" : "text-blue-600 hover:text-blue-800"}`}>
                      {copiedLabel === "post" ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                  <pre className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-200 max-h-60 overflow-y-auto font-sans">{fbText}</pre>
                </div>

                {/* HTML Ad Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ad Preview</h3>
                    <button onClick={downloadHtml} className="text-xs font-bold text-pink-600 hover:text-pink-800 transition">Download HTML</button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200" style={{ background: "#F1F5F9" }}>
                    <iframe
                      srcDoc={adHtml}
                      className="w-full border-0"
                      style={{ height: 560 }}
                      title="Ad Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 bg-white">
                <button onClick={() => copyText(fbText, "post2")} className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${copiedLabel === "post2" ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                  {copiedLabel === "post2" ? "Copied!" : "Copy Post Text"}
                </button>
                <button onClick={shareOnFacebook} className="flex-1 py-3 rounded-xl bg-[#1877F2] text-white text-sm font-bold hover:opacity-90 transition">
                  Share on Facebook
                </button>
                <button onClick={downloadHtml} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-bold hover:opacity-90 transition">
                  Download Ad
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
