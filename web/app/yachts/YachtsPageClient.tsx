"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG } from "../../src/design/tokens";
import Header from "../../src/components/Header";
import AutoTranslate from "../../src/components/AutoTranslate";
import { getImagesForDestination } from "../../src/lib/images";
import { createTrip, updateSnapshot, applyTripPatch, generateProposal, setProposalSelection } from "../../lib/store/tripsStore";
import { useI18n } from "../../src/lib/i18n/I18nProvider";
import { normalizePriceLabel } from "../../src/lib/format";
import yachtImageMap from "../../src/data/ycn_yacht_images.json";

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
        if (active && Array.isArray(fallback)) {
          setItems(fallback);
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
      setItems([...(ycnItems || []), ...partnerItems]);
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
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="w-screen left-1/2 right-1/2 -translate-x-1/2 relative">
        <div className="mx-auto w-full px-6 pt-5">
          <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
        </div>
      </div>

      <section className="mb-8 rounded-3xl px-6 py-8" style={{ background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)` }}>
        <div className="mx-auto max-w-6xl text-white">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Traveler Catalog</p>
            <h1 className="text-3xl font-black">Full Travel Inventory</h1>
            <p className="text-sm text-white/90">
              Explore the full traveler catalog and connect with Zeniva to finalize your trip.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              <Link href="/partners/resorts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
                Hotels & Resorts
              </Link>
              <Link href="/yachts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white text-slate-900">
                Yachts
              </Link>
              <Link href="/residences" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
                Short-term Rentals
              </Link>
              <Link href="/" className="rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white">
                Flights
              </Link>
            </div>
            <div className="w-full rounded-3xl border border-white/35 bg-white/15 p-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-4 pb-3">
                <Link
                  href="/chat/r5ug551qmll3p6p3"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/15 p-1 shadow-sm backdrop-blur transition hover:bg-white/25"
                  aria-label="Chat with Lina"
                >
                  <img
                    src="/branding/lina-avatar.png"
                    alt="Lina"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </Link>
                <div className="text-sm font-semibold text-white/90">
                  Lina concierge
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1">
                  <label htmlFor="yachts-search" className="sr-only">
                    Search yachts
                  </label>
                  <input
                    id="yachts-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by yacht or destination"
                    className="w-full rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/70"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <label htmlFor="yachts-checkin" className="sr-only">
                      Check-in date
                    </label>
                    <input
                      id="yachts-checkin"
                      type="date"
                      value={checkIn}
                      onChange={(event) => setCheckIn(event.target.value)}
                      className="w-full rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/70"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="yachts-checkout" className="sr-only">
                      Check-out date
                    </label>
                    <input
                      id="yachts-checkout"
                      type="date"
                      value={checkOut}
                      onChange={(event) => setCheckOut(event.target.value)}
                      className="w-full rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/70"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="yachts-travelers" className="sr-only">
                      Travelers
                    </label>
                    <select
                      id="yachts-travelers"
                      value={travelers}
                      onChange={(event) => setTravelers(event.target.value)}
                      className="w-full rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/70"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-none px-6 pb-16">

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500"><AutoTranslate text="Yacht Charters" className="inline" /></p>
              <h1 className="text-3xl font-black mt-1"><AutoTranslate text="YCN Fleet" className="inline" /></h1>
              <p className="text-slate-600 mt-2"><AutoTranslate text="Browse curated yachts and contact us for tailored itineraries." className="inline" /></p>
            </div>
            <Link href="/chat?prompt=Plan%20a%20yacht%20charter" className="hidden md:inline-flex px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">
              <AutoTranslate text="Chat to plan" className="inline" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500"><AutoTranslate text="Filter by country" className="inline" /></label>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setVisible(12);
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            <AutoTranslate text="No yachts available right now. Please check back soon." className="inline" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visible).map((p) => (
                <div key={p.slug} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                  <div className="h-44 w-full overflow-hidden rounded-lg mb-4">
                    <Image
                      src={p.image}
                      alt={p.title}
                      width={800}
                      height={520}
                      className="h-full w-full object-cover"
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                      priority={false}
                    />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{p.title}</h2>
                  <div className="text-sm text-slate-500 mb-3">{p.destination}</div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="text-lg font-black">{p.price}</div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/partners/ycn/${p.slug}`}
                        className="text-sm font-semibold underline text-slate-700"
                      >
                        View
                      </Link>
                    </div>
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
        )}
        </div>
      </div>
    </main>
  );
}
