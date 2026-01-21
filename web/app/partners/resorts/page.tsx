"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { resortPartners, type ResortPartner, type ResortStatus } from "@/src/data/partners/resorts";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG, TITLE_TEXT, MUTED_TEXT } from "@/src/design/tokens";
import Header from "@/src/components/Header";
import TravelSearchWidget from "@/src/components/TravelSearchWidget";
import LinaWidget from "@/src/components/LinaWidget";
import AutoTranslate from "@/src/components/AutoTranslate";
import { createTrip, updateSnapshot, applyTripPatch, generateProposal, setProposalSelection } from "@/lib/store/tripsStore";

const statusLabel: Record<ResortStatus, string> = {
  active: "Active",
  onboarding: "Onboarding",
  suspended: "Suspended",
};

const statusColor: Record<ResortStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  onboarding: "bg-amber-100 text-amber-800",
  suspended: "bg-slate-200 text-slate-700",
};

export default function PartnerResortsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(resortPartners[0]?.id ?? "");
  const [filters, setFilters] = useState<{
    status: ResortStatus | "all";
    type: string;
    query: string;
    sort: "featured" | "price" | "name";
    departureCity: string;
    checkIn: string;
    checkOut: string;
  }>({
    status: "all",
    type: "",
    query: "",
    sort: "featured",
    departureCity: "",
    checkIn: "",
    checkOut: "",
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const isLoggedIn = false;
  const userEmail = "user@email.com";

  const types = useMemo(() => Array.from(new Set(resortPartners.map((r) => r.type))).sort(), []);

  const results = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const list = resortPartners.filter((r) => {
      const matchStatus = filters.status === "all" || r.status === filters.status;
      const matchType = !filters.type || r.type === filters.type;
      const matchQuery =
        !query ||
        [r.name, r.destination, r.type, r.positioning, ...r.keywords, ...r.amenities]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchStatus && matchType && matchQuery;
    });

    if (filters.sort === "name") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (filters.sort === "price") {
      return [...list].sort((a, b) => a.pricing.publicRateFrom.localeCompare(b.pricing.publicRateFrom));
    }
    return list;
  }, [filters]);

  const selected = results.find((r) => r.id === selectedId) ?? results[0] ?? resortPartners[0];

  const getRating = (idx: number) => (4.6 + (idx % 4) * 0.1).toFixed(1);
  const getReviews = (idx: number) => 180 + idx * 37;
  const getCover = (r: ResortPartner) => r.media?.[0]?.images?.[0] || "/branding/icon-proposals.svg";

  const handleAddToProposal = async (resort: ResortPartner) => {
    const tripId = createTrip({
      title: resort.name,
      destination: resort.destination,
      style: resort.positioning,
    });

    const dates = filters.checkIn && filters.checkOut ? `${filters.checkIn} - ${filters.checkOut}` : "";

    updateSnapshot(tripId, {
      destination: resort.destination,
      travelers: "2 adults",
      style: resort.positioning,
      accommodationType: "Hotel",
      budget: resort.pricing.publicRateFrom,
      dates,
      departure: filters.departureCity,
    });

    applyTripPatch(tripId, {
      destination: resort.destination,
      accommodationType: "Hotel",
      style: resort.positioning,
      budget: resort.pricing.publicRateFrom,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      departureCity: filters.departureCity,
      dates,
    });

    const hotelSelection = {
      id: resort.id,
      name: resort.name,
      location: resort.destination,
      price: resort.pricing.publicRateFrom,
      room: resort.roomTypes?.[0] || "Resort stay",
      accommodationType: "Hotel",
      image: getCover(resort),
      images: resort.media?.flatMap((m) => m.images) || [],
      amenities: resort.amenities,
      policies: resort.policies,
    };

    setProposalSelection(tripId, { hotel: hotelSelection });
    await generateProposal(tripId);
    router.push("/proposals");
  };

  const openLightbox = (images: string[], idx: number) => {
    setLightboxImages(images);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = () => {
    setLightboxIndex((i) => (lightboxImages.length ? (i - 1 + lightboxImages.length) % lightboxImages.length : 0));
  };

  const goNext = () => {
    setLightboxIndex((i) => (lightboxImages.length ? (i + 1) % lightboxImages.length : 0));
  };

  return (
    <>
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      {/* Header aligned with hero left edge (full-bleed alignment) */}
      <div style={{ position: "relative", left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw", width: "100vw" }}>
        <div className="w-full px-6">
          <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-none px-6 pb-16 pt-5 space-y-8">
        {/* HERO SECTION (Lina Search) */}
        <section
          className="mt-4 mb-4"
          style={{
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            width: "100vw",
          }}
        >
          <div className="relative rounded-3xl overflow-hidden mx-auto" style={{ width: "100%", maxWidth: "none" }}>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)`,
                opacity: 0.98,
              }}
            />

            <div className="relative z-10 w-full mx-auto px-5 py-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
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
        </section>

      <div className="mx-auto max-w-7xl px-1 py-4 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Zeniva Partner Resorts</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Luxury partner hotels, curated like Booking</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              Verified inventory only. Premium contracts, priority perks, and trusted media for proposals.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{resortPartners.filter(r => r.status === "active").length} active</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{resortPartners.filter(r => r.status === "onboarding").length} onboarding</span>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{results.length} results</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Filters</div>
              <div className="mt-3 space-y-3">
                <input
                  placeholder="Search resort, destination, amenity"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={filters.query}
                  onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                />
                <input
                  placeholder="Departure city or address"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={filters.departureCity}
                  onChange={(e) => setFilters((f) => ({ ...f, departureCity: e.target.value }))}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={filters.checkIn}
                    onChange={(e) => setFilters((f) => ({ ...f, checkIn: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={filters.checkOut}
                    onChange={(e) => setFilters((f) => ({ ...f, checkOut: e.target.value }))}
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as ResortStatus | "all" }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">All hotel types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as "featured" | "price" | "name" }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price">Sort: Price</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                Zeniva only lists verified partners with contract terms and marketing rights.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Agent actions</p>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => selected && handleAddToProposal(selected)}
                  className="w-full rounded-full bg-black px-4 py-2 text-center text-sm font-semibold text-white shadow hover:bg-slate-900"
                >
                  Add to proposal
                </button>
                <Link href="/payment" className="block rounded-full border px-4 py-2 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50">
                  Book with Zeniva
                </Link>
                <Link
                  href="/chat/agent?channel=agent-alexandre&listing=AIKA&source=/airbnbs/aika"
                  className="block rounded-full border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Chat with agent
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="space-y-6">
              {results.map((r, idx) => (
                <article key={r.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
                    <div className="space-y-3">
                      <div className="relative h-64 rounded-2xl overflow-hidden">
                        <Image src={getCover(r)} alt={r.name} fill className="object-cover" sizes="(min-width: 1024px) 60vw, 100vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="text-xs uppercase tracking-[0.18em]">Partner spotlight</div>
                          <div className="text-2xl font-black">{r.name}</div>
                          <div className="text-sm opacity-90">{r.destination}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                        <span className={`rounded-full px-2.5 py-1 font-semibold ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">{r.type}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{r.positioning}</span>
                      </div>
                      <p className="text-sm text-slate-600">{r.description}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="font-semibold">Pricing</div>
                          <div className="mt-1 text-slate-700">{r.pricing.publicRateFrom}</div>
                          {r.pricing.netRateFrom && <div className="text-xs text-slate-500">Net: {r.pricing.netRateFrom}</div>}
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="font-semibold">Commission</div>
                          <div className="mt-1 text-slate-700">{r.commercials.commission}</div>
                          <div className="text-xs text-slate-500">{r.commercials.model}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-500">Zeniva score</div>
                            <div className="text-2xl font-black">{getRating(idx)}</div>
                          </div>
                          <div className="text-right text-sm text-slate-600">{getReviews(idx)} reviews</div>
                        </div>
                        <div className="mt-3 text-xs text-slate-600">Best for: {r.marketing.clientTypes.join(", ")}</div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Amenities</div>
                        <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc list-inside">
                          {r.amenities.slice(0, 5).map((a) => <li key={a}>{a}</li>)}
                        </ul>
                        <div className="mt-3 text-xs text-slate-500">Policies: {r.policies.join(" · ")}</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddToProposal(r)}
                          className="flex-1 rounded-full bg-black px-4 py-2 text-center text-sm font-semibold text-white shadow hover:bg-slate-900"
                        >
                          Add to proposal
                        </button>
                        <button
                          type="button"
                          onClick={() => openLightbox(r.media.flatMap((m) => m.images), 0)}
                          className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          View gallery
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </div>
      </div>
      </div>
    </main>

    {lightboxOpen && lightboxImages.length > 0 && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
        <button
          type="button"
          onClick={closeLightbox}
          className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900 shadow"
        >
          Close
        </button>
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow"
        >
          Prev
        </button>
        <div className="relative max-w-5xl w-full">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
            <Image
              src={lightboxImages[lightboxIndex]}
              alt="Gallery item"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <div className="mt-3 flex justify-center gap-2">
            {lightboxImages.map((img, idx) => (
              <button
                key={img}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`h-14 w-20 overflow-hidden rounded border ${idx === lightboxIndex ? "border-white" : "border-slate-400/60"}`}
              >
                <Image
                  src={img}
                  alt={`Thumb ${idx + 1}`}
                  width={160}
                  height={90}
                  className="h-full w-full object-cover"
                  sizes="120px"
                />
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow"
        >
          Next
        </button>
      </div>
    )}
    </>
  );
}
