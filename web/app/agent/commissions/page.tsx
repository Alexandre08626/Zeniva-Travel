"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";
const ACCENT_GOLD = "#E6B85A";

type CommissionStatus = "pending" | "paid";

interface CommissionRow {
  id: string;
  booking_ref: string;
  client_name: string;
  trip: string;
  sale_amount: number;
  zeniva_profit: number;
  commission: number;
  rate: number;
  status: CommissionStatus;
  date: string;
  currency: string;
}

function fmtMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const DEMO: CommissionRow[] = [
  { id: "c1", booking_ref: "BK-001", client_name: "Sarah Mitchell", trip: "Paris, France", sale_amount: 4800, zeniva_profit: 480, commission: 24, rate: 5, status: "paid", date: "2025-03-01", currency: "USD" },
  { id: "c2", booking_ref: "BK-002", client_name: "Carlos Ramirez", trip: "Cancún, Mexico", sale_amount: 6200, zeniva_profit: 620, commission: 31, rate: 5, status: "pending", date: "2025-03-05", currency: "USD" },
  { id: "c3", booking_ref: "BK-003", client_name: "Emma Thompson", trip: "Maldives", sale_amount: 9500, zeniva_profit: 950, commission: 47.5, rate: 5, status: "pending", date: "2025-03-10", currency: "USD" },
  { id: "c4", booking_ref: "BK-004", client_name: "Liu Wei", trip: "Tokyo, Japan", sale_amount: 12400, zeniva_profit: 1240, commission: 62, rate: 5, status: "paid", date: "2025-01-20", currency: "USD" },
  { id: "c5", booking_ref: "BK-005", client_name: "Alexandra Dupont", trip: "Santorini, Greece", sale_amount: 7300, zeniva_profit: 730, commission: 36.5, rate: 5, status: "pending", date: "2025-03-12", currency: "USD" },
];

// Minimal bar chart using divs
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-28 px-2">
      {data.map((d) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <div key={d.label} className="flex flex-col items-center flex-1">
            <span className="text-xs text-slate-500 font-semibold mb-1">${d.value}</span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{ height: `${pct}%`, minHeight: 4, background: BRAND_BLUE }}
            />
            <span className="text-[10px] text-slate-400 mt-1 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CommissionsPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/agents-proxy?path=admin/commissions`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        const arr = Array.isArray(json) ? json : json?.data ?? [];
        setRows(arr.length > 0 ? arr : DEMO);
      } catch {
        setRows(DEMO);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.email]);

  const totalEarned  = rows.reduce((s, r) => s + r.commission, 0);
  const totalPending = rows.filter((r) => r.status === "pending").reduce((s, r) => s + r.commission, 0);
  const totalPaid    = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.commission, 0);
  const thisMonth    = rows
    .filter((r) => new Date(r.date).getMonth() === new Date().getMonth())
    .reduce((s, r) => s + r.commission, 0);

  // Chart data: last 5 months placeholder
  const chartData = [
    { label: "Nov", value: 42 },
    { label: "Dec", value: 88 },
    { label: "Jan", value: 62 },
    { label: "Feb", value: 115 },
    { label: "Mar", value: Math.round(thisMonth) },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">💰 Commissions</h1>
          <p className="text-slate-400 text-sm mt-1">Track your earnings from every booking</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-slate-900 text-sm shadow-lg transition hover:opacity-90 bg-white border border-slate-200">
          📤 Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Earned",  value: fmtMoney(totalEarned),  icon: "💰", color: "text-emerald-600" },
          { label: "Pending",       value: fmtMoney(totalPending),  icon: "⏳", color: "text-amber-600" },
          { label: "Paid Out",      value: fmtMoney(totalPaid),     icon: "✅", color: "text-blue-600" },
          { label: "This Month",    value: fmtMoney(thisMonth),     icon: "📅", color: "text-indigo-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xl">{s.icon}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Commission rate card */}
        <div
          className="rounded-2xl border border-amber-200 shadow-sm p-5 flex items-center gap-4"
          style={{ background: "#FEF9EC" }}
        >
          <span className="text-4xl">⭐</span>
          <div>
            <p className="font-black text-slate-900 text-lg">Your rate: 5%</p>
            <p className="text-sm text-slate-600 mt-0.5">of Zeniva net profit per booking</p>
            <span
              className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: ACCENT_GOLD, color: "#fff" }}
            >
              Gold Agent
            </span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm font-bold text-slate-700 mb-3">Earnings (last 5 months)</p>
          <BarChart data={chartData} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-bold text-slate-900 mb-4">Commission History</h2>
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  {["Ref", "Client", "Trip", "Sale Amount", "Net Profit Est.", "Commission (5%)", "Status", "Date"].map((h) => (
                    <th key={h} className="pb-3 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{r.booking_ref}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">{r.client_name}</td>
                    <td className="py-3 pr-4 text-slate-600">{r.trip}</td>
                    <td className="py-3 pr-4 text-slate-800">{fmtMoney(r.sale_amount, r.currency)}</td>
                    <td className="py-3 pr-4 text-slate-600">{fmtMoney(r.zeniva_profit, r.currency)}</td>
                    <td className="py-3 pr-4 font-bold text-emerald-600">{fmtMoney(r.commission, r.currency)}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${r.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-xs">{fmtDate(r.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
