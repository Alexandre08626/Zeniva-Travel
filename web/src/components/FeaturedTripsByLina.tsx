"use client";
// FeaturedTripsByLina — ready-to-book departures from New York (JFK), curated by Lina.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import featuredTrips from "../data/lina_featured_trips.json";
import { createTrip, applyTripPatch } from "../../lib/store/tripsStore";
import { useI18n } from "../lib/i18n/I18nProvider";
import { formatCurrencyAmount, formatTripDateRange } from "../lib/format";

type Category = "beach" | "europe" | "asia" | "adventure";

type Trip = {
  id: string;
  title: string;
  description: string;
  destination: string;
  departureCity?: string;
  departureAirport?: string;
  dates: string;
  price: number;
  wasPrice?: number;
  currency: string;
  image: string;
  partner: string;
  category?: Category;
  nights?: number;
  details: {
    flight: boolean;
    hotel: boolean;
    transfer?: boolean;
    activities: string[];
  };
};

const CATEGORIES: { key: "all" | Category; label: string; emoji: string }[] = [
  { key: "all", label: "All deals", emoji: "🔥" },
  { key: "beach", label: "Beach & Sun", emoji: "🏖️" },
  { key: "europe", label: "Europe", emoji: "🇪🇺" },
  { key: "asia", label: "Asia", emoji: "🌏" },
  { key: "adventure", label: "Adventure", emoji: "🌋" },
];

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");

// Handles "November 12-17, 2026" and "March 26-April 3, 2027".
function parseDates(datesStr: string): { checkIn?: string; checkOut?: string } {
  if (!datesStr) return {};
  const m = datesStr.match(/([A-Za-z]+)\s+(\d{1,2})\s*-\s*(?:([A-Za-z]+)\s+)?(\d{1,2}),\s*(\d{4})/);
  if (!m) return {};
  const [, startMonth, startDay, endMonth, endDay, year] = m;
  const m1 = MONTHS[startMonth.toLowerCase()];
  const m2 = endMonth ? MONTHS[endMonth.toLowerCase()] : m1;
  if (!m1 || !m2) return {};
  return {
    checkIn: `${year}-${pad(m1)}-${pad(parseInt(startDay, 10))}`,
    checkOut: `${year}-${pad(m2)}-${pad(parseInt(endDay, 10))}`,
  };
}

// Used only when a trip's date label can't be parsed: 30 days out, for the package's length.
function fallbackDates(nights: number) {
  const DAY = 24 * 60 * 60 * 1000;
  const start = new Date(Date.now() + 30 * DAY);
  const end = new Date(start.getTime() + nights * DAY);
  return { checkIn: start.toISOString().split("T")[0], checkOut: end.toISOString().split("T")[0] };
}

function savingsPercent(trip: Trip) {
  if (!trip.wasPrice || trip.wasPrice <= trip.price) return 0;
  return Math.round(((trip.wasPrice - trip.price) / trip.wasPrice) * 100);
}

