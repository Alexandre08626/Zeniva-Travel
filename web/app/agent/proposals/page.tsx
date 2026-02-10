"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ACCENT_GOLD, PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT, LIGHT_BG } from "../../../src/design/tokens";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import { useAuthStore, hasPermission } from "../../../src/lib/authStore";
import { normalizeRbacRole } from "../../../src/lib/rbac";

type ProposalStatus = "Draft" | "Sent" | "Approved" | "Booked";

type Proposal = {
  id: string;
  client: string;
  destination: string;
  value: number;
  currency: string;
  status: ProposalStatus;
  segments: string[];
  updatedAt: string;
  owner: string;
};

type ProposalRecord = {
  id: string;
  owner_email: string;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  payload?: Record<string, unknown> | null;
};

const statusTheme: Record<ProposalStatus, { bg: string; text: string }> = {
  Draft: { bg: "bg-slate-100", text: "text-slate-800" },
  Sent: { bg: "bg-blue-50", text: "text-blue-700" },
  Approved: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Booked: { bg: "bg-amber-50", text: "text-amber-800" },
};

const normalizeStatus = (value?: string | null): ProposalStatus => {
  if (value === "Sent" || value === "Approved" || value === "Booked") return value;
  return "Draft";
};

const mapRecordToProposal = (record: ProposalRecord): Proposal | null => {
  if (!record?.id) return null;
  const payload = (record.payload || {}) as Record<string, unknown>;
  const segments = Array.isArray(payload.segments) ? (payload.segments as string[]) : [];
  const status = normalizeStatus((payload.status as string) || record.status || "Draft");
  const updatedAt = String(payload.updatedAt || record.updated_at || record.created_at || new Date().toISOString());
  return {
    id: record.id,
    client: String(payload.client || payload.clientName || "Client"),
    destination: String(payload.destination || payload.title || "Destination"),
    value: Number(payload.value || payload.total || 0),
    currency: String(payload.currency || "USD"),
    status,
    segments,
    updatedAt,
    owner: String(record.owner_email || payload.owner || ""),
  };
};

