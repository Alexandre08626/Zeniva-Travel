"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const AGENT_STORE_KEY = "zeniva_agent_chat_v1";

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

/* ─── Search APIs ─── */
async function searchFlights(origin, destination, date) {
  try {
    const res = await fetch("/api/amadeus/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, departureDate: date, adults: 1, max: 8 }),
    });
    if (res.ok) {
      const data = await res.json();
      return (data.flights || data.data || []).slice(0, 8);
    }
  } catch {}
  return [];
}

async function searchHotels(destination, checkIn, checkOut) {
  try {
    const res = await fetch("/api/amadeus/hotels/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, checkIn, checkOut, adults: 2, max: 8 }),
    });
    if (res.ok) {
      const data = await res.json();
      return (data.hotels || data.data || []).slice(0, 8);
    }
  } catch {}
  return [];
}

async function searchActivities(destination) {
  try {
    const res = await fetch(`/api/amadeus/activities/search?destination=${encodeURIComponent(destination)}&max=6`);
    if (res.ok) {
      const data = await res.json();
      return (data.activities || data.data || []).slice(0, 6);
    }
  } catch {}
  return [];
}

async function searchTransfers(destination) {
  try {
    const res = await fetch(`/api/amadeus/transfers/search?destination=${encodeURIComponent(destination)}&max=4`);
    if (res.ok) {
      const data = await res.json();
      return (data.transfers || data.data || []).slice(0, 4);
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

  // Load trip data
  useEffect(() => {
    if (!tripId) return;
    const data = loadTripData(tripId);
    setTripData(data);
  }, [tripId]);

  const snapshot = tripData.snapshot || {};
  const destination = snapshot.destination || "";
  const dates = snapshot.dates || "";
  const [startDate, endDate] = useMemo(() => {
    const parts = (dates || "").split("→").map(s => s.trim());
    return [parts[0] || "", parts[1] || ""];
  }, [dates]);

  // Search on load
  useEffect(() => {
    if (!destination) return;
    const destCode = getIATA(destination);
    const originCode = getIATA(snapshot.departure || "Montreal") || "YUL";

    // Flights
    if (destCode && originCode) {
      setLoadingFlights(true);
      searchFlights(originCode, destCode, startDate || undefined)
        .then(setFlights)
        .finally(() => setLoadingFlights(false));
    }

    // Hotels
    setLoadingHotels(true);
    searchHotels(destination, startDate || undefined, endDate || undefined)
      .then(setHotels)
      .finally(() => setLoadingHotels(false));

    // Activities
    setLoadingActivities(true);
    searchActivities(destination)
      .then(setActivities)
      .finally(() => setLoadingActivities(false));

    // Transfers
    setLoadingTransfers(true);
    searchTransfers(destination)
      .then(setTransfers)
      .finally(() => setLoadingTransfers(false));
  }, [destination, startDate, endDate, snapshot.departure]);

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
          tripId,
          destination,
          dates,
          travelers: snapshot.travelers,
          budget: snapshot.budget,
          selections: selected,
          source: "agent_trip_search",
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
            {destination && <span className="text-sm text-teal-700 font-semibold bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">📍 {destination}</span>}
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
          {/* Trip snapshot */}
          {destination && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5 grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "Destination", value: destination, icon: "📍" },
                { label: "Dates", value: dates || "Flexible", icon: "📅" },
                { label: "Travelers", value: snapshot.travelers || "2 adults", icon: "👥" },
                { label: "Budget", value: snapshot.budget || "Flexible", icon: "💰" },
                { label: "Departure", value: snapshot.departure || "YUL", icon: "✈️" },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{f.icon} {f.label}</p>
                  <p className="text-sm font-bold text-slate-800">{f.value}</p>
                </div>
              ))}
            </div>
          )}

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
                        {!destination ? "Go back to chat and describe the trip first." : `Try adjusting your search criteria for ${destination}.`}
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
