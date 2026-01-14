"use client";
import Link from "next/link";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PACKAGES from "@/src/data/packages";
import { createTrip, applyTripPatch } from "@/lib/store/tripsStore";

type Package = {
  slug: string;
  title: string;
  price: string;
  duration: string;
  destination: string;
  collections: string[];
  image: string;
};

function PackagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const country = searchParams?.get("country") || "";
  const [visible, setVisible] = useState(12);
  const items = useMemo(() => {
    if (!country) return PACKAGES;
    const target = country.toLowerCase();
    return PACKAGES.filter((p) => p.destination.toLowerCase().includes(target));
  }, [country]);

  const handleBook = (pkg: Package) => {
    const tripId = createTrip({ title: pkg.title, destination: pkg.destination });
    // Parse duration, assume 5 days if not specified
    const days = parseInt(pkg.duration) || 5;
    const checkIn = new Date('2026-06-01'); // Default start
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + days);

    applyTripPatch(tripId, {
      destination: pkg.destination,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      adults: 2,
      children: 0,
      currency: 'USD',
      budget: parseInt(pkg.price.replace(/[^0-9]/g, '')) || 5000,
      departureCity: "New York",
      accommodationType: "Hotel", // Assume hotel
    });

    router.push(`/proposals/${tripId}/select`);
  };

  return (
    <main className="min-h-screen p-10 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">All Packages</h1>
          {country && <div className="text-sm text-slate-500">Filtered by destination: {country}</div>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, visible).map((p) => (
            <div key={p.slug} className="bg-white rounded-2xl shadow p-4">
              <div className="h-44 w-full overflow-hidden rounded-lg mb-4">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-bold mb-1">{p.title}</h2>
              <div className="text-sm text-slate-500 mb-3">{p.duration} • {p.destination}</div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black">{p.price}</div>
                <button onClick={() => handleBook(p)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Book</button>
              </div>
            </div>
          ))}
        </div>

        {visible < items.length && (
          <div className="flex justify-center mt-8">
            <button onClick={() => setVisible((v) => v + 12)} className="px-6 py-3 rounded-full bg-white border shadow">Load more</button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PackagesContent />
    </Suspense>
  );
}
