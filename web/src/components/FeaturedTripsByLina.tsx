"use client";

import featuredTrips from "../../src/data/lina_featured_trips.json";
import { createTrip, applyTripPatch } from "../../lib/store/tripsStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../lib/i18n/I18nProvider";
import { formatCurrencyAmount, formatTripDateRange } from "../lib/format";
import AutoTranslate from "./AutoTranslate";

type Trip = {
  id: string;
  title: string;
  description: string;
  destination: string;
  departureCity?: string;
  departureAirport?: string;
  destinationAirport?: string;
  estimatedFlightFromJFK_USD?: number;
  dates: string;
  price: number;
  currency: string;
  image: string;
  partner: string;
  details: {
    flight: boolean;
    hotel: boolean;
    transfer?: boolean;
    activities: string[];
  };
};

type Origin = { code: string; city: string; country: "USA" | "Canada"; flag: string };

const ORIGINS: Origin[] = [
  { code: "JFK", city: "New York", country: "USA", flag: "🇺🇸" },
  { code: "MIA", city: "Miami", country: "USA", flag: "🇺🇸" },
  { code: "LAX", city: "Los Angeles", country: "USA", flag: "🇺🇸" },
  { code: "IAD", city: "Virginia (Dulles)", country: "USA", flag: "🇺🇸" },
  { code: "YUL", city: "Montréal", country: "Canada", flag: "🇨🇦" },
  { code: "YQB", city: "Québec City", country: "Canada", flag: "🇨🇦" },
];

type PriceRow = {
  tripId: string;
  flightTotalUSD: number | null;
  pricePerPersonUSD: number | null;
  source: "duffel" | "mock" | "fallback";
  airline?: string;
};

