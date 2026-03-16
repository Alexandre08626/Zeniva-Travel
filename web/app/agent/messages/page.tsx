"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

const VPS = "https://vmi3097009.contaboserver.net";
const HDR = { Authorization: "Bearer zeniva-secret-2025", "Content-Type": "application/json" };

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  message?: string;
  status: string;
  created_at: string;
  source?: string;
  budget?: string;
  travel_dates?: string;
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  new:         { label: "New",       color: "bg-blue-100 text-blue-700" },
  contacted:   { label: "Contacted", color: "bg-yellow-100 text-yellow-700" },
  qualified:   { label: "Qualified", color: "bg-green-100 text-green-700" },
  booked:      { label: "Booked",    color: "bg-emerald-100 text-emerald-700" },
  closed:      { label: "Closed",    color: "bg-gray-100 text-gray-500" },
};

function fmtDate(d: string) {
  if (!d) return "";
  const dt = new Date(d);
  const now = new Date();
  const diffH = (now.getTime() - dt.getTime()) / 3600000;
  if (diffH < 24) return dt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  if (diffH < 168) return dt.toLocaleDateString("fr-CA", { weekday: "short", hour: "2-digit", minute: "2-digit" });
  return dt.toLocaleDateString("fr-CA", { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "qualified">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${VPS}/admin/leads?limit=100`, { headers: HDR });
      const d = await r.json();
      setLeads(d || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const deleteLead = async (id: string) => {
    // Optimistic remove
    setLeads(prev => prev.filter(l => l.id !== id));
    setConfirmDelete(null);
    setExpanded(null);
    try {
      await fetch(`${VPS}/admin/leads/${id}`, { method: "DELETE", headers: HDR });
    } catch {}
  };

  const updateStatus = async (id: string, status: string) => {
    setStatusLoading(id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    try {
      await fetch(`${VPS}/admin/leads/${id}`, {
        method: "PATCH",
        headers: HDR,
        body: JSON.stringify({ status }),
      });
    } catch {}
    setStatusLoading(null);
  };

  const filtered = leads.filter(l => {
    if (filter === "all") return l.status !== "closed";
    return l.status === filter;
  });

  const newCount = leads.filter(l => l.status === "new").length;

  return (
    <div className="max-w-3xl mx-auto py-6 px-3 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">📩 Reservation Requests</h1>
          {newCount > 0 && (
            <p className="text-sm text-blue-600 font-semibold mt-0.5">{newCount} new request{newCount > 1 ? "s" : ""}</p>
          )}
        </div>
        <button onClick={fetchLeads} className="px-3 py-2 text-sm rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold">
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {(["all", "new", "contacted", "qualified"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 whitespace-nowrap py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition ${filter === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            {f === "all" ? "All active" : f === "new" ? `🔵 New ${newCount > 0 ? `(${newCount})` : ""}` : f === "contacted" ? "Contacted" : "Qualified"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading requests…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <div className="text-sm">No reservation requests</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(lead => {
            const isExpanded = expanded === lead.id;
            const isDeleting = confirmDelete === lead.id;
            const cfg = STATUS_CFG[lead.status] || STATUS_CFG["new"];

            return (
              <div key={lead.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${lead.status === "new" ? "border-blue-200 shadow-sm" : "border-gray-200"}`}>
                {/* Main row */}
                <div className="flex items-start gap-3 p-3.5">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(lead.name || "?")[0].toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : lead.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{lead.name || "Unknown"}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      {lead.status === "new" && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {lead.destination ? `✈️ ${lead.destination}` : ""}{lead.destination && lead.message ? " · " : ""}{lead.message?.slice(0, 60) || lead.email}
                      {lead.message && lead.message.length > 60 ? "…" : ""}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {fmtDate(lead.created_at)}{lead.source ? ` · ${lead.source}` : ""}
                    </div>
                  </div>

                  {/* Delete button */}
                  <div className="shrink-0 flex items-center gap-1">
                    {!isDeleting ? (
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(lead.id); setExpanded(lead.id); }}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                        🗑️
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => deleteLead(lead.id)}
                          className="px-2.5 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                          Delete
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-3.5 pb-3.5 pt-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
                      <div><span className="text-gray-400">Email</span><br /><a href={`mailto:${lead.email}`} className="text-blue-600 font-medium">{lead.email || "—"}</a></div>
                      <div><span className="text-gray-400">Phone</span><br /><a href={`tel:${lead.phone}`} className="text-blue-600 font-medium">{lead.phone || "—"}</a></div>
                      {lead.destination && <div><span className="text-gray-400">Destination</span><br /><span className="font-medium text-gray-800">✈️ {lead.destination}</span></div>}
                      {lead.travel_dates && <div><span className="text-gray-400">Dates</span><br /><span className="font-medium text-gray-800">{lead.travel_dates}</span></div>}
                      {lead.budget && <div><span className="text-gray-400">Budget</span><br /><span className="font-medium text-gray-800">${lead.budget}</span></div>}
                    </div>
                    {lead.message && (
                      <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 mb-3">
                        {lead.message}
                      </div>
                    )}
                    {/* Status changer */}
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-xs text-gray-500 self-center mr-1">Move to:</span>
                      {["contacted", "qualified", "booked", "closed"].map(s => (
                        <button key={s} onClick={() => updateStatus(lead.id, s)}
                          disabled={statusLoading === lead.id || lead.status === s}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${lead.status === s ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"} disabled:opacity-50`}>
                          {statusLoading === lead.id ? "…" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                      <a href={`mailto:${lead.email}?subject=Your trip request — Zeniva Travel`}
                        className="ml-auto px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                        ✉️ Reply by email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
