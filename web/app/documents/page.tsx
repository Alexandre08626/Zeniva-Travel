"use client";
import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../src/design/tokens";
import { useAuthStore } from "../../src/lib/authStore";
import { useTripsStore, createTrip } from "../../lib/store/tripsStore";
import { useDocumentsStore, seedDocuments, DocumentRecord } from "../../src/lib/documentsStore";

function TripCard({
  tripId,
  title,
  destination,
  dates,
  travelers,
  docs,
}: {
  tripId: string;
  title: string;
  destination?: string;
  dates?: string;
  travelers?: string;
  docs: DocumentRecord[];
}) {
  const confirmations = docs.filter((d) => d.type === "confirmation" || d.type === "hotel" || d.type === "transfer" || d.type === "excursion");
  const files = docs.filter((d) => d.type !== "confirmation");

  // Deduplicate by id to avoid rendering duplicate keys (preserve first occurrence)
  const confirmationsUnique = (() => {
    const byId = new Map<string, DocumentRecord>();
    for (const d of confirmations) {
      if (!d || !d.id) continue;
      if (!byId.has(d.id)) byId.set(d.id, d);
      else console.warn(`Duplicate document id found for trip ${tripId}:`, d.id);
    }
    return Array.from(byId.values());
  })();

  const filesUnique = (() => {
    const byId = new Map<string, DocumentRecord>();
    for (const d of files) {
      if (!d || !d.id) continue;
      if (!byId.has(d.id)) byId.set(d.id, d);
      else console.warn(`Duplicate document id found for trip ${tripId}:`, d.id);
    }
    return Array.from(byId.values());
  })();

  // Build a set of confirmation ids so files can point to the confirmation view when applicable
  const confirmationIds = new Set(confirmationsUnique.map((d) => d.id));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xl font-extrabold" style={{ color: TITLE_TEXT }}>{title}</div>
          <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
            {destination || "Destination"} • {dates || "Dates TBC"} • Travelers: {travelers || "n/a"}
          </div>
          <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
            Zeniva support: concierge@zeniva.travel · +1 (844) 000-0000 (24/7)
          </div>
        </div>
        <Link
          href={`/proposals/${tripId}/review`}
          className="rounded-full px-4 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: PREMIUM_BLUE }}
        >
          Resume / Continue booking
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm" style={{ color: TITLE_TEXT }}>
          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Flight tickets</div>
          Airline PNR, e-tickets, baggage rules, and departure terminal details.
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm" style={{ color: TITLE_TEXT }}>
          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Hotel confirmations</div>
          Booking numbers, room categories, check-in instructions, and payment status.
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm" style={{ color: TITLE_TEXT }}>
          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Transfers & extras</div>
          Private transfers, excursions, and invoices kept together for the trip.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Confirmations & References</div>
          {confirmationsUnique.length === 0 ? (
            <div className="text-xs" style={{ color: MUTED_TEXT }}>No confirmations yet.</div>
          ) : (
            <ul className="space-y-2 text-sm" style={{ color: TITLE_TEXT }}>
              {confirmationsUnique.map((d) => (
                <li key={`${tripId}-${d.id}`} className="rounded-lg bg-white border border-slate-200 px-3 py-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold">{d.title}</div>
                    <div className="text-xs" style={{ color: MUTED_TEXT }}>
                      {d.provider || "Provider"} · Ref: {d.confirmationNumber || "TBC"}
                    </div>
                    {d.updatedAt && (
                      <div className="text-[11px]" style={{ color: MUTED_TEXT }}>
                        Updated {new Date(d.updatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <Link
                      href={`/test/duffel-stays/confirmation?docId=${encodeURIComponent(d.id)}`}
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: PREMIUM_BLUE }}
                    >
                      View confirmation
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Documents</div>
          {filesUnique.length === 0 ? (
            <div className="text-xs" style={{ color: MUTED_TEXT }}>No documents yet.</div>
          ) : (
            <ul className="space-y-2 text-sm" style={{ color: TITLE_TEXT }}>
              {filesUnique.map((d) => {
                const isConfirmation = confirmationIds.has(d.id);
                const href = isConfirmation ? `/test/duffel-stays/confirmation?docId=${encodeURIComponent(d.id)}` : (d.url || `/test/duffel-stays/confirmation?docId=${encodeURIComponent(d.id)}`);
                return (
                  <li key={`${tripId}-${d.id}`} className="rounded-lg bg-white border border-slate-200 px-3 py-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold">{d.title}</div>
                      <div className="text-xs" style={{ color: MUTED_TEXT }}>
                        {d.provider || "Provider"} · Ref: {d.confirmationNumber || "TBC"}
                      </div>
                    </div>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: PREMIUM_BLUE }}
                    >
                      View / Download
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
        <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Key Details</div>
        <ul className="space-y-2 text-sm" style={{ color: TITLE_TEXT }}>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: PREMIUM_BLUE }} />
            <span>Flight check-in: open 24h before departure; bring passports and PNR to airline desk.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: PREMIUM_BLUE }} />
            <span>Booking numbers: airline PNR, hotel confirmation, transfer references kept above for easy access.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: PREMIUM_BLUE }} />
            <span>Hotel: bring voucher and ID; check-in 15:00, check-out 11:00; address in confirmation.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: PREMIUM_BLUE }} />
            <span>Transfer: meet driver at arrivals with name sign; call support if delayed &gt;15 minutes.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: PREMIUM_BLUE }} />
            <span>Cancellation: see each voucher for penalties; concierge can reissue if changes are needed.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const user = useAuthStore((s) => s.user);
  const { trips, snapshots } = useTripsStore((s) => ({ trips: s.trips, snapshots: s.snapshots }));
  const userId = user?.email || "";
  const documents = useDocumentsStore((s) => (userId ? s.documents[userId] || {} : {}));
  const localDocuments = useDocumentsStore((s) => s.documents['__local__'] || {});

  useEffect(() => {
    if (!userId) return;
    const hasDocs = Object.keys(documents || {}).length > 0;
    if (hasDocs) return;
    const tripId = trips[0]?.id || createTrip({ title: "Mediterranean Escape", destination: "Amalfi Coast", dates: "Jun 12-18", travelers: "2" });
    seedDocuments(userId, tripId);
  }, [userId, documents, trips, snapshots]);

  const list = useMemo(() => {
    if (!userId) return [] as { tripId: string; title: string; destination?: string; dates?: string; travelers?: string; docs: DocumentRecord[] }[];
    return Object.entries(documents || {}).map(([tripId, docs]) => {
      const trip = trips.find((t: any) => t.id === tripId);
      const snap = snapshots[tripId] || {};
      return {
        tripId,
        title: trip?.title || "Trip",
        destination: snap.destination || "",
        dates: snap.dates || "",
        travelers: snap.travelers || "",
        docs,
      };
    });
  }, [userId, documents, trips, snapshots]);

  const loggedOut = !userId;

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-[1100px] px-5 pb-14 pt-6 space-y-6">
        <Header isLoggedIn={!!userId} userEmail={userId} />

        <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>My Travel Documents</h1>
              <p className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
                Flights, hotels, transfers, activities, and vouchers — everything in one place.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/proposals"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                style={{ color: TITLE_TEXT }}
              >
                Go to proposals
              </Link>
            </div>
          </div>

          {loggedOut ? (
            <div className="mt-8 space-y-6">
              {/* Show locally saved docs when available */}
              {Object.keys(localDocuments || {}).length > 0 && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Saved on this device</div>
                  <div className="text-sm font-semibold mt-2" style={{ color: MUTED_TEXT }}>
                    These documents were saved locally after booking. <strong>Log in to save them to your account.</strong>
                  </div>

                  <div className="mt-4 space-y-5">
                    {Object.entries(localDocuments).map(([tripId, docs]) => (
                      <TripCard key={`local-${tripId}`} tripId={tripId} title={trips.find((t: any) => t.id === tripId)?.title || 'Trip'} docs={docs} />       
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Please log in to view your travel documents.</div>
                <p className="text-sm font-semibold mt-2" style={{ color: MUTED_TEXT }}>
                  Documents are secured to your account.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2 text-sm font-bold text-white"
                    style={{ backgroundColor: PREMIUM_BLUE }}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                    style={{ color: TITLE_TEXT }}
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <div className="text-lg font-bold" style={{ color: TITLE_TEXT }}>No documents yet</div>
              <p className="text-sm font-semibold mt-2" style={{ color: MUTED_TEXT }}>
                Book a proposal and your confirmations, vouchers, and tickets will appear here.
              </p>
              <div className="mt-4">
                <Link
                  href="/proposals"
                  className="rounded-full px-4 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: PREMIUM_BLUE }}
                >
                  View proposals
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {list.map((trip) => (
                <TripCard key={trip.tripId} {...trip} />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </main>
  );
}