function parseDates(datesStr: string): { checkIn?: string; checkOut?: string } {
  if (!datesStr) return {};
  // "June 14-19, 2026"
  const same = datesStr.match(/([A-Za-z]+)\s+(\d{1,2})-(\d{1,2}),\s*(\d{4})/);
  if (same) {
    const [, monthName, dayStartStr, dayEndStr, yearStr] = same;
    const month = new Date(`${monthName} 1, ${yearStr}`).getMonth() + 1;
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      checkIn: `${yearStr}-${pad(month)}-${pad(parseInt(dayStartStr, 10))}`,
      checkOut: `${yearStr}-${pad(month)}-${pad(parseInt(dayEndStr, 10))}`,
    };
  }
  // "May 30-June 5, 2026"
  const cross = datesStr.match(/([A-Za-z]+)\s+(\d{1,2})-([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (cross) {
    const [, m1, d1, m2, d2, y] = cross;
    const month1 = new Date(`${m1} 1, ${y}`).getMonth() + 1;
    const month2 = new Date(`${m2} 1, ${y}`).getMonth() + 1;
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      checkIn: `${y}-${pad(month1)}-${pad(parseInt(d1, 10))}`,
      checkOut: `${y}-${pad(month2)}-${pad(parseInt(d2, 10))}`,
    };
  }
  return {};
}

export default function FeaturedTripsByLina({ limit }: { limit?: number } = {}) {
  const router = useRouter();
  const { locale } = useI18n();
  const allTrips = (limit ? featuredTrips.slice(0, limit) : featuredTrips) as Trip[];

  const [origin, setOrigin] = useState<Origin>(ORIGINS[0]);
  const [prices, setPrices] = useState<Record<string, PriceRow>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesError, setPricesError] = useState<string | null>(null);

  // Refresh prices whenever the origin changes. NYC (JFK) is the JSON
  // baseline — we still hit the API so the cache warms up and we surface a
  // real Duffel price for "Flight from NYC" on those cards too.
  useEffect(() => {
    let abort = false;
    const controller = new AbortController();
    setPricesLoading(true);
    setPricesError(null);
    const payload = {
      originAirport: origin.code,
      travelers: 2,
      trips: allTrips.map((t) => {
        const { checkIn, checkOut } = parseDates(t.dates);
        return {
          tripId: t.id,
          destinationAirport: t.destinationAirport,
          checkIn,
          checkOut,
          basePrice: t.price,
          estimatedFlightFromJFK_USD: t.estimatedFlightFromJFK_USD,
        };
      }),
    };
    fetch("/api/packages/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        if (abort) return;
        if (d?.ok && d.prices) setPrices(d.prices);
        else setPricesError(d?.error || "price_lookup_failed");
      })
      .catch((err) => {
        if (abort) return;
        if (err?.name !== "AbortError") setPricesError("network");
      })
      .finally(() => {
        if (!abort) setPricesLoading(false);
      });
    return () => {
      abort = true;
      controller.abort();
    };
  }, [origin.code, allTrips]);

  const handleBook = (trip: Trip) => {
    const destination = trip.destination.trim();
    const tripId = createTrip({ title: trip.title, destination });
    if (!tripId) return;
    let { checkIn, checkOut } = parseDates(trip.dates);
    if (!checkIn) {
      checkIn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      checkOut = new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    }
    const livePerPerson = prices[trip.id]?.pricePerPersonUSD;
    const budget = (livePerPerson || trip.price) * 2;
    applyTripPatch(tripId, {
      destination,
      checkIn,
      checkOut,
      adults: 2,
      children: 0,
      currency: trip.currency,
      budget,
      departureCity: origin.city,
      departureAirport: origin.code,
      includeTransfers: true,
      transferComplimentary: true,
      accommodationType: "Hotel",
      transportationType: "Flights",
      source: "featured-deal",
    });
    router.push(`/proposals/${tripId}/select`);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6">
      {/* Origin filter */}
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Departing from</p>
            <p className="text-sm text-slate-600 mt-0.5">
              Same 22 destinations · live prices via Duffel for your origin
              {pricesLoading ? <span className="ml-2 text-blue-600">· refreshing prices…</span> : null}
              {pricesError ? <span className="ml-2 text-amber-600">· using estimates</span> : null}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ORIGINS.map((o) => {
            const active = o.code === origin.code;
            return (
              <button
                key={o.code}
                type="button"
                onClick={() => setOrigin(o)}
                className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-xs sm:text-sm font-bold transition ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span aria-hidden>{o.flag}</span>
                <span>✈ {o.city}</span>
                <span className={`text-[10px] font-mono ${active ? "text-blue-100" : "text-slate-400"}`}>{o.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {allTrips.map((trip) => {
          const live = prices[trip.id];
          const livePerPerson = live?.pricePerPersonUSD ?? null;
          const flightTotal = live?.flightTotalUSD ?? null;
          const displayPrice = livePerPerson != null ? livePerPerson : trip.price;
          const sourceTag =
            live?.source === "duffel" ? "Live · Duffel" : live?.source === "mock" ? "Estimate" : "Estimate";
          return (
            <div
              key={trip.id}
              className="group relative rounded-2xl sm:rounded-3xl bg-white shadow-md hover:shadow-2xl ring-1 ring-slate-200/60 hover:ring-blue-300 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
            >
              <div className="relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trip.image}
                  alt={trip.title}
                  loading="lazy"
                  className="h-48 sm:h-56 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2 max-w-[calc(100%-1.25rem)]">
                  <span className="bg-white/95 backdrop-blur text-slate-800 text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                    ✈ From {origin.code}
                  </span>
                  <span className="bg-blue-600/95 text-white text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                    <AutoTranslate text="All-Inclusive" className="inline" />
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3">
                  <h3 className="text-white text-base sm:text-lg md:text-xl font-extrabold drop-shadow-md leading-tight">
                    {trip.title}
                  </h3>
                  <div className="text-white/90 text-[11px] sm:text-xs font-medium drop-shadow">{trip.destination}</div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <div className="text-[11px] uppercase tracking-wider text-blue-600 font-bold mb-2 flex items-center gap-1.5">
                  <span>📅</span>
                  <AutoTranslate text="Choose your dates" className="inline" />
                </div>
                <div className="text-[13px] sm:text-sm text-slate-700 mb-3 line-clamp-3 leading-relaxed">{trip.description}</div>

                <div className="flex flex-wrap gap-1.5 mb-4">
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

                {/* Reserved-height flight pill — always rendered (skeleton during
                    loading) so the card doesn't jump when Duffel responds and
                    the surrounding image / price block stays anchored. */}
                <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-1.5 text-[11px] flex items-center justify-between gap-2 min-h-[28px]">
                  {flightTotal != null ? (
                    <>
                      <span className="text-blue-700 font-semibold truncate">
                        ✈ Flight {origin.code} → {trip.destinationAirport}: ${Math.round(flightTotal).toLocaleString()}
                        <span className="text-blue-400 font-normal"> / 2 pax</span>
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${live?.source === "duffel" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                        {sourceTag}
                      </span>
                    </>
                  ) : (
                    <span className="text-blue-400 italic animate-pulse">
                      ✈ Searching live flight {origin.code} → {trip.destinationAirport}…
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500 font-semibold"><AutoTranslate text="From" className="inline" /></div>
                    <div className={`text-xl sm:text-2xl font-black leading-none ${pricesLoading ? "text-slate-400 animate-pulse" : "text-slate-900"}`}>
                      {formatCurrencyAmount(displayPrice, trip.currency, locale)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5"><AutoTranslate text="per person · 2-4 travelers" className="inline" /></div>
                  </div>
                  <button
                    onClick={() => handleBook(trip)}
                    className="shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 text-white text-sm font-bold py-2.5 px-4 sm:px-5 rounded-xl shadow-md hover:shadow-lg transition-all min-h-[44px]"
                  >
                    <AutoTranslate text="Book" className="inline" /> →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suppress unused-import warning — formatTripDateRange is kept for future use */}
      <span style={{ display: "none" }} aria-hidden>{useMemo(() => formatTripDateRange ? "" : "", [])}</span>
    </section>
  );
}
