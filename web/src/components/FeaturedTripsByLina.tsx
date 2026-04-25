"use client";

import featuredTrips from "../../src/data/lina_featured_trips.json";
import { createTrip, applyTripPatch } from "../../lib/store/tripsStore";
import { useRouter } from "next/navigation";
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

export default function FeaturedTripsByLina() {
  const router = useRouter();
  const { locale } = useI18n();

  const parseDates = (datesStr: string) => {
    if (!datesStr) return {};
    // Matches formats like "March 15-20, 2026" or "Jun 1-10, 2026"
    const m = datesStr.match(/([A-Za-z]+)\s+(\d{1,2})-(\d{1,2}),\s*(\d{4})/);
    if (m) {
      const [, monthName, dayStartStr, dayEndStr, yearStr] = m;
      const dayStart = parseInt(dayStartStr, 10);
      const dayEnd = parseInt(dayEndStr, 10);
      const year = parseInt(yearStr, 10);
      // convert month name to month number (1-12)
      const month = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
      const pad = (n: number) => String(n).padStart(2, '0');
      const checkIn = `${year}-${pad(month)}-${pad(dayStart)}`;
      const checkOut = `${year}-${pad(month)}-${pad(dayEnd)}`;
      return { checkIn, checkOut };
    }
    return {};
  };

  const handleBook = (trip: Trip) => {
    const destination = trip.destination.split(',')[0].trim();
    const tripId = createTrip({ title: trip.title, destination });
    if (!tripId) {
      console.error("Failed to create trip for", trip.id);
      return;
    }

    let { checkIn, checkOut } = parseDates(trip.dates) as { checkIn?: string; checkOut?: string };

    // Fallback defaults when dates not parseable
    if (!checkIn) {
      const defaultCheckIn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const defaultCheckOut = new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      checkIn = defaultCheckIn;
      checkOut = defaultCheckOut;
    }

    applyTripPatch(tripId, {
      destination,
      checkIn,
      checkOut,
      adults: 2,
      children: 0,
      currency: trip.currency,
      budget: trip.price * 2,
      departureCity: trip.departureCity || "New York",
      departureAirport: trip.departureAirport || "JFK",
      includeTransfers: true,
      transferComplimentary: true,
      accommodationType: "Hotel",
      transportationType: "Flights",
    });

    router.push(`/proposals/${tripId}/select`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {featuredTrips.map((trip) => (
          <div
            key={trip.id}
            className="group relative rounded-3xl bg-white shadow-md hover:shadow-2xl ring-1 ring-slate-200/60 hover:ring-blue-300 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative overflow-hidden">
              <img
                src={trip.image}
                alt={trip.title}
                className="h-52 sm:h-56 w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-white/95 backdrop-blur text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <AutoTranslate text="✈ From NYC" className="inline" />
                </span>
                <span className="bg-blue-600/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <AutoTranslate text="All-Inclusive" className="inline" />
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <h3 className="text-white text-lg sm:text-xl font-extrabold drop-shadow-md leading-tight">
                    {trip.title}
                  </h3>
                  <div className="text-white/90 text-xs font-medium drop-shadow">{trip.destination}</div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col">
              <div className="text-[11px] uppercase tracking-wider text-blue-600 font-bold mb-2 flex items-center gap-1.5">
                <span>📅</span>
                <AutoTranslate text="Choose your dates" className="inline" />
              </div>
              <div className="text-sm text-slate-700 mb-3 line-clamp-3 leading-relaxed">{trip.description}</div>

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

              <div className="mt-auto flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold"><AutoTranslate text="From" className="inline" /></div>
                  <div className="text-2xl font-black text-slate-900 leading-none">
                    {formatCurrencyAmount(trip.price, trip.currency, locale)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5"><AutoTranslate text="per person · 2-4 travelers" className="inline" /></div>
                </div>
                <button
                  onClick={() => handleBook(trip)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <AutoTranslate text="Book" className="inline" /> →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
