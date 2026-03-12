"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function RentalsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [destination, setDestination] = useState(searchParams.get("destination") || "Miami");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkin") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkout") || "");
  const [guests, setGuests] = useState(parseInt(searchParams.get("guests") || "2"));
  const [propertyType, setPropertyType] = useState(searchParams.get("type") || "short-term rental");
  const [villas, setVillas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PROPERTY_TYPES = [
    { key: "short-term rental", label: "🏠 All Rentals" },
    { key: "villa", label: "🌴 Villas" },
    { key: "condo", label: "🏢 Condos" },
    { key: "house", label: "🏡 Houses" },
    { key: "apartment", label: "🏙️ Apartments" },
    { key: "chalet", label: "⛷️ Chalets" },
  ];

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        destination,
        ...(checkIn && { checkIn }),
        ...(checkOut && { checkOut }),
        guests: String(guests),
        type: propertyType,
      });
      const res = await fetch(`/api/airbnb/villas/search?${params}`);
      const data = await res.json();
      if (data.villas?.length > 0) {
        setVillas(data.villas);
      } else {
        setVillas([]);
        setError("No properties found for this search. Try a different destination or dates.");
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destination) search();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-pink-600 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-purple-200 text-sm mb-4 inline-block hover:text-white">← Back to home</Link>
          <h1 className="text-3xl font-black mb-2">🏠 Zeniva Homes</h1>
          <p className="text-purple-100">Villas, condos, apartments & vacation rentals worldwide</p>

          {/* Search form */}
          <div className="mt-6 bg-white/10 backdrop-blur rounded-2xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Destination"
              className="md:col-span-2 rounded-xl px-4 py-2.5 text-gray-800 text-sm font-medium focus:outline-none"
            />
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none" />
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none" />
            <button onClick={search}
              className="bg-white text-purple-700 font-black rounded-xl py-2.5 hover:bg-purple-50 transition">
              Search
            </button>
          </div>

          {/* Property type filter */}
          <div className="mt-3 flex flex-wrap gap-2">
            {PROPERTY_TYPES.map(pt => (
              <button key={pt.key} onClick={() => setPropertyType(pt.key)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${propertyType === pt.key ? "bg-white text-purple-700" : "bg-white/20 text-white hover:bg-white/30"}`}>
                {pt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-lg font-semibold text-slate-600">Searching {destination}…</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏠</div>
            <p className="text-slate-600 font-semibold">{error}</p>
          </div>
        )}

        {!loading && villas.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800">{villas.length} properties in {destination}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {villas.map((villa, i) => (
                <a key={villa.id || i} href={villa.bookUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
                  {/* Photo */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {villa.photo ? (
                      <img src={villa.photo} alt={villa.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
                    )}
                    {villa.superhost && (
                      <span className="absolute top-3 left-3 bg-white text-xs font-bold px-2 py-1 rounded-full shadow">⭐ Superhost</span>
                    )}
                    {villa.rareFind && (
                      <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">Rare find</span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">{villa.type}</p>
                    <p className="font-bold text-slate-800 leading-tight line-clamp-2">{villa.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{villa.city}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                      {villa.bedrooms > 0 && <span>🛏 {villa.bedrooms} bed{villa.bedrooms > 1 ? "s" : ""}</span>}
                      {villa.bathrooms > 0 && <span>🚿 {villa.bathrooms} bath{villa.bathrooms > 1 ? "s" : ""}</span>}
                      {villa.maxGuests > 0 && <span>👥 {villa.maxGuests} guests</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {villa.rating && (
                          <span className="text-sm font-bold text-amber-600">★ {villa.rating}</span>
                        )}
                        {villa.reviews > 0 && <span className="text-xs text-slate-400 ml-1">({villa.reviews})</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-800">{villa.pricePerNight}</span>
                        <span className="text-xs text-slate-400"> /night</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 flex justify-between">
                      <span>Total: <strong>{villa.priceTotal}</strong></span>
                      <span className="text-purple-600 font-semibold group-hover:underline">Book on Airbnb →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RentalsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <RentalsContent />
    </Suspense>
  );
}
