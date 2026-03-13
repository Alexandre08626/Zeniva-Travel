"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG } from "../../src/design/tokens";
import Header from "../../src/components/Header";
import AutoTranslate from "../../src/components/AutoTranslate";
import { createTrip, updateSnapshot, applyTripPatch, generateProposal, setProposalSelection } from "../../lib/store/tripsStore";
import { normalizeListingTitle, normalizePetFriendly } from "../../src/lib/format";
import AppDarkPageWrapper from "../../src/components/AppDarkPageWrapper.client";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface AirbnbItem {
  id: string;
  title: string;
  location?: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  url?: string;
  price_per_night?: number;
  price_currency?: string;
}

function extractField(description: string | undefined, label: string) {
  if (!description) return null;
  const re = new RegExp(`${label}\s*\n+\s*([^\n]+)`, "i");
  const match = description.match(re);
  return match?.[1]?.trim() || null;
}

function cleanDescription(description: string) {
  if (!description) return "";
  const withoutHeader = description.replace(/Property Description\s*/i, "");
  const beforeContact = withoutHeader.split("Contact Agent")[0];
  const beforeDetails = beforeContact.split("Property Details")[0];
  const cleaned = normalizePetFriendly(beforeDetails.replace(/\n{3,}/g, "\n\n").trim());
  const sanitized = cleaned
    .replace(/Airbnb host/gi, "property host")
    .replace(/Airbnb guests/gi, "guests")
    .replace(/Airbnb/gi, "ZeniStay");
  return sanitized.length < 40 ? "Private stays curated by Zeniva, bookable with concierge support." : sanitized;
}

const PROPERTY_TYPES = [
  { key: "all", label: "🏠 All" },
  { key: "villa", label: "🌴 Villas" },
  { key: "condo", label: "🏢 Condos" },
  { key: "house", label: "🏡 Houses" },
  { key: "apartment", label: "🏙️ Apartments" },
  { key: "chalet", label: "⛷️ Chalets" },
  { key: "beachfront", label: "🏖 Beachfront" },
];

function AirbnbsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<AirbnbItem[]>([]);
  const [visible, setVisible] = useState(12);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("destination") || "");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkin") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkout") || "");
  const [travelers, setTravelers] = useState(searchParams.get("guests") || "2");
  const [propertyType, setPropertyType] = useState(searchParams.get("type") || "all");

  const isLoggedIn = false;
  const userEmail = "user@email.com";

  // Airbnb live search
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchedDest, setSearchedDest] = useState("");

  const handleSearch = async (overrideDest?: string) => {
    const dest = (overrideDest || query).trim();
    if (!dest) return;
    setApiLoading(true);
    setApiError("");
    setSearched(true);
    setSearchedDest(dest);
    try {
      const params = new URLSearchParams({ destination: dest, type: propertyType || "all" });
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      if (travelers) params.set("guests", travelers);
      const r = await fetch(`/api/airbnb/villas/search?${params}`);
      const data = await r.json();
      setApiResults(data.villas || []);
      if ((data.villas || []).length === 0) setApiError("No properties found. Try a different destination or dates.");
    } catch {
      setApiError("Search failed. Please try again.");
    } finally {
      setApiLoading(false);
    }
  };

  // Auto-search if URL has destination param
  useEffect(() => {
    const dest = searchParams.get("destination");
    if (dest) handleSearch(dest);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    const loadFallback = async () => {
      try {
        const mod = await import("../../src/data/airbnbs.json");
        const fallback = (mod as any).default || mod;
        if (active && Array.isArray(fallback)) {
          setItems(fallback);
          setLoading(false);
        }
      } catch {
        if (active) {
          setItems([]);
          setLoading(false);
        }
      }
    };
    const partnerReq = fetch("/api/partners/airbnbs", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((res) => (Array.isArray(res) ? res : []))
      .catch(() => []);
    const publicReq = fetch("/api/public/listings?type=home", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => (res && res.data) || [])
      .catch(() => []);

    Promise.all([partnerReq, publicReq])
      .then(([partnerData, publicData]) => {
        if (!active) return;
        if (!Array.isArray(partnerData) || partnerData.length === 0) {
          loadFallback();
          return;
        }
        const normalizedPublic: AirbnbItem[] = (publicData || []).map((p: any) => {
          const data = p?.data || p || {};
          return {
            id: p.id || data.id,
            title: data.title || p.title,
            location: data.location || data.destination || "",
            description: data.description || "",
            thumbnail: data.thumbnail || (data.images && data.images[0]) || "",
            images: data.images || [],
            url: p.url || data.url,
          };
        });
        setItems([...(partnerData || []), ...normalizedPublic]);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        loadFallback();
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setVisible(12);
  }, [query]);

  const resolveLocation = (item: AirbnbItem) => {
    const fallback = item.location || "";
    if (!fallback || fallback.toLowerCase().includes("property description")) {
      return extractField(item.description, "Property Location") || fallback;
    }
    return fallback;
  };

  const mapped = items.map((p, idx) => {
    const resolvedLocation = resolveLocation(p);
    return {
    slug: p.id || slugify(p.title || `residence-${idx}`),
    title: normalizeListingTitle(p.title || "Residence"),
    location: resolvedLocation || "",
    description: cleanDescription(p.description || ""),
    image: p.thumbnail || (p.images && p.images[0]) || "/branding/icon-proposals.svg",
    images: p.images || (p.thumbnail ? [p.thumbnail] : []),
    price_per_night: (p as any).price_per_night,
  };
  });

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? mapped.filter((p) => {
        const title = p.title.toLowerCase();
        const location = p.location.toLowerCase();
        return title.includes(normalizedQuery) || location.includes(normalizedQuery);
      })
    : mapped;

  const handleAddToProposal = async (stay: { slug: string; title: string; location: string; description: string; image: string; images: string[] }) => {
    const tripId = createTrip({
      title: stay.title,
      destination: stay.location,
      style: "ZeniStay",
    });

    updateSnapshot(tripId, {
      destination: stay.location,
      travelers: "2 adults",
      style: "ZeniStay",
      accommodationType: "Residence",
    });

    applyTripPatch(tripId, {
      destination: stay.location,
      accommodationType: "Residence",
      style: "ZeniStay",
    });

    setProposalSelection(tripId, {
      flight: null,
      activity: null,
      transfer: null,
      hotel: {
        id: stay.slug,
        name: stay.title,
        location: stay.location,
        room: "ZeniStay",
        image: stay.image,
        images: stay.images,
        description: stay.description,
      },
    });

    await generateProposal(tripId);
    router.push("/proposals");
  };

  return (
    <AppDarkPageWrapper title="Villas & Rentals" emoji="🏡" subtitle="Premium ZeniStay properties worldwide">
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="w-screen left-1/2 right-1/2 -translate-x-1/2 relative">
        <div className="mx-auto w-full px-6 pt-5">
          <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
        </div>
      </div>

      <section className="mb-6 rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-5 sm:py-8 overflow-hidden" style={{ background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)` }}>
        <div className="mx-auto max-w-6xl text-white">
          <div className="hidden sm:flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Traveler Catalog</p>
            <h1 className="text-3xl font-black">Full Travel Inventory</h1>
            <p className="text-sm text-white/90">
              Explore the full traveler catalog and connect with Zeniva to finalize your trip.
            </p>
          </div>
          <div className="mt-3 sm:mt-10 flex flex-col gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-wrap gap-3">
              <Link href="/partners/resorts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
                Hotels & Resorts
              </Link>
              <Link href="/yachts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
                Yachts
              </Link>
              <Link href="/residences" className="rounded-full px-4 py-2 text-sm font-semibold bg-white text-slate-900">
                ZeniStay
              </Link>
              <Link href="/" className="rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white">
                Flights
              </Link>
            </div>
            <div className="w-full max-w-full rounded-2xl sm:rounded-3xl border border-white/35 bg-white/15 p-2.5 sm:p-3 shadow-sm backdrop-blur overflow-hidden">
              <div className="flex items-center gap-4 pb-3">
                <Link
                  href="/chat/r5ug551qmll3p6p3"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/15 p-1 shadow-sm backdrop-blur transition hover:bg-white/25"
                  aria-label="Chat with Lina"
                >
                  <img
                    src="/branding/lina-avatar.png"
                    alt="Lina"
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover"
                  />
                </Link>
                <div className="text-sm font-semibold text-white/90">
                  Lina concierge
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center min-w-0">
                <div className="flex-1 min-w-0">
                  <label htmlFor="residence-search" className="sr-only">
                    Search residences
                  </label>
                  <input
                    id="residence-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="City, country or destination (e.g. Paris, Maldives…)"
                    className="w-full max-w-full min-w-0 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/70"
                  />
                </div>
                <div className="flex flex-1 min-w-0 flex-col gap-3 sm:flex-row">
                  <div className="flex-1 min-w-0">
                    <label htmlFor="residence-checkin" className="sr-only">
                      Check-in date
                    </label>
                    <input
                      id="residence-checkin"
                      type="date"
                      value={checkIn}
                      onChange={(event) => setCheckIn(event.target.value)}
                      className="w-full max-w-full min-w-0 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/70"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label htmlFor="residence-checkout" className="sr-only">
                      Check-out date
                    </label>
                    <input
                      id="residence-checkout"
                      type="date"
                      value={checkOut}
                      onChange={(event) => setCheckOut(event.target.value)}
                      className="w-full max-w-full min-w-0 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/70"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label htmlFor="residence-travelers" className="sr-only">
                      Travelers
                    </label>
                    <select
                      id="residence-travelers"
                      value={travelers}
                      onChange={(event) => setTravelers(event.target.value)}
                      className="w-full max-w-full min-w-0 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/70"
                    >
                      {Array.from({ length: 8 }, (_, index) => {
                        const count = index + 1;
                        return (
                          <option key={count} value={String(count)} className="text-slate-900">
                            {count} traveler{count > 1 ? "s" : ""}
                          </option>
                        );
                      })}
                      <option value="9" className="text-slate-900">9 travelers</option>
                      <option value="10" className="text-slate-900">10 travelers</option>
                      <option value="11" className="text-slate-900">11+ travelers</option>
                    </select>
                  </div>
                  {/* Search Button */}
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={apiLoading || !query.trim()}
                    className="flex-shrink-0 rounded-full bg-white px-6 py-2 text-sm font-black text-blue-700 shadow-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {apiLoading ? "🔍…" : "🔍 Search"}
                  </button>
                </div>
              </div>
            </div>
            {/* Property type pills */}
            <div className="mt-3 flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(pt => (
                <button key={pt.key} onClick={() => setPropertyType(pt.key)}
                  className={`text-xs font-bold px-4 py-1.5 rounded-full transition border ${propertyType === pt.key ? "bg-white text-blue-700 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-none px-6 pb-16">

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500"><AutoTranslate text="ZeniStay" className="inline" /></p>
              <h1 className="text-3xl font-black mt-1"><AutoTranslate text="ZeniStay" className="inline" /></h1>
              <p className="text-slate-600 mt-2"><AutoTranslate text="Private stays curated by Zeniva, bookable with concierge support." className="inline" /></p>
            </div>
            <Link href="/chat?prompt=Plan%20a%20short-term%20stay" className="hidden md:inline-flex px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">
              <AutoTranslate text="Chat to book" className="inline" />
            </Link>
          </div>

        {/* ── LIVE AIRBNB RESULTS ── */}
        {(searched || apiLoading) && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {apiLoading ? "Searching…" : `Results for "${searchedDest}"`}
                </h2>
                {!apiLoading && apiResults.length > 0 && (
                  <p className="text-slate-500 text-sm mt-1">{apiResults.length} properties found · Prices in USD · Booked through Zeniva</p>
                )}
              </div>
              <button
                onClick={() => { setSearched(false); setApiResults([]); setApiError(""); }}
                className="text-sm text-slate-500 hover:text-slate-800 font-semibold border border-slate-200 rounded-full px-4 py-1.5 hover:bg-slate-50 transition">
                ✕ Clear search
              </button>
            </div>

            {apiLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow animate-pulse">
                    <div className="h-48 bg-slate-200 rounded-t-2xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!apiLoading && apiError && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-800 font-semibold">
                {apiError}
              </div>
            )}

            {!apiLoading && !apiError && apiResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {apiResults.map((v: any) => {
                  const chatPrompt = encodeURIComponent(
                    `I'd like to book the property "${v.name}" in ${v.city} for ${travelers} traveler${parseInt(travelers) > 1 ? "s" : ""}${checkIn ? ` from ${checkIn}` : ""}${checkOut ? ` to ${checkOut}` : ""}. Price: ${v.pricePerNight}. Can you help me book it?`
                  );
                  return (
                    <div key={v.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
                      {/* Photos */}
                      <div className="relative h-52 overflow-hidden bg-slate-100">
                        {v.photo ? (
                          <img src={v.photo} alt={v.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">🏠</div>
                        )}
                        {v.superhost && (
                          <span className="absolute top-3 left-3 bg-white text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-full shadow">⭐ Superhost</span>
                        )}
                        <div className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow">
                          {v.pricePerNight}
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2">{v.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">📍 {v.city}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {v.bedrooms && <span className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">🛏 {v.bedrooms} bed{v.bedrooms > 1 ? "s" : ""}</span>}
                          {v.bathrooms && <span className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">🚿 {v.bathrooms} bath</span>}
                          {v.maxGuests && <span className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">👥 max {v.maxGuests}</span>}
                          {v.rating && <span className="text-[10px] bg-yellow-50 text-yellow-700 rounded-full px-2 py-0.5 font-bold">★ {v.rating} ({v.reviews})</span>}
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-base font-black text-slate-900">{v.pricePerNight}<span className="text-xs font-normal text-slate-400"> / night</span></p>
                            {v.nights > 1 && <p className="text-[10px] text-slate-400">{v.priceTotal} total · {v.nights} nights</p>}
                          </div>
                          <a href={`/chat?prompt=${chatPrompt}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl px-4 py-2 transition shadow">
                            💬 Book with Lina
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CURATED LISTINGS (default, hidden when API search active) ── */}
        {!searched && loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            <AutoTranslate text="Loading residences..." className="inline" />
          </div>
        ) : !searched && filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            <AutoTranslate text="No residences match your search." className="inline" />
          </div>
        ) : !searched ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visible).map((p) => (
                <div key={p.slug} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                  <div className="relative h-44 w-full overflow-hidden rounded-lg mb-4">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    {(p as any).price_per_night && (
                      <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        ${(p as any).price_per_night}/night
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mb-1">{p.title}</h2>
                  {(p as any).price_per_night && (
                    <div className="text-blue-700 font-bold text-lg mb-1">${(p as any).price_per_night} <span className="text-sm font-normal text-slate-500">/ night</span></div>
                  )}
                  <div className="text-sm text-slate-500 mb-3">{p.location}</div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{p.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <Link href={`/residences/${p.slug}`} className="text-sm font-semibold underline text-slate-700">
                      View details
                    </Link>
                    <Link href="/chat?prompt=Plan%20a%20short-term%20stay" className="text-sm font-semibold text-primary-700">
                      Chat
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToProposal(p)}
                    className="mt-3 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
                  >
                    Add to proposal
                  </button>
                </div>
              ))}
            </div>

            {visible < filtered.length && (
              <div className="flex justify-center mt-8">
                <button onClick={() => setVisible((v) => v + 12)} className="px-6 py-3 rounded-full bg-white border shadow">
                  Load more
                </button>
              </div>
            )}
          </>
        ) : null}
        </div>
      </div>
    </main>
    </AppDarkPageWrapper>
  );
}

export default function AirbnbsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <AirbnbsContent />
    </Suspense>
  );
}
