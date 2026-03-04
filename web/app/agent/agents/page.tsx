"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";
const ACCENT_GOLD = "#E6B85A";

type AgentStatus = "active" | "inactive" | "suspended";
type AgentRole = "travel_agent" | "yacht_broker" | "hq" | "admin";

interface AgentEntry {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  status: AgentStatus;
  leads_count: number;
  commission_earned: number;
  currency: string;
  last_active?: string;
  avatar?: string;
  phone?: string;
  joined?: string;
}

interface AgentPerf {
  proposals: number;
  bookings: number;
  conversion_rate: number;
}

const DEMO_AGENTS: AgentEntry[] = [
  { id: "a1", name: "Alice Moreau",     email: "alice@zenivatravel.com",  role: "travel_agent",  status: "active",   leads_count: 24, commission_earned: 840,  currency: "USD", last_active: "2025-03-04T15:00:00Z", joined: "2024-06-15" },
  { id: "a2", name: "Marco Fernandez",  email: "marco@zenivatravel.com",  role: "yacht_broker",  status: "active",   leads_count: 12, commission_earned: 3200, currency: "USD", last_active: "2025-03-04T12:00:00Z", joined: "2024-08-01" },
  { id: "a3", name: "Sara Kim",         email: "sara@zenivatravel.com",   role: "travel_agent",  status: "active",   leads_count: 31, commission_earned: 1150, currency: "USD", last_active: "2025-03-03T18:00:00Z", joined: "2024-09-10" },
  { id: "a4", name: "Ben Taylor",       email: "ben@zenivatravel.com",    role: "travel_agent",  status: "inactive", leads_count: 8,  commission_earned: 290,  currency: "USD", last_active: "2025-02-15T10:00:00Z", joined: "2024-11-01" },
  { id: "a5", name: "Nina Johansson",   email: "nina@zenivatravel.com",   role: "travel_agent",  status: "active",   leads_count: 19, commission_earned: 560,  currency: "USD", last_active: "2025-03-04T09:00:00Z", joined: "2025-01-15" },
];

const ROLE_CFG: Record<string, { label: string; bg: string; text: string }> = {
  travel_agent: { label: "Travel Agent",  bg: "bg-blue-100",    text: "text-blue-700" },
  yacht_broker: { label: "Yacht Broker",  bg: "bg-indigo-100",  text: "text-indigo-700" },
  hq:           { label: "HQ",            bg: "bg-amber-100",   text: "text-amber-700" },
  admin:        { label: "Admin",         bg: "bg-red-100",     text: "text-red-700" },
};

const STATUS_CFG: Record<AgentStatus, { label: string; dot: string; text: string }> = {
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

function fmtMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function timeAgo(ts?: string) {
  if (!ts) return "Never";
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function AgentCommandPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/agents-proxy?path=admin/agents-list");
        if (!res.ok) throw new Error();
        const json = await res.json();
        const arr: AgentEntry[] = Array.isArray(json) ? json : json?.data ?? [];
        setAgents(arr.length > 0 ? arr : DEMO_AGENTS);
      } catch {
        setAgents(DEMO_AGENTS);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.email]);

  if (!hq) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PREMIUM_BLUE }}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-md">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
          <p className="text-slate-400 mt-2">Agent Command is restricted to HQ administrators only.</p>
        </div>
      </div>
    );
  }

  const stats = {
    total:      agents.length,
    active:     agents.filter((a) => a.status === "active").length,
    leads:      agents.reduce((s, a) => s + (a.leads_count ?? 0), 0),
    commissions: agents.reduce((s, a) => s + (a.commission_earned ?? 0), 0),
  };

  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;

  const DEMO_PERF: AgentPerf = { proposals: 8, bookings: 5, conversion_rate: 62 };

  return (
    <div className="min-h-screen p-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">🎯 Agent Command</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your agent team and performance</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm shadow-lg transition hover:opacity-90"
          style={{ background: BRAND_BLUE }}
        >
          + Add Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Agents",       value: stats.total,                icon: "👥" },
          { label: "Active",             value: stats.active,               icon: "✅" },
          { label: "Leads Assigned",     value: stats.leads,                icon: "📋" },
          { label: "Commissions Paid",   value: fmtMoney(stats.commissions),icon: "💰" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xl">{s.icon}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Agent grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">Loading agents…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((a) => {
                const roleCfg = ROLE_CFG[a.role] ?? ROLE_CFG.travel_agent;
                const statusCfg = STATUS_CFG[a.status] ?? STATUS_CFG.inactive;
                const color = avatarColor(a.name);
                const isSelected = selectedId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedId(isSelected ? null : a.id)}
                    className={`w-full text-left bg-white rounded-2xl border shadow-sm p-5 transition hover:shadow-md ${
                      isSelected ? "border-blue-400 ring-1 ring-blue-300" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
                        style={{ background: color }}
                      >
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{a.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleCfg.bg} ${roleCfg.text}`}>{roleCfg.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{a.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                          <span className={`text-xs font-semibold ${statusCfg.text}`}>{statusCfg.label}</span>
                          <span className="text-xs text-slate-400">· Active {timeAgo(a.last_active)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="text-center">
                        <p className="text-lg font-black text-slate-900">{a.leads_count}</p>
                        <p className="text-[10px] text-slate-400">Leads</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-emerald-600">{fmtMoney(a.commission_earned, a.currency)}</p>
                        <p className="text-[10px] text-slate-400">Earned</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 font-semibold">Joined</p>
                        <p className="text-xs font-bold text-slate-700">{fmtDate(a.joined)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Side panel */}
        {selectedAgent && (
          <div className="w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Agent Details</h3>
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-5">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl"
                  style={{ background: avatarColor(selectedAgent.name) }}
                >
                  {selectedAgent.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-slate-900 mt-2">{selectedAgent.name}</p>
                <p className="text-xs text-slate-500">{selectedAgent.email}</p>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Role</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ROLE_CFG[selectedAgent.role]?.bg} ${ROLE_CFG[selectedAgent.role]?.text}`}>
                    {ROLE_CFG[selectedAgent.role]?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-semibold ${STATUS_CFG[selectedAgent.status]?.text}`}>
                    {STATUS_CFG[selectedAgent.status]?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Leads</span>
                  <span className="font-bold text-slate-900">{selectedAgent.leads_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Commission</span>
                  <span className="font-bold text-emerald-600">{fmtMoney(selectedAgent.commission_earned, selectedAgent.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Active</span>
                  <span className="font-semibold text-slate-700">{timeAgo(selectedAgent.last_active)}</span>
                </div>
              </div>

              {/* Performance */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Performance</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 rounded-xl p-2">
                    <p className="font-black text-slate-900">{DEMO_PERF.proposals}</p>
                    <p className="text-[10px] text-slate-400">Proposals</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2">
                    <p className="font-black text-slate-900">{DEMO_PERF.bookings}</p>
                    <p className="text-[10px] text-slate-400">Bookings</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2">
                    <p className="font-black text-slate-900">{DEMO_PERF.conversion_rate}%</p>
                    <p className="text-[10px] text-slate-400">Conv.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button className="w-full px-3 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90" style={{ background: BRAND_BLUE }}>
                  View Full Profile
                </button>
                <button className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                  View Assigned Leads
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
