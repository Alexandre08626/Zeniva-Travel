"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";
const ACCENT_GOLD = "#E6B85A";

type ProposalStatus = "Draft" | "Ready" | "Sent" | "Accepted" | "Rejected" | "Expired" | "pending" | "accepted" | "rejected" | "expired";

interface Proposal {
  id: string;
  trip_id: string;
  owner_email: string;
  client_email?: string;
  destination: string;
  title?: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  payload?: {
    tripDraft?: {
      destination?: string;
      departureCity?: string;
      checkIn?: string;
      checkOut?: string;
      adults?: number;
      budget?: number;
    };
    client?: { id?: string; name?: string; email?: string; phone?: string };
    clients?: { id?: string; name?: string; email?: string; phone?: string; isLead?: boolean }[];
    pricing?: { subtotal?: number; serviceFee?: number; total?: number };
    selections?: Record<string, unknown>;
    source?: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  Draft:    { label: "Draft",    bg: "bg-slate-100",   text: "text-slate-600" },
  Ready:    { label: "Ready",    bg: "bg-blue-100",    text: "text-blue-700" },
  Sent:     { label: "Sent",     bg: "bg-amber-100",   text: "text-amber-700" },
  Accepted: { label: "Accepted", bg: "bg-emerald-100", text: "text-emerald-700" },
  Rejected: { label: "Rejected", bg: "bg-red-100",     text: "text-red-700" },
  Expired:  { label: "Expired",  bg: "bg-slate-100",   text: "text-slate-500" },
  pending:  { label: "Pending",  bg: "bg-amber-100",   text: "text-amber-700" },
  accepted: { label: "Accepted", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Rejected", bg: "bg-red-100",     text: "text-red-700" },
  expired:  { label: "Expired",  bg: "bg-slate-100",   text: "text-slate-500" },
};

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function TripIdRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get("tripId");
  useEffect(() => {
    if (tripIdParam) router.replace(`/agent/proposals/select/${tripIdParam}`);
  }, [tripIdParam, router]);
  return null;
}

export default function ProposalsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from Supabase — filter by owner email for non-HQ users
      const params = new URLSearchParams();
      if (!hq && user?.email) params.set("ownerEmail", user.email);
      const res = await fetch(`/api/proposals?${params.toString()}`);
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

