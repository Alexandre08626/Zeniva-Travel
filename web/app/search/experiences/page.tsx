"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  { key: "all", label: "🌟 All" },
  { key: "adventure", label: "🧗 Adventure" },
  { key: "tours", label: "🗺️ Tours" },
  { key: "food", label: "🍽️ Food & Wine" },
  { key: "water", label: "🤿 Water Sports" },
  { key: "culture", label: "🏛️ Culture" },
  { key: "nightlife", label: "🌙 Nightlife" },
  { key: "wellness", label: "🧘 Wellness" },
];

const EXP_PHOTOS: Record<string, string> = {
  adventure: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  tours: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
  food: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  water: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  culture: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80",
  nightlife: "https://images.unsplash.com/photo-1429514513361-8fa32282fd5f?w=600&q=80",
  wellness: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  transfers: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
  default: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",
};

type Experience = {
  id: string;
  title: string;
  city: string;
  country: string;
  category: string;
  photo: string;
  priceFrom: string;
  duration: string;
  groupSize: string;
  highlights: string[];
  badge?: string;
  productSlug: string;
  rating: number;
};

function getCategory(taxonomySlug: string, title: string): string {
  if (taxonomySlug === "transfers-services") return "transfers";
  const t = title.toLowerCase();
  if (t.includes("food") || t.includes("wine") || t.includes("dinner") || t.includes("lunch") || t.includes("cook")) return "food";
  if (t.includes("dive") || t.includes("snorkel") || t.includes("surf") || t.includes("swim") || t.includes("boat") || t.includes("sail")) return "water";
  if (t.includes("museum") || t.includes("tour") || t.includes("historic") || t.includes("culture")) return "culture";
  if (t.includes("spa") || t.includes("yoga") || t.includes("wellness")) return "wellness";
  if (t.includes("night") || t.includes("bar") || t.includes("party")) return "nightlife";
  if (t.includes("hike") || t.includes("climb") || t.includes("zip") || t.includes("extreme")) return "adventure";
  return "tours";
}

function getExpPrice(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("private")) return "from $89";
  if (t.includes("luxury") || t.includes("vip")) return "from $145";
  if (t.includes("cruise") || t.includes("yacht")) return "from $120";
  if (t.includes("helicopter") || t.includes("heli")) return "from $290";
  if (t.includes("dinner")) return "from $95";
  return "from $45";
}

function getBadge(title: string, i: number): string | undefined {
  const t = title.toLowerCase();
  if (t.includes("private")) return "Private";
  if (t.includes("luxury")) return "Luxury";
  if (i === 0) return "⭐ Top pick";
  if (i === 1) return "🔥 Popular";
  if (t.includes("night")) return "🌙 Evening";
  return undefined;
}

function getHighlights(title: string, cat: string): string[] {
  const base = ["Booking confirmation", "Local guide"];
  if (cat === "food") return ["All tastings included", "Chef guide", ...base];
  if (cat === "water") return ["All equipment", "Safety briefing", ...base];
  if (cat === "culture") return ["Skip the line", "Expert guide", ...base];
  if (cat === "adventure") return ["Safety gear", "Insurance", ...base];
  if (cat === "wellness") return ["Personalized session", "All materials", ...base];
  return ["Small groups", "Flexible cancellation", ...base];
}

type Step = "search" | "results" | "form" | "confirm";
type Form = { firstName: string; lastName: string; email: string; phone: string; date: string; notes: string; };

