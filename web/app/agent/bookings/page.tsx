"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";

type BookingStatus = "confirmed" | "pending_payment" | "upcoming" | "past" | "cancelled";

interface Booking {
  id: string;
  client_name: string;
  client_email?: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  travelers: number;
  total_price: number;
  currency: string;
  status: BookingStatus;
  airline?: string;
  hotel?: string;
  reference?: string;
  created_at: string;
}

const DEMO_BOOKINGS: Booking[] = [
  { id: "BK-001", client_name: "Sarah & James Mitchell", client_email: "sarah@example.com", destination: "Paris, France", departure_date: "2025-04-15", return_date: "2025-04-22", travelers: 2, total_price: 4800, currency: "USD", status: "confirmed", airline: "Air France", hotel: "Hôtel Le Marais", reference: "AF-20250415-SJM", created_at: "2025-03-01" },
  { id: "BK-002", client_name: "Carlos Ramirez", client_email: "carlos@example.com", destination: "Cancún, Mexico", departure_date: "2025-05-10", return_date: "2025-05-17", travelers: 4, total_price: 6200, currency: "USD", status: "pending_payment", airline: "AeroMéxico", hotel: "Grand Hyatt Cancún", reference: "AM-20250510-CR", created_at: "2025-03-05" },
  { id: "BK-003", client_name: "Emma Thompson", destination: "Maldives", departure_date: "2025-06-01", return_date: "2025-06-08", travelers: 2, total_price: 9500, currency: "USD", status: "upcoming", airline: "Emirates", hotel: "Conrad Maldives", created_at: "2025-03-10" },
  { id: "BK-004", client_name: "Liu Wei & Family", destination: "Tokyo, Japan", departure_date: "2025-01-20", return_date: "2025-01-30", travelers: 5, total_price: 12400, currency: "USD", status: "past", airline: "ANA", hotel: "Park Hyatt Tokyo", created_at: "2024-12-15" },
  { id: "BK-005", client_name: "Alexandra Dupont", destination: "Santorini, Greece", departure_date: "2025-07-05", return_date: "2025-07-12", travelers: 2, total_price: 7300, currency: "USD", status: "confirmed", airline: "Aegean Airlines", hotel: "Canaves Oia", created_at: "2025-03-12" },
];

const STATUS_CFG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  confirmed:      { label: "Confirmed",       bg: "bg-emerald-100", text: "text-emerald-700" },
  pending_payment:{ label: "Pending Payment", bg: "bg-amber-100",   text: "text-amber-700" },
  upcoming:       { label: "Upcoming",        bg: "bg-blue-100",    text: "text-blue-700" },
  past:           { label: "Past",            bg: "bg-slate-100",   text: "text-slate-500" },
  cancelled:      { label: "Cancelled",       bg: "bg-red-100",     text: "text-red-600" },
};

type Tab = "all" | "upcoming" | "past" | "cancelled";

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function avatarLetter(name: string) {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

const AVATAR_COLORS = ["#0F6CF5", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function BookingsPage() {
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/agents-proxy?path=admin/bookings`);
        if (!res.ok) throw new Error("Not available");
        const json = await res.json();
        const arr: Booking[] = Array.isArray(json) ? json : json?.data ?? [];
        setBookings(arr.length > 0 ? arr : DEMO_BOOKINGS);
      } catch {
        setBookings(DEMO_BOOKINGS);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.email]);

  const now = new Date();
  const filtered = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return new Date(b.departure_date) > now && b.status !== "cancelled";
    if (activeTab === "past") return new Date(b.departure_date) < now || b.status === "past";
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending_payment").length,
    revenue: bookings.reduce((s, b) => s + (b.total_price ?? 0), 0),
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">✈️ Bookings</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage all client bookings</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm shadow-lg transition hover:opacity-90"
          style={{ background: BRAND_BLUE }}
        >
          + New Booking
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Bookings",   value: stats.total,               icon: "🎫" },
          { label: "Confirmed",        value: stats.confirmed,            icon: "✅" },
          { label: "Pending Payment",  value: stats.pending,              icon: "⏳" },
          { label: "Revenue",          value: fmtMoney(stats.revenue),    icon: "💵" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xl">{s.icon}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              activeTab === t.key
                ? "bg-white text-slate-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">Loading bookings…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <p className="text-5xl mb-4">✈️</p>
          <p className="text-xl font-bold text-slate-700">No bookings found</p>
          <p className="text-slate-400 mt-2 text-sm">No bookings match this filter</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((b) => {
            const cfg = STATUS_CFG[b.status] ?? STATUS_CFG.upcoming;
            const letter = avatarLetter(b.client_name);
            const color = avatarColor(b.client_name);
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0" style={{ background: color }}>
                    {letter}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{b.client_name}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap text-sm text-slate-500">
                      <span>📍 {b.destination}</span>
                      <span>🗓 {fmtDate(b.departure_date)} → {fmtDate(b.return_date)}</span>
                      <span>👥 {b.travelers} traveler{b.travelers !== 1 ? "s" : ""}</span>
                    </div>
                    {(b.airline || b.hotel) && (
                      <div className="flex gap-3 mt-2 text-xs text-slate-400">
                        {b.airline && <span>✈ {b.airline}</span>}
                        {b.hotel && <span>🏨 {b.hotel}</span>}
                        {b.reference && <span>Ref: {b.reference}</span>}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-slate-900">{fmtMoney(b.total_price, b.currency)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Booked {fmtDate(b.created_at)}</p>
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
