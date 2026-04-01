"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const AGENT_STORE_KEY = "zeniva_agent_chat_v1";

/* ─── Validate destination ─── */
const DEST_BLACKLIST = /^(city|provide|help|plan|find|search|make|give|get|know|need|want|have|will|your|their|some|more|best|good|also|just|that|this|with|from|about|like|would|could|should|here|there|been|being|very|much|such|each|other|tailored|recommend|personalized|perfect|great|sure|hello|thank|welcome|assist|happy|today|trip|travel|luxury|let|please|certainly|absolutely|wonderful|exciting|amazing|fantastic|beautiful|stunning|explore|discover|enjoy|offer|include|option|package|suggest|information|detail)/i;
function isValidDest(d) {
  if (!d || d.length < 3 || d.length > 40) return false;
  if (DEST_BLACKLIST.test(d.trim())) return false;
  if (d.trim().split(/\s+/).length > 4) return false;
  return true;
}

/* ─── Load trip snapshot from agent chat ─── */
function loadTripData(tripId) {
  try {
    const raw = localStorage.getItem(AGENT_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[tripId] || {};
  } catch { return {}; }
}

/* ─── IATA code lookup ─── */
const IATA = {
  "Montreal": "YUL", "Montréal": "YUL", "Toronto": "YYZ", "Vancouver": "YVR", "Ottawa": "YOW", "Calgary": "YYC", "Quebec": "YQB", "Halifax": "YHZ",
  "New York": "JFK", "Miami": "MIA", "Los Angeles": "LAX", "Chicago": "ORD", "San Francisco": "SFO", "Las Vegas": "LAS", "Orlando": "MCO",
  "Cancun": "CUN", "Cancún": "CUN", "Punta Cana": "PUJ", "Paris": "CDG", "London": "LHR", "Barcelona": "BCN", "Rome": "FCO", "Madrid": "MAD",
  "Dubai": "DXB", "Tokyo": "NRT", "Bangkok": "BKK", "Bali": "DPS", "Maldives": "MLE", "Honolulu": "HNL", "Lisbon": "LIS", "Athens": "ATH",
};

function getIATA(city) {
  if (!city) return null;
  for (const [name, code] of Object.entries(IATA)) {
    if (city.toLowerCase().includes(name.toLowerCase())) return code;
  }
  return null;
}

/* ─── Search APIs (Duffel + LiteAPI + RapidAPI) ─── */
async function searchFlights(origin, destination, date) {
  // Duffel flights API — pass city names, server resolves IATA
  try {
    const futureDate = date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const params = new URLSearchParams({ origin, destination, date: futureDate });
    const res = await fetch(`/api/partners/duffel?${params}`);
    if (res.ok) {
      const data = await res.json();
      const offers = data?.result?.data?.offers || data?.result?.offers || data?.offers || data?.data || [];
      return offers.slice(0, 10).map((o, i) => {
        const slice = o.slices?.[0] || {};
        const seg = slice.segments?.[0] || {};
        const carrier = seg.operating_carrier?.name || seg.marketing_carrier?.name || o.owner?.name || "Airline";
        return {
          id: o.id || `flight-${i}`,
          name: `${carrier} ${seg.operating_carrier_flight_number || seg.marketing_carrier_flight_number || ""}`.trim(),
          airline: carrier,
          route: `${slice.origin?.iata_code || origin} → ${slice.destination?.iata_code || destination}`,
          price: parseFloat(o.total_amount || "0"),
          currency: o.total_currency || "CAD",
          class: o.cabin_class || seg.passengers?.[0]?.cabin_class_marketing_name || "Economy",
          duration: slice.duration ? `${Math.floor(parseInt(slice.duration?.replace("PT","")?.replace("H",":").split(":")[0]||0))}h${slice.duration?.match(/(\d+)M/)?.[1] || "00"}` : "",
          stops: (slice.segments?.length || 1) - 1,
          departure: seg.departing_at ? new Date(seg.departing_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          arrival: seg.arriving_at ? new Date(seg.arriving_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        };
      });
    }
  } catch {}
  return [];
}

async function searchHotels(destination, checkIn, checkOut) {
  // LiteAPI hotels
  try {
    const params = new URLSearchParams({ destination, checkIn: checkIn || "", checkOut: checkOut || "", guests: "2", rooms: "1" });
    const res = await fetch(`/api/partners/liteapi/hotels/search?${params}`);
    if (res.ok) {
      const data = await res.json();
      const hotels = data?.hotels || data?.data || [];
      return hotels.slice(0, 10).map((h, i) => ({
        id: h.id || h.hotelId || `hotel-${i}`,
        name: h.name || h.hotelName || "Hotel",
        location: h.address || h.location || "",
        price: h.price || h.minRate || h.rate || 0,
        currency: h.currency || "USD",
        stars: h.stars || h.starRating || h.category || 0,
        rating: h.rating || h.reviewScore || null,
        room: h.roomName || h.roomType || "",
        board: h.boardType || h.boardBasis || "",
        image: h.image || h.thumbnail || h.main_photo || null,
      }));
    }
  } catch {}
  // Fallback: Amadeus hotels
  try {
    const res = await fetch("/api/amadeus/hotels/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, checkIn, checkOut, adults: 2, max: 10 }),
    });
    if (res.ok) {
      const data = await res.json();
      return (data.hotels || data.data || []).slice(0, 10);
    }
  } catch {}
  return [];
}

async function searchActivities(destination) {
  // RapidAPI / Booking.com activities
  try {
    const res = await fetch(`/api/booking/activities/search?destination=${encodeURIComponent(destination)}&limit=8`);
    if (res.ok) {
      const data = await res.json();
      return (data.activities || data.data || []).slice(0, 8);
    }
  } catch {}
  // Fallback: Amadeus
  try {
    const res = await fetch(`/api/experiences/search?destination=${encodeURIComponent(destination)}&limit=8`);
    if (res.ok) {
      const data = await res.json();
      return (data.activities || data.experiences || data.data || []).slice(0, 8);
    }
  } catch {}
  return [];
}

async function searchTransfers(destination) {
  // Booking transfers
  try {
    const res = await fetch(`/api/transfers/search?destination=${encodeURIComponent(destination)}&limit=6`);
    if (res.ok) {
      const data = await res.json();
      return (data.transfers || data.data || []).slice(0, 6);
    }
  } catch {}
  return [];
}

/* ─── Tab config ─── */
const TABS = [
  { key: "flights", label: "Flights", icon: "✈️" },
  { key: "hotels", label: "Hotels", icon: "🏨" },
  { key: "activities", label: "Activities", icon: "🎯" },
  { key: "transfers", label: "Transfers", icon: "🚗" },
  { key: "summary", label: "Summary", icon: "📋" },
];

/* ─── Result card ─── */
function ResultCard({ item, type, selected, onToggle }) {
  const title = item.name || item.airline || item.title || "Unknown";
  const subtitle = item.location || item.route || item.subtitle || item.description?.slice(0, 80) || "";
  const price = item.price || item.total || item.amount || "—";
  const isSelected = selected;

  return (
    <div
      onClick={onToggle}
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${isSelected ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200 shadow-md" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isSelected && <span className="text-xs font-bold text-teal-700 bg-teal-200 px-2 py-0.5 rounded-full">✓ Selected</span>}
          </div>
          <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          {/* Details */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {type === "flights" && (
              <>
                {item.airline && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">{item.airline}</span>}
                {item.class && <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{item.class}</span>}
                {item.duration && <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{item.duration}</span>}
                {item.stops !== undefined && <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{item.stops === 0 ? "Direct" : `${item.stops} stop(s)`}</span>}
                {item.departure && <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">Dep: {item.departure}</span>}
              </>
            )}
            {type === "hotels" && (
              <>
                {item.stars && <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">{"⭐".repeat(Math.min(item.stars, 5))}</span>}
                {item.rating && <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">{item.rating}/5</span>}
                {item.room && <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-200">{item.room}</span>}
                {item.board && <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">{item.board}</span>}
              </>
            )}
            {type === "activities" && (
              <>
                {item.duration && <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">{item.duration}</span>}
                {item.category && <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{item.category}</span>}
              </>
            )}
            {type === "transfers" && (
              <>
                {item.vehicle && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">{item.vehicle}</span>}
                {item.duration && <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{item.duration}</span>}
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-slate-900">{typeof price === "number" ? `$${price}` : price}</p>
          <p className="text-[10px] text-slate-400">{type === "hotels" ? "/night" : "/person"}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function AgentProposalSelectPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId;

  const [tripData, setTripData] = useState({});
  const [activeTab, setActiveTab] = useState("flights");
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activities, setActivities] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [selected, setSelected] = useState({ flights: [], hotels: [], activities: [], transfers: [] });
  const [sending, setSending] = useState(false);

  // Manual search form state
  const [searchForm, setSearchForm] = useState({ origin: "", destination: "", checkIn: "", checkOut: "", travelers: "2" });
  const [hasSearched, setHasSearched] = useState(false);

  // Load trip data from agent chat (localStorage first, then Supabase fallback)
  useEffect(() => {
    if (!tripId) return;
    const data = loadTripData(tripId);
    const snap = data.snapshot || {};

    const applySnapshot = (s) => {
      const dates = (s.dates || "").split("→").map(d => d.trim());
      const dest = s.destination || "";
      const dep = s.departure || s.departureCity || "";
      setSearchForm(f => ({
        ...f,
        origin: (dep && isValidDest(dep)) ? dep : "Montreal",
        destination: isValidDest(dest) ? dest : "",
        checkIn: dates[0] || s.checkIn || "",
        checkOut: dates[1] || s.checkOut || "",
        travelers: (s.travelers?.toString().match(/\d+/)?.[0]) || String(s.adults || 2),
      }));
    };

    if (snap.destination && isValidDest(snap.destination)) {
      setTripData(data);
      applySnapshot(snap);
    } else {
      // Fallback: load from Supabase
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

  // Run search - reads directly from searchForm state
  const runSearch = () => {
    const dest = searchForm.destination;
    if (!dest) return;
    setHasSearched(true);

    const origin = searchForm.origin || "Montreal";
    const checkIn = searchForm.checkIn || "";
    const checkOut = searchForm.checkOut || "";
    setLoadingFlights(true);
    searchFlights(origin, dest, checkIn || undefined)
      .then(r => { console.log("Flights:", r.length); setFlights(r); })
      .finally(() => setLoadingFlights(false));

    setLoadingHotels(true);
    searchHotels(dest, checkIn || undefined, checkOut || undefined)
      .then(r => { console.log("Hotels:", r.length); setHotels(r); })
      .finally(() => setLoadingHotels(false));

    setLoadingActivities(true);
    searchActivities(dest)
      .then(r => { console.log("Activities:", r.length); setActivities(r); })
      .finally(() => setLoadingActivities(false));

    setLoadingTransfers(true);
    searchTransfers(dest)
      .then(r => { console.log("Transfers:", r.length); setTransfers(r); })
      .finally(() => setLoadingTransfers(false));
  };

  // Auto-search if snapshot has destination
  useEffect(() => {
    if (searchForm.destination && !hasSearched) runSearch();
  }, [searchForm.destination]);

  const toggleSelection = (type, item) => {
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

  const isSelected = (type, item) => {
    return (selected[type] || []).some(i => (i.id || i.name) === (item.id || item.name));
  };

  const totalSelected = Object.values(selected).reduce((s, arr) => s + arr.length, 0);

  const createProposal = async () => {
    setSending(true);
    try {
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
              budget: parseInt((tripData.snapshot?.budget || "0").replace(/[^0-9]/g, "")) || 0,
            },
            selections: selected,
            source: "agent_trip_search",
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/agent/proposals`);
      }
    } catch {}
    setSending(false);
  };

  const getResults = () => {
    switch (activeTab) {
      case "flights": return { items: flights, loading: loadingFlights, type: "flights" };
      case "hotels": return { items: hotels, loading: loadingHotels, type: "hotels" };
      case "activities": return { items: activities, loading: loadingActivities, type: "activities" };
      case "transfers": return { items: transfers, loading: loadingTransfers, type: "transfers" };
      default: return { items: [], loading: false, type: "" };
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/agent/trip-search/chat/${tripId}`} className="text-slate-400 hover:text-slate-600 text-sm font-bold">← Back to Chat</Link>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-lg font-black text-slate-900">Build Proposal</h1>
            {searchForm.destination && <span className="text-sm text-teal-700 font-semibold bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">📍 {searchForm.destination}</span>}
          </div>
          <div className="flex items-center gap-3">
            {totalSelected > 0 && (
              <span className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {totalSelected} item{totalSelected > 1 ? "s" : ""} selected
              </span>
            )}
            <button
              onClick={createProposal}
              disabled={totalSelected === 0 || sending}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {sending ? "Creating..." : `Send Proposal (${totalSelected})`}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-6 flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">✈️ From</label>
                <input value={searchForm.origin} onChange={e => setSearchForm(f => ({...f, origin: e.target.value}))} placeholder="Montreal" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">📍 To</label>
                <input value={searchForm.destination} onChange={e => setSearchForm(f => ({...f, destination: e.target.value}))} placeholder="Cancun" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">📅 Check-in</label>
                <input type="date" value={searchForm.checkIn} onChange={e => setSearchForm(f => ({...f, checkIn: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">📅 Check-out</label>
                <input type="date" value={searchForm.checkOut} onChange={e => setSearchForm(f => ({...f, checkOut: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">👥 Travelers</label>
                <input type="number" min="1" max="9" value={searchForm.travelers} onChange={e => setSearchForm(f => ({...f, travelers: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <button onClick={runSearch} disabled={!searchForm.destination} className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-violet-600 text-white text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity">
                  🔍 Search
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-5">
            {TABS.map(tab => {
              const count = tab.key === "summary" ? totalSelected : (selected[tab.key] || []).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === tab.key ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <span>{tab.icon}</span> {tab.label}
                  {count > 0 && (
                    <span className={`text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center ${activeTab === tab.key ? "bg-teal-400 text-slate-900" : "bg-teal-100 text-teal-700"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Results */}
          {activeTab === "summary" ? (
            <div className="space-y-6">
              {["flights", "hotels", "activities", "transfers"].map(type => {
                const items = selected[type] || [];
                if (items.length === 0) return null;
                const tab = TABS.find(t => t.key === type);
                return (
                  <div key={type}>
                    <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">{tab?.icon} {tab?.label} ({items.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map((item, i) => (
                        <ResultCard key={i} item={item} type={type} selected onToggle={() => toggleSelection(type, item)} />
                      ))}
                    </div>
                  </div>
                );
              })}
              {totalSelected === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-bold text-slate-600">No items selected yet</p>
                  <p className="text-sm mt-1">Go through each tab and click items to add them to the proposal.</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {(() => {
                const { items, loading, type } = getResults();
                if (loading) {
                  return (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-slate-200" />
                      ))}
                    </div>
                  );
                }
                if (items.length === 0) {
                  return (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                      <p className="text-4xl mb-3">{TABS.find(t => t.key === type)?.icon || "🔍"}</p>
                      <p className="font-bold text-slate-600">No {type} found</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {!searchForm.destination ? "Enter a destination above and click Search." : `Try adjusting your search criteria for ${searchForm.destination}.`}
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item, i) => (
                      <ResultCard
                        key={item.id || i}
                        item={item}
                        type={type}
                        selected={isSelected(type, item)}
                        onToggle={() => toggleSelection(type, item)}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Selection sidebar */}
        <div className="w-72 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 sticky top-20">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">📋 Proposal Draft</h3>
              <p className="text-xs text-slate-400 mt-0.5">{totalSelected} items selected</p>
            </div>
            <div className="px-4 py-3 max-h-[60vh] overflow-y-auto space-y-3">
              {["flights", "hotels", "activities", "transfers"].map(type => {
                const items = selected[type] || [];
                if (items.length === 0) return null;
                const tab = TABS.find(t => t.key === type);
                return (
                  <div key={type}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{tab?.icon} {tab?.label}</p>
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.name || item.airline || item.title}</p>
                          <p className="text-[10px] text-slate-400">{typeof item.price === "number" ? `$${item.price}` : item.price || item.total || ""}</p>
                        </div>
                        <button onClick={() => toggleSelection(type, item)} className="text-red-400 hover:text-red-600 text-xs ml-2">✕</button>
                      </div>
                    ))}
                  </div>
                );
              })}
              {totalSelected === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">Click results to add them here.</p>
              )}
            </div>
            {totalSelected > 0 && (
              <div className="px-4 py-3 border-t border-slate-100">
                <button
                  onClick={createProposal}
                  disabled={sending}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {sending ? "Creating..." : "Send Proposal →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
