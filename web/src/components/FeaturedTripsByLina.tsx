"use client";

import featuredTrips from "../../src/data/lina_featured_trips.json";
import { createTrip, applyTripPatch } from "../../lib/store/tripsStore";
import { useRouter } from "next/navigation";
import { useI18n } from "../lib/i18n/I18nProvider";
import { formatCurrencyAmount, formatTripDateRange } from "../lib/format";

type Trip = {
  id: string;
  title: string;
  description: string;
  destination: string;
  dates: string;
  price: number;
  currency: string;
  image: string;
  partner: string;
  details: {
    flight: boolean;
    hotel: boolean;
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
      budget: trip.price,
      // departureCity intentionally left undefined so the client chooses origin on the Select page
    });

    router.push(`/proposals/${tripId}/select`);
  };

  return (
    <section className="max-w-7xl mx-auto py-10 px-6">
      <h2 className="text-3xl font-black mb-6">Featured Trips by Lina</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featuredTrips.map(trip => (
          <div key={trip.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <img src={trip.image} alt={trip.title} className="h-64 w-full object-cover" />
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-1">{trip.title}</h3>
              <div className="text-sm text-slate-600 mb-2">{trip.destination} • {formatTripDateRange(trip.dates, locale)}</div>
              <div className="text-sm mb-3">{trip.description}</div>
              <div className="text-lg font-extrabold text-blue-700 mb-4">{formatCurrencyAmount(trip.price, trip.currency, locale)}</div>
              <button onClick={() => handleBook(trip)} className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition">Book</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
