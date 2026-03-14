"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/lib/authStore";

const AUTH = "Bearer zeniva-secret-2025";

interface Listing {
  id: string;
  title: string;
  type: "hotel" | "villa" | "yacht" | string;
  location: string;
  price_per_night: number;
  currency: string;
  status: "active" | "pending" | "inactive";
  description?: string;
  max_guests?: number;
  created_at: string;
}

const TYPE_CFG: Record<string, { icon: string; color: string }> = {
  hotel: { icon: "🏨", color: "text-blue-600" },
  villa: { icon: "🏡", color: "text-emerald-600" },
  yacht: { icon: "⛵", color: "text-indigo-600" },
};

export default function ListingsPage() {
  const user = useAuthStore((s) => s.user);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "hotel" | "villa" | "yacht">("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", type: "hotel", location: "", price_per_night: "", currency: "USD", description: "", max_guests: "2" });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/agents-proxy?path=admin/listings");
      const d = await r.json();
      setListings(d?.listings || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { void fetchListings(); }, []);

  const shown = filter === "all" ? listings : listings.filter(l => l.type === filter);

  const createListing = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/agents-proxy?path=admin/listings", {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price_per_night: Number(form.price_per_night), max_guests: Number(form.max_guests) }),
      });
      if (r.ok) { setShowForm(false); void fetchListings(); }
    } catch {}
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-7xl px-5 py-8 space-y-6">

        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Inventory</p>
            <h1 className="text-3xl font-black text-slate-900">Listings</h1>
            <p className="text-sm text-slate-500 mt-0.5">{listings.length} properties · Hotels, Villas & Yachts</p>
          </div>
          <button onClick={() => setShowForm(true)} className="rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90" style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}>
            + Add Listing
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { type: "hotel", icon: "🏨", label: "Hotels" },
            { type: "villa", icon: "🏡", label: "Villas" },
            { type: "yacht", icon: "⛵", label: "Yachts" },
          ].map((t) => (
            <div key={t.type} className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm text-center">
              <p className="text-3xl">{t.icon}</p>
              <p className="text-xl font-black text-slate-900">{listings.filter(l => l.type === t.type).length}</p>
              <p className="text-xs text-slate-500">{t.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(["all","hotel","villa","yacht"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-colors ${filter === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
              {f === "all" ? "All Types" : `${TYPE_CFG[f]?.icon} ${f.charAt(0).toUpperCase() + f.slice(1)}s`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_,i) => <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 h-40 animate-pulse" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-4xl mb-3">🏨</p>
            <p className="text-slate-600 font-semibold">No listings yet</p>
            <p className="text-slate-400 text-sm mt-1">Add your first hotel, villa, or yacht</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((l) => {
              const tc = TYPE_CFG[l.type] || { icon: "🏢", color: "text-slate-600" };
              return (
                <div key={l.id} className="group rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{tc.icon}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${l.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {l.status}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 mb-1">{l.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">📍 {l.location}</p>
                  {l.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{l.description}</p>}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-lg font-black text-blue-600">${(l.price_per_night || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">per night · {l.max_guests || 2} guests max</p>
                    </div>
                    <span className={`text-xs font-bold capitalize ${tc.color}`}>{l.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Listing Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 space-y-4">
            <h2 className="text-xl font-black text-slate-900">New Listing</h2>
            <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Title *" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} />
            <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
              <option value="hotel">🏨 Hotel</option>
              <option value="villa">🏡 Villa</option>
              <option value="yacht">⛵ Yacht</option>
            </select>
            <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Location *" value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Price/night" value={form.price_per_night} onChange={e => setForm(p=>({...p,price_per_night:e.target.value}))} />
              <input type="number" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Max guests" value={form.max_guests} onChange={e => setForm(p=>({...p,max_guests:e.target.value}))} />
            </div>
            <textarea className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" rows={2} placeholder="Description" value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="rounded-full px-5 py-2 text-sm border border-slate-200 font-semibold text-slate-600">Cancel</button>
              <button onClick={createListing} disabled={saving || !form.title} className="rounded-full px-6 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}>
                {saving ? "Saving…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
