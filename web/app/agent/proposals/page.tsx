"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ACCENT_GOLD, PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT, LIGHT_BG } from "../../../src/design/tokens";

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

const MOCK: Proposal[] = [
  { id: "PR-2310", client: "Lefebvre", destination: "Lisbon", value: 8400, currency: "USD", status: "Sent", segments: ["Flights", "Hotel", "Transfers"], updatedAt: "2026-01-08T14:20:00Z", owner: "alice@zeniva.ca" },
  { id: "PR-2311", client: "NovaTech", destination: "Tokyo", value: 12600, currency: "USD", status: "Approved", segments: ["Flights", "Hotel", "Rail"], updatedAt: "2026-01-07T09:10:00Z", owner: "sara@zeniva.ca" },
  { id: "PR-2312", client: "HQ Yacht", destination: "Amalfi", value: 52000, currency: "USD", status: "Draft", segments: ["Yacht", "Chef", "Tender"], updatedAt: "2026-01-06T18:05:00Z", owner: "marco@zeniva.ca" },
  { id: "PR-2313", client: "Lavoie", destination: "New York", value: 4100, currency: "USD", status: "Booked", segments: ["Hotel", "Activities"], updatedAt: "2026-01-05T11:42:00Z", owner: "lea@zeniva.ca" },
];

const statusTheme: Record<ProposalStatus, { bg: string; text: string }> = {
  Draft: { bg: "bg-slate-100", text: "text-slate-800" },
  Sent: { bg: "bg-blue-50", text: "text-blue-700" },
  Approved: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Booked: { bg: "bg-amber-50", text: "text-amber-800" },
};

function ProposalsContent() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "All">("All");
  const [query, setQuery] = useState(() => searchParams.get("q") || "");

  useEffect(() => {
    const incoming = searchParams.get("q") || "";
    setQuery(incoming);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK.filter((p) => {
      const matchesStatus = statusFilter === "All" ? true : p.status === statusFilter;
      const matchesQuery = [p.id, p.client, p.destination].some((v) => v.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [statusFilter, query]);

  const totals = useMemo(() => {
    const base: Record<ProposalStatus, number> = { Draft: 0, Sent: 0, Approved: 0, Booked: 0 };
    MOCK.forEach((p) => { base[p.status] += 1; });
    return base;
  }, []);

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
            <span className="rounded-full bg-white px-3 py-2 text-slate-800 border border-slate-200 shadow-sm">Total {MOCK.length}</span>
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
                          store.proposals[tripId] = { tripId, title: p.destination, sections: [{ title: 'Flights', items: [] }, { title: 'Hotels', items: [] }], priceEstimate: p.value.toString(), images: [], notes: '', updatedAt: now };
                          store.selections[tripId] = { flight: null, hotel: null };
                          window.localStorage.setItem(key, JSON.stringify(store));
                          window.location.href = `/proposals/${tripId}/select`;
                        }
                      }}
                    >
                      Open
                    </button>
                    <Link
                      href="#"
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: ACCENT_GOLD, color: "#0B1228" }}
                    >
                      Share link
                    </Link>
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
            {filtered.length === 0 && (
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProposalsContent />
    </Suspense>
  );
}
