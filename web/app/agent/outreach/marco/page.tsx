"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const ENGINES = [
  { id: "reddit", label: "Reddit", icon: "🔴", desc: "Travel subs, honeymoon requests, trip planning threads, luxury travel discussions", color: "#ef4444" },
  { id: "agencies", label: "Agency Finder", icon: "🏢", desc: "Find agencies without AI tools — sell them Zeniva's platform with Lina + 11 AI agents", color: "#6366f1" },
  { id: "social", label: "Social", icon: "📱", desc: "Instagram travel tags, TikTok travel creators, Facebook groups, travel influencers", color: "#ec4899" },
  { id: "agents", label: "Agent Recruit", icon: "🧳", desc: "Independent advisors looking for better tools — recruit them to work with Zeniva's AI platform", color: "#f59e0b" },
  { id: "travelers", label: "Traveler Intent", icon: "✈️", desc: "Google search intent, travel forums, wedding planners, luxury vacation seekers", color: "#06b6d4" },
];

type ProspectResult = { travelers: number; agencies: number; agents: number; total: number };

type RecentRun = {
  date: string;
  travelers: number;
  agencies: number;
  agents: number;
  total: number;
};

export default function MarcoPage() {
  const [prospecting, setProspecting] = useState(false);
  const [result, setResult] = useState<ProspectResult | null>(null);
  const [travelers, setTravelers] = useState(5);
  const [agencies, setAgencies] = useState(3);
  const [agents, setAgents] = useState(2);
  const [history, setHistory] = useState<RecentRun[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("marco_history") || "[]");
      setHistory(h.slice(0, 10));
    } catch { /* ignore */ }
  }, []);

  const saveHistory = (r: ProspectResult) => {
    const entry: RecentRun = { date: new Date().toISOString(), ...r };
    const updated = [entry, ...history].slice(0, 10);
    setHistory(updated);
    try { localStorage.setItem("marco_history", JSON.stringify(updated)); } catch {}
  };

  const runHunt = async () => {
    setProspecting(true);
    setResult(null);
    try {
      const res = await fetch("/api/prospecting/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travelers, agencies, agents }),
      });
      if (res.ok) {
        const data = await res.json();
        const saved = data.saved || { travelers: 0, agencies: 0, agents: 0, total: 0 };
        setResult(saved);
        saveHistory(saved);
      }
    } catch {}
    setProspecting(false);
  };

  const totalHistory = history.reduce((s, h) => s + h.total, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Marco Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img src="/agents/marco.png" alt="Marco" className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-red-500/50 shadow-2xl" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-[#1a1a2e] animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Marco</h1>
              <p className="text-sm sm:text-base font-bold text-red-400">Lead Hunter · 5-Engine Scraper</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
                5 scraping engines running 24/7. Finds quality leads from Reddit travel subs, competitor sites, social signals, SEO intent keywords, and deep web directories.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Active · Auto-runs daily
                </span>
                {totalHistory > 0 && (
                  <span className="text-[10px] text-slate-500">{totalHistory} leads found total</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Engines */}
      <div>
        <h2 className="text-sm font-black text-slate-900 mb-3">Scraping Engines</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ENGINES.map(e => (
            <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{e.icon}</span>
                <span className="text-sm font-black text-slate-900">{e.label}</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hunt Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-900">Hunt Configuration</h2>
          <button
            onClick={runHunt}
            disabled={prospecting}
            className="px-6 py-3 rounded-xl text-sm font-black text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: prospecting ? "#64748b" : "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            {prospecting ? "🔍 Marco is hunting..." : "🔥 Hunt Now"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border-2 border-blue-200 bg-blue-50">
            <label className="text-xs font-bold text-blue-600 uppercase block mb-2">✈️ Travelers</label>
            <p className="text-[10px] text-blue-500 mb-2">Luxury travel intent, honeymoons, destination weddings</p>
            <input type="number" min="0" max="20" value={travelers} onChange={e => setTravelers(Number(e.target.value))}
              className="w-full font-black text-lg text-blue-800 bg-white rounded-lg px-3 py-2 border border-blue-200 focus:outline-none focus:border-blue-400" />
            <span className="text-[10px] text-blue-400 mt-1 block">leads per hunt</span>
          </div>
          <div className="rounded-xl p-4 border-2 border-emerald-200 bg-emerald-50">
            <label className="text-xs font-bold text-emerald-600 uppercase block mb-2">🏢 Agencies</label>
            <p className="text-[10px] text-emerald-500 mb-2">Travel agencies, B2B partnerships, consortia</p>
            <input type="number" min="0" max="20" value={agencies} onChange={e => setAgencies(Number(e.target.value))}
              className="w-full font-black text-lg text-emerald-800 bg-white rounded-lg px-3 py-2 border border-emerald-200 focus:outline-none focus:border-emerald-400" />
            <span className="text-[10px] text-emerald-400 mt-1 block">leads per hunt</span>
          </div>
          <div className="rounded-xl p-4 border-2 border-amber-200 bg-amber-50">
            <label className="text-xs font-bold text-amber-600 uppercase block mb-2">🧳 Agents</label>
            <p className="text-[10px] text-amber-500 mb-2">Independent advisors, home-based agents, CTA/CTC</p>
            <input type="number" min="0" max="20" value={agents} onChange={e => setAgents(Number(e.target.value))}
              className="w-full font-black text-lg text-amber-800 bg-white rounded-lg px-3 py-2 border border-amber-200 focus:outline-none focus:border-amber-400" />
            <span className="text-[10px] text-amber-400 mt-1 block">leads per hunt</span>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 p-5 rounded-xl" style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }}>
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Hunt Complete</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Travelers", value: result.travelers, icon: "✈️", color: "text-blue-400" },
                { label: "Agencies", value: result.agencies, icon: "🏢", color: "text-emerald-400" },
                { label: "Agents", value: result.agents, icon: "🧳", color: "text-amber-400" },
                { label: "Total", value: result.total, icon: "🔥", color: "text-red-400" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-lg">{s.icon}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/agent/outreach/newLeads" className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition">
                View Leads →
              </Link>
              <span className="text-[10px] text-slate-500">Source: prospecting:ai · Status: new</span>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-black text-slate-900 mb-3">Hunt History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-slate-600">Date</th>
                  <th className="text-center px-4 py-2 font-semibold text-blue-600">Travelers</th>
                  <th className="text-center px-4 py-2 font-semibold text-emerald-600">Agencies</th>
                  <th className="text-center px-4 py-2 font-semibold text-amber-600">Agents</th>
                  <th className="text-center px-4 py-2 font-semibold text-red-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-2 text-slate-600">{new Date(h.date).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-2 text-center font-bold text-blue-600">{h.travelers}</td>
                    <td className="px-4 py-2 text-center font-bold text-emerald-600">{h.agencies}</td>
                    <td className="px-4 py-2 text-center font-bold text-amber-600">{h.agents}</td>
                    <td className="px-4 py-2 text-center font-black text-red-600">{h.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
