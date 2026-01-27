"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG } from "../../src/design/tokens";
import Header from "../../src/components/Header";
import TravelSearchWidget from "../../src/components/TravelSearchWidget";
import LinaWidget from "../../src/components/LinaWidget";
import AutoTranslate from "../../src/components/AutoTranslate";
import { getImagesForDestination } from "../../src/lib/images";
import { createTrip, updateSnapshot, applyTripPatch, generateProposal, setProposalSelection } from "../../lib/store/tripsStore";
import { useI18n } from "../../src/lib/i18n/I18nProvider";
import { normalizePriceLabel } from "../../src/lib/format";

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

  const isLoggedIn = false;
  const userEmail = "user@email.com";

  useEffect(() => {
    let active = true;
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
      // Normalize partner yacht shape to YcnItem
      const partnerItems: YcnItem[] = (partnerData || []).map((p: any) => ({
        title: p.title,
        destination: p.data?.location || p.data?.destination || "",
        thumbnail: p.data?.thumbnail || (p.data?.images && p.data.images[0]) || undefined,
        prices: p.data?.prices || [],
        images: p.data?.images || [],
      }));
      setItems([...(ycnData || []), ...partnerItems]);
    }).catch(() => {
      if (!active) return;
      setItems([]);
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
  const normalizedFilter = countryFilter === "all" ? "all" : normalizeCountry(countryFilter);
  const filtered = normalizedFilter === "all"
    ? mapped
    : mapped.filter((p) => p.countryKey === normalizedFilter);


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

      {/* HERO SECTION (Lina Search) */}
      <section className="hidden sm:block mt-4 mb-8 sm:mt-8 sm:mb-12">
        <div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2">
          <div className="relative rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)`,
                opacity: 0.98,
              }}
            />

            <div className="relative z-10 w-full mx-auto px-6 py-8 sm:py-12">
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-3 flex items-center justify-center md:justify-start gap-4">
                    <img
                      src="/branding/logo.png"
                      alt="Zeniva logo"
                      className="w-auto rounded-lg shadow-sm"
                      style={{ height: "clamp(2.5rem, 6.5vw, 4.25rem)" }}
                    />
                    <div>
                      <div
                        className="font-extrabold tracking-tight text-white"
                        style={{
                          fontSize: "clamp(2.5rem, 6.5vw, 4.25rem)",
                          lineHeight: 0.95,
                          background: "linear-gradient(90deg,#ffffff 60%, #E6B85A 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          textShadow: "0 8px 24px rgba(11,27,77,0.28)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Zeniva Travel AI
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-md text-white/90 max-w-xl md:max-w-2xl">
                    <AutoTranslate
                      text="Tailor-made journeys, expert recommendations, and ready-to-book itineraries."
                      className="inline"
                    />
                  </p>

                  <div className="mt-6 mx-auto md:mx-0" style={{ width: "min(820px, 100%)" }}>
                    <div className="bg-white rounded-2xl shadow-lg p-4">
                      <TravelSearchWidget />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          { id: "q1", label: "Family trip", prompt: "Family beach trip, 7 nights" },
                          { id: "q2", label: "Romantic", prompt: "Honeymoon Santorini, 5 nights" },
                          { id: "q3", label: "Budget", prompt: "Sunny destinations under $1500" },
                        ].map((q) => (
                          <Link
                            key={q.id}
                            href={`/chat?prompt=${encodeURIComponent(q.prompt)}`}
                            className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                          >
                            {q.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 hidden md:flex items-center justify-center pr-12">
                  <div className="flex flex-col items-center gap-3">
                    <span
                      className="font-extrabold tracking-tight"
                      style={{
                        fontSize: "clamp(1.25rem, 2.6vw, 1.75rem)",
                        lineHeight: 1,
                        background: "linear-gradient(90deg,#ffffff 60%, #E6B85A 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 6px 18px rgba(11,27,77,0.22)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Lina AI
                    </span>
                    <LinaWidget size={Math.min(336, Math.max(192, 21 * 16))} />
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
