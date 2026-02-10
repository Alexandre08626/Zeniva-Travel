"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD } from "../../src/design/tokens";
import { useTripsStore, deleteTrip, createTrip, updateSnapshot, applyTripPatch, generateProposal, setProposalSelection } from "../../lib/store/tripsStore";
import { useAuthStore } from "../../src/lib/authStore";

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
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const userEmail = user?.email || "";
  const hasSyncedRef = useRef(false);
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [remoteList, setRemoteList] = useState<any[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const { proposals, trips, snapshots, selections, tripDrafts } = useTripsStore((s) => ({
    proposals: s.proposals,
    trips: s.trips,
    snapshots: s.snapshots,
    selections: s.selections,
    tripDrafts: s.tripDrafts,
  }));

  const localList = useMemo(() => {
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
        const coverImage = proposal?.images?.[0] || snap?.image || "/branding/icon-proposals.svg";
        return {
          tripId,
          title: proposal?.title || trip?.title || "Trip",
          destination,
          status,
          createdAt,
          updatedAt,
          hasSelection,
          coverImage,
          travelers: snap.travelers,
          dates: snap.dates,
          budget: snap.budget,
          style: snap.style,
          accommodationType: snap.accommodationType,
          transportationType: snap.transportationType,
          departureCity: snap.departure || snap.departureCity,
        };
      })
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [proposals, trips, snapshots, selections]);

  const list = useMemo(() => {
    return remoteList.length ? remoteList : localList;
  }, [remoteList, localList]);

  const empty = list.length === 0;

  const buildPayloadFromLocal = (entry: any) => ({
    tripId: entry.tripId,
    title: entry.title,
    destination: entry.destination,
    status: entry.status,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    hasSelection: entry.hasSelection,
    coverImage: entry.coverImage,
    travelers: entry.travelers,
    dates: entry.dates,
    budget: entry.budget,
    style: entry.style,
    accommodationType: entry.accommodationType,
    transportationType: entry.transportationType,
    departureCity: entry.departureCity,
  });

  useEffect(() => {
    if (!userEmail) return;
    let active = true;
    const loadRemote = async () => {
      setLoadingRemote(true);
      try {
        const resp = await fetch(`/api/proposals?ownerEmail=${encodeURIComponent(userEmail)}`, { cache: "no-store" });
        const payload = await resp.json();
        if (!resp.ok) throw new Error(payload?.error || "Failed to load proposals");
        if (!active) return;
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = rows
          .map((row: any) => ({
            ...(row?.payload || {}),
            tripId: row?.payload?.tripId || row?.id,
          }))
          .filter((row: any) => row?.tripId);
        setRemoteList(mapped);

        if (!rows.length && localList.length && !hasSyncedRef.current) {
          hasSyncedRef.current = true;
          await Promise.all(
            localList.map((entry) =>
              fetch("/api/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: entry.tripId,
                  ownerEmail: userEmail,
                  status: entry.status || "Draft",
                  createdAt: entry.createdAt,
                  updatedAt: entry.updatedAt,
                  payload: buildPayloadFromLocal(entry),
                }),
              })
            )
          );
          const refreshed = await fetch(`/api/proposals?ownerEmail=${encodeURIComponent(userEmail)}`, { cache: "no-store" });
          const refreshedPayload = await refreshed.json();
          const refreshedRows = Array.isArray(refreshedPayload?.data) ? refreshedPayload.data : [];
          const refreshedMapped = refreshedRows
            .map((row: any) => ({
              ...(row?.payload || {}),
              tripId: row?.payload?.tripId || row?.id,
            }))
            .filter((row: any) => row?.tripId);
          if (active) setRemoteList(refreshedMapped);
        }
      } catch {
        if (!active) return;
        setRemoteList([]);
      } finally {
        if (active) setLoadingRemote(false);
      }
    };
    void loadRemote();
    return () => {
      active = false;
    };
  }, [userEmail, localList]);

  useEffect(() => {
    if (list.length === 0) return;
    setSelectedTripIds((prev) => (prev.length === 0 ? list.map((p) => p.tripId) : prev));
  }, [list]);

  const toggleSelected = (tripId: string) => {
    setSelectedTripIds((prev) => (prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId]));
  };

  const buildCombinedProposal = async () => {
    const ids = selectedTripIds.length ? selectedTripIds : list.map((p) => p.tripId);
    if (ids.length === 0) return;

    const candidates = ids.map((id) => ({
      tripId: id,
      selection: selections[id] || {},
      snapshot: snapshots[id] || {},
      draft: tripDrafts[id] || {},
    }));

    const primaryFlight = candidates.find((c) => c.selection?.flight)?.selection?.flight || null;
    const primaryHotel = candidates.find((c) => c.selection?.hotel)?.selection?.hotel || null;

    const extraHotels = candidates
      .map((c) => (c.selection?.hotel ? { ...c.selection.hotel, accommodationType: c.draft?.accommodationType || c.selection?.hotel?.accommodationType } : null))
      .filter(Boolean)
      .filter((h) => h && h.id !== primaryHotel?.id);

    const extraActivities = candidates
      .map((c) => c.selection?.activity)
      .filter(Boolean);

    const extraTransfers = candidates
      .map((c) => c.selection?.transfer)
      .filter(Boolean);

    const destination = primaryHotel?.location || candidates[0]?.snapshot?.destination || candidates[0]?.draft?.destination || "Multi-destination";
    const tripId = createTrip({ title: "Custom itinerary", destination, style: "Multi-selection" });

    updateSnapshot(tripId, {
      destination,
      travelers: candidates[0]?.snapshot?.travelers || "2 adults",
      style: "Multi-selection",
      accommodationType: primaryHotel?.accommodationType || candidates[0]?.draft?.accommodationType || "Hotel",
    });

    applyTripPatch(tripId, {
      destination,
      accommodationType: primaryHotel?.accommodationType || candidates[0]?.draft?.accommodationType || "Hotel",
      style: "Multi-selection",
      extraHotels,
      extraActivities,
      extraTransfers,
    });

    setProposalSelection(tripId, {
      flight: primaryFlight,
      hotel: primaryHotel,
      activity: extraActivities[0] || null,
      transfer: extraTransfers[0] || null,
    });

    await generateProposal(tripId);
    router.push(`/proposals/${tripId}/review`);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-[1400px] px-5 pb-14 pt-6 space-y-8">
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
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Build a complete trip</h2>
              <p className="mt-1 text-sm" style={{ color: MUTED_TEXT }}>
                Combine multiple proposals (flights + transfers + stays + yacht + car) to generate one final proposal.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={buildCombinedProposal}
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
                >
                  Generate final proposal
                </button>
                <button
                  onClick={() => setSelectedTripIds([])}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Deselect all
                </button>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Selected: {selectedTripIds.length}
                </span>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              {list.map((p) => {
              const resumeHref = p.hasSelection ? `/proposals/${p.tripId}/review` : `/proposals/${p.tripId}/select`;
              return (
                <div
                  key={p.tripId}
                  className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="h-44 w-full bg-slate-100">
                    <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>{p.title}</span>
                    <span className={statusPill(p.status)} style={{ color: TITLE_TEXT }}>{p.status}</span>
                    {p.hasSelection && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                        Ready to book
                      </span>
                    )}
                    <label className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedTripIds.includes(p.tripId)}
                        onChange={() => toggleSelected(p.tripId)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Include in final
                    </label>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
                    {p.destination}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: MUTED_TEXT }}>
                    <div><strong>Dates:</strong> {p.dates || "TBD"}</div>
                    <div><strong>Travelers:</strong> {p.travelers || "n/a"}</div>
                    <div><strong>Budget:</strong> {p.budget || "n/a"}</div>
                    <div><strong>Style:</strong> {p.style || "Tailor-made"}</div>
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
                        style={{ minWidth: 160 }}
                        onClick={async () => {
                          try {
                            // Get the full proposal data
                            const proposal = proposals[p.tripId];
                            const trip = trips.find((t: any) => t.id === p.tripId);
                            const snap = snapshots[p.tripId] || {};
                            const selection = selections[p.tripId] || {};
                            const draft = tripDrafts[p.tripId] || {};
                            
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
                              shortlist: [],
                              format: "html",
                              departureCity: snap.departure || snap.departureCity,
                              accommodationType: snap.accommodationType,
                              transportationType: snap.transportationType,
                              style: snap.style,
                              notes: proposal?.notes
                              ,
                              selection,
                              tripDraft: draft,
                              extraHotels: draft.extraHotels || [],
                              extraActivities: draft.extraActivities || [],
                              extraTransfers: draft.extraTransfers || []
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
                              a.download = `Proposition-${p.title}-${p.destination}.html`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
                              alert('✅ HTML téléchargé avec succès ! 📄');
                            } else {
                              alert('❌ Erreur lors de la génération du HTML');
                            }
                          } catch (error) {
                            alert('❌ Erreur lors du téléchargement: ' + (error instanceof Error ? error.message : String(error)));
                          }
                        }}
                      >
                        📥 Télécharger HTML
                      </button>
                  </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
