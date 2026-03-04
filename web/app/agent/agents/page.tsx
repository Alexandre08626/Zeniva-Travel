"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

type AgentStatus = "active" | "inactive" | "suspended";

interface AgentEntry {
  id: string;
  name: string;
  email: string;
  agent_type: string;
  status: AgentStatus;
  leads_count: number;
  commission_rate: number;
  ref_code?: string;
  bio?: string;
  created_at: string;
  avatar_url?: string;
}

const ROLE_CFG: Record<string, { label: string; bg: string; text: string }> = {
  travel_agent: { label: "Travel Agent",  bg: "bg-blue-100",    text: "text-blue-700" },
  yacht_broker: { label: "Yacht Broker",  bg: "bg-indigo-100",  text: "text-indigo-700" },
  hq:           { label: "HQ",            bg: "bg-amber-100",   text: "text-amber-700" },
  admin:        { label: "Admin",         bg: "bg-red-100",     text: "text-red-700" },
};

const STATUS_CFG: Record<string, { label: string; dot: string; text: string }> = {
  active:    { label: "Active",    dot: "bg-emerald-500", text: "text-emerald-600" },
  inactive:  { label: "Inactive",  dot: "bg-slate-300",   text: "text-slate-500" },
  suspended: { label: "Suspended", dot: "bg-red-400",     text: "text-red-600" },
};

const AVATAR_COLORS = ["#0F6CF5", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function AgentCommandPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AgentEntry | null>(null);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"active"|"all">("active");

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/agents-proxy?path=admin/agents-list");
      const d = await r.json();
      setAgents(d?.agents || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { void fetchAgents(); }, []);

  if (!hq) {
    return (
      <main className="min-h-screen bg-[#F3F6FB] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center max-w-sm">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-black text-xl text-slate-900">HQ Access Only</p>
          <p className="text-slate-500 text-sm mt-2">Agent Command is reserved for Zeniva HQ administrators.</p>
        </div>
      </main>
    );
  }

  const shown = agents
    .filter(a => tab === "active" ? a.status === "active" : true)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()));

  const totalActive = agents.filter(a => a.status === "active").length;
  const totalLeads = agents.reduce((s, a) => s + (a.leads_count || 0), 0);

  const handleStatus = async (agentId: string, newStatus: string) => {
    setActionLoading(agentId);
    try {
      await fetch(`/api/agents-proxy?path=admin/agents/${agentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchAgents();
    } catch {}
    setActionLoading(null);
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-7xl px-5 py-8 space-y-6">

        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">HQ</p>
            <h1 className="text-3xl font-black text-slate-900">Agent Command</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your team of travel agents and brokers</p>
          </div>
          <button onClick={() => void fetchAgents()} className="rounded-full px-5 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
            🔄 Refresh
          </button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Agents", value: agents.length, icon: "👥", color: "text-blue-600" },
            { label: "Active", value: totalActive, icon: "✅", color: "text-emerald-600" },
            { label: "Total Leads", value: totalLeads, icon: "🎯", color: "text-purple-600" },
            { label: "Travel Agents", value: agents.filter(a => a.agent_type === "travel_agent").length, icon: "✈️", color: "text-amber-600" },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500">{k.icon} {k.label}</p>
              <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1">
            {(["active","all"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors capitalize ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}>{t === "active" ? "✅ Active" : "📋 All"}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents…" className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        {/* Agent Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-40" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-semibold text-slate-600">No agents found</p>
            <p className="text-slate-400 text-sm mt-1">Add agents via Agent Requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map(agent => {
              const sc = STATUS_CFG[agent.status] || STATUS_CFG.inactive;
              const rc = ROLE_CFG[agent.agent_type] || { label: agent.agent_type, bg: "bg-slate-100", text: "text-slate-700" };
              const initials = agent.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div key={agent.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all p-5 cursor-pointer" onClick={() => setSelected(selected?.id === agent.id ? null : agent)}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0" style={{ background: avatarColor(agent.name) }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 truncate">{agent.name}</p>
                      <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rc.bg} ${rc.text}`}>{rc.label}</span>
                    <span className="text-xs text-slate-500">🎯 {agent.leads_count} leads</span>
                    <span className="text-xs text-slate-500">💰 {agent.commission_rate}%</span>
                  </div>

                  {agent.ref_code && (
                    <p className="text-xs text-slate-400 font-mono truncate">Ref: {agent.ref_code}</p>
                  )}

                  {/* Expanded detail */}
                  {selected?.id === agent.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <p className="text-xs text-slate-500">Joined: {agent.created_at ? new Date(agent.created_at).toLocaleDateString("en-CA") : "—"}</p>
                      {agent.bio && <p className="text-xs text-slate-600 italic">"{agent.bio}"</p>}
                      <div className="flex gap-2 flex-wrap">
                        {agent.status === "active" ? (
                          <button
                            onClick={e => { e.stopPropagation(); void handleStatus(agent.id, "inactive"); }}
                            disabled={actionLoading === agent.id}
                            className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-semibold hover:bg-amber-200 disabled:opacity-50"
                          >
                            {actionLoading === agent.id ? "…" : "⏸ Deactivate"}
                          </button>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); void handleStatus(agent.id, "active"); }}
                            disabled={actionLoading === agent.id}
                            className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-semibold hover:bg-emerald-200 disabled:opacity-50"
                          >
                            {actionLoading === agent.id ? "…" : "▶ Activate"}
                          </button>
                        )}
                        <a href={`mailto:${agent.email}`} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold hover:bg-blue-200">📧 Email</a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
