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
  const [propertyType, setPropertyType] = useState(searchParams.get("type") || "ZeniStay");
  const [villas, setVillas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [photoModal, setPhotoModal] = useState<any | null>(null);

  const PROPERTY_TYPES = [
    { key: "ZeniStay", label: "🏠 All" },
    { key: "villa", label: "🌴 Villas" },
    { key: "condo", label: "🏢 Condos" },
    { key: "house", label: "🏡 Houses" },
    { key: "apartment", label: "🏙️ Apartments" },
    { key: "chalet", label: "⛷️ Chalets" },
  ];

  const search = async () => {
    setLoading(true);
    setError(null);
    setSelectedId(null);
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
        setError("No properties found. Try a different destination or dates.");
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (destination) search(); }, []);

  const requestBooking = (villa: any) => {
    const subject = encodeURIComponent(`ZeniStay Booking Request — ${villa.name}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in booking this property:\n\nName: ${villa.name}\nLocation: ${villa.city}\nDates: ${checkIn || "TBD"} → ${checkOut || "TBD"}\nGuests: ${guests}\nPrice: ${villa.priceTotal}\n\nPlease confirm availability.\n\nThank you`);
    window.open(`mailto:info@zeniva.ca?subject=${subject}&body=${body}`, "_blank");
  };

  const chatWithLina = (villa: any) => {
    const prompt = encodeURIComponent(`I want to book the ZeniStay: ${villa.name} in ${villa.city} from ${checkIn || "my dates"} to ${checkOut || "my dates"} for ${guests} guests. Price: ${villa.priceTotal}. Can you help me with the booking?`);
    router.push(`/chat?prompt=${prompt}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Premium header */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2a5e] to-[#1a3d8f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-blue-200 text-sm mb-6 hover:text-white transition">
            ← Back to home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏠</span>
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Zeniva Travel</p>
              <h1 className="text-3xl sm:text-4xl font-black">ZeniStay</h1>
            </div>
          </div>
          <p className="text-blue-200 mb-8">Curated villas, condos & vacation rentals — booked exclusively through Zeniva</p>

          {/* Search bar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Destination</label>
              <input value={destination} onChange={e => setDestination(e.target.value)}
                placeholder="Tulum, Bali, Miami…"
                className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={e => e.key === "Enter" && search()} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Check-in</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Check-out</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Guests</label>
              <div className="flex gap-2">
                <input type="number" min={1} max={20} value={guests} onChange={e => setGuests(parseInt(e.target.value) || 1)}
                  className="w-20 rounded-xl bg-white px-3 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button onClick={search} disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black rounded-xl py-2.5 text-sm hover:opacity-90 transition disabled:opacity-50">
                  {loading ? "…" : "Search"}
                </button>
              </div>
            </div>
          </div>

          {/* Type filter pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {PROPERTY_TYPES.map(pt => (
              <button key={pt.key} onClick={() => { setPropertyType(pt.key); }}
                className={`text-xs font-bold px-4 py-1.5 rounded-full transition border ${propertyType === pt.key ? "bg-white text-blue-700 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}>
                {pt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-semibold">Searching {destination}…</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏠</div>
            <p className="text-slate-600 font-semibold text-lg">{error}</p>
            <p className="text-slate-400 text-sm mt-2">Or <a href="mailto:info@zeniva.ca" className="text-blue-600 hover:underline">contact us</a> — we'll find the perfect property for you.</p>
          </div>
        )}

        {!loading && villas.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">{villas.length} properties in <span className="capitalize">{destination}</span></h2>
                <p className="text-xs text-slate-400 mt-0.5">All bookings handled exclusively by Zeniva Travel</p>
              </div>
              <span className="hidden sm:block text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-full border border-blue-100">🔒 Zeniva-exclusive</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {villas.map((villa, i) => {
                const isSelected = selectedId === (villa.id || String(i));
                const villaId = villa.id || String(i);
                return (
                  <div key={villaId}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 ${isSelected ? "border-blue-500 shadow-blue-100" : "border-slate-100 hover:border-slate-200"}`}>
                    {/* Photo */}
                    <div className="relative h-56 overflow-hidden bg-slate-100 cursor-pointer group" onClick={() => setPhotoModal(villa)}>
                      {villa.photo ? (
                        <img src={villa.photo} alt={villa.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
                      )}
                      {/* Photo count */}
                      {villa.photos?.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold rounded-full px-2 py-1">
                          📷 {villa.photos.length}
                        </div>
                      )}
                      {villa.superhost && (
                        <span className="absolute top-3 left-3 bg-white text-xs font-bold px-2.5 py-1 rounded-full shadow">⭐ Superhost</span>
                      )}
                      {villa.rareFind && (
                        <span className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">Rare find</span>
                      )}
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-black rounded-full px-3 py-1">✓ Selected</div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition text-white font-bold text-sm bg-black/50 rounded-full px-4 py-2">View photos</span>
                      </div>
                    </div>

                    {/* Mini strip thumbnails */}
                    {villa.photos?.length > 1 && (
                      <div className="flex gap-1 px-3 pt-2">
                        {villa.photos.slice(1, 4).map((p: string, pi: number) => (
                          <button key={pi} onClick={() => setPhotoModal(villa)} className="flex-1 h-12 rounded-lg overflow-hidden bg-slate-100">
                            <img src={p} alt="" className="w-full h-full object-cover hover:opacity-80 transition" />
                          </button>
                        ))}
                        {villa.photos.length > 4 && (
                          <button onClick={() => setPhotoModal(villa)} className="flex-1 h-12 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">+{villa.photos.length - 4}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{villa.type || propertyType}</p>
                          <p className="font-black text-slate-900 leading-tight line-clamp-2 mt-0.5">{villa.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{villa.city}</p>
                        </div>
                        {villa.rating && (
                          <span className="flex-shrink-0 text-sm font-black text-amber-600 bg-amber-50 rounded-full px-2.5 py-1">★ {villa.rating}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                        {villa.bedrooms > 0 && <span>🛏 {villa.bedrooms} bed{villa.bedrooms > 1 ? "s" : ""}</span>}
                        {villa.bathrooms > 0 && <span>🚿 {villa.bathrooms} bath</span>}
                        {villa.maxGuests > 0 && <span>👥 {villa.maxGuests} guests</span>}
                      </div>

                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-xl font-black text-slate-900">{villa.pricePerNight}<span className="text-xs font-medium text-slate-400">/night</span></p>
                          <p className="text-xs text-slate-500">Total: <strong>{villa.priceTotal}</strong></p>
                        </div>
                        <button onClick={() => setSelectedId(isSelected ? null : villaId)}
                          className={`text-xs font-bold rounded-xl px-4 py-2 transition ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"}`}>
                          {isSelected ? "✓ Selected" : "Select"}
                        </button>
                      </div>

                      {/* CTA buttons — NO external links */}
                      <div className="mt-3 space-y-2">
                        <button onClick={() => {
                          const p = new URLSearchParams({
                            name: villa.name || "",
                            price: villa.pricePerNight || "",
                            priceNum: String(villa.rawPrice || villa.pricePerNightNum || 0),
                            location: villa.location || villa.city || "",
                            guests: searchParams.get("guests") || "1",
                            bedrooms: String(villa.bedrooms || ""),
                            bathrooms: String(villa.bathrooms || ""),
                            checkin: searchParams.get("checkin") || "",
                            checkout: searchParams.get("checkout") || "",
                            rating: String(villa.rating || ""),
                            reviews: String(villa.reviewCount || ""),
                            type: villa.type || "Vacation Rental",
                            photos: encodeURIComponent(JSON.stringify(villa.photos || (villa.photo ? [villa.photo] : []))),
                            amenities: encodeURIComponent(JSON.stringify(villa.amenities || [])),
                          });
                          router.push(`/rentals/${villa.id || villaId}?${p.toString()}`);
                        }}
                          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black py-3 hover:opacity-90 transition shadow">
                          🏠 View details & book
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => chatWithLina(villa)}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-black py-2.5 hover:opacity-90 transition shadow">
                            💬 Ask Lina
                          </button>
                          <button onClick={() => requestBooking(villa)}
                            className="rounded-xl border-2 border-blue-200 text-blue-700 text-xs font-black py-2.5 hover:bg-blue-50 transition">
                            📧 Request
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1a3d8f] text-white p-8 text-center">
              <h3 className="text-2xl font-black mb-2">Can't find what you're looking for?</h3>
              <p className="text-blue-200 mb-6">Our team will personally source the perfect property for you — villas, private estates, luxury condos worldwide.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/chat" className="bg-white text-blue-700 font-black rounded-xl px-6 py-3 hover:bg-blue-50 transition">
                  💬 Chat with Lina
                </Link>
                <a href="mailto:info@zeniva.ca" className="border-2 border-white/30 text-white font-black rounded-xl px-6 py-3 hover:bg-white/10 transition">
                  📧 info@zeniva.ca
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Photo modal */}
      {photoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPhotoModal(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={photoModal.photo} alt={photoModal.name} className="w-full h-72 object-cover" />
              <button onClick={() => setPhotoModal(null)} className="absolute top-3 right-3 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm hover:bg-black/70">✕</button>
            </div>
            <div className="p-5">
              <h3 className="font-black text-slate-900 text-lg">{photoModal.name}</h3>
              <p className="text-slate-500 text-sm">{photoModal.city}</p>
              {photoModal.photos?.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {photoModal.photos.slice(1).map((p: string, i: number) => (
                    <img key={i} src={p} alt="" className="rounded-xl h-28 w-full object-cover" />
                  ))}
                </div>
              )}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => { chatWithLina(photoModal); setPhotoModal(null); }}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black py-3 hover:opacity-90 transition">
                  💬 Ask Lina
                </button>
                <button onClick={() => { requestBooking(photoModal); setPhotoModal(null); }}
                  className="rounded-xl border-2 border-blue-200 text-blue-700 font-black py-3 hover:bg-blue-50 transition">
                  📧 Request booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RentalsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RentalsContent />
    </Suspense>
  );
}
