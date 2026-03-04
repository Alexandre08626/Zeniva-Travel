"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";

type RequestStatus = "pending" | "approved" | "rejected";
type AgentRole = "travel_agent" | "yacht_broker";

interface AgentRequest {
  id: string;
  name: string;
  email: string;
  role: AgentRole | null;
  status: RequestStatus;
  code?: string | null;
  note?: string | null;
  requested_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  motivation?: string;
}

const DEMO_REQUESTS: AgentRequest[] = [
  { id: "r1", name: "Marie Dubois", email: "marie.dubois@gmail.com", role: "travel_agent", status: "pending", requested_at: "2025-03-03T10:00:00Z", motivation: "I have 5 years of experience as a travel consultant and want to join Zeniva to serve luxury clients." },
  { id: "r2", name: "James Thornton", email: "j.thornton@outlook.com", role: "yacht_broker", status: "pending", requested_at: "2025-03-04T14:30:00Z", motivation: "Specialized in Mediterranean yacht charters. Looking to expand my client base through Zeniva." },
  { id: "r3", name: "Priya Sharma", email: "priya.s@hotmail.com", role: "travel_agent", status: "approved", requested_at: "2025-02-25T09:00:00Z", reviewed_at: "2025-02-26T11:00:00Z", reviewed_by: "info@zenivatravel.com" },
  { id: "r4", name: "Thomas Klein", email: "thomas.klein@web.de", role: "travel_agent", status: "rejected", requested_at: "2025-02-20T16:00:00Z", reviewed_at: "2025-02-21T09:00:00Z", reviewed_by: "info@zenivatravel.com", note: "Profile incomplete. Missing certifications." },
];

const ROLE_CFG: Record<string, { label: string; bg: string; text: string }> = {
  travel_agent: { label: "Travel Agent",  bg: "bg-blue-100",   text: "text-blue-700" },
  yacht_broker: { label: "Yacht Broker",  bg: "bg-indigo-100", text: "text-indigo-700" },
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type TabKey = "pending" | "approved" | "rejected";

export default function AgentRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents-proxy?path=admin/agent-requests");
      if (!res.ok) throw new Error();
      const json = await res.json();
      const arr: AgentRequest[] = Array.isArray(json) ? json : json?.data ?? [];
      setRequests(arr.length > 0 ? arr : DEMO_REQUESTS);
    } catch {
      setRequests(DEMO_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchRequests(); }, [user?.email]);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setActionLoading(id + action);
    try {
      await fetch(`/api/agents-proxy?path=admin/agent-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, reviewed_by: user?.email }),
      });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: action, reviewed_by: user?.email ?? "", reviewed_at: new Date().toISOString() } : r));
    } catch {
      // graceful
    } finally {
      setActionLoading(null);
    }
  };

  if (!hq) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PREMIUM_BLUE }}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-md">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
          <p className="text-slate-400 mt-2">Agent Requests is restricted to HQ administrators only.</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "pending",  label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  const filtered = requests.filter((r) => r.status === activeTab);

  return (
    <div className="min-h-screen p-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">📨 Agent Requests</h1>
        <p className="text-slate-400 text-sm mt-1">Review and manage agent onboarding requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tabs.map((t) => (
          <div key={t.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xl font-black text-slate-900">{requests.filter((r) => r.status === t.key).length}</p>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === t.key ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {t.label} ({requests.filter((r) => r.status === t.key).length})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading requests…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-bold text-slate-700 text-lg">No {activeTab} requests</p>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === "pending" ? "All caught up! No pending requests." : `No ${activeTab} requests yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => {
              const roleCfg = ROLE_CFG[req.role ?? "travel_agent"] ?? ROLE_CFG.travel_agent;
              return (
                <div key={req.id} className="border border-slate-100 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{req.name}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${roleCfg.bg} ${roleCfg.text}`}>{roleCfg.label}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{req.email}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Submitted {fmtDate(req.requested_at)}</p>
                        {req.motivation && (
                          <p className="text-sm text-slate-600 mt-2 italic">"{req.motivation}"</p>
                        )}
                        {req.note && (
                          <p className="text-xs text-red-500 mt-1">Note: {req.note}</p>
                        )}
                        {req.reviewed_by && (
                          <p className="text-xs text-slate-400 mt-1">Reviewed by {req.reviewed_by} · {fmtDate(req.reviewed_at)}</p>
                        )}
                      </div>
                    </div>

                    {activeTab === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          disabled={!!actionLoading}
                          onClick={() => void handleAction(req.id, "approved")}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition disabled:opacity-50"
                        >
                          ✅ Approve
                        </button>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => void handleAction(req.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                        >
                          ❌ Reject
                        </button>
                        <button className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                          👁 View
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
