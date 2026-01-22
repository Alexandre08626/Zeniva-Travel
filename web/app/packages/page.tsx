"use client";
import Link from "next/link";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PACKAGES from "@/src/data/packages";
import { createTrip, applyTripPatch } from "@/lib/store/tripsStore";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG } from "@/src/design/tokens";
import Header from "@/src/components/Header";
import TravelSearchWidget from "@/src/components/TravelSearchWidget";
import LinaWidget from "@/src/components/LinaWidget";
import AutoTranslate from "@/src/components/AutoTranslate";

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
  const isLoggedIn = false;
  const userEmail = "user@email.com";
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
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      {/* Header aligned with hero left edge (full-bleed alignment) */}
      <div className="full-bleed-container">
        <div className="w-full px-6">
          <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-none px-6 pb-16 pt-5">
        {/* HERO SECTION (Lina Search) */}
        <section className="mt-4 mb-10 full-bleed-container">
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
