"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

const AMENITY_ICONS: Record<string, string> = {
  wifi: "📶", pool: "🏊", parking: "🅿️", kitchen: "🍳", ac: "❄️",
  "air conditioning": "❄️", gym: "💪", spa: "🧖", beach: "🏖️",
  pets: "🐾", washer: "🫧", dryer: "🫧", tv: "📺", balcony: "🌅",
  bbq: "🍖", workspace: "💻", "hot tub": "♨️", fireplace: "🔥",
  garden: "🌿", elevator: "🛗", security: "🔒",
};

function getAmenityIcon(a: string) {
  const key = a.toLowerCase();
  for (const [k, v] of Object.entries(AMENITY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return "✓";
}

function RentalDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  // Read villa data passed via URL search params (from listing page)
  const name = searchParams.get("name") || "Vacation Rental";
  const price = searchParams.get("price") || "";
  const priceNum = parseFloat(searchParams.get("priceNum") || "0");
  const location = searchParams.get("location") || "";
  const guests = searchParams.get("guests") || "1";
  const bedrooms = searchParams.get("bedrooms") || "";
  const bathrooms = searchParams.get("bathrooms") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const rating = searchParams.get("rating") || "";
  const reviews = searchParams.get("reviews") || "";
  const type = searchParams.get("type") || "Vacation Rental";
  const photosRaw = searchParams.get("photos") || searchParams.get("photo") || "";
  const amenitiesRaw = searchParams.get("amenities") || "";
  const description = searchParams.get("description") || `This beautiful ${type.toLowerCase()} in ${location} offers a perfect retreat for your stay. Enjoy premium amenities, comfortable spaces, and an unforgettable experience.`;

  // Parse photos
  let photos: string[] = [];
  try { photos = JSON.parse(decodeURIComponent(photosRaw)); } catch {
    if (photosRaw) photos = [photosRaw];
  }
  if (!photos.length) photos = ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80"];

  // Parse amenities
  let amenities: string[] = [];
  try { amenities = JSON.parse(decodeURIComponent(amenitiesRaw)); } catch {
    if (amenitiesRaw) amenities = amenitiesRaw.split(",").map(a => a.trim());
  }
  if (!amenities.length) amenities = ["WiFi", "Air Conditioning", "Fully Equipped Kitchen", "Parking", "Washer & Dryer"];

  const [activePhoto, setActivePhoto] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Compute nights
  let nights = 1;
  if (checkin && checkout) {
    const d1 = new Date(checkin), d2 = new Date(checkout);
    const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000);
    if (diff > 0) nights = diff;
  }

  const cleaningFee = Math.round(priceNum * 0.15);
  const serviceFee = Math.round(priceNum * nights * 0.12);
  const total = Math.round(priceNum * nights + cleaningFee + serviceFee);

  const goToPayment = () => {
    const booking = {
      type: "villa",
      name,
      location,
      checkin,
      checkout,
      guests,
      nights,
      pricePerNight: priceNum,
      cleaningFee,
      serviceFee,
      total,
      photo: photos[0],
      amenities,
    };
    localStorage.setItem("zeniva_villa_booking", JSON.stringify(booking));
    localStorage.setItem("zeniva_pending_booking", JSON.stringify({
      type: "villa",
      name,
      amount: total,
      currency: "USD",
      description: `Zeniva Home · ${name} · ${nights} night${nights > 1 ? "s" : ""} · ${checkin} → ${checkout}`,
    }));
    router.push(`/payment?type=villa&name=${encodeURIComponent(name)}&total=${total}&nights=${nights}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}`);
  };

  const chatWithLina = () => {
    const prompt = encodeURIComponent(`I'm interested in booking the Zeniva Home "${name}" in ${location} from ${checkin} to ${checkout} for ${guests} guests. Can you help me with the reservation?`);
    router.push(`/chat?prompt=${prompt}`);
  };

  const displayAmenities = showAllAmenities ? amenities : amenities.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Back nav */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-1.5 transition">
            ← Back to results
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 text-sm truncate">{name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero photo gallery */}
        <div className="rounded-3xl overflow-hidden mb-8 bg-slate-100">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] sm:h-[480px]">
            {/* Main photo */}
            <div className="col-span-4 sm:col-span-2 row-span-2 relative overflow-hidden cursor-pointer group" onClick={() => setActivePhoto(0)}>
              <img src={photos[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </div>
            {/* Side photos */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`relative overflow-hidden cursor-pointer group hidden sm:block ${i === 4 ? "rounded-br-none" : ""}`}
                onClick={() => setActivePhoto(i)}>
                {photos[i] ? (
                  <>
                    <img src={photos[i]} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                    {i === 4 && photos.length > 5 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-black text-sm">+{photos.length - 5} photos</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Title + thumbnail strip on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 sm:hidden">
          {photos.slice(0, 6).map((p, i) => (
            <button key={i} onClick={() => setActivePhoto(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition ${activePhoto === i ? "border-blue-500" : "border-transparent"}`}>
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title block */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-blue-600 bg-blue-50 rounded-full px-3 py-1 uppercase tracking-widest">🏠 Zeniva Home</span>
                <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1">{type}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{name}</h1>
              {location && <p className="text-slate-500 text-sm flex items-center gap-1.5">📍 {location}</p>}
              {rating && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-500 text-sm">★ {parseFloat(rating).toFixed(1)}</span>
                  {reviews && <span className="text-slate-400 text-sm">({reviews} reviews)</span>}
                </div>
              )}
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "👤", label: `${guests} guests` },
                bedrooms ? { icon: "🛏", label: `${bedrooms} bedroom${Number(bedrooms) > 1 ? "s" : ""}` } : null,
                bathrooms ? { icon: "🚿", label: `${bathrooms} bathroom${Number(bathrooms) > 1 ? "s" : ""}` } : null,
                nights > 1 ? { icon: "📅", label: `${nights} nights` } : null,
              ].filter(Boolean).map((f: any, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                  <p className="text-2xl mb-1">{f.icon}</p>
                  <p className="text-xs font-bold text-slate-700">{f.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-black text-slate-900 text-lg mb-3">About this property</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
              {checkin && checkout && (
                <div className="mt-4 flex gap-3 flex-wrap">
                  <div className="bg-slate-50 rounded-xl px-4 py-2.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in</p>
                    <p className="font-bold text-slate-800 text-sm">{checkin}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl px-4 py-2.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-out</p>
                    <p className="font-bold text-slate-800 text-sm">{checkout}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl px-4 py-2.5">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Duration</p>
                    <p className="font-bold text-blue-700 text-sm">{nights} night{nights > 1 ? "s" : ""}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-black text-slate-900 text-lg mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {displayAmenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-slate-700 text-sm">
                      <span className="text-lg">{getAmenityIcon(a)}</span>
                      <span className="font-medium">{a}</span>
                    </div>
                  ))}
                </div>
                {amenities.length > 8 && (
                  <button onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 transition">
                    {showAllAmenities ? "Show fewer amenities ↑" : `Show all ${amenities.length} amenities ↓`}
                  </button>
                )}
              </div>
            )}

            {/* Zeniva commitment */}
            <div className="bg-gradient-to-br from-[#0a1628] to-[#1a3d8f] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🔒</div>
                <div>
                  <h3 className="font-black text-base">Booked & protected by Zeniva</h3>
                  <p className="text-blue-200 text-xs">Your reservation is 100% managed by our team</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="font-black text-sm">✓ Verified</p><p className="text-blue-200 text-[10px]">Property</p></div>
                <div><p className="font-black text-sm">24/7</p><p className="text-blue-200 text-[10px]">Support</p></div>
                <div><p className="font-black text-sm">Secure</p><p className="text-blue-200 text-[10px]">Payment</p></div>
              </div>
            </div>
          </div>

          {/* RIGHT — Booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6">
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-slate-900">
                  {priceNum ? `USD ${priceNum.toLocaleString()}` : price}
                </span>
                <span className="text-slate-400 text-sm font-medium">/ night</span>
              </div>
              {rating && <p className="text-yellow-500 text-sm mb-4">★ {parseFloat(rating).toFixed(1)} {reviews ? `· ${reviews} reviews` : ""}</p>}

              {/* Dates summary */}
              {checkin && checkout && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 mb-4">
                  <div className="flex justify-between px-4 py-3">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in</p><p className="font-bold text-slate-800 text-sm">{checkin}</p></div>
                    <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-out</p><p className="font-bold text-slate-800 text-sm">{checkout}</p></div>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <p className="text-sm text-slate-600">Guests</p>
                    <p className="text-sm font-bold text-slate-800">{guests}</p>
                  </div>
                </div>
              )}

              {/* Price breakdown */}
              {priceNum > 0 && (
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>USD {priceNum.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
                    <span>USD {(priceNum * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cleaning fee</span>
                    <span>USD {cleaningFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Zeniva service fee</span>
                    <span>USD {serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900">
                    <span>Total</span>
                    <span>USD {total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Book button */}
              <button onClick={goToPayment}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black rounded-2xl py-4 text-base transition shadow-lg shadow-amber-500/30 mb-3">
                🏠 Reserve now
              </button>

              <button onClick={chatWithLina}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl py-3.5 text-sm transition mb-3">
                💬 Ask Lina about this property
              </button>

              <a href={`mailto:info@zeniva.ca?subject=${encodeURIComponent(`Booking Request — ${name}`)}`}
                className="block w-full text-center border-2 border-slate-200 text-slate-700 font-bold rounded-2xl py-3 text-sm hover:border-slate-300 hover:bg-slate-50 transition">
                📧 Request by email
              </a>

              <p className="text-center text-[10px] text-slate-400 mt-3">You won't be charged yet · Zeniva-protected booking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RentalDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <RentalDetailContent />
    </Suspense>
  );
}
