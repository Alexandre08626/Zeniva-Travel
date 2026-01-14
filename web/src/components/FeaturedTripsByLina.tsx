"use client";

import featuredTrips from "../../src/data/lina_featured_trips.json";
import { createTrip, applyTripPatch } from "../../lib/store/tripsStore";
import { useRouter } from "next/navigation";

export default function FeaturedTripsByLina() {
  const router = useRouter();

  const handleBook = (trip) => {
    const destination = trip.destination.split(',')[0].trim();
    const tripId = createTrip({ title: trip.title, destination });

    let checkIn, checkOut;
    if (trip.id === 'paris-romantic-getaway') {
      checkIn = '2026-03-15';
      checkOut = '2026-03-20';
    } else if (trip.id === 'miami-beach-vacation') {
      checkIn = '2026-04-10';
      checkOut = '2026-04-15';
    }

    applyTripPatch(tripId, {
      destination,
      checkIn,
      checkOut,
      adults: 2,
      children: 0,
      currency: trip.currency,
      budget: trip.price,
      departureCity: "New York", // Default origin for flights
    });

    router.push(`/proposals/${tripId}/select`);
  };

  return (
    <section className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-black mb-6">Featured Trips by Lina</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredTrips.map(trip => (
          <div key={trip.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <img src={trip.image} alt={trip.title} className="h-56 w-full object-cover" />
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-1">{trip.title}</h3>
              <div className="text-sm text-slate-600 mb-2">{trip.destination} • {trip.dates}</div>
              <div className="text-sm mb-3">{trip.description}</div>
              <div className="text-lg font-extrabold text-blue-700 mb-4">{trip.price} {trip.currency}</div>
              <button onClick={() => handleBook(trip)} className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition">Book</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
