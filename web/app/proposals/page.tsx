"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD } from "../../src/design/tokens";
import { useTripsStore, deleteTrip } from "../../lib/store/tripsStore";

function formatDate(value?: string) {
  if (!value) return "Saved now";
  try {
    return new Date(value).toLocaleString();
  } catch (_) {
    return value;
  }
}

function statusPill(status: string) {
  const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold";
  switch (status) {
    case "Ready":
      return `${base} bg-green-50`;
    case "Paid":
      return `${base} bg-amber-50`;
    default:
      return `${base} bg-slate-100`;
  }
}

export default function ProposalsPage() {
  const { proposals, trips, snapshots, selections } = useTripsStore((s) => ({
    proposals: s.proposals,
    trips: s.trips,
    snapshots: s.snapshots,
    selections: s.selections,
  }));

  const list = useMemo(() => {
    return Object.entries(proposals)
      .map(([tripId, proposal]: [string, any]) => {
        const trip = trips.find((t: any) => t.id === tripId);
        const snap = snapshots[tripId] || {};
        const sel = selections[tripId] || {};
        const status = trip?.status || "Draft";
        const updatedAt = proposal?.updatedAt || trip?.updatedAt;
        const createdAt = trip?.createdAt || trip?.updatedAt;
        const hasSelection = !!(sel.flight || sel.hotel);
        const destination = snap.destination || proposal?.title || "Destination";
        return {
          tripId,
          title: proposal?.title || trip?.title || "Trip",
          destination,
          status,
          createdAt,
          updatedAt,
          hasSelection,
        };
      })
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [proposals, trips, snapshots, selections]);

  const empty = list.length === 0;

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-[1100px] px-5 pb-14 pt-6 space-y-8">
        <Header isLoggedIn={false} />

        <section className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${PREMIUM_BLUE} 0%, ${ACCENT_GOLD} 100%)`, opacity: 0.12 }}
          />
          <div className="relative flex flex-col gap-3 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proposals & booking</p>
              <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Your saved trips</h1>
              <p className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
                Lina keeps every proposal here. Pick up where you left off and finish booking in minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/chat"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm"
                style={{ color: TITLE_TEXT }}
              >
                Start a new trip
              </Link>
              <Link
                href="/proposals"
                className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm"
                style={{ backgroundColor: PREMIUM_BLUE }}
              >
                View all
              </Link>
            </div>
          </div>
        </section>

        {empty ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center shadow-sm">
            <div className="text-xl font-black" style={{ color: TITLE_TEXT }}>No proposals yet</div>
            <p className="mt-2 text-sm font-semibold" style={{ color: MUTED_TEXT }}>
              Chat with Lina to generate your first proposal. Every draft, selection, and price lives here.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                href="/chat"
                className="rounded-full px-5 py-2 text-sm font-bold text-white"
                style={{ backgroundColor: PREMIUM_BLUE }}
              >
                Chat with Lina
              </Link>
              <Link
                href="/collections/resort"
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold"
                style={{ color: TITLE_TEXT }}
              >
                Browse ideas
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((p) => {
              const resumeHref = p.hasSelection ? `/proposals/${p.tripId}/review` : `/proposals/${p.tripId}/select`;
              return (
                <div
                  key={p.tripId}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>{p.title}</span>
                    <span className={statusPill(p.status)} style={{ color: TITLE_TEXT }}>{p.status}</span>
                    {p.hasSelection && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                        Ready to book
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
                    {p.destination}
                  </div>
                  <div className="text-xs" style={{ color: MUTED_TEXT }}>
                    Created: {formatDate(p.createdAt)} · Last update: {formatDate(p.updatedAt)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={resumeHref}
                      className="rounded-full px-4 py-2 text-sm font-bold text-white"
                      style={{ backgroundColor: PREMIUM_BLUE }}
                    >
                      Continue booking
                    </Link>
                    <button
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (!confirm('Supprimer cette proposition ? Cette action est irréversible.')) return;
                        deleteTrip(p.tripId);
                      }}
                    >
                      Supprimer
                    </button>
                      <button
                        className="rounded-full px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-blue-600 border-2 border-emerald-500 hover:border-blue-500 hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        style={{ minWidth: 140 }}
                        onClick={async () => {
                          try {
                            // Get the full proposal data
                            const proposal = proposals[p.tripId];
                            const trip = trips.find((t: any) => t.id === p.tripId);
                            const snap = snapshots[p.tripId] || {};
                            
                            // Construct the proposal data for PDF
                            const pdfData = {
                              id: p.tripId,
                              dossierId: `DOS-${p.tripId.slice(-6).toUpperCase()}`,
                              clientName: "Client", // You might want to get this from user data
                              destination: snap.destination || proposal?.title || "Destination",
                              travelDates: snap.dates || "Dates not specified",
                              pax: snap.travelers || 2,
                              budget: snap.budget || "Budget not specified",
                              itinerary: proposal?.sections ? proposal.sections.map((s: any) => s.content || s.title || "Activity").filter(Boolean) : ["Itinerary not available"],
                              totalPrice: proposal?.priceEstimate || "Price on request",
                              createdAt: proposal?.updatedAt || trip?.createdAt || new Date().toISOString(),
                              status: "ready" as const,
                              shortlist: [] // You can populate this if you have shortlist data
                            };

                            const response = await fetch('/api/proposals/generate-pdf', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(pdfData)
                            });
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `Proposition-${p.title}-${p.destination}.pdf`;
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
              );
            })}
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
