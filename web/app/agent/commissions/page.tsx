"use client";
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
  booking_type?: string;
}

interface AgentProfile {
  agent_type: string;
  commission_rate: number;
  role?: string;
}

// Commission rates by agent type
const RATE_CONFIG: Record<string, {
  label: string;
  agentRate: number;
  zenivaRate: number;
  basis: string;
  color: string;
  icon: string;
  description: string;
}> = {
  travel_agent: {
    label: "Travel Agent",
    agentRate: 70,
    zenivaRate: 30,
    basis: "of sale",
    color: "text-blue-600",
    icon: "✈️",
    description: "You earn 70% of each booking — Zeniva keeps 30%",
  },
  yacht_broker: {
    label: "Yacht Broker",
    agentRate: 5,
    zenivaRate: 95,
    basis: "of Zeniva's cut",
    color: "text-indigo-600",
    icon: "⛵",
    description: "Zeniva Yacht keeps 95% — you earn 5% of Zeniva's net profit",
  },
  influencer: {
    label: "Influencer",
    agentRate: 5,
    zenivaRate: 95,
    basis: "of net profit",
    color: "text-purple-600",
    icon: "⭐",
    description: "You earn 5% of Zeniva's net profit on each referred booking",
  },
  default: {
    label: "Agent",
    agentRate: 70,
    zenivaRate: 30,
    basis: "of sale",
    color: "text-blue-600",
    icon: "💼",
    description: "You earn 70% of each booking — Zeniva keeps 30%",
  },
};

function getRateConfig(agentType?: string | null) {
  if (!agentType) return RATE_CONFIG.default;
  const t = agentType.toLowerCase();
  if (t.includes("yacht")) return RATE_CONFIG.yacht_broker;
  if (t.includes("influencer")) return RATE_CONFIG.influencer;
  if (t.includes("travel")) return RATE_CONFIG.travel_agent;
  return RATE_CONFIG.default;
}

