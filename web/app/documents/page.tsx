"use client";
import React, { useEffect, useMemo, useState } from "react";
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

  const primaryTrip = list[0];
  const primarySnapshot = primaryTrip ? snapshots[primaryTrip.tripId] || {} : {};
  const tripStatus = primarySnapshot.status || (primaryTrip ? "Confirmed" : "Planning");
  const partnerName = primarySnapshot.partnerName || "";
  const hasPartner = Boolean(partnerName);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: "m1", role: "lina", author: "Lina (AI)", text: "I can confirm your flights and finalize your hotel. Want me to proceed?", ts: "09:02" },
    { id: "m2", role: "agent", author: "Zeniva Agent", text: "I can also call the hotel to confirm your late check-in.", ts: "09:04" },
  ] as { id: string; role: "lina" | "agent" | "partner" | "specialist" | "traveler"; author: string; text: string; ts: string }[]);

  const loggedOut = !userId;

  const handleChatSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString().slice(0, 5);
    setChatMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, role: "traveler", author: user?.name || "Traveler", text: trimmed, ts: now },
      { id: `m-${Date.now()}-lina`, role: "lina", author: "Lina (AI)", text: "Got it. I’m on it and will keep you updated here.", ts: now },
    ]);
    setChatInput("");
  };

  useEffect(() => {
    if (!hasPartner) return;
    setChatMessages((prev) => {
      if (prev.find((m) => m.role === "partner")) return prev;
      return [
        ...prev,
        { id: "m-partner", role: "partner", author: partnerName || "Partner Host", text: "I can help with property questions and arrival timing.", ts: "09:06" },
      ];
    });
  }, [hasPartner, partnerName]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto w-full max-w-none px-6 pb-14 pt-6 space-y-6">
        <Header isLoggedIn={!!userId} userEmail={userId} />

        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Traveler Dashboard</p>
              <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Your traveler cockpit</h1>
              <p className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
                Track your trip, finalize bookings, and communicate with Lina and the Zeniva team.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Status: {tripStatus}</span>
              <Link
                href="/payment"
                className="rounded-full px-4 py-2 text-sm font-bold text-white"
                style={{ backgroundColor: PREMIUM_BLUE }}
              >
                Finalize booking
              </Link>
              <Link
                href="/chat?prompt=Continue%20with%20Lina"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                style={{ color: TITLE_TEXT }}
              >
                Continue with Lina
              </Link>
              <Link
                href="/chat/agent?channel=agent-alexandre&source=/documents"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                style={{ color: TITLE_TEXT }}
              >
                Contact an expert
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Trip</div>
              <div className="mt-1 text-sm font-bold" style={{ color: TITLE_TEXT }}>{primaryTrip?.title || "New itinerary"}</div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>{primaryTrip?.destination || "Destination à confirmer"}</div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Documents</div>
              <div className="mt-1 text-2xl font-extrabold" style={{ color: TITLE_TEXT }}>{list.length}</div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>Trips with files</div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Support</div>
              <div className="mt-1 text-sm font-bold" style={{ color: TITLE_TEXT }}>{hasPartner ? "Lina + Partner" : "Lina + Zeniva"}</div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>{hasPartner ? "Partner assistance enabled" : "Dedicated Zeniva assistance"}</div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Réservation</div>
              <div className="mt-1 text-sm font-bold" style={{ color: TITLE_TEXT }}>{tripStatus}</div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>Real-time tracking</div>
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
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Messaging</p>
                    <h2 className="text-xl font-black" style={{ color: TITLE_TEXT }}>Communication center</h2>
                    <p className="text-sm" style={{ color: MUTED_TEXT }}>
                      Lina replies first, then the right expert takes over based on your trip.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Lina (AI)</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Zeniva Agent</span>
                    {hasPartner && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Partner host</span>}
                  </div>
                </div>

                <div className="mt-4 max-h-[320px] overflow-y-auto space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  {chatMessages.map((msg) => {
                    const roleStyle =
                      msg.role === "lina"
                        ? "bg-blue-600 text-white"
                        : msg.role === "partner"
                          ? "bg-emerald-600 text-white"
                          : msg.role === "traveler"
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900";
                    return (
                      <div key={msg.id} className="flex items-start gap-3">
                        <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${roleStyle}`}>
                          <div className="text-xs font-bold opacity-70">{msg.author}</div>
                          <div className="mt-1">{msg.text}</div>
                          <div className="mt-2 text-[11px] opacity-70">{msg.ts}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleChatSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Write to Lina or your Zeniva expert..."
                    className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    className="rounded-full px-4 py-2 text-sm font-semibold text-white"
                    style={{ backgroundColor: PREMIUM_BLUE }}
                  >
                    Send
                  </button>
                </form>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Trip</p>
                <h2 className="text-xl font-black" style={{ color: TITLE_TEXT }}>Status & actions</h2>
                <div className="mt-4 space-y-3 text-sm" style={{ color: TITLE_TEXT }}>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Current status</div>
                    <div className="mt-1 font-semibold">{tripStatus}</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Next steps</div>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li>• Review documents and confirmations</li>
                      <li>• Finalize remaining payments</li>
                      <li>• Confirm transfers and excursions</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Contacts</div>
                    <div className="mt-2 text-sm">Lina (AI) + Zeniva Expert</div>
                    {hasPartner && <div className="text-sm">{partnerName || "Partner host"}</div>}
                  </div>
                </div>
              </section>
            </div>
          )}

          {!loggedOut && (
            <div className="mt-8" id="documents">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Travel documents</p>
                  <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Tickets, vouchers, and confirmations</h2>
                  <p className="text-sm" style={{ color: MUTED_TEXT }}>Everything you need before, during, and after your trip.</p>
                </div>
                <Link
                  href="/documents"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                  style={{ color: TITLE_TEXT }}
                >
                  View all documents
                </Link>
              </div>
            </div>
          )}

          {!loggedOut && list.length === 0 ? (
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
          ) : !loggedOut ? (
            <div className="mt-6 space-y-5">
              {list.map((trip) => (
                <TripCard key={trip.tripId} {...trip} />
              ))}
            </div>
          ) : null}
        </div>

        <Footer />
      </div>
    </main>
  );
}
