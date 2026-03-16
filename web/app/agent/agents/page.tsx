"use client";
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
  personal_email?: string;
  phone?: string;
}

interface AgentDetail {
  clients: any[];
  leads: any[];
  commissions: any[];
  bookings: any[];
}

const ROLE_CFG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  travel_agent: { label: "Travel Agent", bg: "bg-blue-100", text: "text-blue-700", icon: "✈️" },
  yacht_broker: { label: "Yacht Broker", bg: "bg-indigo-100", text: "text-indigo-700", icon: "⛵" },
  hq:           { label: "HQ", bg: "bg-amber-100", text: "text-amber-700", icon: "🏢" },
  admin:        { label: "Admin", bg: "bg-red-100", text: "text-red-700", icon: "🔑" },
};

const STATUS_CFG: Record<string, { label: string; dot: string; text: string }> = {
  active:    { label: "Active",    dot: "bg-emerald-500", text: "text-emerald-600" },
  inactive:  { label: "Inactive",  dot: "bg-slate-300",   text: "text-slate-500" },
  suspended: { label: "Suspended", dot: "bg-red-400",     text: "text-red-600" },
};

const AVATAR_COLORS = ["#0F6CF5","#7C3AED","#10B981","#F59E0B","#EF4444","#EC4899","#06B6D4"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const IMPERSONATE_KEY = "zeniva_impersonating";

export default function AgentCommandPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const deleteAgent = async (agentId: string, email: string) => {
    if (!confirm(`Remove agent ${email}? They will lose agent access.`)) return;
    await fetch(`/api/agents-proxy?path=admin/agents/${agentId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer zeniva-secret-2025" },
    });
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
    setSelected(null);
    setDetail(null);
  };

  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AgentEntry | null>(null);
  const [detail, setDetail] = useState<AgentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview"|"clients"|"leads"|"commissions">("overview");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"active"|"all">("active");
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/agents-proxy?path=admin/agents-list");
      const d = await r.json();
      const agentList = d?.agents || [];

      // Ajouter HQ en tête de liste s'il n'est pas déjà là
      const alreadyHQ = agentList.some((a: any) => a.email === "info@zeniva.ca");
      if (!alreadyHQ) {
        // Charger le vrai compte de leads HQ
        let hqLeads = 0;
        try {
          const lr = await fetch("/api/agents-proxy?path=admin/leads&agent_email=info%40zeniva.ca");
          const ld = await lr.json();
          hqLeads = ld?.total || ld?.leads?.length || 0;
        } catch {}
        const hqEntry = {
          id: "hq-zeniva",
          email: "info@zeniva.ca",
          first_name: "Zeniva",
          last_name: "HQ",
          name: "Zeniva HQ",
          agent_type: "hq",
          status: "active",
          commission_rate: 30,
          ref_code: "hq",
          leads_count: hqLeads,
        };
        setAgents([hqEntry, ...agentList]);
      } else {
        setAgents(agentList);
      }
    } catch {}
    setLoading(false);
  };

  const fetchAgentDetail = async (agentEmail: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const [clientsR, leadsR, commissionsR, bookingsR] = await Promise.all([
        fetch(`/api/agents-proxy?path=admin/all-clients&agent_email=${encodeURIComponent(agentEmail)}`),
        fetch(`/api/agents-proxy?path=admin/leads&agent_email=${encodeURIComponent(agentEmail)}`),
        fetch(`/api/agents-proxy?path=admin/commissions&agent_email=${encodeURIComponent(agentEmail)}`),
        fetch(`/api/agents-proxy?path=admin/bookings&agent_email=${encodeURIComponent(agentEmail)}`),
      ]);
      const [clients, leads, commissions, bookings] = await Promise.all([
        clientsR.json().catch(() => ({ clients: [] })),
        leadsR.json().catch(() => ({ leads: [] })),
        commissionsR.json().catch(() => ({ commissions: [] })),
        bookingsR.json().catch(() => ({ bookings: [] })),
      ]);
      setDetail({
        clients: clients?.clients || [],
        leads: leads?.leads || [],
        commissions: commissions?.commissions || [],
        bookings: bookings?.bookings || [],
      });
    } catch {}
    setDetailLoading(false);
  };

  useEffect(() => { void fetchAgents(); }, []);

  // Check if we're currently impersonating
  useEffect(() => {
    if (typeof window !== "undefined") {
      const imp = localStorage.getItem(IMPERSONATE_KEY);
      setImpersonating(imp);
    }
  }, []);

  const handleImpersonate = (agent: AgentEntry) => {
    if (typeof window === "undefined") return;
    // Save original HQ email
    const original = user?.email || "";
    localStorage.setItem(IMPERSONATE_KEY, JSON.stringify({ agentEmail: agent.email, agentName: agent.name, originalEmail: original }));
    setImpersonating(agent.email);
    // Navigate to agent dashboard as this agent
    window.location.href = `/agent?impersonate=${encodeURIComponent(agent.email)}`;
  };

  const handleStopImpersonating = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(IMPERSONATE_KEY);
    setImpersonating(null);
    window.location.href = "/agent";
  };

  const openAgent360 = (agent: AgentEntry) => {
    setSelected(agent);
    setDetailTab("overview");
    void fetchAgentDetail(agent.email);
  };

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

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      {/* Impersonation banner */}
      {impersonating && (
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 text-sm font-bold text-white" style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899)" }}>
          <span>👁️ You are viewing as: <span className="underline">{JSON.parse(impersonating || "{}").agentName}</span></span>
          <button onClick={handleStopImpersonating} className="bg-white/20 hover:bg-white/30 rounded-full px-4 py-1 font-black transition-all">
            ← Return to HQ
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">HQ</p>
            <h1 className="text-3xl font-black text-slate-900">Agent Command</h1>
            <p className="text-sm text-slate-500 mt-0.5">Click any agent to see their 360° profile and switch into their account</p>
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
              <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}>
                {t === "active" ? "✅ Active" : "📋 All"}
              </button>
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
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map(agent => {
              const sc = STATUS_CFG[agent.status] || STATUS_CFG.inactive;
              const rc = ROLE_CFG[agent.agent_type] || { label: agent.agent_type, bg: "bg-slate-100", text: "text-slate-700", icon: "👤" };
              const initials = agent.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div
                  key={agent.id}
                  onClick={() => openAgent360(agent)}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all p-5 cursor-pointer ${selected?.id === agent.id ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`}
                >
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
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rc.bg} ${rc.text}`}>{rc.icon} {rc.label}</span>
                    <span className="text-xs text-slate-500">🎯 {agent.leads_count} leads</span>
                    <span className="text-xs text-slate-500">💰 {agent.commission_rate}%</span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={e => { e.stopPropagation(); openAgent360(agent); }}
                      className="flex-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl font-semibold hover:bg-blue-100 transition-all"
                    >
                      👁️ View 360°
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleImpersonate(agent); }}
                      className="flex-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl font-semibold hover:bg-purple-100 transition-all"
                    >
                      🔀 Switch Account
                    </button>
                    {hq && agent.id !== "hq-zeniva" && (
                      <button
                        onClick={e => { e.stopPropagation(); void deleteAgent(agent.id, agent.email); }}
                        className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-xl font-semibold hover:bg-red-100 transition-all"
                        title="Remove agent"
                      >🗑️</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agent 360° Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 px-6 py-5 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0" style={{ background: avatarColor(selected.name) }}>
                  {selected.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{selected.name}</h2>
                    <div className={`w-2 h-2 rounded-full ${STATUS_CFG[selected.status]?.dot || "bg-slate-300"}`} />
                  </div>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                </div>
                <button
                  onClick={() => handleImpersonate(selected)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                >
                  🔀 Switch to Account
                </button>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-light ml-2">✕</button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 bg-slate-100 rounded-xl p-1">
                {(["overview","clients","leads","commissions"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setDetailTab(t)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold capitalize transition-all ${detailTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {t === "overview" ? "📊 Overview" : t === "clients" ? "👥 Clients" : t === "leads" ? "🎯 Leads" : "💰 Commissions"}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {detailLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <>
                  {detailTab === "overview" && (
                    <div className="space-y-4">
                      {/* Info cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Role", value: (ROLE_CFG[selected.agent_type]?.icon || "👤") + " " + (ROLE_CFG[selected.agent_type]?.label || selected.agent_type) },
                          { label: "Commission", value: `${selected.commission_rate}%` },
                          { label: "Clients", value: detail?.clients?.length ?? "—" },
                          { label: "Leads", value: detail?.leads?.length ?? "—" },
                          { label: "Bookings", value: detail?.bookings?.length ?? "—" },
                          { label: "Commissions earned", value: detail?.commissions?.length ? `$${detail.commissions.reduce((s: number, c: any) => s + (c.amount || 0), 0).toLocaleString()}` : "$0" },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className="font-black text-slate-900 text-lg">{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Contact */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</p>
                        <p className="text-sm text-slate-700">📧 {selected.email}</p>
                        {selected.personal_email && <p className="text-sm text-slate-700">📬 {selected.personal_email}</p>}
                        {selected.phone && <p className="text-sm text-slate-700">📱 {selected.phone}</p>}
                        {selected.ref_code && <p className="text-sm font-mono text-slate-500">🔗 Ref: {selected.ref_code}</p>}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <a href={`mailto:${selected.email}`} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all">
                          📧 Email Agent
                        </a>
                        <button
                          onClick={() => handleImpersonate(selected)}
                          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                        >
                          🔀 Switch to Account
                        </button>
                        {selected.status === "active" ? (
                          <button
                            onClick={() => void handleStatus(selected.id, "inactive")}
                            disabled={actionLoading === selected.id}
                            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all col-span-2"
                          >
                            ⏸ Deactivate Agent
                          </button>
                        ) : (
                          <button
                            onClick={() => void handleStatus(selected.id, "active")}
                            disabled={actionLoading === selected.id}
                            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all col-span-2"
                          >
                            ▶ Activate Agent
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {detailTab === "clients" && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-500">{detail?.clients?.length || 0} clients with accounts</p>
                      {!detail?.clients?.length ? (
                        <div className="text-center py-8 text-slate-400">No clients yet</div>
                      ) : detail?.clients?.map((c: any) => (
                        <div key={c.id || c.email} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: avatarColor(c.name || c.email) }}>
                            {(c.name || c.email || "?")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{c.name || "—"}</p>
                            <p className="text-xs text-slate-500 truncate">{c.email}</p>
                          </div>
                          {c.destination && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">✈️ {c.destination}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {detailTab === "leads" && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-500">{detail?.leads?.length || 0} leads in pipeline</p>
                      {!detail?.leads?.length ? (
                        <div className="text-center py-8 text-slate-400">No leads assigned yet</div>
                      ) : detail?.leads?.slice(0, 20).map((l: any) => (
                        <div key={l.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: avatarColor((l.first_name || "") + (l.last_name || "")) }}>
                            {(l.first_name || l.email || "?")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{l.first_name} {l.last_name}</p>
                            <p className="text-xs text-slate-500 truncate">{l.email}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${l.status === "client" ? "bg-green-100 text-green-700" : l.status === "new" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                            {l.status || "new"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {detailTab === "commissions" && (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Total Earned</p>
                        <p className="text-3xl font-black text-emerald-700 mt-1">
                          ${detail?.commissions?.reduce((s: number, c: any) => s + (c.amount || 0), 0).toLocaleString() || "0"}
                        </p>
                      </div>
                      {!detail?.commissions?.length ? (
                        <div className="text-center py-8 text-slate-400">No commissions yet</div>
                      ) : detail?.commissions?.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{c.client_name || "Client"}</p>
                            <p className="text-xs text-slate-500">{c.trip_name || "Trip"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-600">${(c.amount || 0).toLocaleString()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{c.status || "pending"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
