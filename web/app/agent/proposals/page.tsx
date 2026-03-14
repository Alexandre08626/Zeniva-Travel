"use client";

import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";
const ACCENT_GOLD = "#E6B85A";

type ProposalStatus = "pending" | "accepted" | "rejected" | "expired";

interface Proposal {
  id: string;
  client_name: string;
  client_email?: string;
  destination: string;
  trip_start?: string;
  trip_end?: string;
  amount: number;
  currency: string;
  status: ProposalStatus;
  created_at: string;
  notes?: string;
  agent_email?: string;
}

const STATUS_CONFIG: Record<ProposalStatus, { label: string; bg: string; text: string }> = {
  pending:  { label: "Pending",  bg: "bg-amber-100",  text: "text-amber-700" },
  accepted: { label: "Accepted", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Rejected", bg: "bg-red-100",    text: "text-red-700" },
  expired:  { label: "Expired",  bg: "bg-slate-100",  text: "text-slate-500" },
};

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export default function ProposalsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ path: "admin/proposals" });
      if (!hq && user?.email) params.append("agent_email", user.email);
      const res = await fetch(`/api/agents-proxy?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr: Proposal[] = Array.isArray(json) ? json : json?.data ?? [];
      setProposals(arr);
    } catch (err) {
      setError("Could not load proposals.");
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchProposals(); }, [user?.email]);

  const updateStatus = async (id: string, status: "accepted" | "rejected") => {
    setActionLoading(id + status);
    try {
      await fetch(`/api/agents-proxy?path=admin/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchProposals();
    } catch {
      // graceful
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status === "pending").length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
    value: proposals.reduce((s, p) => s + (p.amount ?? 0), 0),
  };

  return (
    <div className="min-h-screen p-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">📋 Proposals</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track your client proposals</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm shadow-lg transition hover:opacity-90"
          style={{ background: BRAND_BLUE }}
        >
          + New Proposal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: "📋" },
          { label: "Pending", value: stats.pending, icon: "⏳" },
          { label: "Accepted", value: stats.accepted, icon: "✅" },
          { label: "Total Value", value: fmtMoney(stats.value), icon: "💰" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xl">{s.icon}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">Loading proposals…</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-xl font-bold text-slate-700">No proposals yet</p>
            <p className="text-slate-400 mt-2">Create your first one to get started</p>
            <button
              className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: BRAND_BLUE }}
            >
              + New Proposal
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {proposals.map((p) => {
              const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending;
              const isOpen = expandedId === p.id;
              return (
                <div key={p.id} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition"
                    onClick={() => setExpandedId(isOpen ? null : p.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{p.client_name || "Unknown client"}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600 text-sm">{p.destination || "—"}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {fmtDate(p.trip_start)} – {fmtDate(p.trip_end)} · Created {fmtDate(p.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-slate-900">{fmtMoney(p.amount, p.currency)}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                      <span className="text-slate-400">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Client Email</p>
                          <p className="text-sm text-slate-800 mt-0.5">{p.client_email || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Destination</p>
                          <p className="text-sm text-slate-800 mt-0.5">{p.destination || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Dates</p>
                          <p className="text-sm text-slate-800 mt-0.5">{fmtDate(p.trip_start)} – {fmtDate(p.trip_end)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Amount</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{fmtMoney(p.amount, p.currency)}</p>
                        </div>
                      </div>
                      {p.notes && (
                        <div className="mb-4 p-3 bg-white rounded-xl border border-slate-200">
                          <p className="text-xs text-slate-400 font-semibold mb-1">Notes</p>
                          <p className="text-sm text-slate-700">{p.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {p.status === "pending" && (
                          <>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => updateStatus(p.id, "accepted")}
                              className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-50"
                            >
                              ✅ Mark Accepted
                            </button>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => updateStatus(p.id, "rejected")}
                              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                            >
                              ❌ Mark Rejected
                            </button>
                          </>
                        )}
                        <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                          📄 Duplicate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
