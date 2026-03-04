"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";

type ListingType = "hotel" | "villa" | "yacht";
type ListingStatus = "active" | "pending" | "inactive";

interface Listing {
  id: string;
  title: string;
  type: ListingType;
  location: string;
  price_per_night: number;
  currency: string;
  status: ListingStatus;
  image_url?: string;
  rating?: number;
  rooms?: number;
}

const DEMO_LISTINGS: Listing[] = [
  { id: "l1", title: "Hôtel Le Marais", type: "hotel", location: "Paris, France", price_per_night: 320, currency: "USD", status: "active", rating: 4.8, rooms: 42 },
  { id: "l2", title: "Villa Azura", type: "villa", location: "Santorini, Greece", price_per_night: 850, currency: "USD", status: "active", rating: 4.9, rooms: 5 },
  { id: "l3", title: "MY Ocean Spirit", type: "yacht", location: "Monaco", price_per_night: 4200, currency: "USD", status: "active", rating: 5.0 },
  { id: "l4", title: "Conrad Maldives Rangali", type: "hotel", location: "Maldives", price_per_night: 1100, currency: "USD", status: "active", rating: 4.9, rooms: 150 },
  { id: "l5", title: "Villa Tulum Estrella", type: "villa", location: "Tulum, Mexico", price_per_night: 620, currency: "USD", status: "pending", rating: 4.7, rooms: 4 },
  { id: "l6", title: "MY Serenity", type: "yacht", location: "Dubai Marina", price_per_night: 6500, currency: "USD", status: "pending" },
];

const TYPE_CFG: Record<ListingType, { label: string; icon: string; color: string }> = {
  hotel: { label: "Hotel",  icon: "🏨", color: "#0F6CF5" },
  villa: { label: "Villa",  icon: "🏡", color: "#10B981" },
  yacht: { label: "Yacht",  icon: "⛵", color: "#6366f1" },
};

const STATUS_CFG: Record<ListingStatus, { label: string; bg: string; text: string }> = {
  active:   { label: "Active",          bg: "bg-emerald-100", text: "text-emerald-700" },
  pending:  { label: "Pending Review",  bg: "bg-amber-100",   text: "text-amber-700" },
  inactive: { label: "Inactive",        bg: "bg-slate-100",   text: "text-slate-500" },
};

type Filter = "all" | ListingType;

function fmtMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export default function ListingsPage() {
  const user = useAuthStore((s) => s.user);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/agents-proxy?path=admin/listings");
        if (!res.ok) throw new Error();
        const json = await res.json();
        const arr: Listing[] = Array.isArray(json) ? json : json?.data ?? [];
        setListings(arr.length > 0 ? arr : DEMO_LISTINGS);
      } catch {
        setListings(DEMO_LISTINGS);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.email]);

  const filtered = filter === "all" ? listings : listings.filter((l) => l.type === filter);

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    pending: listings.filter((l) => l.status === "pending").length,
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "hotel", label: "🏨 Hotels" },
    { key: "villa", label: "🏡 Villas" },
    { key: "yacht", label: "⛵ Yachts" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">🏨 Listings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your properties and offerings</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm shadow-lg transition hover:opacity-90"
          style={{ background: BRAND_BLUE }}
        >
          + New Listing
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total",           value: stats.total,   icon: "🏨" },
          { label: "Active",          value: stats.active,  icon: "✅" },
          { label: "Pending Review",  value: stats.pending, icon: "⏳" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xl">{s.icon}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              filter === f.key ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400">Loading listings…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <p className="text-5xl mb-4">🏨</p>
          <p className="text-xl font-bold text-slate-700">No listings found</p>
          <p className="text-slate-400 mt-2 text-sm">Add your first listing to get started</p>
          <button className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ background: BRAND_BLUE }}>
            + New Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((l) => {
            const typeCfg = TYPE_CFG[l.type];
            const statusCfg = STATUS_CFG[l.status];
            return (
              <div key={l.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Image placeholder */}
                <div
                  className="h-40 flex items-center justify-center text-5xl"
                  style={{ background: `${typeCfg.color}18` }}
                >
                  {typeCfg.icon}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900">{l.title}</h3>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: typeCfg.color }}
                    >
                      {typeCfg.label}
                    </span>
                    <span className="text-xs text-slate-400">📍 {l.location}</span>
                  </div>

                  {l.rating && (
                    <p className="text-xs text-amber-500 font-semibold mt-1">★ {l.rating}/5</p>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <p className="font-black text-slate-900">
                      {fmtMoney(l.price_per_night, l.currency)}
                      <span className="text-xs font-normal text-slate-400">/night</span>
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                        ✏️ Edit
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90" style={{ background: BRAND_BLUE }}>
                        👁 View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
