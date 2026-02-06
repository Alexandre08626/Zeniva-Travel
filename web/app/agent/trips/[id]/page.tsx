"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { addAudit, useAuthStore } from "../../../../src/lib/authStore";
import { useRequireAnyPermission } from "../../../../src/lib/roleGuards";
import { normalizeRbacRole } from "../../../../src/lib/rbac";
import { searchFlights } from "../../../../src/lib/agent/inventory/flights";
import { searchHotels } from "../../../../src/lib/agent/inventory/hotels";
import { searchYachts } from "../../../../src/lib/agent/inventory/yachts";
import { searchActivities } from "../../../../src/lib/agent/inventory/activities";
import { searchTransfers } from "../../../../src/lib/agent/inventory/transfers";
import { searchCars } from "../../../../src/lib/agent/inventory/cars";
import { searchVillas } from "../../../../src/lib/agent/inventory/villas";
import { searchGroups } from "../../../../src/lib/agent/inventory/groups";
import { aggregatePricing } from "../../../../src/lib/agent/pricing";
import { TripComponent, Pricing, Payment, DocumentEntry, TripStatus } from "../../../../src/lib/agent/types";
import {
  addComponentToTrip,
  addDocument,
  addPayment,
  advanceTripStatus,
  listClients,
  listTrips,
  listLedger,
  setTripBookingType,
  setTripPartnerBooking,
  setTripPartnerFeePct,
  setTripCommissionOverride,
  setTripMarginOverride,
  setTripStatus,
  setPaymentStatus,
} from "../../../../src/lib/agent/store";
import { computeTripSplit } from "../../../../src/lib/agent/billing";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT, ACCENT_GOLD } from "../../../../src/design/tokens";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function TripWorkspacePage() {
  useRequireAnyPermission(["sales:all", "create_yacht_proposal"], "/agent");
  const params = useParams<{ id: string | string[] }>();
  const tripId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const user = useAuthStore((s) => s.user);
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole((user?.roles || [])[0]);
  const isYachtBroker = effectiveRole === "yacht_broker";
  const [, force] = useState(0);
  const [components, setComponents] = useState<TripComponent[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [docs, setDocs] = useState<DocumentEntry[]>([]);
  const [ledger, setLedger] = useState(() => listLedger());
  const [marginOverride, setMarginOverride] = useState<number | undefined>();
  const [commissionOverride, setCommissionOverride] = useState<number | undefined>();
  const [bookingType, setBookingType] = useState<"zeniva_managed" | "agent_built">("zeniva_managed");
  const [partnerBooking, setPartnerBooking] = useState(false);
  const [partnerFeePct, setPartnerFeePct] = useState<number | undefined>(undefined);
  const flights = useMemo(() => searchFlights(), []);
  const hotels = useMemo(() => searchHotels(), []);
  const yachts = useMemo(() => searchYachts(), []);
  const activities = useMemo(() => searchActivities(), []);
  const transfers = useMemo(() => searchTransfers(), []);
  const cars = useMemo(() => searchCars(), []);
  const villas = useMemo(() => searchVillas(), []);
  const groups = useMemo(() => searchGroups(), []);
  const clients = listClients();
  const trips = listTrips();
  const trip = useMemo(() => trips.find((t) => t.id === tripId) ?? trips[0], [tripId, trips]);
  const client = useMemo(() => clients.find((c) => c.id === (trip?.clientId || "")), [clients, trip]);

  useEffect(() => {
    if (!trip) return;
    setComponents(trip.components || []);
    setPayments(trip.payments || []);
    setDocs(trip.documents || []);
    setMarginOverride(trip.marginOverridePct);
    setCommissionOverride(trip.commissionOverridePct);
    setBookingType(trip.bookingType || "zeniva_managed");
    setPartnerBooking(Boolean(trip.partnerBooking));
    setPartnerFeePct(trip.partnerFeePct);
    setLedger(listLedger().filter((l) => l.tripId === trip.id));
  }, [trip]);

  const visibleComponents = useMemo(
    () => (isYachtBroker ? components.filter((c) => c.productKind === "yacht") : components),
    [components, isYachtBroker]
  );

  const pricing: Pricing | null = useMemo(
    () => aggregatePricing(visibleComponents, commissionOverride, marginOverride),
    [visibleComponents, commissionOverride, marginOverride]
  );

  const isYachtTrip = useMemo(
    () => trip?.division === "YACHT" || (visibleComponents.length > 0 && visibleComponents.every((c) => c.productKind === "yacht")),
    [trip?.division, visibleComponents]
  );

  const travelAgentPct = useMemo(() => {
    if (client?.origin !== "agent" || !client?.ownerEmail) return 0;
    if (isYachtTrip) return 0.2;
    return bookingType === "agent_built" ? 0.8 : 0.05;
  }, [bookingType, client?.origin, client?.ownerEmail, isYachtTrip]);

  const appliedPartnerFeePct = useMemo(
    () => (partnerBooking ? Number(partnerFeePct ?? 0.025) : 0),
    [partnerBooking, partnerFeePct]
  );

  const split = useMemo(
    () => computeTripSplit(visibleComponents, travelAgentPct, appliedPartnerFeePct),
    [visibleComponents, travelAgentPct, appliedPartnerFeePct]
  );

  if (!trip) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
        <div className="mx-auto max-w-4xl px-5 py-10">
          <h1 className="text-2xl font-bold" style={{ color: TITLE_TEXT }}>Trip not found</h1>
          <p className="text-sm" style={{ color: MUTED_TEXT }}>The requested trip does not exist. Pick one from the dashboard.</p>
          <Link href="/agent" className="text-sm font-bold" style={{ color: PREMIUM_BLUE }}>Back to dashboard</Link>
        </div>
      </main>
    );
  }

  const addComponent = (c: TripComponent) => {
    if (isYachtBroker && c.productKind !== "yacht") {
      setNotice("Yacht brokers can only add yacht inventory.");
      return;
    }
    setNotice(null);
    setComponents((prev) => [c, ...prev]);
    addComponentToTrip(trip.id, c);
  };

  const requestPayment = () => {
    if (!pricing) return;
    const p: Payment = {
      id: uid(),
      link: `https://pay.zeniva.test/${uid()}`,
      amount: pricing.sell,
      currency: pricing.currency,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [p, ...prev]);
    addPayment(trip.id, p);
  };

  const updatePaymentStatus = (paymentId: string, status: Payment["status"]) => {
    setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, status } : p)));
    setPaymentStatus(trip.id, paymentId, status);
    setLedger(listLedger().filter((l) => l.tripId === trip.id));
  };

  const generateDocs = () => {
    const bundle: DocumentEntry = {
      id: uid(),
      title: "Travel Documents Package",
      content: "Flight tickets, hotel voucher, transfer details, cancellation policy (mock)",
    };
    setDocs((prev) => [bundle, ...prev]);
    addDocument(trip.id, bundle);
  };

  const setMargin = (val: string) => {
    const n = Number(val);
    setMarginOverride(Number.isFinite(n) ? n : undefined);
    setTripMarginOverride(trip.id, Number.isFinite(n) ? n : undefined);
  };

  const setCommission = (val: string) => {
    const n = Number(val);
    setCommissionOverride(Number.isFinite(n) ? n : undefined);
    setTripCommissionOverride(trip.id, Number.isFinite(n) ? n : undefined);
  };

  const updateBookingType = (value: "zeniva_managed" | "agent_built") => {
    setBookingType(value);
    setTripBookingType(trip.id, value);
  };

  const updatePartnerBooking = (value: boolean) => {
    setPartnerBooking(value);
    setTripPartnerBooking(trip.id, value);
  };

  const updatePartnerFee = (val: string) => {
    const n = Number(val);
    const pct = Number.isFinite(n) ? n : undefined;
    setPartnerFeePct(pct);
    setTripPartnerFeePct(trip.id, pct);
  };

  const advanceStatus = () => {
    advanceTripStatus(trip.id);
    addAudit("trip:status", "trip", trip.id, { action: "advance" });
    force((n) => n + 1);
  };

  const setStatus = (status: TripStatus) => {
    setTripStatus(trip.id, status);
    addAudit("trip:status", "trip", trip.id, { status });
    force((n) => n + 1);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-7xl px-5 py-6 space-y-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Trip Workspace</p>
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: TITLE_TEXT }}>Trip file {trip.id}</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              {isYachtBroker
                ? "Yacht-only dossier. Add yachts, send proposal, and confirm payments."
                : "Build flights, hotels, activities, transfers, cars, yachts. Status: Draft → Quoted → Approved → Pending Payment → Booked → Ticketed."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold">Agent Workspace</span>
            {user && <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold" style={{ color: TITLE_TEXT }}>{user.email}</span>}
            <Link href="/agent" className="text-sm font-bold" style={{ color: PREMIUM_BLUE }}>Back to dashboard</Link>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[260px,1fr,320px]">
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">Clients</p>
              <ul className="mt-2 space-y-2 text-sm">
                {clients.map((c) => (
                  <li key={c.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="font-semibold" style={{ color: TITLE_TEXT }}>{c.name}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{c.ownerEmail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Trips</p>
              <ul className="mt-2 space-y-2 text-sm">
                {trips.map((t) => (
                  <li key={t.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="font-semibold" style={{ color: TITLE_TEXT }}>{t.title}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{t.id} · {t.status}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="space-y-4">
            {notice && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {notice}
              </div>
            )}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">Status</p>
                <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{trip.status}</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {(["Draft", "Quoted", "Approved", "Pending Payment", "Booked", "Ticketed", "Completed"] as TripStatus[]).map((s) => (
                  <button
                    key={s}
                    className={`rounded-full border px-3 py-1 ${s === trip.status ? "bg-slate-900 text-white" : "bg-white border-slate-200"}`}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </button>
                ))}
                <button className="rounded-full bg-amber-100 px-3 py-1 text-slate-900" onClick={advanceStatus}>Advance</button>
              </div>
            </div>

            {!isYachtBroker && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Search</p>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Flights</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Duffel / GDS (mock)</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {flights.map((f) => (
                  <div key={f.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <p className="font-semibold" style={{ color: TITLE_TEXT }}>{f.from} → {f.to}</p>
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold">{f.cabin}</span>
                    </div>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{f.dep} → {f.arr} · {f.carrier}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Net ${f.pricing.net} · Sell ${f.pricing.sell} · Margin {f.pricing.marginPct}%</p>
                    <button
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:border-slate-400"
                      onClick={() => addComponent({ ...f })}
                    >
                      Add to trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {!isYachtBroker && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Search</p>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Hotels</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Supplier feed (mock)</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {hotels.map((h) => (
                  <div key={h.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <p className="font-semibold" style={{ color: TITLE_TEXT }}>{h.hotel}</p>
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold">{h.board}</span>
                    </div>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{h.location}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{h.checkIn} → {h.checkOut} · Room {h.room}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Net ${h.pricing.net} · Sell ${h.pricing.sell} · Margin {h.pricing.marginPct}%</p>
                    <button
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:border-slate-400"
                      onClick={() => addComponent({ ...h })}
                    >
                      Add to trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {!isYachtBroker && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Search</p>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Activities</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Tours / DMC</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {activities.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <p className="font-semibold" style={{ color: TITLE_TEXT }}>{a.title}</p>
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold">{a.location}</span>
                    </div>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{a.date} · {a.time}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Sell ${a.pricing.sell} · Margin {a.pricing.marginPct}%</p>
                    <button
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:border-slate-400"
                      onClick={() => addComponent({ ...a })}
                    >
                      Add to trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {!isYachtBroker && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Search</p>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Transfers</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Chauffeur</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {transfers.map((t) => (
                  <div key={t.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <p className="font-semibold" style={{ color: TITLE_TEXT }}>{t.from} → {t.to}</p>
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold">{t.vehicle}</span>
                    </div>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{t.date}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Sell ${t.pricing.sell} · Margin {t.pricing.marginPct}%</p>
                    <button
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:border-slate-400"
                      onClick={() => addComponent({ ...t })}
                    >
                      Add to trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {!isYachtBroker && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Search</p>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Cars</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Self-drive</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {cars.map((car) => (
                  <div key={car.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <p className="font-semibold" style={{ color: TITLE_TEXT }}>{car.pickup}</p>
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold">{car.category}</span>
                    </div>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{car.start} → {car.end}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Sell ${car.pricing.sell} · Margin {car.pricing.marginPct}%</p>
                    <button
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:border-slate-400"
                      onClick={() => addComponent({ ...car })}
                    >
                      Add to trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Catalogue</p>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Yachts (Zeniva Yacht)</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Zeniva Yacht</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {yachts.map((y) => (
                  <div key={y.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <p className="font-semibold" style={{ color: TITLE_TEXT }}>{y.name}</p>
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold">{y.length}</span>
                    </div>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{y.location} · {y.guests} guests · Week {y.weekStart}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Total Sell ${y.pricing.sell} · Travel share 5% · Margin {y.pricing.marginPct}%</p>
                    <button
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:border-slate-400"
                      onClick={() => addComponent({ ...y })}
                    >
                      Add to trip
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {!isYachtBroker && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Catalogue</p>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Villas</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Villas</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {villas.map((v) => (
                  <div key={v.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <p className="font-semibold" style={{ color: TITLE_TEXT }}>{v.title}</p>
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold">Villa</span>
                    </div>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Sell ${v.pricing.sell} · Margin {v.pricing.marginPct}%</p>
                    <button
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:border-slate-400"
                      onClick={() => addComponent({ ...v })}
                    >
                      Add to trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {!isYachtBroker && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Catalogue</p>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Groups</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">MICE</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {groups.map((g) => (
                  <div key={g.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <p className="font-semibold" style={{ color: TITLE_TEXT }}>{g.title}</p>
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold">Group</span>
                    </div>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Sell ${g.pricing.sell} · Margin {g.pricing.marginPct}%</p>
                    <button
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:border-slate-400"
                      onClick={() => addComponent({ ...g })}
                    >
                      Add to trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Components</p>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>In trip</h2>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold" style={{ color: TITLE_TEXT }}>{visibleComponents.length} items</span>
              </div>
              <div className="space-y-2 text-sm max-h-72 overflow-y-auto">
                {visibleComponents.length === 0 && (
                  <p className="text-slate-500">No items yet. {isYachtBroker ? "Add yachts." : "Add flights/hotels."}</p>
                )}
                {visibleComponents.map((c, idx) => (
                  <div key={`${c.id}-${idx}`} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{c.type.toUpperCase()}</span>
                      <span>{c.status}</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>{c.type === "flight" ? `${(c as any).from} → ${(c as any).to}` : (c as any).hotel || (c as any).title || (c as any).from}</p>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>Sell ${c.pricing.sell} · Margin {c.pricing.marginPct}%</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Pricing</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Quote</span>
            </div>
            {pricing ? (
              <div className="space-y-2 text-sm">
                <p>Net: ${pricing.net}</p>
                <p>Sell: ${pricing.sell}</p>
                <p>Margin: ${pricing.marginAmount} ({pricing.marginPct}%)</p>
                <p>Commission: ${pricing.commissionAmount} ({pricing.commissionPct}%)</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Add items to see totals.</p>
            )}
            <div className="space-y-2 text-sm">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold text-slate-500">Commission rule</p>
                <div className="mt-2 space-y-2">
                  <label className="block text-xs">
                    Booking type
                    <select
                      className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      value={bookingType}
                      onChange={(e) => updateBookingType(e.target.value as "zeniva_managed" | "agent_built")}
                      disabled={isYachtTrip}
                    >
                      <option value="zeniva_managed">Zeniva-managed (5% referral)</option>
                      <option value="agent_built">Agent-built / TBO (80/20)</option>
                    </select>
                    {isYachtTrip && (
                      <p className="mt-1 text-[11px] text-slate-500">Yacht commission rules are fixed and do not use this toggle.</p>
                    )}
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={partnerBooking}
                      onChange={(e) => updatePartnerBooking(e.target.checked)}
                    />
                    Partner booking (2.5% fee)
                  </label>
                  {partnerBooking && (
                    <label className="block text-xs">
                      Partner fee %
                      <input
                        className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-xs"
                        type="number"
                        step="0.1"
                        placeholder="2.5"
                        value={partnerFeePct ?? ""}
                        onChange={(e) => updatePartnerFee(e.target.value)}
                      />
                    </label>
                  )}
                </div>
              </div>
              <label className="block">
                Margin override % (HQ)
                <input
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
                  type="number"
                  placeholder="e.g. 18"
                  value={marginOverride ?? ""}
                  onChange={(e) => setMargin(e.target.value)}
                />
              </label>
              <label className="block">
                Commission %
                <input
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
                  type="number"
                  placeholder="e.g. 10"
                  value={commissionOverride ?? ""}
                  onChange={(e) => setCommission(e.target.value)}
                />
              </label>
            </div>
            <div className="space-y-2">
              <button
                className="w-full rounded-full px-4 py-2 text-sm font-bold text-white"
                style={{ backgroundColor: PREMIUM_BLUE }}
                onClick={requestPayment}
              >
                Request payment link
              </button>
              <button
                className="w-full rounded-full px-4 py-2 text-sm font-bold text-slate-900"
                style={{ backgroundColor: ACCENT_GOLD }}
                onClick={generateDocs}
              >
                Generate travel docs
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs font-semibold text-slate-500">Payments</p>
              {payments.length === 0 && <p className="text-slate-500">No payment links yet.</p>}
              {payments.map((p, idx) => (
                <div key={`${p.id}-${idx}`} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="font-semibold" style={{ color: TITLE_TEXT }}>${p.amount} {p.currency}</p>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>{p.status} · {p.link}</p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button
                      className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800"
                      onClick={() => updatePaymentStatus(p.id, "Paid")}
                    >
                      Mark paid
                    </button>
                    <button
                      className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800"
                      onClick={() => updatePaymentStatus(p.id, "Pending")}
                    >
                      Mark pending
                    </button>
                    <button
                      className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-800"
                      onClick={() => updatePaymentStatus(p.id, "Failed")}
                    >
                      Mark failed
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs font-semibold text-slate-500">Revenue split (95/5 yacht)</p>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 space-y-1">
                <p className="font-semibold" style={{ color: TITLE_TEXT }}>Total sell ${split.totalSell}</p>
                <p className="text-xs" style={{ color: MUTED_TEXT }}>Zeniva Travel share (incl yacht 5%): ${split.travelSell}</p>
                {split.partnerFeeAmount > 0 && (
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>Partner fee: ${split.partnerFeeAmount}</p>
                )}
                {split.partnerFeeAmount > 0 && (
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>Travel after partner fee: ${split.travelAfterPartnerFee}</p>
                )}
                {split.travelAgentShare > 0 && (
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>Travel agent {Math.round(travelAgentPct * 100)}%: ${split.travelAgentShare}</p>
                )}
                <p className="text-xs" style={{ color: MUTED_TEXT }}>Zeniva Travel net after agent: ${split.travelNetAfterAgent}</p>
                <p className="text-xs" style={{ color: MUTED_TEXT }}>Zeniva Yacht share (95% yachts): ${split.yachtSell}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs font-semibold text-slate-500">Documents</p>
              {docs.length === 0 && <p className="text-slate-500">No documents yet.</p>}
              {docs.map((d, idx) => (
                <div key={`${d.id}-${idx}`} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="font-semibold" style={{ color: TITLE_TEXT }}>{d.title}</p>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>{d.content}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs font-semibold text-slate-500">Ledger (paid splits)</p>
              {ledger.filter((l) => l.tripId === trip.id).length === 0 && <p className="text-slate-500">No ledger entries yet.</p>}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {ledger
                  .filter((l) => l.tripId === trip.id)
                  .map((l) => (
                    <div key={l.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{l.account}</span>
                        <span>{new Date(l.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="font-semibold" style={{ color: TITLE_TEXT }}>{l.label}</p>
                      <p className="text-xs" style={{ color: MUTED_TEXT }}>${l.amount} {l.currency}</p>
                    </div>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
