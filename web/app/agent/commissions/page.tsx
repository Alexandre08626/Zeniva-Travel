"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const AUTH = "Bearer zeniva-secret-2025";

interface Commission {
  id: string;
  client_name: string;
  trip_description?: string;
  sale_amount: number;
  zeniva_profit: number;
  commission_amount: number;
  status: "pending" | "paid";
  created_at: string;
  paid_at?: string;
}

export default function CommissionsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");

  const fetchComm = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ path: "admin/commissions" });
      if (!hq && user?.email) p.append("agent_email", user.email);
      const r = await fetch(`/api/agents-proxy?${p}`);
      const d = await r.json();
      setCommissions(d?.commissions || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (user?.email) void fetchComm(); }, [user?.email]);

  const shown = filter === "all" ? commissions : commissions.filter(c => c.status === filter);
  const totalEarned = commissions.filter(c => c.status === "paid").reduce((s, c) => s + (c.commission_amount || 0), 0);
  const totalPending = commissions.filter(c => c.status === "pending").reduce((s, c) => s + (c.commission_amount || 0), 0);
  const totalSales = commissions.reduce((s, c) => s + (c.sale_amount || 0), 0);

  const downloadCSV = () => {
    const header = "Client,Trip,Sale Amount,Zeniva Profit,Commission (5%),Status,Date\n";
    const rows = commissions.map(c => `"${c.client_name}","${c.trip_description||''}",${c.sale_amount},${c.zeniva_profit},${c.commission_amount},${c.status},${c.created_at}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "commissions.csv"; a.click();
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-7xl px-5 py-8 space-y-6">

        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Earnings</p>
            <h1 className="text-3xl font-black text-slate-900">Commissions</h1>
            <p className="text-sm text-slate-500 mt-0.5">5% of Zeniva's net profit on each booking</p>
          </div>
          <button onClick={downloadCSV} className="rounded-full px-6 py-2.5 text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm">
            ⬇️ Export CSV
          </button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Earned (Paid)", value: `$${totalEarned.toLocaleString()}`, color: "text-emerald-600", icon: "✅" },
            { label: "Pending Commissions", value: `$${totalPending.toLocaleString()}`, color: "text-amber-600", icon: "⏳" },
            { label: "Total Sales Tracked", value: `$${totalSales.toLocaleString()}`, color: "text-blue-600", icon: "📊" },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{k.icon}</span>
                <p className="text-xs text-slate-500 font-medium">{k.label}</p>
              </div>
              <p className={`text-3xl font-black ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Commission rate info */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <p className="font-black text-lg">Your Commission Rate: 5% of Net Profit</p>
              <p className="text-blue-100 text-sm">Example: A $5,000 trip where Zeniva makes $1,000 profit = <strong>$50 commission</strong> for you. Paid monthly after client confirmation.</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(["all","pending","paid"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors capitalize ${filter === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading commissions…</div>
          ) : shown.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">💰</p>
              <p className="text-slate-600 font-semibold">No commissions yet</p>
              <p className="text-slate-400 text-sm mt-1">Commissions appear here once a booking is confirmed</p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Trip</th>
                  <th className="px-5 py-3">Sale</th>
                  <th className="px-5 py-3">Zeniva Profit</th>
                  <th className="px-5 py-3">Your 5%</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-900">{c.client_name}</td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{c.trip_description || "—"}</td>
                    <td className="px-5 py-3 font-semibold">${(c.sale_amount||0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-slate-600">${(c.zeniva_profit||0).toLocaleString()}</td>
                    <td className="px-5 py-3 font-black text-emerald-700 text-base">${(c.commission_amount||0).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {c.status === "paid" ? "✅ Paid" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-CA") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