function ProposalsContent() {
  const user = useAuthStore((s) => s.user);
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole((user?.roles || [])[0]);
  const canSend = user ? hasPermission(user, "send_proposal_to_client") || hasPermission(user, "sales:all") : false;
  const canViewAll = user ? hasPermission(user, "sales:all") : false;
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "All">("All");
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const incoming = searchParams.get("q") || "";
    setQuery(incoming);
  }, [searchParams]);

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (!canViewAll) params.set("ownerEmail", user.email);
        const resp = await fetch(`/api/proposals${params.toString() ? `?${params.toString()}` : ""}`, { cache: "no-store" });
        const payload = await resp.json();
        if (!resp.ok) throw new Error(payload?.error || "Failed to load proposals");
        if (!active) return;
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = rows.map(mapRecordToProposal).filter(Boolean) as Proposal[];
        setProposals(mapped);
      } catch {
        if (!active) return;
        setProposals([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user?.email, canViewAll]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return proposals.filter((p) => {
      if (effectiveRole === "yacht_broker" && !p.segments.some((seg) => seg.toLowerCase().includes("yacht"))) {
        return false;
      }
      const matchesStatus = statusFilter === "All" ? true : p.status === statusFilter;
      const matchesQuery = [p.id, p.client, p.destination].some((v) => v.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [statusFilter, query, effectiveRole, proposals]);

  const totals = useMemo(() => {
    const base: Record<ProposalStatus, number> = { Draft: 0, Sent: 0, Approved: 0, Booked: 0 };
    proposals.forEach((p) => { base[p.status] += 1; });
    return base;
  }, [proposals]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Proposals</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Pipeline of client proposals</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>See every draft, sent link, approval, and booked conversion.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white px-3 py-2 text-slate-800 border border-slate-200 shadow-sm">Total {proposals.length}</span>
            <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700 border border-blue-100">Sent {totals.Sent}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 border border-emerald-100">Approved {totals.Approved}</span>
            <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-800 border border-amber-100">Booked {totals.Booked}</span>
          </div>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {["All", "Draft", "Sent", "Approved", "Booked"].map((s) => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s as ProposalStatus | "All")}
                    className="rounded-full border px-3 py-1.5"
                    style={{
                      borderColor: active ? PREMIUM_BLUE : "#e2e8f0",
                      backgroundColor: active ? PREMIUM_BLUE : "#fff",
                      color: active ? "#fff" : TITLE_TEXT,
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search client, destination, ID"
              className="w-full md:w-72 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {loading && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Loading proposals...
              </div>
            )}
            {filtered.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{p.id} · {p.client}</div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusTheme[p.status].bg} ${statusTheme[p.status].text}`}>
                    {p.status}
                  </span>
                </div>
                <div className="text-sm" style={{ color: TITLE_TEXT }}>{p.destination}</div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold" style={{ color: MUTED_TEXT }}>
                  {p.segments.map((seg) => (
                    <span key={seg} className="rounded-full bg-slate-100 px-2 py-1">{seg}</span>
                  ))}
                </div>
                <div className="text-xs" style={{ color: MUTED_TEXT }}>
                  Updated {new Date(p.updatedAt).toLocaleString()} · Owner {p.owner}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold" style={{ color: TITLE_TEXT }}>{p.currency} {p.value.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold"
                      style={{ color: PREMIUM_BLUE }}
                      onClick={() => {
                        // Générer un vrai tripId unique et copier les infos du mock
                        if (typeof window !== 'undefined') {
                          const key = 'zeniva_trips_store_v1__guest';
                          let store: any = {};
                          try {
                            store = JSON.parse(window.localStorage.getItem(key) || '{}');
                          } catch (e) {}
                          if (!store.trips) store.trips = [];
                          if (!store.snapshots) store.snapshots = {};
                          if (!store.proposals) store.proposals = {};
                          if (!store.selections) store.selections = {};
                          // Générer un id unique
                          const tripId = 'trip-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
                          const now = new Date().toISOString();
                          store.trips.unshift({ id: tripId, title: p.destination, status: p.status, lastMessage: '', updatedAt: now, createdAt: now });
                          store.snapshots[tripId] = { departure: '', destination: p.destination, dates: '', travelers: '', budget: p.value.toString(), style: '' };
                          const sections = effectiveRole === "yacht_broker"
                            ? [{ title: 'Yacht', items: [] }]
                            : [{ title: 'Flights', items: [] }, { title: 'Hotels', items: [] }];
                          store.proposals[tripId] = { tripId, title: p.destination, sections, priceEstimate: p.value.toString(), images: [], notes: '', updatedAt: now };
                          store.selections[tripId] = { flight: null, hotel: null };
                          window.localStorage.setItem(key, JSON.stringify(store));
                          window.location.href = `/proposals/${tripId}/select`;
                        }
                      }}
                    >
                      Open
                    </button>
                    {canSend && (
                      <Link
                        href="#"
                        className="rounded-full px-3 py-1 text-xs font-bold text-white"
                        style={{ backgroundColor: ACCENT_GOLD, color: "#0B1228" }}
                      >
                        Share link
                      </Link>
                    )}
                      <button
                        className="rounded-full px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-blue-600 border-2 border-emerald-500 hover:border-blue-500 hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        style={{ minWidth: 140 }}
                        onClick={async () => {
                          try {
                            // Map agent proposal to PDF API format
                            const pdfPayload = {
                              id: p.id,
                              dossierId: p.id,
                              clientName: p.client,
                              destination: p.destination,
                              travelDates: new Date(p.updatedAt).toLocaleDateString('fr-CA'),
                              pax: 1,
                              budget: `${p.currency} ${p.value}`,
                              itinerary: p.segments,
                              totalPrice: `${p.currency} ${p.value}`,
                              createdAt: p.updatedAt,
                              status: 'draft',
                            };
                            const response = await fetch('/api/proposals/generate-pdf', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(pdfPayload)
                            });
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `Proposition-${p.client}-${p.destination}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
                              alert('✅ PDF téléchargé avec succès ! 📄');
                            } else {
                              alert('❌ Erreur lors de la génération du PDF');
                            }
                          } catch (error) {
                            alert('❌ Erreur lors du téléchargement: ' + (error instanceof Error ? error.message : String(error)));
                          }
                        }}
                      >
                        📥 Télécharger PDF
                      </button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                No proposals match your filters.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Next actions</p>
          <ul className="space-y-1 text-xs" style={{ color: MUTED_TEXT }}>
            <li>Send PR-2310 to Lefebvre after adding rail add-on.</li>
            <li>Follow up on approval signature for PR-2311 (Tokyo).</li>
            <li>Block yacht dates for PR-2312 once deposit is confirmed.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function ProposalsPage() {
  useRequireAnyPermission(["sales:all", "create_yacht_proposal"], "/agent");
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProposalsContent />
    </Suspense>
  );
}
