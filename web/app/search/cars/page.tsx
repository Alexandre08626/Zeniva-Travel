"use client";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const CAR_CATEGORIES = [
  { key: "all", label: "🚗 All" },
  { key: "economy", label: "💚 Economy" },
  { key: "compact", label: "🚙 Compact" },
  { key: "suv", label: "🛻 SUV" },
  { key: "luxury", label: "💎 Luxury" },
  { key: "minivan", label: "🚐 Minivan" },
  { key: "electric", label: "⚡ Electric" },
];

const TRANS_ICONS: Record<string, string> = {
  automatic: "🔄 Auto",
  manual: "⚙️ Manual",
  "": "🚗",
};

type Car = {
  id: string;
  name: string;
  category: string;
  photo: string;
  photos: string[];
  supplier: string;
  supplier_logo: string;
  pickup: string;
  dropoff: string;
  pickup_date: string;
  dropoff_date: string;
  price: number;
  currency: string;
  price_per_day: number;
  days: number;
  specs: {
    transmission: string;
    fuel: string;
    seats: number;
    doors: number;
    air_conditioning: boolean;
    bags: number;
  };
  free_cancellation: boolean;
  rating: number | null;
  review_count: number | null;
};

type BookingStep = "search" | "select" | "form" | "confirm";

type PassengerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flightNumber: string;
  specialRequests: string;
};

const CAR_PHOTOS: Record<string, string> = {
  economy: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80",
  compact: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
  suv: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80",
  luxury: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
  minivan: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80",
  electric: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80",
  default: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
};

function getCarPhoto(car: Car): string {
  if (car.photo) return car.photo;
  const cat = (car.category || "").toLowerCase();
  for (const [key, url] of Object.entries(CAR_PHOTOS)) {
    if (cat.includes(key)) return url;
  }
  return CAR_PHOTOS.default;
}

function calcDays(d1: string, d2: string): number {
  try {
    return Math.max(1, Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000));
  } catch { return 1; }
}

function CarsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pickup, setPickup] = useState(searchParams.get("pickup") || "");
  const [dropoff, setDropoff] = useState(searchParams.get("dropoff") || "");
  const [pickupDate, setPickupDate] = useState(searchParams.get("pickupDate") || "");
  const [dropoffDate, setDropoffDate] = useState(searchParams.get("dropoffDate") || "");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffTime, setDropoffTime] = useState("10:00");
  const [driverAge, setDriverAge] = useState(searchParams.get("drivers") ? "30" : "30");
  const [category, setCategory] = useState("all");

  const [step, setStep] = useState<BookingStep>("search");
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [bookingRef, setBookingRef] = useState("");

  const [form, setForm] = useState<PassengerForm>({
    firstName: "", lastName: "", email: "", phone: "", flightNumber: "", specialRequests: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const buildRentalcarsUrl = useCallback((p: string) => {
    const base = "https://www.rentalcars.com/en/search/";
    const params = new URLSearchParams({
      pickUpLocation: p,
      dropOffSameAsPickUp: dropoff.trim() ? "false" : "true",
    });
    if (dropoff.trim()) params.set("dropOffLocation", dropoff.trim());
    if (pickupDate) {
      const [y, m, d] = pickupDate.split("-");
      params.set("pickUpDate", `${d}/${m}/${y}`);
    }
    if (dropoffDate) {
      const [y, m, d] = dropoffDate.split("-");
      params.set("dropOffDate", `${d}/${m}/${y}`);
    }
    params.set("pickUpTime", pickupTime);
    params.set("dropOffTime", dropoffTime);
    params.set("driverAge", driverAge);
    params.set("cor", "US");
    return `${base}?${params.toString()}`;
  }, [pickup, dropoff, pickupDate, dropoffDate, pickupTime, dropoffTime, driverAge]);

  const buildKayakUrl = useCallback((p: string) => {
    const city = encodeURIComponent(p.replace(/\s+/g, "-").toLowerCase());
    const pd = pickupDate || "2026-03-22";
    const dd = dropoffDate || "2026-03-29";
    return `https://www.kayak.com/cars/${city}/${pd}/${dd}?sort=price_a`;
  }, [pickupDate, dropoffDate]);

  const search = useCallback(async (overridePickup?: string) => {
    const p = (overridePickup || pickup).trim();
    if (!p || !pickupDate || !dropoffDate) return;
    setLoading(true);
    setError(null);
    setStep("search");
    setCars([]);
    // Open Rentalcars.com in new tab with real results
    window.open(buildRentalcarsUrl(p), "_blank");
    // Show the Lina booking panel after a short delay
    setTimeout(() => {
      setLoading(false);
      setStep("select");
    }, 500);
  }, [pickup, dropoff, pickupDate, dropoffDate, pickupTime, dropoffTime, driverAge, buildRentalcarsUrl]);

  // Auto-search from URL
  useEffect(() => {
    const p = searchParams.get("pickup");
    const pd = searchParams.get("pickupDate");
    const dd = searchParams.get("dropoffDate");
    if (p && pd && dd) {
      setPickup(p);
      if (dd) setDropoffDate(dd);
      if (pd) setPickupDate(pd);
      search(p);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCars = category === "all"
    ? cars
    : cars.filter(c => (c.category || "").toLowerCase().includes(category));

  const selectCar = (car: Car) => {
    setSelectedCar(car);
    setStep("form");
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) return;
    setSubmitting(true);
    const ref = `ZV-CAR-${Date.now().toString(36).toUpperCase()}`;
    try {
      const days = calcDays(selectedCar.pickup_date, selectedCar.dropoff_date);
      await fetch("/api/cruises/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref,
          type: "car_rental",
          car: selectedCar.name,
          supplier: selectedCar.supplier,
          pickup: selectedCar.pickup,
          dropoff: selectedCar.dropoff,
          pickup_date: selectedCar.pickup_date,
          dropoff_date: selectedCar.dropoff_date,
          total_price: selectedCar.price,
          currency: selectedCar.currency,
          days,
          ...form,
          trip_type: "ZeniCar",
          notes: `Car: ${selectedCar.name} | ${selectedCar.supplier} | ${selectedCar.pickup} → ${selectedCar.dropoff} | ${selectedCar.pickup_date} → ${selectedCar.dropoff_date} | ${days} days | $${selectedCar.price} ${selectedCar.currency}${form.flightNumber ? ` | Flight: ${form.flightNumber}` : ""}${form.specialRequests ? ` | Notes: ${form.specialRequests}` : ""}`,
        }),
      });
    } catch {}
    setBookingRef(ref);
    setStep("confirm");
    setSubmitting(false);
  };

  const days = pickupDate && dropoffDate ? calcDays(pickupDate, dropoffDate) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Dark navy header */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2a5e] to-[#1a3d8f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-blue-200 text-sm mb-6 hover:text-white transition">
            ← Back
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🚗</span>
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Zeniva Travel</p>
              <h1 className="text-3xl sm:text-4xl font-black">ZeniCar</h1>
            </div>
          </div>
          <p className="text-blue-200 mb-8">Location de voiture partout dans le monde — réservez avec Lina</p>

          {/* Search form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Pickup City / Airport</label>
                <input value={pickup} onChange={e => setPickup(e.target.value)}
                  placeholder="Miami, Paris, Toronto, Dubai…"
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onKeyDown={e => e.key === "Enter" && search()} />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Dropoff (optional)</label>
                <input value={dropoff} onChange={e => setDropoff(e.target.value)}
                  placeholder="Same as pickup"
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Pick-up Date</label>
                <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Return Date</label>
                <input type="date" value={dropoffDate} onChange={e => setDropoffDate(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Pick-up Time</label>
                <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                  className="rounded-xl bg-white px-3 py-2 text-slate-800 text-sm focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Return Time</label>
                <input type="time" value={dropoffTime} onChange={e => setDropoffTime(e.target.value)}
                  className="rounded-xl bg-white px-3 py-2 text-slate-800 text-sm focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Driver Age</label>
                <input type="number" min={18} max={99} value={driverAge} onChange={e => setDriverAge(e.target.value)}
                  className="w-16 rounded-xl bg-white px-3 py-2 text-slate-800 text-sm focus:outline-none" />
              </div>
              <button onClick={() => search()} disabled={loading || !pickup.trim() || !pickupDate || !dropoffDate}
                className="ml-auto bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black rounded-xl px-8 py-2.5 text-sm hover:opacity-90 transition disabled:opacity-50">
                {loading ? "Searching…" : "🔍 Search Cars"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* STEP: Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-semibold">Searching best rates in {pickup}…</p>
          </div>
        )}

        {/* STEP: Error / no results */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Searching the best rates for you</h3>
            <p className="text-slate-500 mb-6 text-sm">{error}</p>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <p className="text-blue-800 font-semibold mb-2">💬 Lina can find you the best deal</p>
              <p className="text-blue-600 text-sm mb-4">Our AI travel agent has access to 500+ car rental suppliers. She'll find the best rate and confirm your booking in minutes.</p>
              <Link href={`/chat?prompt=${encodeURIComponent(`I need a rental car in ${pickup || "my destination"} from ${pickupDate || "my dates"} to ${dropoffDate || "return"} for ${driverAge} year old driver. Can you find me the best deal?`)}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl px-6 py-3 hover:opacity-90 transition shadow">
                💬 Ask Lina for the best rate
              </Link>
            </div>
          </div>
        )}

        {/* STEP: Partner results + Lina booking */}
        {!loading && step === "select" && (
          <div className="max-w-4xl mx-auto">
            {/* Partner search banner */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-white font-black">Results opened in a new tab!</p>
                  <p className="text-emerald-100 text-xs">Real cars, real prices, real booking — powered by Rentalcars.com</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 text-sm mb-4">We searched <strong className="capitalize">{pickup}</strong> for your dates. Your results should be open in a new tab with 500+ cars from Hertz, Avis, Enterprise, Budget & more.</p>
                <div className="flex flex-wrap gap-3">
                  <a href={buildRentalcarsUrl(pickup)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl px-6 py-3 text-sm hover:opacity-90 transition shadow">
                    🚗 Open Rentalcars.com
                  </a>
                  <a href={buildKayakUrl(pickup)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-xl px-6 py-3 text-sm hover:opacity-90 transition shadow">
                    🔍 Compare on Kayak
                  </a>
                </div>
              </div>
            </div>

            {/* OR book through Lina */}
            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-[#f8fafc] px-3">OR book through Zeniva</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl flex-shrink-0">🤖</div>
                <div>
                  <p className="font-black text-slate-900">Book through Lina — Zeniva's AI agent</p>
                  <p className="text-slate-500 text-sm mt-0.5">We handle everything: best rates, insurance, pickup confirmation. No hidden fees.</p>
                </div>
              </div>

              {/* Quick category selector */}
              <div className="flex flex-wrap gap-2 mb-5">
                {CAR_CATEGORIES.filter(c => c.key !== "all").map(cat => (
                  <button key={cat.key} onClick={() => { setCategory(cat.key); setStep("form"); }}
                    className="flex flex-col items-center gap-1 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl px-4 py-3 transition">
                    <span className="text-xl">{cat.label.split(" ")[0]}</span>
                    <span className="text-xs font-bold text-slate-600">{cat.label.split(" ").slice(1).join(" ")}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStep("form")}
                  className="bg-gradient-to-r from-[#0a1628] to-[#1a3d8f] text-white font-black rounded-xl py-3.5 text-sm hover:opacity-90 transition shadow">
                  🚗 Request through Zeniva
                </button>
                <Link href={`/chat?prompt=${encodeURIComponent(`I need a rental car in ${pickup} from ${pickupDate} to ${dropoffDate} for ${days} days. Driver age: ${driverAge}. Can you find me the best deal?`)}`}
                  className="border-2 border-[#0a1628] text-[#0a1628] font-black rounded-xl py-3.5 text-sm text-center hover:bg-blue-50 transition">
                  💬 Chat with Lina
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Passenger form */}
        {step === "form" && selectedCar && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep("select")} className="text-blue-600 text-sm hover:underline mb-6 flex items-center gap-1">
              ← Back to results
            </button>

            {/* Selected car summary */}
            <div className="bg-white rounded-2xl overflow-hidden shadow border border-slate-100 mb-6">
              <div className="relative h-40">
                <img src={getCarPhoto(selectedCar)} alt={selectedCar.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-black text-xl">{selectedCar.name}</p>
                  <p className="text-white/80 text-sm">{selectedCar.supplier}</p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Pick-up</p><p className="font-bold text-slate-800 capitalize">{selectedCar.pickup}</p><p className="text-slate-500">{selectedCar.pickup_date} at {pickupTime}</p></div>
                <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Return</p><p className="font-bold text-slate-800 capitalize">{selectedCar.dropoff}</p><p className="text-slate-500">{selectedCar.dropoff_date} at {dropoffTime}</p></div>
                <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Duration</p><p className="font-bold text-slate-800">{selectedCar.days} day{selectedCar.days > 1 ? "s" : ""}</p></div>
                <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total</p><p className="font-black text-blue-700 text-lg">${selectedCar.price.toFixed(0)} {selectedCar.currency}</p></div>
              </div>
            </div>

            <form onSubmit={submitBooking} className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-4">
              <h2 className="text-xl font-black text-slate-900">Driver Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">First Name *</label>
                  <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Last Name *</label>
                  <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Phone *</label>
                <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Flight Number (optional)</label>
                <input value={form.flightNumber} onChange={e => setForm(f => ({ ...f, flightNumber: e.target.value }))}
                  placeholder="e.g. AA1234"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Special Requests</label>
                <textarea rows={3} value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                  placeholder="Car seat, GPS, specific supplier preference…"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-bold mb-1">🔒 No payment now</p>
                <p>Lina will contact you within 2 hours to confirm pricing, insurance options, and process payment.</p>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-gradient-to-r from-[#0a1628] to-[#1a3d8f] text-white font-black rounded-xl py-4 text-sm hover:opacity-90 transition shadow disabled:opacity-50">
                {submitting ? "Processing…" : "✅ Confirm Reservation Request"}
              </button>
            </form>
          </div>
        )}

        {/* STEP: Confirmation */}
        {step === "confirm" && selectedCar && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0a1628] to-[#1a3d8f] p-8 text-white">
                <div className="text-5xl mb-4">🚗</div>
                <h2 className="text-2xl font-black mb-2">Reservation Confirmed!</h2>
                <p className="text-blue-200 text-sm mb-4">Lina will contact you within 2 hours to finalize your booking.</p>
                <div className="bg-white/10 rounded-xl px-6 py-3 inline-block">
                  <p className="text-xs text-blue-200 font-bold uppercase tracking-widest">Reservation Reference</p>
                  <p className="text-2xl font-black font-mono">{bookingRef}</p>
                </div>
              </div>

              <div className="p-6 space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Vehicle</p><p className="font-black text-slate-800">{selectedCar.name}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Supplier</p><p className="font-bold text-slate-700">{selectedCar.supplier || "TBC"}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Pick-up</p><p className="font-bold text-slate-800 capitalize">{selectedCar.pickup}</p><p className="text-slate-500 text-xs">{selectedCar.pickup_date}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Return</p><p className="font-bold text-slate-800 capitalize">{selectedCar.dropoff}</p><p className="text-slate-500 text-xs">{selectedCar.dropoff_date}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Driver</p><p className="font-bold text-slate-800">{form.firstName} {form.lastName}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total</p><p className="font-black text-blue-700 text-xl">${selectedCar.price.toFixed(0)} {selectedCar.currency}</p></div>
                </div>

                <div className="flex gap-3">
                  <Link href="/chat" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl py-3 text-sm text-center hover:opacity-90 transition">
                    💬 Chat with Lina
                  </Link>
                  <Link href="/" className="flex-1 border-2 border-slate-200 text-slate-700 font-black rounded-xl py-3 text-sm text-center hover:bg-slate-50 transition">
                    🏠 Back to home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Default state — no search yet */}
        {!loading && !error && step === "search" && cars.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🚗</div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">ZeniCar — Best rates worldwide</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Enter your pickup city and dates above to search 500+ car rental suppliers. Economy to luxury, fully insured.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {["🌴 Miami", "🗼 Paris", "🌆 Dubai", "🍁 Toronto"].map(city => (
                <button key={city} onClick={() => { setPickup(city.split(" ")[1]); }}
                  className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition">
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarsSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1628]" />}>
      <CarsContent />
    </Suspense>
  );
}