function ExperiencesContent() {
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [travelers, setTravelers] = useState(parseInt(searchParams.get("travelers") || "2"));
  const [category, setCategory] = useState(searchParams.get("category")?.toLowerCase() || "all");

  const [step, setStep] = useState<Step>("search");
  const [results, setResults] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [bookingRef, setBookingRef] = useState("");
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState<Form>({ firstName: "", lastName: "", email: "", phone: "", date: date || "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const search = async (overrideDest?: string) => {
    const dest = (overrideDest || destination).trim();
    if (!dest) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/experiences/search?destination=${encodeURIComponent(dest)}&travelers=${travelers}`);
      const data = await res.json();
      if (data.experiences?.length > 0) {
        setResults(data.experiences);
        setStep("results");
      } else {
        setError("No experiences found. Try another destination or let Lina curate something special.");
      }
    } catch {
      setError("Search failed. Chat with Lina for personalized recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const d = searchParams.get("destination");
    if (d) search(d);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = category === "all" ? results.filter(e => e.category !== "transfers") : results.filter(e => e.category === category);

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    const ref = `ZV-XP-${Date.now().toString(36).toUpperCase()}`;
    try {
      const { notes: formNotes, ...formRest } = form;
      await fetch("/api/cruises/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref, type: "experience", service: selected.title, destination,
          travelers, trip_type: "ZeniXP",
          notes: `Experience: ${selected.title} | ${destination} | ${form.date || date} | ${travelers} pax${formNotes ? ` | Notes: ${formNotes}` : ""}`,
          ...formRest,
        }),
      });
    } catch {}
    setBookingRef(ref);
    setStep("confirm");
    setSubmitting(false);
  };

  const payNow = async () => {
    if (!selected || !bookingRef) return;
    setPaying(true);
    try {
      const price = parseFloat(String(selected.priceFrom).replace(/[^0-9.]/g, "")) || 99;
      const res = await fetch("/api/zenipay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          description: `ZeniXP — ${selected.title}`,
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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2a5e] to-[#1a3d8f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-blue-200 text-sm mb-6 hover:text-white transition">← Back</Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Zeniva Travel</p>
              <h1 className="text-3xl sm:text-4xl font-black">ZeniXP</h1>
            </div>
          </div>
          <p className="text-blue-200 mb-8">Curated experiences, tours & adventures — worldwide</p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Destination</label>
                <input value={destination} onChange={e => setDestination(e.target.value)}
                  placeholder="Miami, Paris, Tokyo, Bali…"
                  onKeyDown={e => e.key === "Enter" && search()}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Travelers</label>
                <input type="number" min={1} max={50} value={travelers} onChange={e => setTravelers(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none" />
              </div>
              <div className="flex items-end">
                <button onClick={() => search()} disabled={loading || !destination.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black rounded-xl px-4 py-2.5 text-sm hover:opacity-90 transition disabled:opacity-50">
                  {loading ? "Searching…" : "🔍 Search"}
                </button>
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)}
                className={`text-xs font-bold px-4 py-1.5 rounded-full transition border ${category === cat.key ? "bg-white text-blue-700 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-semibold">Discovering experiences in {destination}…</p>
          </div>
        )}

        {!loading && error && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Let Lina curate your perfect experience</h3>
            <p className="text-slate-500 mb-6 text-sm">{error}</p>
            <Link href={`/chat?prompt=${encodeURIComponent(`I'm looking for experiences in ${destination || "my destination"} for ${travelers} traveler${travelers > 1 ? "s" : ""}${date ? ` on ${date}` : ""}. Category: ${category !== "all" ? category : "any"}. What do you recommend?`)}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl px-6 py-3 hover:opacity-90 transition shadow">
              💬 Ask Lina for recommendations
            </Link>
          </div>
        )}

        {/* Results */}
        {!loading && !error && step === "results" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800">{filtered.length} experience{filtered.length > 1 ? "s" : ""} in <span className="capitalize">{destination}</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(exp => (
                <div key={exp.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img src={exp.photo} alt={exp.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    {exp.badge && <span className="absolute top-3 left-3 bg-white/90 text-slate-800 text-[10px] font-black rounded-full px-3 py-1">{exp.badge}</span>}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-black rounded-full px-2.5 py-1">
                      ★ {exp.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest capitalize mb-1">{exp.category}</p>
                    <p className="font-black text-slate-900 leading-snug text-sm mb-1 line-clamp-2">{exp.title}</p>
                    <p className="text-xs text-slate-400 mb-3">{exp.city}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {exp.highlights.slice(0, 3).map((h, i) => (
                        <span key={i} className="text-[10px] bg-blue-50 text-blue-700 rounded-full px-2.5 py-1 font-semibold">{h}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xl font-black text-slate-900">{exp.priceFrom}<span className="text-xs font-medium text-slate-400"> / person</span></p>
                      {exp.duration && <span className="text-xs text-slate-400">⏱ {exp.duration}</span>}
                    </div>
                    <button onClick={() => { setSelected(exp); setStep("form"); }}
                      className="w-full bg-gradient-to-r from-[#0a1628] to-[#1a3d8f] text-white font-black rounded-xl py-3 text-sm hover:opacity-90 transition shadow">
                      🎯 Book this Experience
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
                  <p className="text-white/70 text-xs">{destination} · {travelers} traveler{travelers > 1 ? "s" : ""} · {selected.priceFrom}/person</p>
                </div>
              </div>
            </div>
            <form onSubmit={submitBooking} className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-4">
              <h2 className="text-xl font-black text-slate-900">Booking Details</h2>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Preferred Date *</label>
                <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Special Requests</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Dietary restrictions, accessibility needs, surprises…" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-bold">🔒 No payment now — Lina confirms within 2 hours</p>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#0a1628] to-[#1a3d8f] text-white font-black rounded-xl py-4 text-sm hover:opacity-90 transition shadow disabled:opacity-50">
                {submitting ? "Processing…" : "✅ Confirm Experience Request"}
              </button>
            </form>
          </div>
        )}

        {/* Confirmation */}
        {step === "confirm" && selected && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0a1628] to-[#1a3d8f] p-8 text-white">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-2xl font-black mb-2">Experience Booked!</h2>
                <p className="text-blue-200 text-sm mb-4">Lina will confirm your experience within 2 hours.</p>
                <div className="bg-white/10 rounded-xl px-6 py-3 inline-block">
                  <p className="text-xs text-blue-200 font-bold uppercase tracking-widest">Reference</p>
                  <p className="text-2xl font-black font-mono">{bookingRef}</p>
                </div>
              </div>
              <div className="p-6 text-left space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Experience</p><p className="font-black text-slate-800 text-xs leading-tight">{selected.title}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Location</p><p className="font-bold text-slate-800">{destination}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Date</p><p className="font-bold text-slate-800">{form.date}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Travelers</p><p className="font-bold text-slate-800">{travelers}</p></div>
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
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Experiences worth living</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">From helicopter tours to cooking classes, Zeniva curates only the best. Search a destination to explore.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {["🏝 Bali", "🗼 Paris", "🌴 Miami", "🏛️ Rome"].map(dest => (
                <button key={dest} onClick={() => { setDestination(dest.split(" ")[1]); }}
                  className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition">{dest}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExperiencesSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1628]" />}>
      <ExperiencesContent />
    </Suspense>
  );
}