function linaPrompt(trip: Trip) {
  return `/chat?prompt=${encodeURIComponent(
    `I'm interested in the "${trip.title}" package from New York (${trip.dates}, from $${trip.price} per person). Can you tell me more?`
  )}`;
}

type Props = {
  /** "grid" (default) = full desktop grid with filters; "carousel" = compact horizontal scroller for mobile. */
  variant?: "grid" | "carousel";
  /** Cap the number of trips shown (carousel defaults to 8). */
  limit?: number;
};

export default function FeaturedTripsByLina({ variant = "grid", limit }: Props) {
  const router = useRouter();
  const { locale } = useI18n();
  const [category, setCategory] = useState<"all" | Category>("all");

  const trips = useMemo(() => {
    const all = featuredTrips as Trip[];
    const filtered = category === "all" ? all : all.filter((t) => t.category === category);
    const max = limit ?? (variant === "carousel" ? 8 : undefined);
    return max ? filtered.slice(0, max) : filtered;
  }, [category, limit, variant]);

  const handleBook = (trip: Trip) => {
    const destination = trip.destination.split(",")[0].trim();
    const tripId = createTrip({ title: trip.title, destination });
    if (!tripId) {
      // Trip limit reached — let Lina take over instead of failing silently.
      router.push(linaPrompt(trip));
      return;
    }

    let { checkIn, checkOut } = parseDates(trip.dates);
    if (!checkIn || !checkOut) {
      ({ checkIn, checkOut } = fallbackDates(trip.nights ?? 5));
    }

    const adults = 2;
    applyTripPatch(tripId, {
      destination,
      checkIn,
      checkOut,
      adults,
      children: 0,
      currency: trip.currency,
      budget: trip.price * adults,
      departureCity: trip.departureCity || "New York",
      departureAirport: trip.departureAirport || "JFK",
      includeTransfers: true,
      transferComplimentary: true,
      accommodationType: "Hotel",
      transportationType: "Flights",
    });

    router.push(`/proposals/${tripId}/select`);
  };

  /* ── Compact carousel (mobile) ── */
  if (variant === "carousel") {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {trips.map((trip) => {
          const save = savingsPercent(trip);
          return (
            <button
              key={trip.id}
              type="button"
              onClick={() => handleBook(trip)}
              className="flex-shrink-0 w-52 text-left rounded-2xl overflow-hidden bg-white shadow-md ring-1 ring-slate-200/60 active:scale-95 transition-transform"
            >
              <div className="relative h-32 overflow-hidden">
                {/* Inline height: globals.css forces img { height: auto } on Windows, which overrides h-* classes. */}
                <img src={trip.image} alt={trip.title} className="w-full object-cover" style={{ height: "100%" }} loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
                <span className="absolute top-2 left-2 bg-white/95 text-slate-800 text-[9px] font-black px-2 py-0.5 rounded-full">✈ From NYC</span>
                {save > 0 && (
                  <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">-{save}%</span>
                )}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-white text-sm font-black leading-tight drop-shadow">{trip.title}</div>
                  <div className="text-white/85 text-[10px] font-semibold">{trip.destination}</div>
                </div>
              </div>
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{formatTripDateRange(trip.dates, locale)}</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-900 whitespace-nowrap">{formatCurrencyAmount(trip.price, trip.currency, locale)}</span>
                  {trip.wasPrice && <span className="text-[10px] text-slate-400 line-through whitespace-nowrap">{formatCurrencyAmount(trip.wasPrice, trip.currency, locale)}</span>}
                </div>
                <div className="text-[10px] text-slate-500">per person · {trip.nights ?? 5} nights · flight + hotel</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Full grid (desktop) ── */
  return (
    <div>
      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {CATEGORIES.map((c) => {
          const active = c.key === category;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold border transition-all ${
                active
                  ? "bg-[#0B1B4D] text-white border-[#0B1B4D] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              <span className="mr-1.5">{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-slate-500 font-semibold">
          {trips.length} departure{trips.length === 1 ? "" : "s"} · JFK · 2–4 travelers
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {trips.map((trip) => {
          const save = savingsPercent(trip);
          return (
            <div
              key={trip.id}
              className="group relative rounded-3xl bg-white shadow-md hover:shadow-2xl ring-1 ring-slate-200/60 hover:ring-blue-300 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-52 sm:h-56 overflow-hidden">
                <img
                  src={trip.image}
                  alt={trip.title}
                  loading="lazy"
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ height: "100%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/95 backdrop-blur text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    ✈ From NYC · {trip.departureAirport || "JFK"}
                  </span>
                  <span className="bg-blue-600/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    All-Inclusive
                  </span>
                </div>
                {save > 0 && (
                  <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                    Save {save}%
                  </span>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white text-lg sm:text-xl font-extrabold drop-shadow-md leading-tight">{trip.title}</h3>
                  <div className="text-white/90 text-xs font-medium drop-shadow">
                    {trip.destination} · {trip.nights ?? 5} nights
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {formatTripDateRange(trip.dates, locale)}
                </div>
                <p className="text-sm text-slate-700 mb-3 line-clamp-3 leading-relaxed">{trip.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {trip.details.flight && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">✈ Flight</span>
                  )}
                  {trip.details.hotel && (
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">🏨 Hotel</span>
                  )}
                  {trip.details.transfer && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-md">🚐 Transfer</span>
                  )}
                </div>

                {trip.details.activities?.length > 0 && (
                  <div className="text-[11px] text-slate-500 mb-4 truncate">
                    <span className="font-bold text-slate-600">Includes:</span> {trip.details.activities.join(" · ")}
                  </div>
                )}

                <div className="mt-auto flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                      From{" "}
                      {trip.wasPrice && (
                        <span className="text-slate-400 line-through">{formatCurrencyAmount(trip.wasPrice, trip.currency, locale)}</span>
                      )}
                    </div>
                    <div className="text-xl font-black text-slate-900 leading-none whitespace-nowrap">
                      {formatCurrencyAmount(trip.price, trip.currency, locale)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 whitespace-nowrap">per person · 2–4 travelers</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleBook(trip)}
                      className="whitespace-nowrap bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      Book →
                    </button>
                    <Link href={linaPrompt(trip)} className="text-[11px] font-bold text-blue-600 hover:text-blue-800">
                      Ask Lina
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {trips.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-10">No departures in this category yet — ask Lina to build one for you.</div>
      )}
    </div>
  );
}
