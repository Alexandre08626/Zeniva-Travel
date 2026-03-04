"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";
const ACCENT_GOLD = "#E6B85A";

interface FinanceStats {
  total_revenue: number;
  commissions_paid: number;
  commissions_pending: number;
  bookings_this_month: number;
  revenue_this_month: number;
  avg_deal_value: number;
}

interface Commission {
  id: string;
  agent_name: string;
  agent_email: string;
  client_name: string;
  trip: string;
  sale_amount: number;
  zeniva_profit: number;
  commission: number;
  status: "pending" | "paid";
  created_at: string;
}

interface Booking {
  id: string;
  client_name: string;
  destination: string;
  total_price: number;
  status: string;
  departure_date: string;
  agent_email?: string;
}

export default function FinancePage() {
  const { user } = useAuthStore();
  const hq = isHQ(user);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"overview" | "commissions" | "bookings">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hq) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [cRes, bRes] = await Promise.all([
          fetch("/api/agents-proxy?path=admin/commissions"),
          fetch("/api/agents-proxy?path=admin/bookings"),
        ]);
        const cData = await cRes.json().catch(() => []);
        const bData = await bRes.json().catch(() => []);
        const comms: Commission[] = Array.isArray(cData) ? cData : [];
        const books: Booking[] = Array.isArray(bData) ? bData : [];
        setCommissions(comms);
        setBookings(books);
        const totalRev = books.reduce((s, b) => s + (b.total_price || 0), 0);
        const commPaid = comms.filter(c => c.status === "paid").reduce((s, c) => s + c.commission, 0);
        const commPending = comms.filter(c => c.status === "pending").reduce((s, c) => s + c.commission, 0);
        const now = new Date();
        const thisMonth = books.filter(b => new Date(b.departure_date).getMonth() === now.getMonth());
        setStats({
          total_revenue: totalRev,
          commissions_paid: commPaid,
          commissions_pending: commPending,
          bookings_this_month: thisMonth.length,
          revenue_this_month: thisMonth.reduce((s, b) => s + (b.total_price || 0), 0),
          avg_deal_value: books.length ? Math.round(totalRev / books.length) : 0,
        });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [hq]);

  if (!hq) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PREMIUM_BLUE }}>
        <div className="bg-white rounded-2xl p-10 text-center shadow-xl max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-black text-slate-800 mb-2">HQ Access Only</h2>
          <p className="text-slate-500 text-sm">Finance is restricted to Zeniva headquarters.</p>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  const kpis = [
    { label: "Total Revenue", value: fmt(stats?.total_revenue ?? 0), icon: "💵", color: "from-blue-500 to-blue-700", sub: "All time" },
    { label: "This Month", value: fmt(stats?.revenue_this_month ?? 0), icon: "📅", color: "from-emerald-500 to-emerald-700", sub: `${stats?.bookings_this_month ?? 0} bookings` },
    { label: "Commissions Paid", value: fmt(stats?.commissions_paid ?? 0), icon: "✅", color: "from-purple-500 to-purple-700", sub: "To agents" },
    { label: "Commissions Pending", value: fmt(stats?.commissions_pending ?? 0), icon: "⏳", color: "from-amber-500 to-amber-700", sub: "Awaiting payout" },
    { label: "Avg Deal Value", value: fmt(stats?.avg_deal_value ?? 0), icon: "📊", color: "from-rose-500 to-rose-700", sub: "Per booking" },
    { label: "Net Profit Est.", value: fmt(Math.round((stats?.total_revenue ?? 0) * 0.2)), icon: "🏦", color: "from-slate-600 to-slate-800", sub: "~20% margin" },
  ];

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "commissions", label: "💰 Commissions" },
    { id: "bookings", label: "✈️ Revenue" },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">📊 Finance</h1>
          <p className="text-white/60 text-sm mt-1">Global revenue, commissions & financial overview</p>
        </div>
        <button
          onClick={() => {
            const csv = commissions.map(c =>
              `${c.agent_name},${c.client_name},${c.trip},${c.sale_amount},${c.commission},${c.status},${c.created_at}`
            ).join("\n");
            const blob = new Blob(["Agent,Client,Trip,Sale,Commission,Status,Date\n" + csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "zeniva-finance.csv"; a.click();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: ACCENT_GOLD, color: PREMIUM_BLUE }}
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-5 text-white`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{k.icon}</span>
              <span className="text-xs text-white/70">{k.sub}</span>
            </div>
            <div className="text-2xl font-black">{loading ? "—" : k.value}</div>
            <div className="text-xs text-white/80 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id ? "text-white shadow-lg" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
            style={tab === t.id ? { background: BRAND_BLUE } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-black text-slate-800 mb-4">Revenue Breakdown</h3>
            {[
              { label: "Gross Revenue", value: stats?.total_revenue ?? 0, color: "bg-blue-500", max: stats?.total_revenue ?? 1 },
              { label: "Commissions Paid", value: stats?.commissions_paid ?? 0, color: "bg-purple-500", max: stats?.total_revenue ?? 1 },
              { label: "Commissions Pending", value: stats?.commissions_pending ?? 0, color: "bg-amber-500", max: stats?.total_revenue ?? 1 },
              { label: "Est. Net Profit (20%)", value: Math.round((stats?.total_revenue ?? 0) * 0.2), color: "bg-emerald-500", max: stats?.total_revenue ?? 1 },
            ].map(row => (
              <div key={row.label} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-bold text-slate-800">{fmt(row.value)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.color} rounded-full transition-all duration-700`}
                    style={{ width: `${row.max > 0 ? Math.min(100, (row.value / row.max) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Commission summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-black text-slate-800 mb-4">Commission Rate</h3>
            <div className="rounded-xl p-4 mb-4" style={{ background: `${ACCENT_GOLD}20`, border: `1px solid ${ACCENT_GOLD}` }}>
              <div className="text-3xl font-black mb-1" style={{ color: PREMIUM_BLUE }}>5%</div>
              <div className="text-sm font-semibold text-slate-700">of Zeniva's net profit per trip</div>
              <div className="text-xs text-slate-500 mt-1">Example: $5,000 trip · $1,000 Zeniva profit → <strong>$50 commission</strong></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Total agents</span>
                <span className="font-bold">{new Set(commissions.map(c => c.agent_email)).size || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Paid out</span>
                <span className="font-bold text-emerald-600">{commissions.filter(c => c.status === "paid").length} commissions</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Pending payout</span>
                <span className="font-bold text-amber-600">{commissions.filter(c => c.status === "pending").length} commissions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commissions Tab */}
      {tab === "commissions" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-black text-slate-800">All Commissions</h3>
            <p className="text-slate-500 text-sm">{commissions.length} total records</p>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : commissions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">💰</div>
              <p className="text-slate-500 font-semibold">No commissions yet</p>
              <p className="text-slate-400 text-sm mt-1">Commissions appear when bookings are confirmed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Agent", "Client", "Trip", "Sale", "Profit Est.", "Commission", "Status", "Date"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissions.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{c.agent_name || c.agent_email?.split("@")[0]}</div>
                        <div className="text-xs text-slate-400">{c.agent_email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{c.client_name}</td>
                      <td className="px-4 py-3 text-slate-700">{c.trip}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{fmt(c.sale_amount)}</td>
                      <td className="px-4 py-3 text-slate-600">{fmt(c.zeniva_profit || Math.round(c.sale_amount * 0.2))}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: ACCENT_GOLD }}>{fmt(c.commission)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          c.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {c.status === "paid" ? "✅ Paid" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bookings / Revenue Tab */}
      {tab === "bookings" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-black text-slate-800">Revenue by Booking</h3>
            <p className="text-slate-500 text-sm">{bookings.length} total bookings</p>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">✈️</div>
              <p className="text-slate-500 font-semibold">No bookings yet</p>
              <p className="text-slate-400 text-sm mt-1">Revenue appears when trips are booked</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Client", "Destination", "Departure", "Revenue", "Profit Est.", "Agent", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{b.client_name}</td>
                      <td className="px-4 py-3 text-slate-700">{b.destination}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {b.departure_date ? new Date(b.departure_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{fmt(b.total_price || 0)}</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">{fmt(Math.round((b.total_price || 0) * 0.2))}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{b.agent_email?.split("@")[0] || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          b.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                          b.status === "pending_payment" ? "bg-amber-100 text-amber-700" :
                          b.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {b.status?.replace("_", " ") || "upcoming"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
