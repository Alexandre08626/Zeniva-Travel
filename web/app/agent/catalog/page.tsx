"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/src/lib/authStore";

type CatalogTab = "stays" | "yachts" | "hotels";

interface StayItem {
  id: string;
  title: string;
  location: string;
  thumbnail: string;
  price_per_night?: number;
  price_currency?: string;
  description?: string;
}

interface YachtItem {
  id: string;
  title: string;
  destination: string;
  thumbnail: string;
  prices: string[];
  specs?: string;
  amenities?: string[];
}

interface HotelItem {
  id: string;
  name: string;
  destination: string;
  type: string;
  status: string;
  description: string;
  pricing: { publicRateFrom: string };
  media: { name: string; images: string[] }[];
  roomTypes: string[];
  amenities: string[];
}

const TABS: { key: CatalogTab; label: string; icon: string; color: string }[] = [
  { key: "stays", label: "ZeniStay", icon: "🏠", color: "#f59e0b" },
  { key: "yachts", label: "ZeniYacht", icon: "🛥️", color: "#0F6CF5" },
  { key: "hotels", label: "ZeniHotel", icon: "🏨", color: "#10b981" },
];

function extractPrice(prices: string[]): string {
  if (!prices?.length) return "—";
  const first = prices[0];
  const match = first.match(/\$[\d,]+/);
  return match ? `From ${match[0]}` : first;
}

function truncate(s: string, n: number) {
  if (!s) return "";
  // Strip excessive whitespace/newlines
  const clean = s.replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
  return clean.length > n ? clean.slice(0, n) + "..." : clean;
}

