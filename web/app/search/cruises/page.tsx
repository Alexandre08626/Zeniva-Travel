"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Params = {
  region?: string;
  departureMonth?: string;
  duration?: string;
  guests?: string;
};

type CruiseOption = {
  id: string;
  name: string;
  line: string;
  route: string;
  dates: string;
  duration: string;
  price: string;
  priceNum: number;
  cabin: string;
  perks: string[];
  badge?: string;
  image: string;
};

const sampleCruises: CruiseOption[] = [
  { id: "cru-1", name: "Caribbean Escape", line: "Celebrity Cruises", route: "Miami → St. Maarten → St. Lucia → Barbados", dates: "Mar 12 – Mar 19", duration: "7 nights", price: "$1,350 / person", priceNum: 1350, cabin: "Veranda stateroom", perks: ["Drinks & Wi-Fi", "Onboard credit", "Flexible fare"], badge: "Best value", image: "https://images.unsplash.com/photo-1548032885-b5e38734eca5?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-2", name: "Mediterranean Icons", line: "Oceania Cruises", route: "Rome → Amalfi → Santorini → Athens", dates: "May 4 – May 11", duration: "7 nights", price: "$2,480 / person", priceNum: 2480, cabin: "Concierge veranda", perks: ["Fine dining", "Air credit", "Excursion credit"], badge: "Top pick", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-3", name: "Alaska Fjords", line: "Holland America", route: "Vancouver → Juneau → Skagway → Ketchikan", dates: "Jul 8 – Jul 15", duration: "7 nights", price: "$1,180 / person", priceNum: 1180, cabin: "Oceanview", perks: ["Excursion credit", "Kids promo", "Flexible cancel"], badge: "Family friendly", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-4", name: "Greek Isles Discovery", line: "Azamara", route: "Athens → Mykonos → Paros → Rhodes", dates: "Jun 2 – Jun 9", duration: "7 nights", price: "$1,620 / person", priceNum: 1620, cabin: "Veranda", perks: ["Gratuities", "Wi-Fi", "Smaller ship"], badge: "Small ship", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-5", name: "Baltic Capitals", line: "Norwegian Cruise Line", route: "Copenhagen → Tallinn → Helsinki → Stockholm", dates: "Aug 14 – Aug 21", duration: "7 nights", price: "$1,050 / person", priceNum: 1050, cabin: "Balcony", perks: ["Drinks", "Wi-Fi", "Specialty dining"], badge: "Great value", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-6", name: "Norway Fjords", line: "Princess Cruises", route: "Southampton → Bergen → Geiranger → Stavanger", dates: "May 18 – May 25", duration: "7 nights", price: "$1,290 / person", priceNum: 1290, cabin: "Balcony", perks: ["Medallion tech", "Flex fare"], badge: "Scenic", image: "https://images.unsplash.com/photo-1520769945061-0a448c463865?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-7", name: "Iceland Loop", line: "Windstar Cruises", route: "Reykjavik → Isafjordur → Seydisfjordur → Reykjavik", dates: "Jul 3 – Jul 10", duration: "7 nights", price: "$2,250 / person", priceNum: 2250, cabin: "Oceanview", perks: ["Small ship", "Excursion credit"], badge: "Expedition", image: "https://images.unsplash.com/photo-1531911315232-ff5d3d2e74b8?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-8", name: "Galapagos Journey", line: "Celebrity Flora", route: "Baltra → Genovesa → Santa Cruz", dates: "Oct 6 – Oct 13", duration: "7 nights", price: "$5,400 / person", priceNum: 5400, cabin: "Suite", perks: ["All-inclusive", "Excursions", "Naturalists"], badge: "Bucket list", image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-9", name: "Danube Castles", line: "AMA Waterways", route: "Budapest → Vienna → Melk → Passau", dates: "Sep 10 – Sep 17", duration: "7 nights", price: "$3,050 / person", priceNum: 3050, cabin: "French balcony", perks: ["Excursions", "Wine & beer", "Wi-Fi"], badge: "River cruise", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-10", name: "Seine Gourmet", line: "Uniworld Boutique", route: "Paris → Rouen → Honfleur → Paris", dates: "Apr 14 – Apr 21", duration: "7 nights", price: "$3,280 / person", priceNum: 3280, cabin: "Deluxe", perks: ["All-inclusive", "Butler", "Small ship"], badge: "Culinary", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-11", name: "Dubai to Mumbai", line: "Oceania Cruises", route: "Dubai → Abu Dhabi → Muscat → Mumbai", dates: "Jan 18 – Jan 28", duration: "10 nights", price: "$2,980 / person", priceNum: 2980, cabin: "Veranda", perks: ["Fine dining", "Wi-Fi", "Shore credit"], image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-12", name: "Australia Explorer", line: "Royal Caribbean", route: "Sydney → Hobart → Adelaide → Sydney", dates: "Feb 3 – Feb 13", duration: "10 nights", price: "$1,450 / person", priceNum: 1450, cabin: "Balcony", perks: ["Drinks package", "Wi-Fi"], badge: "Popular", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-13", name: "Antarctic Peninsula", line: "Lindblad Expeditions", route: "Ushuaia → Antarctic Peninsula → Ushuaia", dates: "Dec 5 – Dec 15", duration: "10 nights", price: "$8,900 / person", priceNum: 8900, cabin: "Suite", perks: ["Expedition team", "Zodiacs", "Parkas"], badge: "Expedition", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-14", name: "Hawaii Islands", line: "NCL Pride of America", route: "Honolulu → Maui → Kona → Kauai", dates: "Nov 2 – Nov 9", duration: "7 nights", price: "$1,640 / person", priceNum: 1640, cabin: "Balcony", perks: ["US-flagged", "Ports daily"], badge: "Island hopper", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-15", name: "Panama Canal", line: "Princess Cruises", route: "Ft Lauderdale → Cartagena → Panama → Costa Rica", dates: "Jan 6 – Jan 16", duration: "10 nights", price: "$1,780 / person", priceNum: 1780, cabin: "Balcony", perks: ["Canal transit", "Wi-Fi"], badge: "Classic route", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80" },
];

