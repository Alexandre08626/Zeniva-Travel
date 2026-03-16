"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

type TabKey = "pending" | "approved";

interface AgentRequest {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  requested_at: string;
  phone?: string;
  motivation?: string;
}

interface ApprovedAgent {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  requested_at: string;
  ref_code?: string;
}

const ROLE_CFG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  travel_agent: { label: "Travel Agent",  bg: "bg-blue-100",   text: "text-blue-700",   icon: "✈️" },
  yacht_broker: { label: "Yacht Broker",  bg: "bg-indigo-100", text: "text-indigo-700", icon: "⛵" },
  influencer:   { label: "Influencer",    bg: "bg-purple-100", text: "text-purple-700", icon: "⭐" },
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AgentRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [pending, setPending] = useState<AgentRequest[]>([]);
  const [approved, setApproved] = useState<ApprovedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/agents-proxy?path=admin/agent-requests");
      if (r.ok) {
        const d = await r.json();
        setPending(d?.pending || []);
        setApproved(d?.approved || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { void fetchRequests(); }, []);

  if (!hq) {
    return (
      <main className="min-h-screen bg-[#F3F6FB] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center max-w-sm">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-black text-xl text-slate-900">HQ Access Only</p>
          <p className="text-slate-500 text-sm mt-2">Agent Requests is reserved for Zeniva HQ administrators.</p>
        </div>
      </main>
    );
  }

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      await fetch(`/api/agents-proxy?path=admin/agent-requests/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setSuccess(action === "approve" ? "✅ Agent approved and added to the team!" : "❌ Request rejected.");
      setTimeout(() => setSuccess(""), 4000);
      await fetchRequests();
    } catch {}
    setActionLoading(null);
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">HQ</p>
            <h1 className="text-3xl font-black text-slate-900">Agent Requests</h1>
            <p className="text-sm text-slate-500 mt-0.5">Review and approve new agents joining Zeniva Travel</p>
          </div>
          <button onClick={() => void fetchRequests()} className="rounded-full px-5 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
            🔄 Refresh
          </button>
        </header>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-3 text-sm font-semibold">{success}</div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500">⏳ Pending Review</p>
            <p className="text-4xl font-black text-amber-600 mt-1">{pending.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500">✅ Recently Approved</p>
            <p className="text-4xl font-black text-emerald-600 mt-1">{approved.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          {(["pending","approved"] as TabKey[]).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${activeTab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}>
              {t === "pending" ? `⏳ Pending (${pending.length})` : `✅ Approved (${approved.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-200" />)}
          </div>
        ) : activeTab === "pending" ? (
          pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-semibold text-slate-600">No pending requests</p>
              <p className="text-slate-400 text-sm mt-1">All agent applications have been reviewed.</p>
              <p className="text-slate-400 text-xs mt-3">New agents appear here when they sign up with a Travel Agent or Yacht Broker role on the site.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(req => {
                const rc = ROLE_CFG[req.role || ""] || { label: req.role || "Unknown", bg: "bg-slate-100", text: "text-slate-700", icon: "👤" };
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                        {req.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-slate-900 text-lg">{req.name}</p>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rc.bg} ${rc.text}`}>{rc.icon} {rc.label}</span>
                        </div>
                        <p className="text-sm text-slate-600">{req.email} {req.phone ? `· ${req.phone}` : ""}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Requested {fmtDate(req.requested_at)}</p>
                        {req.motivation && (
                          <p className="text-sm text-slate-600 mt-2 italic bg-slate-50 rounded-xl px-3 py-2">"{req.motivation}"</p>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => void handleAction(req.id, "approve")}
                          disabled={actionLoading === req.id}
                          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === req.id ? "…" : "✅ Approve"}
                        </button>
                        <button
                          onClick={() => void handleAction(req.id, "reject")}
                          disabled={actionLoading === req.id}
                          className="bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === req.id ? "…" : "✕ Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          approved.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="font-semibold text-slate-600">No recently approved agents</p>
              <p className="text-slate-400 text-sm mt-1">Agents approved in the last 30 days will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map(agent => {
                const rc = ROLE_CFG[agent.role || ""] || { label: agent.role || "Agent", bg: "bg-slate-100", text: "text-slate-700", icon: "👤" };
                return (
                  <div key={agent.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shrink-0">
                      {agent.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{agent.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rc.bg} ${rc.text}`}>{rc.icon} {rc.label}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">✅ Active</span>
                      </div>
                      <p className="text-sm text-slate-500">{agent.email}</p>
                      <p className="text-xs text-slate-400">Joined {fmtDate(agent.requested_at)}</p>
                    </div>
                    <a href={`mailto:${agent.email}`} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold hover:bg-blue-200 shrink-0">📧 Email</a>
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>
    </main>
  );
}
