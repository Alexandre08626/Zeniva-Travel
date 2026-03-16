"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const TRANSFER_TYPES = [
  { key: "all", label: "🚐 All" },
  { key: "private", label: "🚗 Private" },
  { key: "shared", label: "🚌 Shared" },
  { key: "luxury", label: "💎 Luxury" },
  { key: "airport", label: "✈️ Airport" },
  { key: "port", label: "🚢 Port/Cruise" },
  { key: "hotel", label: "🏨 Hotel" },
];

const VEHICLE_PHOTOS: Record<string, string> = {
  private: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
  luxury: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
  shared: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
  airport: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
  port: "https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=600&q=80",
  minivan: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80",
  default: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
};

type Transfer = {
  id: string;
  title: string;
  city: string;
  country: string;
  type: string;
  photo: string;
  priceFrom: string;
  capacity: string;
  duration: string;
  freeCancellation: boolean;
  highlights: string[];
  productSlug: string;
};

function getTransferType(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("luxury") || t.includes("vip") || t.includes("limo")) return "luxury";
  if (t.includes("private")) return "private";
  if (t.includes("shared") || t.includes("shuttle") || t.includes("bus")) return "shared";
  if (t.includes("airport")) return "airport";
  if (t.includes("port") || t.includes("cruise")) return "port";
  return "private";
}

function getTransferPhoto(type: string): string {
  return VEHICLE_PHOTOS[type] || VEHICLE_PHOTOS.default;
}

function getTransferPrice(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("luxury") || t.includes("vip")) return "from $65";
  if (t.includes("private")) return "from $35";
  if (t.includes("shared") || t.includes("shuttle")) return "from $18";
  if (t.includes("bus")) return "from $12";
  return "from $35";
}

function getHighlights(title: string, type: string): string[] {
  const base = ["Meet & greet", "Flight monitoring"];
  if (type === "luxury") return ["Professional chauffeur", "Luxury vehicle", "Complimentary water", ...base];
  if (type === "shared") return ["Cost-effective", "Fixed schedule", ...base];
  if (type === "port") return ["Cruise terminal pickup", "Luggage assistance", ...base];
  return ["Door-to-door", "24/7 support", ...base];
}

type Step = "search" | "results" | "form" | "confirm";
type Form = { firstName: string; lastName: string; email: string; phone: string; flightNumber: string; notes: string; };

function TransfersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pickup, setPickup] = useState(searchParams.get("pickup") || "");
  const [dropoff, setDropoff] = useState(searchParams.get("dropoff") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [time, setTime] = useState("10:00");
  const [passengers, setPassengers] = useState(parseInt(searchParams.get("passengers") || "2"));
  const [filterType, setFilterType] = useState("all");

  const [step, setStep] = useState<Step>("search");
  const [results, setResults] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Transfer | null>(null);
  const [bookingRef, setBookingRef] = useState("");
  const [form, setForm] = useState<Form>({ firstName: "", lastName: "", email: "", phone: "", flightNumber: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const payNow = async () => {
    if (!selected || !bookingRef) return;
    setPaying(true);
    try {
      const price = parseFloat(String(selected.priceFrom).replace(/[^0-9.]/g, "")) || 49;
      const res = await fetch("/api/zenipay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          description: `ZeniTransfers — ${selected.title} | ${pickup} → ${dropoff}`,
          referenceId: bookingRef,
        }),
      });
      const data = await res.json();
      if (data.url) {
        setPayUrl(data.url);
        window.open(data.url, "_blank");
      }
    } catch {}
    setPaying(false);
  };

  const search = async (overridePickup?: string) => {
    const city = (overridePickup || pickup).trim();
    if (!city) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/transfers/search?city=${encodeURIComponent(city)}&passengers=${passengers}`);
      const data = await res.json();
      if (data.transfers?.length > 0) {
        setResults(data.transfers);
        setStep("results");
      } else {
        setError("No transfers found for this location. Lina can arrange a custom transfer for you.");
      }
    } catch {
      setError("Search failed. Try again or chat with Lina.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const p = searchParams.get("pickup");
    if (p) search(p);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = filterType === "all" ? results : results.filter(t => t.type === filterType);

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    const ref = `ZV-TRF-${Date.now().toString(36).toUpperCase()}`;
    try {
      await fetch("/api/cruises/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref, type: "transfer", service: selected.title, pickup, dropoff, date,
          passengers, trip_type: "ZeniTransfers",
          ...(() => { const { notes: _n, ...rest } = form; return rest; })(),
          notes: `Transfer: ${selected.title} | ${pickup} → ${dropoff} | ${date} at ${time} | ${passengers} pax${form.flightNumber ? ` | Flight: ${form.flightNumber}` : ""}${form.notes ? ` | Notes: ${form.notes}` : ""}`,
        }),
      });
    } catch {}
    setBookingRef(ref);
    setStep("confirm");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2a5e] to-[#1a3d8f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-blue-200 text-sm mb-6 hover:text-white transition">← Back</Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🚐</span>
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Zeniva Travel</p>
              <h1 className="text-3xl sm:text-4xl font-black">ZeniTransfers</h1>
            </div>
          </div>
          <p className="text-blue-200 mb-8">Private transfers, airport pickups & luxury transportation — worldwide</p>

          {/* Search */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">From</label>
                <input value={pickup} onChange={e => setPickup(e.target.value)}
                  placeholder="Miami Airport, Hotel, Address…"
                  onKeyDown={e => e.key === "Enter" && search()}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">To</label>
                <input value={dropoff} onChange={e => setDropoff(e.target.value)}
                  placeholder="Destination, Hotel, Port…"
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="rounded-xl bg-white px-3 py-2 text-slate-800 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Passengers</label>
                <input type="number" min={1} max={50} value={passengers} onChange={e => setPassengers(parseInt(e.target.value) || 1)}
                  className="w-16 rounded-xl bg-white px-3 py-2 text-slate-800 text-sm" />
              </div>
              <button onClick={() => search()} disabled={loading || !pickup.trim()}
                className="ml-auto bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black rounded-xl px-8 py-2.5 text-sm hover:opacity-90 transition disabled:opacity-50">
                {loading ? "Searching…" : "🔍 Search Transfers"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-semibold">Finding transfers in {pickup}…</p>
          </div>
        )}

        {!loading && error && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-5xl mb-4">🚐</div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Let Lina arrange your transfer</h3>
            <p className="text-slate-500 mb-6 text-sm">{error}</p>
            <Link href={`/chat?prompt=${encodeURIComponent(`I need a transfer from ${pickup || "pickup"} to ${dropoff || "destination"} on ${date || "my date"} for ${passengers} passengers. Can you arrange this?`)}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl px-6 py-3 hover:opacity-90 transition shadow">
              💬 Ask Lina to arrange it
            </Link>
          </div>
        )}

        {/* Results */}
        {!loading && !error && step === "results" && results.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {TRANSFER_TYPES.map(t => (
                <button key={t.key} onClick={() => setFilterType(t.key)}
                  className={`text-xs font-bold px-4 py-2 rounded-full border transition ${filterType === t.key ? "bg-[#0f2a5e] text-white border-[#0f2a5e]" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-slate-800">{filtered.length} transfer{filtered.length > 1 ? "s" : ""} available</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(transfer => (
                <div key={transfer.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img src={transfer.photo} alt={transfer.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    {transfer.freeCancellation && <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black rounded-full px-3 py-1">✓ Free cancel</span>}
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold rounded-full px-2.5 py-1 capitalize">{transfer.type}</span>
                  </div>
                  <div className="p-4">
                    <p className="font-black text-slate-900 leading-snug text-sm mb-2 line-clamp-2">{transfer.title}</p>
                    <p className="text-xs text-slate-400 mb-3">{transfer.city}, {transfer.country}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {transfer.highlights.slice(0, 3).map((h, i) => (
                        <span key={i} className="text-[10px] bg-blue-50 text-blue-700 rounded-full px-2.5 py-1 font-semibold">{h}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xl font-black text-slate-900">{transfer.priceFrom}</p>
                      <span className="text-xs text-slate-400">per vehicle</span>
                    </div>
                    <button onClick={() => { setSelected(transfer); setStep("form"); }}
                      className="w-full bg-gradient-to-r from-[#0a1628] to-[#1a3d8f] text-white font-black rounded-xl py-3 text-sm hover:opacity-90 transition shadow">
                      🚐 Book this Transfer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Booking form */}
        {step === "form" && selected && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep("results")} className="text-blue-600 text-sm hover:underline mb-6">← Back to results</button>
            <div className="bg-white rounded-2xl overflow-hidden shadow border border-slate-100 mb-6">
              <div className="relative h-36">
                <img src={selected.photo} alt={selected.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-black">{selected.title}</p>
                  <p className="text-white/70 text-xs">{pickup} → {dropoff} · {date} at {time} · {passengers} pax</p>
                </div>
              </div>
            </div>
            <form onSubmit={submitBooking} className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-4">
              <h2 className="text-xl font-black text-slate-900">Passenger Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">First Name *</label>
                  <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Last Name *</label>
                  <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Phone *</label>
                  <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Flight/Cruise Number (optional)</label>
                <input value={form.flightNumber} onChange={e => setForm(f => ({ ...f, flightNumber: e.target.value }))} placeholder="AA1234 / MSC Seashore" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Child seat, meet & greet sign, extra luggage…" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-bold">🔒 No payment now — Lina confirms within 2 hours</p>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#0a1628] to-[#1a3d8f] text-white font-black rounded-xl py-4 text-sm hover:opacity-90 transition shadow disabled:opacity-50">
                {submitting ? "Processing…" : "✅ Confirm Transfer Request"}
              </button>
            </form>
          </div>
        )}

        {/* Confirmation */}
        {step === "confirm" && selected && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0a1628] to-[#1a3d8f] p-8 text-white">
                <div className="text-5xl mb-4">🚐</div>
                <h2 className="text-2xl font-black mb-2">Transfer Booked!</h2>
                <p className="text-blue-200 text-sm mb-4">Lina will confirm details within 2 hours.</p>
                <div className="bg-white/10 rounded-xl px-6 py-3 inline-block">
                  <p className="text-xs text-blue-200 font-bold uppercase tracking-widest">Reference</p>
                  <p className="text-2xl font-black font-mono">{bookingRef}</p>
                </div>
              </div>
              <div className="p-6 text-left space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Service</p><p className="font-black text-slate-800 text-xs leading-tight">{selected.title}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Route</p><p className="font-bold text-slate-800">{pickup} → {dropoff}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Date & Time</p><p className="font-bold text-slate-800">{date} at {time}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Passengers</p><p className="font-bold text-slate-800">{passengers}</p></div>
                </div>
                <div className="space-y-3 pt-2">
                  <button onClick={payNow} disabled={paying} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black rounded-xl py-4 text-sm hover:opacity-90 transition shadow disabled:opacity-50">
                    {paying ? "Opening payment…" : "💳 Pay Now — Secure Online Payment"}
                  </button>
                  {payUrl && <p className="text-xs text-center text-emerald-600 font-bold">✅ Payment page opened in new tab</p>}
                  <div className="flex gap-3">
                    <Link href="/chat" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl py-3 text-sm text-center hover:opacity-90 transition">💬 Chat with Lina</Link>
                    <Link href="/" className="flex-1 border-2 border-slate-200 text-slate-700 font-black rounded-xl py-3 text-sm text-center hover:bg-slate-50 transition">🏠 Home</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Default state */}
        {!loading && !error && step === "search" && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🚐</div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">ZeniTransfers — Door to door, worldwide</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Airport pickups, hotel transfers, cruise port shuttles. Private or shared — always on time.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {["✈️ Airport", "🚢 Cruise Port", "🏨 Hotel", "🏙️ City"].map(loc => (
                <button key={loc} onClick={() => setPickup(loc.split(" ")[1])}
                  className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition">{loc}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransfersSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1628]" />}>
      <TransfersContent />
    </Suspense>
  );
}