const REGIONS = ["All", "Caribbean", "Mediterranean", "Alaska", "Northern Europe", "River", "Expedition", "Asia", "Pacific"];
const BADGE_COLORS: Record<string, string> = {
  "Best value": "bg-emerald-100 text-emerald-800",
  "Top pick": "bg-blue-100 text-blue-800",
  "Family friendly": "bg-yellow-100 text-yellow-800",
  "Bucket list": "bg-purple-100 text-purple-800",
  "Expedition": "bg-slate-700 text-white",
  "Scenic": "bg-teal-100 text-teal-800",
  "River cruise": "bg-cyan-100 text-cyan-800",
  "Popular": "bg-orange-100 text-orange-800",
  "Culinary": "bg-pink-100 text-pink-800",
  "Island hopper": "bg-lime-100 text-lime-800",
  "Classic route": "bg-amber-100 text-amber-800",
  "Great value": "bg-green-100 text-green-800",
  "Small ship": "bg-indigo-100 text-indigo-800",
};

export default function CruisesSearchPage({ searchParams }: { searchParams: Params }) {
  const router = useRouter();
  const { region = "", departureMonth = "", duration = "", guests = "2" } = searchParams || {};
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState(region || "All");
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc">("recommended");
  const [detailModal, setDetailModal] = useState<CruiseOption | null>(null);

  const filtered = useMemo(() => {
    let list = [...sampleCruises];
    if (activeRegion !== "All") {
      list = list.filter(c =>
        c.route.toLowerCase().includes(activeRegion.toLowerCase()) ||
        c.name.toLowerCase().includes(activeRegion.toLowerCase()) ||
        c.line.toLowerCase().includes(activeRegion.toLowerCase())
      );
    }
    if (sortBy === "price_asc") list.sort((a, b) => a.priceNum - b.priceNum);
    if (sortBy === "price_desc") list.sort((a, b) => b.priceNum - a.priceNum);
    return list;
  }, [activeRegion, sortBy]);

  const selectedCruise = sampleCruises.find(c => c.id === selectedId);

  const chatWithLina = (cruise?: CruiseOption) => {
    const c = cruise || selectedCruise;
    if (!c) { router.push("/chat"); return; }
    const prompt = encodeURIComponent(`I'm interested in the ${c.name} cruise with ${c.line}. Route: ${c.route}. Dates: ${c.dates}. ${guests} guests. Price: ${c.price}. Can you help me book this?`);
    router.push(`/chat?prompt=${prompt}`);
  };

  const requestQuote = (cruise?: CruiseOption) => {
    const c = cruise || selectedCruise;
    if (!c) return;
    const subject = encodeURIComponent(`Cruise Quote Request — ${c.name}`);
    const body = encodeURIComponent(`Hi,\n\nI'd like a quote for the following cruise:\n\nCruise: ${c.name}\nLine: ${c.line}\nRoute: ${c.route}\nDates: ${c.dates}\nDuration: ${c.duration}\nCabin: ${c.cabin}\nGuests: ${guests}\nPrice listed: ${c.price}\n\nThank you`);
    window.open(`mailto:info@zeniva.ca?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Premium header */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2a5e] to-[#1a3d8f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-blue-200 text-sm mb-6 hover:text-white transition">
            ← Back to home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🚢</span>
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Zeniva Travel</p>
              <h1 className="text-3xl sm:text-4xl font-black">Cruises</h1>
            </div>
          </div>
          <p className="text-blue-200 mb-6">
            {region ? `${region} cruises` : "World-class cruises"} · {departureMonth || "All dates"} · {guests} guest{guests === "1" ? "" : "s"}
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-3">
            <span className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold">{filtered.length} cruises available</span>
            {region && <span className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold">📍 {region}</span>}
            {departureMonth && <span className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold">📅 {departureMonth}</span>}
            <span className="bg-blue-500/30 border border-blue-400/30 rounded-full px-4 py-1.5 text-xs font-bold">🔒 Booked through Zeniva</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(r => (
              <button key={r} onClick={() => setActiveRegion(r)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition border ${activeRegion === r ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-700"}`}>
                {r}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 bg-white text-slate-700">
            <option value="recommended">Sort: Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Cruise grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚢</div>
            <p className="text-slate-600 font-semibold text-lg">No cruises found for this region</p>
            <button onClick={() => setActiveRegion("All")} className="mt-4 bg-blue-600 text-white font-bold rounded-xl px-6 py-2.5 text-sm hover:bg-blue-700 transition">Show all cruises</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => {
              const isSelected = selectedId === c.id;
              return (
                <div key={c.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 ${isSelected ? "border-blue-500 shadow-blue-100" : "border-slate-100 hover:border-slate-200"}`}>
                  {/* Photo */}
                  <div className="relative h-52 overflow-hidden bg-slate-100 cursor-pointer group" onClick={() => setDetailModal(c)}>
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {c.badge && (
                      <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full ${BADGE_COLORS[c.badge] || "bg-white text-slate-800"}`}>
                        {c.badge}
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-black rounded-full px-3 py-1">✓ Selected</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-end p-3">
                      <span className="opacity-0 group-hover:opacity-100 transition bg-black/60 text-white text-xs font-bold rounded-full px-3 py-1">View details</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{c.line}</p>
                    <h3 className="font-black text-slate-900 text-base mt-0.5">{c.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">📍 {c.route}</p>
                    <p className="text-xs text-slate-500 mt-0.5">📅 {c.dates} · {c.duration}</p>
                    <p className="text-xs text-slate-500 mt-0.5">🛏 {c.cabin}</p>

                    {/* Perks */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.perks.map(p => (
                        <span key={p} className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 font-medium">{p}</span>
                      ))}
                    </div>

                    {/* Price & select */}
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-xl font-black text-slate-900">{c.price.split(" / ")[0]}</p>
                        <p className="text-[10px] text-slate-400">per person</p>
                      </div>
                      <button onClick={() => setSelectedId(isSelected ? null : c.id)}
                        className={`text-xs font-bold rounded-xl px-4 py-2 transition ${isSelected ? "bg-blue-600 text-white hover:bg-red-500" : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"}`}>
                        {isSelected ? "✓ Selected" : "Select"}
                      </button>
                    </div>

                    {/* CTAs — no external links */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => chatWithLina(c)}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-black py-2.5 hover:opacity-90 transition shadow">
                        💬 Ask Lina
                      </button>
                      <button onClick={() => requestQuote(c)}
                        className="rounded-xl border-2 border-blue-200 text-blue-700 text-xs font-black py-2.5 hover:bg-blue-50 transition">
                        📧 Get a quote
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected cruise CTA bar */}
        {selectedCruise && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-2xl px-4 py-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={selectedCruise.image} alt={selectedCruise.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div>
                  <p className="font-black text-slate-900 text-sm">{selectedCruise.name}</p>
                  <p className="text-xs text-slate-500">{selectedCruise.line} · {selectedCruise.dates} · <strong className="text-slate-800">{selectedCruise.price}</strong></p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => chatWithLina()}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl px-6 py-3 text-sm hover:opacity-90 transition shadow-lg">
                  💬 Book with Lina
                </button>
                <button onClick={() => requestQuote()}
                  className="flex-1 sm:flex-none border-2 border-blue-200 text-blue-700 font-black rounded-xl px-6 py-3 text-sm hover:bg-blue-50 transition">
                  📧 Get a quote
                </button>
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 px-2 font-bold text-lg">✕</button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1a3d8f] text-white p-8 text-center">
          <h3 className="text-2xl font-black mb-2">Need help choosing the perfect cruise?</h3>
          <p className="text-blue-200 mb-6">Lina, your AI travel concierge, will find the ideal cruise — comparing lines, dates, cabins and perks for your budget.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => chatWithLina()} className="bg-white text-blue-700 font-black rounded-xl px-6 py-3 hover:bg-blue-50 transition">
              💬 Chat with Lina
            </button>
            <a href="mailto:info@zeniva.ca" className="border-2 border-white/30 text-white font-black rounded-xl px-6 py-3 hover:bg-white/10 transition">
              📧 info@zeniva.ca
            </a>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={detailModal.image} alt={detailModal.name} className="w-full h-56 object-cover" />
              <button onClick={() => setDetailModal(null)} className="absolute top-3 right-3 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm hover:bg-black/70">✕</button>
              {detailModal.badge && (
                <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full ${BADGE_COLORS[detailModal.badge] || "bg-white text-slate-800"}`}>
                  {detailModal.badge}
                </span>
              )}
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{detailModal.line}</p>
                <h3 className="font-black text-slate-900 text-xl mt-0.5">{detailModal.name}</h3>
                <p className="text-sm text-slate-500 mt-1">📍 {detailModal.route}</p>
                <p className="text-sm text-slate-500">📅 {detailModal.dates} · {detailModal.duration}</p>
                <p className="text-sm text-slate-500">🛏 {detailModal.cabin}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detailModal.perks.map(p => (
                  <span key={p} className="text-xs bg-blue-50 text-blue-700 rounded-full px-3 py-1 font-semibold">{p}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-2xl font-black text-slate-900">{detailModal.price.split(" / ")[0]}<span className="text-xs font-medium text-slate-400"> / person</span></p>
                <span className="text-xs text-emerald-700 bg-emerald-50 font-bold rounded-full px-3 py-1">Zeniva price</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button onClick={() => { chatWithLina(detailModal); setDetailModal(null); }}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black py-3 hover:opacity-90 transition">
                  💬 Book with Lina
                </button>
                <button onClick={() => { requestQuote(detailModal); setDetailModal(null); }}
                  className="rounded-xl border-2 border-blue-200 text-blue-700 font-black py-3 hover:bg-blue-50 transition">
                  📧 Get a quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
