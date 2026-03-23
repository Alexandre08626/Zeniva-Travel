"use client";

import Link from "next/link";
// Image from next/image replaced with <img> to avoid double-encoding local paths
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppDarkPageWrapper from "../../src/components/AppDarkPageWrapper.client";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG } from "../../src/design/tokens";
import Header from "../../src/components/Header";
import AutoTranslate from "../../src/components/AutoTranslate";
import { getImagesForDestination } from "../../src/lib/images";
import { createTrip, updateSnapshot, applyTripPatch, generateProposal, setProposalSelection } from "../../lib/store/tripsStore";
import { useI18n } from "../../src/lib/i18n/I18nProvider";
import { normalizePriceLabel } from "../../src/lib/format";
import yachtImageMap from "../../src/data/ycn_yacht_images.json";
import zenivaYachtsGlobal from "../../src/data/zeniva_yachts_global.json";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface YcnItem {
  title?: string;
  destination?: string;
  prices?: string[];
  thumbnail?: string;
  images?: string[];
  calendar?: string;
}

const localYachtImages = yachtImageMap as Record<string, string[]>;

function normalizeCountry(value: string) {
  const raw = (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "unknown";
  if (cleaned.includes("polynesie francaise") || cleaned.includes("french polynesia")) return "french polynesia";
  if (cleaned.includes("emirats arabes unis") || cleaned.includes("united arab emirates") || cleaned === "uae") return "united arab emirates";
  if (cleaned.includes("etats unis") || cleaned.includes("united states") || cleaned === "usa") return "united states";
  if (cleaned.includes("republique dominicaine") || cleaned.includes("dominican republic")) return "dominican republic";
  if (cleaned.includes("mexique") || cleaned.includes("mexico")) return "mexico";
  if (cleaned.includes("canada")) return "canada";
  if (cleaned.includes("france")) return "france";
  if (cleaned.includes("grece") || cleaned.includes("greece")) return "greece";
  if (cleaned.includes("italie") || cleaned.includes("italy")) return "italy";
  if (cleaned.includes("espagne") || cleaned.includes("spain")) return "spain";
  return cleaned;
}

function formatCountry(value: string) {
  if (!value || value === "unknown") return "Unknown";
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function YachtsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const [visible, setVisible] = useState(12);
  const [items, setItems] = useState<YcnItem[]>([]);
  const [countryFilter, setCountryFilter] = useState(() => searchParams.get("country") || "all");
  const [query, setQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [travelers, setTravelers] = useState("2");

  const isLoggedIn = false;
  const userEmail = "user@email.com";

  useEffect(() => {
    let active = true;
    const loadFallback = async () => {
      try {
        const mod = await import("../../src/data/ycn_packages.json");
        const fallback = (mod as any).default || mod;
        const globalItems: YcnItem[] = (zenivaYachtsGlobal as any[]).map((y: any) => ({
          title: y.title,
          destination: y.destination,
          prices: y.prices || [],
          thumbnail: y.thumbnail,
          images: y.images || [y.thumbnail],
          calendar: undefined,
        }));
        if (active && Array.isArray(fallback)) {
          setItems([...fallback, ...globalItems]);
        }
      } catch {
        if (active) setItems([]);
      }
    };
    // fetch curated YCN fleet
    const ycnReq = fetch("/api/partners/ycn", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
    // fetch partner-published yachts
    const partnerReq = fetch("/api/public/listings?type=yacht", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => (res && res.data) || [])
      .catch(() => []);

    Promise.all([ycnReq, partnerReq]).then(([ycnData, partnerData]) => {
      if (!active) return;
      if (!Array.isArray(ycnData) || ycnData.length === 0) {
        loadFallback();
        return;
      }
      const ycnItems: YcnItem[] = (Array.isArray(ycnData) ? ycnData : []).map((p: any) => {
        const title = (p.title || "Yacht Charter").trim();
        const mappedImages = localYachtImages[title];
        const resolvedImages = mappedImages && mappedImages.length ? mappedImages : (p.images || []);
        const resolvedThumbnail = resolvedImages[0] || p.thumbnail || (p.images && p.images[0]) || undefined;
        return {
          title,
          destination: p.destination || "",
          prices: p.prices || [],
          thumbnail: resolvedThumbnail,
          images: resolvedImages,
          calendar: p.calendar || undefined,
        };
      });
      // Normalize partner yacht shape to YcnItem
      const partnerItems: YcnItem[] = (partnerData || []).map((p: any) => {
        const data = p?.data || p || {};
        const priceLabel =
          Array.isArray(data.prices) && data.prices.length
            ? data.prices
            : typeof data.price === "number"
              ? [`${data.currency || "USD"} ${data.price}`]
              : [];
        return {
          title: data.title || p.title,
          destination: data.location || data.destination || "",
          thumbnail: data.thumbnail || (data.images && data.images[0]) || undefined,
          prices: priceLabel,
          images: data.images || [],
        };
      });
      // Add global luxury yachts (Zeniva curated worldwide fleet)
      const globalItems: YcnItem[] = (zenivaYachtsGlobal as any[]).map((y: any) => ({
        title: y.title,
        destination: y.destination,
        prices: y.prices || [],
        thumbnail: y.thumbnail,
        images: y.images || [y.thumbnail],
        calendar: undefined,
      }));

      setItems([...(ycnItems || []), ...partnerItems, ...globalItems]);
    }).catch(() => {
      if (!active) return;
      loadFallback();
    });

    return () => {
      active = false;
    };
  }, []);

  const getCountry = (location: string) => {
    if (!location) return "unknown";
    const parts = location.split(",").map((s) => s.trim()).filter(Boolean);
    const last = parts[parts.length - 1] || "unknown";
    return normalizeCountry(last);
  };

  const fallbackQuote = locale === "fr" ? "Devis sur demande" : "Request a quote";
  const mapped = items.map((p, idx) => {
    const destination = p.destination || "Worldwide";
    const fallback = getImagesForDestination(destination)[0];
    const countryKey = getCountry(destination);
    return {
      slug: p.title ? slugify(p.title) : `ycn-${idx}`,
      title: p.title || "Yacht Charter",
      price: normalizePriceLabel((p.prices && p.prices[0]) || fallbackQuote, locale),
      destination,
      image: (p.images && p.images[0]) || p.thumbnail || fallback || "/branding/icon-proposals.svg",
      calendar: p.calendar,
      images: p.images || (p.thumbnail ? [p.thumbnail] : []),
      countryKey,
      countryLabel: formatCountry(countryKey),
    };
  });

  const countries = Array.from(new Set(mapped.map((p) => p.countryLabel))).sort();
  const normalizedQuery = query.trim().toLowerCase();
  const searchFiltered = normalizedQuery
    ? mapped.filter((p) => [p.title, p.destination, p.countryLabel].join(" ").toLowerCase().includes(normalizedQuery))
    : mapped;
  const normalizedFilter = countryFilter === "all" ? "all" : normalizeCountry(countryFilter);
  const filtered = normalizedFilter === "all"
    ? searchFiltered
    : searchFiltered.filter((p) => p.countryKey === normalizedFilter);


  const handleAddToProposal = async (yacht: { slug: string; title: string; destination: string; price: string; image: string; images: string[] }) => {
    const tripId = createTrip({
      title: yacht.title,
      destination: yacht.destination,
      style: "Yacht charter",
    });

    updateSnapshot(tripId, {
      destination: yacht.destination,
      travelers: "2 adults",
      style: "Yacht charter",
      accommodationType: "Yacht",
      budget: yacht.price,
    });

    applyTripPatch(tripId, {
      destination: yacht.destination,
      accommodationType: "Yacht",
      style: "Yacht charter",
      budget: yacht.price,
    });

    setProposalSelection(tripId, {
      flight: null,
      activity: null,
      transfer: null,
      hotel: {
        id: yacht.slug,
        name: yacht.title,
        location: yacht.destination,
        price: yacht.price,
        room: "Yacht",
        image: yacht.image,
        images: yacht.images,
      },
    });

    await generateProposal(tripId);
    router.push("/proposals");
  };

    return (
    <AppDarkPageWrapper title="ZeniYacht" emoji="🛥️" subtitle="YCN Premium Fleet · Miami & Caribbean">
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full px-4 sm:px-6 pt-5">
        <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
      </div>

      {/* Hero section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%)` }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=60')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="text-white">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70 mb-2">⛵ Zeniva Yacht Collection</p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                ZeniYacht
              </h1>
              <p className="text-white/80 mt-3 text-base max-w-xl">
                <AutoTranslate text="Private yacht charters curated by YCN Miami — from intimate catamarans to mega-yachts. Expert brokers, instant quotes." className="inline" />
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["⚓ Expert brokers", "📍 Miami & Caribbean", "💎 Premium fleet", "✈️ Concierge included"].map(tag => (
                  <span key={tag} className="bg-white/15 border border-white/25 rounded-full px-3 py-1 text-xs font-semibold text-white">{tag}</span>
                ))}
              </div>
            </div>
            <Link href="/chat?prompt=Plan%20a%20luxury%20yacht%20charter"
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-slate-900 shadow-lg transition hover:scale-105"
              style={{ background: "linear-gradient(135deg, #E6B85A, #d4a442)" }}>
              <span>💬 Plan with Lina</span>
            </Link>
          </div>

          {/* Search bar — mobile stacked, desktop 5-col */}
          <div className="mt-4 sm:mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-2 sm:p-4 overflow-hidden">
            {/* Mobile */}
            <div className="sm:hidden grid grid-cols-2 gap-1.5">
              <div className="col-span-2">
                <label className="block text-[8px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">Destination / Yacht</label>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Miami, Bahamas…"
                  className="w-full min-w-0 rounded-lg bg-white px-2.5 py-1.5 text-slate-800 text-[11px] font-medium focus:outline-none" />
              </div>
              <div className="min-w-0">
                <label className="block text-[8px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">Charter date</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full min-w-0 rounded-lg bg-white px-2 py-1.5 text-[10px] text-slate-800 focus:outline-none" />
              </div>
              <div className="min-w-0">
                <label className="block text-[8px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">Return date</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full min-w-0 rounded-lg bg-white px-2 py-1.5 text-[10px] text-slate-800 focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-[8px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">Guests</label>
                <select value={travelers} onChange={(e) => setTravelers(e.target.value)}
                  className="w-full rounded-lg bg-white px-2.5 py-1.5 text-slate-800 text-[11px] focus:outline-none">
                  {[...Array(11)].map((_, i) => { const n = i + 1; return <option key={n} value={String(n)} className="text-slate-900">{n === 11 ? "11+ guests" : `${n} guest${n > 1 ? "s" : ""}`}</option>; })}
                </select>
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden sm:grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Destination or Yacht</label>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Miami, Bahamas, Caribbean…"
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Charter date</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Return date</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Guests</label>
                <select value={travelers} onChange={(e) => setTravelers(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {[...Array(11)].map((_, i) => { const n = i + 1; return <option key={n} value={String(n)} className="text-slate-900">{n === 11 ? "11+ guests" : `${n} guest${n > 1 ? "s" : ""}`}</option>; })}
                </select>
              </div>
            </div>
          </div>

          {/* Nav pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: "Hotels & Resorts", href: "/partners/resorts" },
              { label: "⛵ Yachts", href: "/zeniyacht", active: true },
              { label: "🏠 Short-term Rentals", href: "/zenistay" },
              { label: "✈️ ZeniFlights", href: "/" },
            ].map(({ label, href, active }) => (
              <Link key={href} href={href}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${active ? "bg-white text-slate-900" : "bg-white/15 text-white hover:bg-white/25"}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500"><AutoTranslate text="Yacht Charters" className="inline" /></p>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">
              <AutoTranslate text="YCN Premium Fleet" className="inline" />
              <span className="ml-2 text-base font-semibold text-slate-400">({filtered.length})</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Country:</label>
            <select
              value={countryFilter}
              onChange={(e) => { setCountryFilter(e.target.value); setVisible(12); }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <option value="all">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">⛵</div>
            <p className="text-lg font-bold text-slate-700"><AutoTranslate text="No yachts match your search." className="inline" /></p>
            <p className="text-slate-500 text-sm mt-1"><AutoTranslate text="Try adjusting your filters." className="inline" /></p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visible).map((p) => (
                <div key={p.slug} className="group bg-white rounded-3xl shadow-md overflow-hidden flex flex-col transition hover:shadow-xl hover:-translate-y-1">
                  {/* Photo */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/branding/lina-hero.png"; }}
                    />
                    {/* Price badge */}
                    {p.price && (
                      <div className="absolute bottom-3 left-3 rounded-xl px-3 py-1.5 text-sm font-black text-white shadow-lg"
                        style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)" }}>
                        {p.price}
                      </div>
                    )}
                    {/* Photo count */}
                    {p.images && p.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white">
                        📷 {p.images.length}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="text-lg font-black text-slate-900 leading-tight">{p.title}</h2>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                      <span>📍</span> {p.destination}
                    </p>

                    {/* Specs */}
                    {(p as any).specs && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {String((p as any).specs || "").split("·").slice(0, 3).map((s: string) => s.trim()).filter(Boolean).map((spec: string) => (
                          <span key={spec} className="bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full px-2 py-0.5">{spec}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/partners/ycn/${p.slug}`}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 text-center hover:bg-slate-50 transition"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleAddToProposal(p)}
                        className="flex-1 rounded-xl px-3 py-2.5 text-sm font-black text-white transition hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)" }}
                      >
                        + Proposal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visible < filtered.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisible((v) => v + 12)}
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  Load {Math.min(filtered.length - visible, 12)} more yachts ↓
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
    </AppDarkPageWrapper>
  );
}
