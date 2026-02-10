"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { resortPartners, type ResortPartner, type ResortStatus } from "@/src/data/partners/resorts";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG, TITLE_TEXT, MUTED_TEXT } from "@/src/design/tokens";
import Header from "@/src/components/Header";
import AutoTranslate from "@/src/components/AutoTranslate";
import { createTrip, updateSnapshot, applyTripPatch, generateProposal, setProposalSelection } from "@/lib/store/tripsStore";
import { useI18n } from "@/src/lib/i18n/I18nProvider";
import { formatCurrencyAmount, normalizePriceLabel } from "@/src/lib/format";

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
  const { locale } = useI18n();
  const [selectedId, setSelectedId] = useState(resortPartners[0]?.id ?? "");
  const [selectedRooms, setSelectedRooms] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<{
    status: ResortStatus | "all";
    type: string;
    query: string;
    sort: "featured" | "price" | "name";
    departureCity: string;
    checkIn: string;
    checkOut: string;
    travelers: number;
  }>({
    status: "all",
    type: "",
    query: "",
    sort: "featured",
    departureCity: "",
    checkIn: "",
    checkOut: "",
    travelers: 2,
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewsResort, setReviewsResort] = useState<ResortPartner | null>(null);
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
  const getRoomSelection = (r: ResortPartner) => selectedRooms[r.id] || r.roomTypes?.[0] || "Resort stay";
  const getBaseNightlyRate = (r: ResortPartner) => (r.id === "tribe-resorts" ? 195 : 295);
  const getRoomNightlyRate = (r: ResortPartner, room: string) => {
    const rooms = r.roomTypes?.length ? r.roomTypes : ["Resort stay"];
    const idx = Math.max(0, rooms.findIndex((item) => item === room));
    const base = getBaseNightlyRate(r);
    const increments = [0, 40, 80, 120];
    const bump = increments[Math.min(idx, increments.length - 1)] ?? 0;
    return base + bump;
  };
  const formatNightlyRate = (amount: number) => `${formatCurrencyAmount(amount, "USD", locale)}/night`;
  const formatRate = (value?: string) => {
    if (!value) return "";
    const cleaned = value
      .replace(/\bcommissionable\b\s*/gi, "")
      .replace(/\bbar\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return normalizePriceLabel(cleaned, locale);
  };

  const handleAddToProposal = async (resort: ResortPartner) => {
    const selectedRoom = getRoomSelection(resort);
    const nightlyRate = getRoomNightlyRate(resort, selectedRoom);
    const publicRate = `From ${formatCurrencyAmount(nightlyRate, "USD", locale)}/night`;
    const tripId = createTrip({
      title: resort.name,
      destination: resort.destination,
      style: resort.positioning,
    });

    const dates = filters.checkIn && filters.checkOut ? `${filters.checkIn} - ${filters.checkOut}` : "";

    updateSnapshot(tripId, {
      destination: resort.destination,
      travelers: `${filters.travelers} travelers`,
      style: resort.positioning,
      accommodationType: "Hotel",
      budget: publicRate,
      dates,
      departure: filters.departureCity,
    });

    applyTripPatch(tripId, {
      destination: resort.destination,
      accommodationType: "Hotel",
      style: resort.positioning,
      budget: publicRate,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      departureCity: filters.departureCity,
      dates,
      travelers: filters.travelers,
    });

    const hotelSelection = {
      id: resort.id,
      name: resort.name,
      location: resort.destination,
      price: publicRate,
      room: selectedRoom,
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

  const openReviews = (resort: ResortPartner) => {
    setReviewsResort(resort);
    setReviewsOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const closeReviews = () => setReviewsOpen(false);

  const goPrev = () => {
    setLightboxIndex((i) => (lightboxImages.length ? (i - 1 + lightboxImages.length) % lightboxImages.length : 0));
  };

  const goNext = () => {
    setLightboxIndex((i) => (lightboxImages.length ? (i + 1) % lightboxImages.length : 0));
  };

  const fakeReviews = (resort: ResortPartner) => [
    {
      name: "Camille R.",
      rating: "5.0",
      title: "Zeniva nailed the details",
      text: `Every detail felt curated. ${resort.name} was flawless for a reset trip.`,
      date: "Jan 2026",
    },
    {
      name: "Lucas M.",
      rating: "4.8",
      title: "Perfect for retreats",
      text: "Great service, calm spaces, and the room selection made booking easy.",
      date: "Dec 2025",
    },
    {
      name: "Nadia K.",
      rating: "4.6",
      title: "Would book again",
      text: "Beautiful amenities and the team handled everything fast.",
      date: "Nov 2025",
    },
  ];

  return (
    <>
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="w-screen left-1/2 right-1/2 -translate-x-1/2 relative">
        <div className="mx-auto w-full px-6 pt-5">
          <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
        </div>
      </div>

      <section className="mb-8 rounded-3xl px-6 py-8" style={{ background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)` }}>
        <div className="mx-auto max-w-6xl text-white">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Agent Catalog</p>
            <h1 className="text-3xl font-black">Full Travel Inventory</h1>
            <p className="text-sm text-white/90">Concierge-ready listings for resorts, yachts, and private residences.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/partners/resorts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white text-slate-900">
              Hotels & Resorts
            </Link>
            <Link href="/yachts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
              Yachts
            </Link>
            <Link href="/residences" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
              Short-term Rentals
            </Link>
            <Link href="/agent/purchase-orders" className="rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white">
              Submit booking request
            </Link>
          </div>
        </div>
      </section>

      <div className="w-screen left-1/2 right-1/2 -translate-x-1/2 relative px-6 pb-16 space-y-8">

      <div className="w-full max-w-none px-1 py-4 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><AutoTranslate text="Zeniva Partner Resorts" className="inline" /></p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}><AutoTranslate text="Partner hotels, curated by Lina AI" className="inline" /></h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              <AutoTranslate text="Verified inventory only. AI‑assisted contracts, priority perks, and trusted media for proposals." className="inline" />
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
                  placeholder="Search resort or destination"
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={filters.travelers}
                    onChange={(e) => setFilters((f) => ({ ...f, travelers: Math.max(1, Number(e.target.value || 1)) }))}
                    placeholder="Travelers"
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
                  href="/chat/agent?channel=agent-alexandre&listing=AIKA&source=/residences/aika"
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
                          <div className="mt-1 text-slate-700">
                            {formatNightlyRate(getRoomNightlyRate(r, getRoomSelection(r)))}
                          </div>
                          {r.pricing.netRateFrom && (
                            <div className="text-xs text-slate-500">Net: {formatRate(r.pricing.netRateFrom) || r.pricing.netRateFrom}</div>
                          )}
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="font-semibold">Room</div>
                          <select
                            value={getRoomSelection(r)}
                            onChange={(e) =>
                              setSelectedRooms((prev) => ({
                                ...prev,
                                [r.id]: e.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            {(r.roomTypes?.length ? r.roomTypes : ["Resort stay"]).map((room) => (
                              <option key={room} value={room}>
                                {room}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => openReviews(r)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-500">Zeniva score</div>
                            <div className="text-2xl font-black">{getRating(idx)}</div>
                          </div>
                          <div className="text-right text-sm text-slate-600">{getReviews(idx)} reviews</div>
                        </div>
                        <div className="mt-3 text-xs text-slate-600">Best for: {r.marketing.clientTypes.join(", ")}</div>
                      </button>

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

    {reviewsOpen && reviewsResort && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Reviews</div>
              <div className="text-2xl font-black" style={{ color: TITLE_TEXT }}>{reviewsResort.name}</div>
            </div>
            <button
              type="button"
              onClick={closeReviews}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid gap-4">
            {fakeReviews(reviewsResort).map((review) => (
              <div key={`${review.name}-${review.title}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold" style={{ color: TITLE_TEXT }}>{review.name}</div>
                  <div className="text-sm text-slate-600">{review.rating} · {review.date}</div>
                </div>
                <div className="mt-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>{review.title}</div>
                <div className="mt-1 text-sm text-slate-600">{review.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