export default function CatalogPage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<CatalogTab>("stays");
  const [search, setSearch] = useState("");
  const [stays, setStays] = useState<StayItem[]>([]);
  const [yachts, setYachts] = useState<YachtItem[]>([]);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sendModal, setSendModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [sendTab, setSendTab] = useState<"clients" | "leads">("clients");
  const [sendSearch, setSendSearch] = useState("");
  const [sendToIds, setSendToIds] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  // Optional flight
  const [addFlight, setAddFlight] = useState(false);
  const [flightFrom, setFlightFrom] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [flightReturn, setFlightReturn] = useState("");
  const [flightTravelers, setFlightTravelers] = useState("2");
  // Marketing modal
  const [showMarketing, setShowMarketing] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState("");

  // Load catalog data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/partners/airbnbs").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/partners/ycn").then(r => r.ok ? r.json() : []).catch(() => []),
      import("@/src/data/partners/resorts").then(m => m.resortPartners).catch(() => []),
    ]).then(([s, y, h]) => {
      setStays(Array.isArray(s) ? s : s?.data || []);
      setYachts(Array.isArray(y) ? y : y?.data || []);
      setHotels(Array.isArray(h) ? h : []);
    }).finally(() => setLoading(false));
  }, []);

  // Load clients + leads for send modal
  useEffect(() => {
    if (!sendModal) return;
    fetch("/api/auth/me").then(() =>
      fetch("/api/clients").then(r => r.ok ? r.json() : { data: [] })
    ).then(j => setClients(j?.data || [])).catch(() => {});

    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const me = meRes.ok ? await meRes.json() : null;
        const email = me?.user?.email || me?.email || "";
        if (!email) return;
        const p = new URLSearchParams({ path: "admin/agent-leads/" + encodeURIComponent(email) });
        const r = await fetch(`/api/agents-proxy?${p}`);
        if (r.ok) {
          const d = await r.json();
          setLeads((d?.leads || []).filter((l: any) => l.email && !l.email.endsWith("@zeniva-lead.com")));
        }
      } catch {}
    })();
  }, [sendModal]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Filter items by search
  const q = search.toLowerCase();
  const filteredStays = stays.filter(s => !q || s.title?.toLowerCase().includes(q) || s.location?.toLowerCase().includes(q));
  const filteredYachts = yachts.filter(y => !q || y.title?.toLowerCase().includes(q) || y.destination?.toLowerCase().includes(q));
  const filteredHotels = hotels.filter(h => !q || h.name?.toLowerCase().includes(q) || h.destination?.toLowerCase().includes(q));

  const currentItems = tab === "stays" ? filteredStays : tab === "yachts" ? filteredYachts : filteredHotels;
  const currentCount = tab === "stays" ? stays.length : tab === "yachts" ? yachts.length : hotels.length;

  // Get selected items details for send
  const getSelectedItems = () => {
    const items: { type: string; name: string; location: string; price: string; thumbnail: string; url: string }[] = [];
    selectedIds.forEach(id => {
      const stay = stays.find(s => s.id === id);
      if (stay) items.push({ type: "ZeniStay", name: stay.title, location: stay.location || "", price: stay.price_per_night ? `$${stay.price_per_night}/night` : "", thumbnail: stay.thumbnail, url: `/zenistay/${stay.id}` });
      const yacht = yachts.find(y => y.id === id);
      if (yacht) items.push({ type: "ZeniYacht", name: yacht.title, location: yacht.destination, price: extractPrice(yacht.prices), thumbnail: yacht.thumbnail, url: `/zeniyacht` });
      const hotel = hotels.find(h => h.id === id);
      if (hotel) items.push({ type: "ZeniHotel", name: hotel.name, location: hotel.destination, price: hotel.pricing?.publicRateFrom || "", thumbnail: hotel.media?.[0]?.images?.[0] || "", url: `/partners/resorts` });
    });
    return items;
  };

  const handleSend = async () => {
    if (!sendToIds.length || !selectedIds.length) return;
    setSending(true);
    try {
      const items = getSelectedItems();
      const allPeople = [
        ...clients.map((c: any) => ({ id: c.id, name: c.name, email: c.email, isLead: false })),
        ...leads.map((l: any) => ({ id: l.id, name: `${l.first_name || ""} ${l.last_name || ""}`.trim(), email: l.email, isLead: true })),
      ];
      const recipients = allPeople.filter(p => sendToIds.includes(p.email));
      const agentEmail = user?.email || "agent@zeniva.ca";

      // For each recipient: send email + save proposal in Supabase
      for (const r of recipients) {
        // Build optional flight info
        const flightInfo = addFlight && flightFrom ? {
          from: flightFrom,
          departDate: flightDate,
          returnDate: flightReturn,
          travelers: parseInt(flightTravelers) || 2,
        } : null;

        // 1. Send the catalog email
        await fetch("/api/proposals/send-catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientEmail: r.email,
            clientName: r.name,
            agentName: user?.name || user?.email || "Your Zeniva Agent",
            items,
            flight: flightInfo,
          }),
        });

        // 2. Save as proposal in Supabase so it appears in /agent/proposals
        const tripId = `catalog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const itemNames = items.map(i => i.name).join(", ");
        const itemTypes = [...new Set(items.map(i => i.type))].join(" + ");
        await fetch("/api/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: tripId,
            ownerEmail: agentEmail,
            status: "Sent",
            payload: {
              trip: { title: (flightInfo ? `Flight + ` : "") + itemTypes + " — " + itemNames.slice(0, 60) },
              tripDraft: {
                destination: items[0]?.location || "",
                departureCity: flightInfo?.from || "",
                checkIn: flightInfo?.departDate || "",
                checkOut: flightInfo?.returnDate || "",
                adults: flightInfo?.travelers || 2,
              },
              client: { name: r.name, email: r.email },
              clients: [{ id: r.id, name: r.name, email: r.email, isLead: r.isLead }],
              catalogItems: items,
              flight: flightInfo,
              pricing: { total: 0 },
              source: "catalog",
            },
          }),
        });
      }
      setSent(true);
      setTimeout(() => { setSent(false); setSendModal(false); setSelectedIds([]); setSendToIds([]); }, 2000);
    } catch {}
    setSending(false);
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Zeniva Catalog</h1>
            <p className="text-sm text-slate-500 mt-1">Browse all Zeniva partners. Select items and send to your clients & leads.</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSendModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
              >
                Send {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} to client
              </button>
            )}
            <Link href="/agent/trip-search" className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Back
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? "bg-white shadow-md border-2 text-slate-900"
                  : "bg-white/50 border border-slate-200 text-slate-500 hover:bg-white"
              }`}
              style={tab === t.key ? { borderColor: t.color } : {}}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                {t.key === "stays" ? stays.length : t.key === "yachts" ? yachts.length : hotels.length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tab === "stays" ? "residences" : tab === "yachts" ? "yachts" : "hotels"}...`}
            className="w-full rounded-xl bg-white border border-slate-200 pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-teal-400 shadow-sm"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading catalog...</div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No results found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* ZeniStay cards */}
            {tab === "stays" && filteredStays.map(item => {
              const selected = selectedIds.includes(item.id);
              return (
                <div key={item.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${selected ? "border-2 border-amber-400 ring-2 ring-amber-100" : "border-slate-100"}`}>
                  <div className="relative h-48 bg-slate-100">
                    {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all ${selected ? "bg-amber-400 text-white" : "bg-white/90 text-slate-400 hover:bg-white"}`}
                    >
                      {selected ? "✓" : "+"}
                    </button>
                    <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">ZeniStay</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-black text-slate-900 truncate">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{truncate(item.location || "", 60)}</p>
                    {item.price_per_night && (
                      <p className="text-sm font-bold text-amber-600 mt-2">${item.price_per_night} <span className="text-xs font-medium text-slate-400">/night</span></p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ZeniYacht cards */}
            {tab === "yachts" && filteredYachts.map(item => {
              const selected = selectedIds.includes(item.id);
              return (
                <div key={item.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${selected ? "border-2 border-blue-400 ring-2 ring-blue-100" : "border-slate-100"}`}>
                  <div className="relative h-48 bg-slate-100">
                    {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all ${selected ? "bg-blue-500 text-white" : "bg-white/90 text-slate-400 hover:bg-white"}`}
                    >
                      {selected ? "✓" : "+"}
                    </button>
                    <span className="absolute bottom-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">ZeniYacht</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-black text-slate-900 truncate">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.destination}</p>
                    {item.specs && <p className="text-[10px] text-slate-400 mt-1">{item.specs}</p>}
                    <p className="text-sm font-bold text-blue-600 mt-2">{extractPrice(item.prices)}</p>
                  </div>
                </div>
              );
            })}

            {/* ZeniHotel cards */}
            {tab === "hotels" && filteredHotels.map(item => {
              const selected = selectedIds.includes(item.id);
              const thumb = item.media?.[0]?.images?.[0] || "";
              return (
                <div key={item.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${selected ? "border-2 border-emerald-400 ring-2 ring-emerald-100" : "border-slate-100"}`}>
                  <div className="relative h-48 bg-slate-100">
                    {thumb && <img src={thumb} alt={item.name} className="w-full h-full object-cover" />}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all ${selected ? "bg-emerald-500 text-white" : "bg-white/90 text-slate-400 hover:bg-white"}`}
                    >
                      {selected ? "✓" : "+"}
                    </button>
                    <span className="absolute bottom-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">ZeniHotel</span>
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-black text-slate-900 truncate">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.destination}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{item.type} · {item.roomTypes?.length || 0} room types</p>
                    <p className="text-sm font-bold text-emerald-600 mt-2">From {item.pricing?.publicRateFrom || "—"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-5 py-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">{selectedIds.length} selected</span>
                <button onClick={() => setSelectedIds([])} className="text-xs text-slate-400 hover:text-red-500 transition">Clear all</button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMarketing(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
                >
                  Marketing
                </button>
                <button
                  onClick={() => setSendModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
                >
                  Send to Client / Lead
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send Modal */}
      {sendModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setSendModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[80vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header — sticky top */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-black text-slate-900">Send Catalog Items</h2>
              <button onClick={() => setSendModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto min-h-0">

            {/* Selected items preview + dates */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Sending {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""}</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {getSelectedItems().map((item, i) => (
                  <div key={i} className="flex-shrink-0 flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200">
                    {item.thumbnail && <img src={item.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{item.name}</p>
                      <p className="text-[9px] text-slate-400">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stay dates */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Check-in</label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={e => setFlightDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Check-out</label>
                  <input
                    type="date"
                    value={flightReturn}
                    onChange={e => setFlightReturn(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div className="px-5 py-3">
              <div className="flex rounded-lg bg-slate-100 p-0.5 mb-3">
                <button
                  onClick={() => setSendTab("clients")}
                  className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${sendTab === "clients" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Clients ({clients.length})
                </button>
                <button
                  onClick={() => setSendTab("leads")}
                  className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${sendTab === "leads" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Leads ({leads.length})
                </button>
              </div>

              <input
                type="text"
                placeholder="Search..."
                value={sendSearch}
                onChange={e => setSendSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs mb-2 focus:outline-none focus:border-teal-400"
              />

              <div className="space-y-1">
                {sendTab === "clients" && clients
                  .filter(c => !sendSearch || (c.name || "").toLowerCase().includes(sendSearch.toLowerCase()) || (c.email || "").toLowerCase().includes(sendSearch.toLowerCase()))
                  .map(c => (
                    <label key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition ${sendToIds.includes(c.email) ? "bg-teal-50 border border-teal-200" : "border border-transparent"}`}>
                      <input
                        type="checkbox"
                        checked={sendToIds.includes(c.email)}
                        onChange={() => setSendToIds(prev => prev.includes(c.email) ? prev.filter(x => x !== c.email) : [...prev, c.email])}
                        className="accent-teal-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.email}</p>
                      </div>
                    </label>
                  ))
                }
                {sendTab === "leads" && leads
                  .filter(l => {
                    if (!sendSearch) return true;
                    const name = `${l.first_name || ""} ${l.last_name || ""}`.toLowerCase();
                    return name.includes(sendSearch.toLowerCase()) || (l.email || "").toLowerCase().includes(sendSearch.toLowerCase());
                  })
                  .map(l => (
                    <label key={l.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition ${sendToIds.includes(l.email) ? "bg-violet-50 border border-violet-200" : "border border-transparent"}`}>
                      <input
                        type="checkbox"
                        checked={sendToIds.includes(l.email)}
                        onChange={() => setSendToIds(prev => prev.includes(l.email) ? prev.filter(x => x !== l.email) : [...prev, l.email])}
                        className="accent-violet-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800">{l.first_name} {l.last_name}</p>
                        <p className="text-[10px] text-slate-400">{l.email}</p>
                      </div>
                    </label>
                  ))
                }
              </div>
            </div>

            {/* Optional Flight */}
            <div className="px-5 py-3 border-t border-slate-100">
              <button
                onClick={() => setAddFlight(!addFlight)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  addFlight ? "bg-blue-50 border-2 border-blue-300 text-blue-800" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">✈️</span>
                  <span>Add a flight</span>
                </div>
                <span className="text-xs font-semibold">{addFlight ? "Added" : "Optional"}</span>
              </button>

              {addFlight && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Departure City</label>
                    <input
                      type="text"
                      value={flightFrom}
                      onChange={e => setFlightFrom(e.target.value)}
                      placeholder="e.g. Montreal, YUL"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Travelers</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={flightTravelers}
                      onChange={e => setFlightTravelers(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <p className="col-span-2 text-[10px] text-blue-500 font-semibold">Dates from check-in / check-out above</p>
                </div>
              )}
            </div>

            </div>{/* end scrollable content */}

            {/* Footer — sticky bottom */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
              <span className="text-xs text-slate-400">{sendToIds.length} recipient{sendToIds.length !== 1 ? "s" : ""}</span>
              <button
                onClick={handleSend}
                disabled={sending || !sendToIds.length || sent}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 ${sent ? "bg-green-500" : "bg-gradient-to-r from-teal-500 to-cyan-600 hover:opacity-90"}`}
              >
                {sent ? "Sent!" : sending ? "Sending..." : `Send to ${sendToIds.length} recipient${sendToIds.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Modal */}
      {showMarketing && (() => {
        const items = getSelectedItems();
        const itemNames = items.map(i => i.name);
        const itemTypes = [...new Set(items.map(i => i.type))];
        const title = itemTypes.join(" + ");
        const fmtRound = (n: number) => "$" + Math.round(n).toLocaleString();

        // Facebook post
        const fbLines = [
          `🌴✨ ${title} — Exclusive Properties Available!`,
          "",
        ];
        if (flightDate && flightReturn) fbLines.push(`📅 ${flightDate} → ${flightReturn}`);
        fbLines.push("");
        items.forEach(item => {
          const icon = item.type === "ZeniStay" ? "🏠" : item.type === "ZeniYacht" ? "🛥️" : "🏨";
          fbLines.push(`${icon} ${item.name}`);
          if (item.location) fbLines.push(`   📍 ${item.location}`);
          if (item.price) fbLines.push(`   ${item.price}`);
          fbLines.push("");
        });
        fbLines.push("🔥 Limited availability — DM us or comment BOOK!");
        fbLines.push("");
        fbLines.push("💬 Chat with Lina AI to book:");
        fbLines.push("👉 zenivatravel.com/chat");
        fbLines.push("");
        fbLines.push("#ZenivaTravel #LuxuryTravel #" + itemTypes.map(t => t.replace("Zeni", "")).join(" #Zeni") + " #TravelDeals #Vacation");
        const fbText = fbLines.join("\n");

        // HTML Ad
        const heroImg = items[0]?.thumbnail || "";
        const absImg = heroImg ? (heroImg.startsWith("http") ? heroImg : "https://www.zenivatravel.com" + heroImg) : "";

        const adHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F1F5F9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}</style>
</head><body>
<div style="width:100%;max-width:540px;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.15);background:white;">
  <div style="height:260px;background:${absImg ? "url('" + absImg + "') center/cover" : "linear-gradient(135deg,#E6B85A,#0B1B4D)"};position:relative;">
    <div style="position:absolute;inset:0;background:linear-gradient(0deg,rgba(11,27,77,0.85) 0%,rgba(0,0,0,0.1) 50%);"></div>
    <div style="position:absolute;top:16px;left:16px;background:rgba(230,184,90,0.9);color:#0B1B4D;font-size:11px;font-weight:900;padding:5px 12px;border-radius:999px;letter-spacing:1px;">ZENIVA TRAVEL</div>
    <div style="position:absolute;bottom:20px;left:20px;right:20px;">
      <h1 style="font-size:26px;font-weight:900;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.3);">${title}</h1>
      ${flightDate && flightReturn ? `<p style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">📅 ${flightDate} → ${flightReturn}</p>` : ""}
      <p style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px;">${items.length} exclusive propert${items.length > 1 ? "ies" : "y"}</p>
    </div>
  </div>
  <div style="padding:24px;">
    ${items.map(item => {
      const absThumb = item.thumbnail ? (item.thumbnail.startsWith("http") ? item.thumbnail : "https://www.zenivatravel.com" + item.thumbnail) : "";
      const badgeColor = item.type === "ZeniStay" ? "#F59E0B" : item.type === "ZeniYacht" ? "#0F6CF5" : "#10B981";
      return `<div style="display:flex;gap:12px;margin-bottom:14px;padding:12px;background:#F8FAFC;border-radius:14px;">
      ${absThumb ? `<img src="${absThumb}" style="width:70px;height:70px;border-radius:10px;object-fit:cover;" alt="">` : ""}
      <div style="flex:1;min-width:0;">
        <span style="display:inline-block;background:${badgeColor};color:white;font-size:9px;font-weight:900;padding:2px 8px;border-radius:999px;margin-bottom:4px;">${item.type}</span>
        <p style="font-size:14px;font-weight:800;color:#0B1B4D;margin-top:2px;">${item.name}</p>
        ${item.location ? `<p style="font-size:11px;color:#6B7280;margin-top:2px;">📍 ${item.location}</p>` : ""}
        ${item.price ? `<p style="font-size:13px;font-weight:800;color:${badgeColor};margin-top:4px;">${item.price}</p>` : ""}
      </div>
    </div>`;
    }).join("")}
    <div style="margin-top:16px;text-align:center;">
      <a href="https://www.zenivatravel.com/chat" style="display:inline-block;background:linear-gradient(90deg,#0F6CF5,#0B1B4D);color:white;font-size:13px;font-weight:800;padding:14px 36px;border-radius:50px;text-decoration:none;">Book Now — Chat with Lina ✨</a>
      <p style="font-size:11px;color:#94A3B8;margin-top:10px;">DM or comment BOOK · zenivatravel.com</p>
    </div>
  </div>
</div>
</body></html>`;

        const copyText = async (text: string, label: string) => {
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.cssText = "position:fixed;left:-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
          }
          setCopiedLabel(label);
          setTimeout(() => setCopiedLabel(""), 2000);
        };

        const downloadHtml = () => {
          const blob = new Blob([adHtml], { type: "text/html" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `zeniva-catalog-${itemTypes.join("-").toLowerCase()}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        const shareOnFacebook = () => {
          // Facebook scrapes Open Graph tags from whatever URL we pass — sharing
          // /chat gives a generic "chat with Lina" preview. Share the actual
          // property page so FB shows the real photo, title and price.
          const firstItemUrl = items[0]?.url || "/";
          const shareUrl = firstItemUrl.startsWith("http")
            ? firstItemUrl
            : `https://www.zenivatravel.com${firstItemUrl}`;

          // CRITICAL: open the FB window FIRST and synchronously inside the
          // click handler. Any async work before window.open (like awaiting
          // clipboard.writeText) breaks the user-gesture context and most
          // browsers will silently block the popup. Copy the text after.
          // sharer.php no longer honors `quote=` for non-FB-app links — keep
          // url-only and copy the post text to clipboard so the agent can
          // paste it into the FB compose box that opens.
          const shareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

          // On mobile, prefer the native share sheet (FB app, IG, WhatsApp,
          // SMS, etc. all show up). Use navigator.share when available.
          const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
          if (isMobile && typeof navigator !== "undefined" && (navigator as any).share) {
            (navigator as any)
              .share({ title: "Zeniva Travel", text: fbText, url: shareUrl })
              .catch(() => {
                window.location.href = shareHref;
              });
            // Best-effort copy in the background.
            copyText(fbText, "fb");
            return;
          }

          // Desktop: open the FB share dialog in a centered popup. If the popup
          // is blocked, fall through to a same-tab navigation so the share
          // still happens.
          const w = 600;
          const h = 600;
          const left = typeof window !== "undefined" ? window.screenX + Math.max(0, (window.outerWidth - w) / 2) : 0;
          const top = typeof window !== "undefined" ? window.screenY + Math.max(0, (window.outerHeight - h) / 2) : 0;
          const popup = window.open(
            shareHref,
            "zenivaFbShare",
            `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
          );
          if (!popup) {
            // Popup blocked — fall back to in-tab navigation so the user still
            // gets to Facebook's share dialog.
            window.location.href = shareHref;
            return;
          }
          // Now (after window.open succeeded) copy the post text in the
          // background so the agent can paste it into the FB compose box.
          copyText(fbText, "fb");
        };

        return (
          <div className="fixed inset-0 z-[9999] bg-black/60 flex items-end sm:items-center justify-center" onClick={() => setShowMarketing(false)}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] shadow-2xl flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-black text-slate-900">Marketing — {title}</h2>
                <button onClick={() => setShowMarketing(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5">
                {/* FB Post */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facebook / Instagram Post</h3>
                    <button onClick={() => copyText(fbText, "post")} className={`text-xs font-bold transition ${copiedLabel === "post" ? "text-green-600" : "text-blue-600 hover:text-blue-800"}`}>
                      {copiedLabel === "post" ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                  <pre className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-200 max-h-60 overflow-y-auto font-sans">{fbText}</pre>
                </div>

                {/* Ad Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ad Preview</h3>
                    <button onClick={downloadHtml} className="text-xs font-bold text-pink-600 hover:text-pink-800 transition">Download HTML</button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200" style={{ background: "#F1F5F9" }}>
                    <iframe srcDoc={adHtml} className="w-full border-0" style={{ height: 560 }} title="Ad Preview" sandbox="allow-same-origin" />
                  </div>
                </div>
              </div>

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