export default function CommissionsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);

  // Determine agent type from role or profile
  const userRole = (user as any)?.role || (user as any)?.agent_type || "";
  const rateConfig = getRateConfig(userRole || agentProfile?.agent_type);

  const fetchData = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ path: "admin/commissions" });
      if (!hq && user?.email) p.append("agent_email", user.email);
      const r = await fetch(`/api/agents-proxy?${p}`);
      const d = await r.json();
      setCommissions(d?.commissions || []);

      // Load agent profile to get agent_type
      if (user?.email) {
        const pr = await fetch(`/api/agents-proxy?path=admin/agent-profile/${encodeURIComponent(user.email)}`);
        if (pr.ok) {
          const pd = await pr.json();
          setAgentProfile(pd);
        }
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (user?.email) void fetchData(); }, [user?.email]);

  const shown = filter === "all" ? commissions : commissions.filter(c => c.status === filter);
  const totalEarned = commissions.filter(c => c.status === "paid").reduce((s, c) => s + (c.commission_amount || 0), 0);
  const totalPending = commissions.filter(c => c.status === "pending").reduce((s, c) => s + (c.commission_amount || 0), 0);
  const totalSales = commissions.reduce((s, c) => s + (c.sale_amount || 0), 0);

  const downloadCSV = () => {
    const header = "Client,Trip,Sale Amount,Zeniva Profit,Your Commission,Status,Date\n";
    const rows = commissions.map(c => `"${c.client_name}","${c.trip_description||''}",${c.sale_amount},${c.zeniva_profit},${c.commission_amount},${c.status},${c.created_at}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "commissions.csv"; a.click();
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-7xl px-5 py-8 space-y-6">

        {/* ── Header ── */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Earnings</p>
            <h1 className="text-3xl font-black text-slate-900">Commissions</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {rateConfig.icon} {rateConfig.label} · {rateConfig.description}
            </p>
          </div>
          <button onClick={downloadCSV} className="rounded-full px-6 py-2.5 text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm">
            ⬇️ Export CSV
          </button>
        </header>

        {/* ── Commission Rate Card ── */}
        <div className="rounded-2xl overflow-hidden shadow-sm">
          {/* Travel Agent */}
          {(!userRole || userRole.includes("travel_agent") || (!userRole.includes("yacht") && !userRole.includes("influencer"))) && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-black">70%</p>
                    <p className="text-blue-200 text-sm font-semibold">YOU</p>
                  </div>
                  <div className="flex items-center text-2xl font-black text-blue-300">+</div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-blue-200">30%</p>
                    <p className="text-blue-300 text-sm font-semibold">ZENIVA</p>
                  </div>
                </div>
                <div className="sm:ml-6 sm:border-l sm:border-blue-500 sm:pl-6">
                  <p className="font-black text-xl">✈️ Travel Agent Split</p>
                  <p className="text-blue-100 text-sm mt-1">On every booking you close: <strong>you keep 70%</strong>, Zeniva keeps 30%.</p>
                  <p className="text-blue-200 text-xs mt-1">Example: $5,000 trip → <strong>$3,500 for you</strong> · $1,500 for Zeniva</p>
                  <div className="mt-3 bg-amber-400/20 border border-amber-300/40 rounded-lg px-3 py-2">
                    <p className="text-amber-200 text-xs font-bold">⚠️ Lina Books Alone Rule</p>
                    <p className="text-amber-100 text-xs mt-0.5">If Lina closes a deal <strong>entirely on her own</strong> without your involvement → split reverses: <strong>Zeniva 70% · You 30%</strong></p>
                    <p className="text-amber-200/70 text-xs mt-0.5">Stay active in your pipeline to keep your 70% !</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Yacht Broker */}
          {userRole.includes("yacht") && (
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-5 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-black">95%</p>
                    <p className="text-indigo-200 text-sm font-semibold">ZENIVA YACHT</p>
                  </div>
                  <div className="flex items-center text-2xl font-black text-indigo-300">+</div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-indigo-200">5%</p>
                    <p className="text-indigo-300 text-sm font-semibold">YOU</p>
                  </div>
                </div>
                <div className="sm:ml-6 sm:border-l sm:border-indigo-500 sm:pl-6">
                  <p className="font-black text-xl">⛵ Yacht Broker Split</p>
                  <p className="text-indigo-100 text-sm mt-1">Zeniva Yacht keeps 95% · You earn <strong>5% of Zeniva's net profit</strong> on yacht charters.</p>
                  <p className="text-indigo-200 text-xs mt-1">Example: $50,000 yacht charter, Zeniva profit $10,000 → <strong>$500 for you</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* HQ sees all rates — white card */}
          {hq && (
            <div className="bg-white border border-slate-200 p-5 text-slate-900">
              <p className="font-black text-lg mb-3 text-slate-900">📊 HQ — All Commission Structures</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="font-black text-blue-900">✈️ Travel Agents</p>
                  <p className="text-blue-700 text-sm mt-1">Agent: <strong>70%</strong> · Zeniva: <strong>30%</strong></p>
                  <p className="text-blue-500 text-xs">of total sale amount</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="font-black text-amber-900">🤖 Lina Books Alone</p>
                  <p className="text-amber-700 text-sm mt-1">Zeniva: <strong>70%</strong> · Agent: <strong>30%</strong></p>
                  <p className="text-amber-600 text-xs">reversed — no agent involvement</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                  <p className="font-black text-indigo-900">⛵ Yacht Brokers</p>
                  <p className="text-indigo-700 text-sm mt-1">Zeniva Yacht: <strong>95%</strong> · Agent: <strong>5%</strong></p>
                  <p className="text-indigo-500 text-xs">of Zeniva's net profit</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="font-black text-purple-900">⭐ Influencers</p>
                  <p className="text-purple-700 text-sm mt-1">Influencer: <strong>5%</strong> · Zeniva: <strong>95%</strong></p>
                  <p className="text-purple-500 text-xs">of Zeniva's net profit</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-800 font-semibold">⚠️ Lina Auto-Book Rule: When Lina closes a booking entirely on her own (no agent action) → split reverses: <strong>Zeniva 70% · Agent 30%</strong>. This incentivizes agents to stay active in the sales process.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Earned (Paid)", value: `$${totalEarned.toLocaleString()}`, color: "text-emerald-600", icon: "✅", sub: "Commissions received" },
            { label: "Pending Commissions", value: `$${totalPending.toLocaleString()}`, color: "text-amber-600", icon: "⏳", sub: "Awaiting payment" },
            { label: "Total Sales Tracked", value: `$${totalSales.toLocaleString()}`, color: "text-blue-600", icon: "📊", sub: "All bookings" },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{k.icon}</span>
                <div>
                  <p className="text-xs text-slate-500 font-medium">{k.label}</p>
                  <p className="text-xs text-slate-400">{k.sub}</p>
                </div>
              </div>
              <p className={`text-3xl font-black mt-2 ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filter ── */}
        <div className="flex gap-2">
          {(["all","pending","paid"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors capitalize ${filter === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {f === "all" ? "All" : f === "paid" ? "✅ Paid" : "⏳ Pending"}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading commissions…</div>
          ) : shown.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">💰</p>
              <p className="text-slate-600 font-semibold">No commissions yet</p>
              <p className="text-slate-400 text-sm mt-1">Commissions appear here once a booking is confirmed and payment is received</p>
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 max-w-sm mx-auto text-left">
                <p className="text-xs text-blue-800 font-bold mb-1">How to earn commissions:</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Share your referral link from the Influencer page</li>
                  <li>A client fills the travel form</li>
                  <li>Lina qualifies them and closes the booking</li>
                  <li>Your commission is calculated and tracked here</li>
                </ol>
              </div>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Trip</th>
                  <th className="px-5 py-3">Sale</th>
                  {hq && <th className="px-5 py-3">Zeniva Profit</th>}
                  <th className="px-5 py-3">Your Commission</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-900">{c.client_name}</td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{c.trip_description || "—"}</td>
                    <td className="px-5 py-3 font-semibold text-slate-700">${(c.sale_amount||0).toLocaleString()}</td>
                    {hq && <td className="px-5 py-3 text-slate-500">${(c.zeniva_profit||0).toLocaleString()}</td>}
                    <td className="px-5 py-3">
                      <span className="font-black text-emerald-700 text-base">${(c.commission_amount||0).toLocaleString()}</span>
                    </td>
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