  const updateStatus = async (tripId: string, status: "Accepted" | "Rejected") => {
    setActionLoading(tripId + status);
    try {
      // Update directly in Supabase via /api/proposals POST (upsert)
      await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tripId,
          ownerEmail: user?.email || "agent@zeniva.ca",
          status,
        }),
      });
      await fetchProposals();
    } catch {
      // graceful
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (tripId: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(tripId) ? n.delete(tripId) : n.add(tripId); return n; });
  };

  const toggleSelectAll = () => {
    if (selected.size === proposals.length) setSelected(new Set());
    else setSelected(new Set(proposals.map(p => p.trip_id || p.id)));
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} proposal${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setDeleting(true);
    const ids = Array.from(selected);
    await Promise.all(ids.map(id =>
      fetch(`/api/proposals?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {})
    ));
    setProposals(prev => prev.filter(p => !selected.has(p.trip_id) && !selected.has(p.id)));
    setSelected(new Set());
    setSelectMode(false);
    setDeleting(false);
  };

  // Extract useful fields from payload
  const getClientName = (p: Proposal) => {
    if (p.payload?.client?.name) return p.payload.client.name;
    if (p.payload?.clients?.[0]?.name) return p.payload.clients[0].name;
    return p.client_email || "—";
  };

  const getClientEmail = (p: Proposal) => {
    if (p.payload?.client?.email) return p.payload.client.email;
    if (p.payload?.clients?.[0]?.email) return p.payload.clients[0].email;
    return p.client_email || "";
  };

  const getAmount = (p: Proposal) => {
    return p.payload?.pricing?.total || p.payload?.pricing?.subtotal || 0;
  };

  const getDestination = (p: Proposal) => {
    return p.destination || p.payload?.tripDraft?.destination || "—";
  };

  const getClients = (p: Proposal) => {
    if (p.payload?.clients && p.payload.clients.length > 0) return p.payload.clients;
    if (p.payload?.client) return [p.payload.client];
    return [];
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter((p) => ["Ready", "Sent", "pending", "Draft"].includes(p.status)).length,
    accepted: proposals.filter((p) => ["Accepted", "accepted"].includes(p.status)).length,
    value: proposals.reduce((s, p) => s + getAmount(p), 0),
  };

  return (
    <div className="min-h-screen p-6" style={{ background: PREMIUM_BLUE }}>
      <Suspense fallback={null}><TripIdRedirect /></Suspense>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Proposals</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track your client proposals</p>
        </div>
        <div className="flex items-center gap-2">
          {!selectMode ? (
            <button
              onClick={() => { setSelectMode(true); setSelected(new Set()); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 transition"
            >
              ☑️ Select
            </button>
          ) : (
            <>
              <span className="text-xs text-white/60 font-semibold">{selected.size} selected</span>
              <button onClick={toggleSelectAll} className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 transition">
                {selected.size === proposals.length ? "Deselect All" : "Select All"}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selected.size === 0 || deleting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-40"
              >
                {deleting ? "Deleting..." : `🗑️ Delete (${selected.size})`}
              </button>
              <button onClick={() => { setSelectMode(false); setSelected(new Set()); }} className="px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition">
                Cancel
              </button>
            </>
          )}
          <Link
            href="/agent/trip-search"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm shadow-lg transition hover:opacity-90"
            style={{ background: BRAND_BLUE }}
          >
            + New Proposal
          </Link>
        </div>
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
          <div className="flex items-center justify-center py-16 text-slate-400">Loading proposals...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-xl font-bold text-slate-700">No proposals yet</p>
            <p className="text-slate-400 mt-2">Create your first one to get started</p>
            <Link
              href="/agent/trip-search"
              className="mt-6 inline-block px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: BRAND_BLUE }}
            >
              + New Proposal
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {proposals.map((p) => {
              const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.Draft;
              const isOpen = expandedId === p.trip_id;
              const clientName = getClientName(p);
              const clientEmail = getClientEmail(p);
              const amount = getAmount(p);
              const destination = getDestination(p);
              const clients = getClients(p);
              const checkIn = p.payload?.tripDraft?.checkIn;
              const checkOut = p.payload?.tripDraft?.checkOut;

              return (
                <div key={p.trip_id || p.id} className="border border-slate-100 rounded-xl overflow-hidden">
                  <div
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => selectMode ? toggleSelect(p.trip_id || p.id) : setExpandedId(isOpen ? null : p.trip_id)}
                  >
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={selected.has(p.trip_id) || selected.has(p.id)}
                        onChange={() => toggleSelect(p.trip_id || p.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{clientName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600 text-sm">{destination}</span>
                        {(p.payload as any)?.source === "catalog" && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Catalog</span>
                        )}
                        {clients.length > 1 && (
                          <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                            +{clients.length - 1} more
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {fmtDate(checkIn)} – {fmtDate(checkOut)} · Created {fmtDate(p.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {amount > 0 && <span className="font-bold text-slate-900">{fmtMoney(amount)}</span>}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                      <span className="text-slate-400">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Client</p>
                          <p className="text-sm text-slate-800 mt-0.5">{clientName}</p>
                          {clientEmail && <p className="text-xs text-slate-500">{clientEmail}</p>}
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Destination</p>
                          <p className="text-sm text-slate-800 mt-0.5">{destination}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Dates</p>
                          <p className="text-sm text-slate-800 mt-0.5">{fmtDate(checkIn)} – {fmtDate(checkOut)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Amount</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{amount > 0 ? fmtMoney(amount) : "—"}</p>
                        </div>
                      </div>

                      {/* All assigned clients/leads */}
                      {clients.length > 1 && (
                        <div className="mb-4">
                          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Assigned To ({clients.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {clients.map((c, i) => (
                              <div key={i} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${c.isLead ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"}`}>
                                <span>{c.isLead ? "Lead" : "Client"}</span>
                                <span className="font-bold">{c.name || c.email}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Catalog items (if from catalog) */}
                      {(p.payload as any)?.catalogItems && (
                        <div className="mb-4">
                          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Catalog Items</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {((p.payload as any).catalogItems as any[]).map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-slate-200">
                                {item.thumbnail && <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                                  <p className="text-[10px] text-slate-400">{item.location}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                      item.type === "ZeniStay" ? "bg-amber-100 text-amber-700" :
                                      item.type === "ZeniYacht" ? "bg-blue-100 text-blue-700" :
                                      "bg-emerald-100 text-emerald-700"
                                    }`}>{item.type}</span>
                                    {item.price && <span className="text-[10px] font-bold text-slate-600">{item.price}</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {["Ready", "Sent", "pending", "Draft"].includes(p.status) && (
                          <>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => updateStatus(p.trip_id, "Accepted")}
                              className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-50"
                            >
                              Mark Accepted
                            </button>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => updateStatus(p.trip_id, "Rejected")}
                              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                            >
                              Mark Rejected
                            </button>
                          </>
                        )}
                        <Link href={`/agent/proposals/preview/${p.trip_id}`} className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition">
                          Preview
                        </Link>
                        <Link href={`/agent/proposals/select/${p.trip_id}`} className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition">
                          Edit
                        </Link>
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
