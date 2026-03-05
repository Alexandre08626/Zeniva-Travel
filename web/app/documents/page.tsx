"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../src/design/tokens";
import { useAuthStore } from "../../src/lib/authStore";
import { buildChatChannelId, buildContactChannelId, fetchChatMessages, saveChatMessage } from "../../src/lib/chatPersistence";
import { useTripsStore, createTrip } from "../../lib/store/tripsStore";
import { useDocumentsStore, seedDocuments, DocumentRecord } from "../../src/lib/documentsStore";

type DocumentsChatMessage = {
  id: string;
  role: "lina" | "agent" | "partner" | "specialist" | "traveler";
  author: string;
  text: string;
  ts: string;
};

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
  const hasSyncedRef = useRef(false);
  const [remoteDocsByTrip, setRemoteDocsByTrip] = useState<Record<string, DocumentRecord[]>>({});
  const [loadingRemote, setLoadingRemote] = useState(false);
  const documents = useDocumentsStore((s) => (userId ? s.documents[userId] || {} : {}));
  const localDocuments = useDocumentsStore((s) => s.documents['__local__'] || {});

  useEffect(() => {
    if (!userId) return;
    const hasDocs = Object.keys(documents || {}).length > 0;
    if (hasDocs) return;
    const tripId = trips[0]?.id || createTrip({ title: "Mediterranean Escape", destination: "Amalfi Coast", dates: "Jun 12-18", travelers: "2" });
    seedDocuments(userId, tripId);
  }, [userId, documents, trips, snapshots]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const loadRemote = async () => {
      setLoadingRemote(true);
      try {
        const resp = await fetch(`/api/documents?ownerEmail=${encodeURIComponent(userId)}`, { cache: "no-store" });
        const payload = await resp.json();
        if (!resp.ok) throw new Error(payload?.error || "Failed to load documents");
        if (!active) return;
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const grouped: Record<string, DocumentRecord[]> = {};
        rows.forEach((row: any) => {
          const doc = row?.payload || {};
          const tripId = row?.trip_id || doc?.tripId;
          if (!tripId || !doc?.id) return;
          if (!grouped[tripId]) grouped[tripId] = [];
          grouped[tripId].push(doc as DocumentRecord);
        });
        setRemoteDocsByTrip(grouped);

        const localTripIds = Object.keys(documents || {});
        if (!rows.length && localTripIds.length && !hasSyncedRef.current) {
          hasSyncedRef.current = true;
          const syncCalls: Promise<Response>[] = [];
          localTripIds.forEach((tripId) => {
            (documents[tripId] || []).forEach((doc) => {
              syncCalls.push(
                fetch("/api/documents", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: doc.id,
                    ownerEmail: userId,
                    tripId,
                    updatedAt: doc.updatedAt,
                    payload: { ...doc, tripId },
                  }),
                })
              );
            });
          });
          await Promise.all(syncCalls);
          const refreshed = await fetch(`/api/documents?ownerEmail=${encodeURIComponent(userId)}`, { cache: "no-store" });
          const refreshedPayload = await refreshed.json();
          const refreshedRows = Array.isArray(refreshedPayload?.data) ? refreshedPayload.data : [];
          const refreshedGrouped: Record<string, DocumentRecord[]> = {};
          refreshedRows.forEach((row: any) => {
            const doc = row?.payload || {};
            const tripId = row?.trip_id || doc?.tripId;
            if (!tripId || !doc?.id) return;
            if (!refreshedGrouped[tripId]) refreshedGrouped[tripId] = [];
            refreshedGrouped[tripId].push(doc as DocumentRecord);
          });
          if (active) setRemoteDocsByTrip(refreshedGrouped);
        }
      } catch {
        if (!active) return;
        setRemoteDocsByTrip({});
      } finally {
        if (active) setLoadingRemote(false);
      }
    };
    void loadRemote();
    return () => {
      active = false;
    };
  }, [userId, documents]);

  const list = useMemo(() => {
    if (!userId) return [] as { tripId: string; title: string; destination?: string; dates?: string; travelers?: string; docs: DocumentRecord[] }[];
    const source = Object.keys(remoteDocsByTrip).length ? remoteDocsByTrip : (documents || {});
    return Object.entries(source).map(([tripId, docs]) => {
      const trip = trips.find((t: any) => t.id === tripId);
      const snap = snapshots[tripId] || {};
      return {
        tripId,
        title: trip?.title || "Trip",
        destination: snap.destination || "",
        dates: snap.dates || "",
        travelers: snap.travelers || "",
        docs: docs as DocumentRecord[],
      };
    });
  }, [userId, documents, remoteDocsByTrip, trips, snapshots]);

  const primaryTrip = list[0];
  const primarySnapshot = primaryTrip ? snapshots[primaryTrip.tripId] || {} : {};
  const tripStatus = primarySnapshot.status || (primaryTrip ? "Confirmed" : "Planning");
  const partnerName = primarySnapshot.partnerName || "";
  const hasPartner = Boolean(partnerName);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<DocumentsChatMessage[]>([
    { id: "m1", role: "lina", author: "Lina (AI)", text: "I can confirm your flights and finalize your hotel. Want me to proceed?", ts: "09:02" },
    { id: "m2", role: "agent", author: "Zeniva Agent", text: "I can also call the hotel to confirm your late check-in.", ts: "09:04" },
  ]);
  const chatChannelId = useMemo(() => buildChatChannelId(user?.email, "documents-chat"), [user?.email]);
  const contactChannelId = useMemo(() => buildContactChannelId(user?.email), [user?.email]);

  const loggedOut = !userId;

  const handleChatSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString().slice(0, 5);
    const createdAt = new Date().toISOString();
    setChatMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, role: "traveler", author: user?.name || "Traveler", text: trimmed, ts: now },
      { id: `m-${Date.now()}-lina`, role: "lina", author: "Lina (AI)", text: "Got it. I’m on it and will keep you updated here.", ts: now },
    ]);
    setChatInput("");
    if (chatChannelId || contactChannelId) {
      void saveChatMessage({
        channelIds: [chatChannelId, contactChannelId].filter(Boolean),
        message: trimmed,
        author: user?.name || user?.email || "Traveler",
        senderRole: "client",
        source: "documents-chat",
        sourcePath: "/documents",
        propertyName: "Documents",
      });
      void saveChatMessage({
        channelIds: [chatChannelId],
        message: "Got it. I’m on it and will keep you updated here.",
        author: "Lina",
        senderRole: "lina",
        source: "documents-chat",
        sourcePath: "/documents",
        propertyName: "Documents",
      });
    }
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
    if (chatChannelId) {
      void saveChatMessage({
        channelIds: [chatChannelId],
        message: "I can help with property questions and arrival timing.",
        author: partnerName || "Partner Host",
        senderRole: "agent",
        source: "documents-chat",
        sourcePath: "/documents",
        propertyName: "Documents",
      });
    }
  }, [hasPartner, partnerName]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!chatChannelId) return;
      const rows = await fetchChatMessages(chatChannelId);
      if (!active || !rows.length) return;
      const mapped: DocumentsChatMessage[] = rows.map((row: any): DocumentsChatMessage => {
        const createdAt = row?.createdAt || row?.created_at || new Date().toISOString();
        const sender = row?.senderRole || row?.sender_role;
        const role: DocumentsChatMessage["role"] = sender === "lina" ? "lina" : sender === "agent" || sender === "hq" ? "agent" : "traveler";
        return {
          id: String(row?.id || createdAt),
          role,
          author: row?.author || (role === "lina" ? "Lina (AI)" : role === "agent" ? "Zeniva Agent" : user?.name || "Traveler"),
          text: String(row?.message || "").trim() || "Message",
          ts: new Date(createdAt).toLocaleTimeString().slice(0, 5),
        };
      });
      setChatMessages(mapped);
    };
    void load();
    return () => {
      active = false;
    };
  }, [chatChannelId, user?.name]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-none px-4 sm:px-6 pb-14 pt-6 space-y-0">
        <Header isLoggedIn={!!userId} userEmail={userId} hideAgentWorkspaceSwitch />

        {/* ── HERO ── */}
        <div className="rounded-3xl overflow-hidden shadow-xl mb-6 mt-4" style={{ background: `linear-gradient(135deg, ${GRADIENT_START} 0%, #1a3a7a 50%, ${GRADIENT_END} 100%)` }}>
          <div className="px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div className="text-white">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70 mb-2">✈️ Traveler Cockpit</p>
                <h1 className="text-3xl sm:text-4xl font-black">Your Travel Hub</h1>
                <p className="text-white/80 mt-2 text-sm max-w-lg">
                  Track bookings, manage documents, and chat with Lina or a Zeniva expert — all in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                <Link href="/payment"
                  className="rounded-2xl px-5 py-2.5 text-sm font-black text-slate-900 shadow-lg transition hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #E6B85A, #d4a442)" }}>
                  💳 Finalize booking
                </Link>
                <Link href="/chat?prompt=Continue%20with%20Lina"
                  className="rounded-2xl border border-white/40 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition">
                  💬 Chat with Lina
                </Link>
                <Link href="/chat/agent?channel=agent-alexandre&source=/documents"
                  className="rounded-2xl border border-white/40 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition">
                  🧑‍💼 Expert support
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "✈️", label: "Trip", val: primaryTrip?.title || "New itinerary", sub: primaryTrip?.destination || "TBD" },
                { icon: "📄", label: "Documents", val: String(list.length), sub: "Trips with files" },
                { icon: "🎯", label: "Support", val: hasPartner ? "Lina + Partner" : "Lina + Zeniva", sub: hasPartner ? "Partner enabled" : "Zeniva dedicated" },
                { icon: "📊", label: "Status", val: tripStatus, sub: "Real-time tracking" },
              ].map(({ icon, label, val, sub }) => (
                <div key={label} className="rounded-2xl bg-white/15 border border-white/20 p-4">
                  <div className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{icon} {label}</div>
                  <div className="text-white font-black text-sm mt-1 truncate">{val}</div>
                  <div className="text-white/60 text-[10px] mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">

          {loggedOut ? (
            <div className="space-y-4">
              {Object.keys(localDocuments || {}).length > 0 && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <h2 className="text-lg font-black text-slate-900 mb-1">📱 Saved on this device</h2>
                  <p className="text-sm text-slate-600 mb-4">Documents saved locally. <strong>Log in to sync to your account.</strong></p>
                  <div className="space-y-4">
                    {Object.entries(localDocuments).map(([tripId, docs]) => (
                      <TripCard key={`local-${tripId}`} tripId={tripId} title={trips.find((t: any) => t.id === tripId)?.title || 'Trip'} docs={docs} />
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
                <div className="text-5xl mb-4">🔐</div>
                <h2 className="text-xl font-black text-slate-900">Log in to view your documents</h2>
                <p className="text-slate-500 text-sm mt-2 mb-6">Your tickets, vouchers, and confirmations are secured to your account.</p>
                <div className="flex justify-center gap-3">
                  <Link href="/login" className="rounded-2xl px-6 py-3 text-sm font-black text-white shadow-lg" style={{ backgroundColor: PREMIUM_BLUE }}>Log in</Link>
                  <Link href="/signup" className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Create account</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Chat center */}
              <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-white text-lg">💬 Communication center</h2>
                    <p className="text-blue-200 text-xs mt-0.5">Lina replies first — then a Zeniva expert takes over</p>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white">🤖 Lina (AI)</span>
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white">🧑‍💼 Agent</span>
                    {hasPartner && <span className="rounded-full bg-emerald-400/30 px-2.5 py-1 text-[10px] font-bold text-emerald-200">🏨 Partner</span>}
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-3 bg-slate-50 p-4">
                  {chatMessages.map((msg) => {
                    const isLina = msg.role === "lina";
                    const isTraveler = msg.role === "traveler";
                    return (
                      <div key={msg.id} className={`flex ${isTraveler ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isLina ? "bg-blue-600 text-white" : isTraveler ? "bg-slate-900 text-white" : msg.role === "partner" ? "bg-emerald-600 text-white" : "bg-white text-slate-900 border border-slate-200"}`}>
                          <div className="text-[10px] font-bold opacity-70 mb-1">{msg.author}</div>
                          <div>{msg.text}</div>
                          <div className="text-[10px] opacity-60 mt-1.5">{msg.ts}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleChatSubmit} className="p-4 flex gap-2 border-t border-slate-100">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message Lina or your Zeniva expert…"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-black text-white" style={{ backgroundColor: PREMIUM_BLUE }}>Send</button>
                </form>
              </section>

              {/* Status sidebar */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
                  <h2 className="font-black text-white text-lg">📊 Trip status</h2>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { icon: "📊", label: "Current status", val: tripStatus },
                    { icon: "👥", label: "Support team", val: hasPartner ? `Lina + ${partnerName || "Partner"}` : "Lina + Zeniva Expert" },
                  ].map(({ icon, label, val }) => (
                    <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{icon} {label}</div>
                      <div className="font-bold text-slate-800 mt-0.5 text-sm">{val}</div>
                    </div>
                  ))}
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">📋 Next steps</div>
                    {["Review confirmations", "Finalize payments", "Confirm transfers"].map(s => (
                      <div key={s} className="flex items-center gap-2 text-xs text-slate-600 py-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />{s}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link href="/proposals" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-center text-slate-700 hover:bg-slate-50">Proposals</Link>
                    <Link href="/payment" className="rounded-xl px-3 py-2.5 text-xs font-black text-center text-white" style={{ backgroundColor: PREMIUM_BLUE }}>Pay now</Link>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Documents section */}
          {!loggedOut && (
            <div id="documents">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">📄 Travel documents</p>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">Tickets, vouchers & confirmations</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Everything you need before, during, and after your trip.</p>
                </div>
              </div>

              {list.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
                  <div className="text-5xl mb-3">📭</div>
                  <h3 className="text-lg font-black text-slate-900">No documents yet</h3>
                  <p className="text-slate-500 text-sm mt-1 mb-5">Book a proposal to receive your confirmations, tickets, and vouchers here.</p>
                  <Link href="/proposals" className="rounded-2xl px-6 py-3 text-sm font-black text-white" style={{ backgroundColor: PREMIUM_BLUE }}>View proposals →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {list.map((trip) => <TripCard key={trip.tripId} {...trip} />)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8">
          <Footer />
        </div>
      </div>
    </main>
  );
}
