"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

/* ──────────────────────────── types ──────────────────────────── */

interface TripDraft {
  destination: string;
  departureCity: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  budget?: number;
}

interface FlightLeg {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  cabinClass?: string;
  stops?: number;
  price: number;
}

interface Hotel {
  name: string;
  location?: string;
  image?: string;
  stars?: number;
  pricePerNight: number;
  roomType?: string;
  perks?: string[];
}

interface Activity {
  name: string;
  image?: string;
  description?: string;
  price: number;
  duration?: string;
}

interface Transfer {
  type: string;
  from: string;
  to: string;
  price: number;
  vehicle?: string;
}

interface Selections {
  flights: { outbound?: FlightLeg; inbound?: FlightLeg };
  hotels: Hotel[];
  activities: Activity[];
  transfers: Transfer[];
}

interface Client {
  id?: string;
  name: string;
  email: string;
}

interface Proposal {
  id: string;
  status?: string;
  payload: {
    tripDraft: TripDraft;
    selections: Selections;
    client?: Client;
  };
}

/* ──────────────────────────── constants ──────────────────────── */

const HERO_IMAGES: Record<string, string> = {
  Paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80",
  Cancun:
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1600&q=80",
  Tokyo:
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80",
  London:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80",
  Rome:
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&q=80",
  Dubai:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80",
  "New York":
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&q=80",
  Bali:
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80",
  Barcelona:
    "https://images.unsplash.com/photo-1583422409516-2895a77efed6?w=1600&q=80",
  Maldives:
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=80",
  Santorini:
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=80",
  Sydney:
    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80",
  Marrakech:
    "https://images.unsplash.com/photo-1597211833712-5e41faa202ea?w=1600&q=80",
  Bangkok:
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&q=80",
  "Punta Cana":
    "https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?w=1600&q=80",
};

const DEFAULT_HERO =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80";

const HOTEL_FALLBACK =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";

const ACTIVITY_FALLBACK =
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80";

/* ──────────────────────────── helpers ─────────────────────────── */

function fmtDate(d?: string): string {
  if (!d) return "\u2014";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function fmtMoney(n: any): string {
  const num = typeof n === "number" ? n : parseFloat(String(n || "0").replace(/[^0-9.-]/g, "")) || 0;
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

function nightsBetween(a?: string, b?: string): number {
  if (!a || !b) return 1;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  const n = Math.round(ms / 86_400_000);
  return isNaN(n) || n < 1 ? 1 : n;
}

function heroFor(destination?: string): string {
  if (!destination) return DEFAULT_HERO;
  const key = Object.keys(HERO_IMAGES).find(
    (k) => k.toLowerCase() === destination.toLowerCase()
  );
  return key ? HERO_IMAGES[key] : DEFAULT_HERO;
}

function stars(n: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < n ? "text-amber-400" : "text-slate-200"}>
      &#9733;
    </span>
  ));
}

/* ──────────────────────────── sub-components ─────────────────── */

function SectionHeader({
  title,
  icon,
  gradient,
}: {
  title: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div
      className={`${gradient} rounded-2xl px-6 py-4 flex items-center gap-3 mb-6`}
    >
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
    </div>
  );
}

function FlightCard({
  leg,
  label,
}: {
  leg?: FlightLeg;
  label: string;
}) {
  if (!leg) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-center text-slate-400 italic h-36">
        No {label.toLowerCase()} flight selected
      </div>
    );
  }

  // Support both builder format (airline, route, departure) and typed format (airlineCode, departureAirport)
  const f = leg as any;
  const airlineCode = f.airlineCode || f.carrierCode || "";
  const airlineName = f.airline || f.name || "Flight";
  const flightNum = f.flightNumber || f.flight_number || "";
  const routeParts = (f.route || "").split("→").map((s: string) => s.trim());
  const depAirport = f.departureAirport || routeParts[0] || "";
  const arrAirport = f.arrivalAirport || routeParts[1] || "";
  const depTime = f.departureTime || f.departure || "";
  const arrTime = f.arrivalTime || f.arrival || "";
  const duration = f.duration || "";
  const stops = f.stops;
  const cabinClass = f.cabinClass || f.class || "";
  const price = parseFloat(f.price) || 0;
  const logoUrl = airlineCode ? `https://images.kiwi.com/airlines/64/${airlineCode}.png` : "";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      {/* label */}
      <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
        {label}
      </span>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* airline */}
        <div className="flex items-center gap-3 min-w-[160px]">
          {logoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt={airlineName}
              width={32}
              height={32}
              className="rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div>
            <p className="font-semibold text-slate-900">{airlineName}</p>
            <p className="text-xs text-slate-400">{flightNum}</p>
          </div>
        </div>

        {/* timeline */}
        <div className="flex-1 flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">
              {depTime}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {depAirport}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[11px] text-slate-400">{duration}</span>
            <div className="w-full flex items-center gap-1">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded" />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-blue-600 -rotate-45"
              >
                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
              </svg>
            </div>
            {stops !== undefined && stops > 0 ? (
              <span className="text-[10px] text-orange-500 font-medium">
                {stops} stop{stops > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-[10px] text-emerald-500 font-medium">
                Direct
              </span>
            )}
          </div>

          <div className="text-left">
            <p className="text-lg font-bold text-slate-900">
              {arrTime}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {arrAirport}
            </p>
          </div>
        </div>

        {/* badges + price */}
        <div className="flex flex-col items-end gap-2 min-w-[100px]">
          <span className="text-lg font-extrabold text-slate-900">
            {fmtMoney(price)}
          </span>
          {cabinClass && (
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {cabinClass}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── skeleton ────────────────────────── */

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] animate-pulse">
      <div className="h-80 bg-slate-200" />
      <div className="max-w-5xl mx-auto px-4 -mt-8 space-y-6">
        <div className="h-24 bg-white rounded-2xl shadow-sm" />
        <div className="h-10 bg-slate-200 rounded-2xl w-64" />
        <div className="h-40 bg-white rounded-2xl shadow-sm" />
        <div className="h-40 bg-white rounded-2xl shadow-sm" />
        <div className="h-60 bg-white rounded-2xl shadow-sm" />
      </div>
    </div>
  );
}

/* ══════════════════════════ MAIN PAGE ═════════════════════════ */

export default function ProposalPreviewPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  /* ── fetch proposal ── */
  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    fetch(`/api/proposals?id=${tripId}`)
      .then((r) => r.json())
      .then((json) => {
        const p = json.data?.[0] as Proposal | undefined;
        if (!p) {
          setError("Proposal not found.");
        } else {
          setProposal(p);
        }
      })
      .catch(() => setError("Failed to load proposal."))
      .finally(() => setLoading(false));
  }, [tripId]);

  /* ── price calc (must be before useCallback so grandTotal is in scope) ── */
  const _sel = proposal?.payload?.selections || {} as any;
  const _flights = _sel.flights || {} as any;
  const _hotels: any[] = Array.isArray(_sel.hotels) ? _sel.hotels : [];
  const _activities: any[] = Array.isArray(_sel.activities) ? _sel.activities : [];
  const _transfers: any[] = Array.isArray(_sel.transfers) ? _sel.transfers : [];
  const _tripDraft = proposal?.payload?.tripDraft || {} as any;
  const _nights = nightsBetween(_tripDraft.checkIn, _tripDraft.checkOut);

  const flightTotal =
    (parseFloat(_flights.outbound?.price) || 0) + (parseFloat(_flights.inbound?.price) || 0);
  const hotelTotal = _hotels.reduce(
    (s: number, h: any) => s + (parseFloat(String(h.price || h.pricePerNight || "0").replace(/[^0-9.]/g, "")) || 0),
    0
  );
  const activityTotal = _activities.reduce((s: number, a: any) => s + (parseFloat(a.price) || 0), 0);
  const transferTotal = _transfers.reduce((s: number, t: any) => s + (parseFloat(t.price) || 0), 0);
  const subtotal = flightTotal + hotelTotal + activityTotal + transferTotal;
  const serviceFee = Math.round(subtotal * 0.06);
  const grandTotal = subtotal + serviceFee;

  /* ── send to client ── */
  const handleSend = useCallback(async () => {
    if (!proposal || sending) return;
    const client = proposal.payload?.client;
    if (!client?.email) {
      alert("No client email assigned to this proposal. Go back to the builder and assign a client.");
      return;
    }
    setSending(true);
    try {
      // Update proposal status
      await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: proposal.trip_id || tripId,
          ownerEmail: proposal.owner_email || "agent@zeniva.ca",
          status: "Sent",
          payload: proposal.payload,
        }),
      });
      // Send email with full trip details
      const draft = proposal.payload?.tripDraft || {};
      const sel = proposal.payload?.selections || {};
      await fetch("/api/proposals/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.trip_id || tripId,
          clientName: client.name,
          clientEmail: client.email,
          destination: draft.destination || proposal.destination || "",
          dates: draft.checkIn && draft.checkOut ? `${fmtDate(draft.checkIn)} — ${fmtDate(draft.checkOut)}` : "",
          totalPrice: grandTotal > 0 ? `$${grandTotal.toLocaleString()}` : "",
          proposalUrl: `https://www.zenivatravel.com/agent/proposals/preview/${proposal.trip_id || tripId}`,
          // Full selections for rich email
          outboundFlight: sel.flights?.outbound || null,
          returnFlight: sel.flights?.inbound || null,
          hotels: sel.hotels || [],
          activities: sel.activities || [],
          transfers: sel.transfers || [],
          travelers: draft.adults || 2,
          departureCity: draft.departureCity || "",
        }),
      });
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch {
      alert("Failed to send proposal. Please try again.");
    } finally {
      setSending(false);
    }
  }, [proposal, sending, tripId, grandTotal]);

  /* ── loading / error ── */
  if (loading) return <Skeleton />;

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center max-w-md">
          <p className="text-5xl mb-4">&#128464;</p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Proposal Not Found
          </h1>
          <p className="text-slate-500 mb-6">
            {error || "We could not locate this proposal."}
          </p>
          <button
            onClick={() => router.push("/agent/proposals")}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            Back to Proposals
          </button>
        </div>
      </div>
    );
  }

  /* ── destructure (defensive) ── */
  const tripDraft = proposal.payload?.tripDraft || {} as any;
  const selections = proposal.payload?.selections || {} as any;
  const client = proposal.payload?.client || null;
  const flights = selections.flights || {} as any;
  const hotels: any[] = Array.isArray(selections.hotels) ? selections.hotels : [];
  const activities: any[] = Array.isArray(selections.activities) ? selections.activities : [];
  const transfers: any[] = Array.isArray(selections.transfers) ? selections.transfers : [];
  const nights = nightsBetween(tripDraft.checkIn, tripDraft.checkOut);

  /* ════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-32">
      {/* ─── Hero ─── */}
      <section className="relative h-80 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroFor(tripDraft.destination)}
          alt={tripDraft.destination}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />

        {/* back button */}
        <button
          onClick={() =>
            router.push(`/agent/proposals/select/${tripId}`)
          }
          className="absolute top-5 left-5 z-10 flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-semibold bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full transition"
        >
          <span>&larr;</span> Back to Builder
        </button>

        {/* overlay content */}
        <div className="absolute bottom-8 left-0 right-0 px-6 max-w-5xl mx-auto z-10">
          <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg leading-tight mb-2">
            {tripDraft.destination}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm font-medium">
            <span>
              {fmtDate(tripDraft.checkIn)} &mdash;{" "}
              {fmtDate(tripDraft.checkOut)}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>
              {tripDraft.adults} traveler{tripDraft.adults !== 1 ? "s" : ""}
            </span>
            {client?.name && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/50" />
                <span>Prepared for {client.name}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Summary Bar ─── */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20 mb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
              Route
            </p>
            <p className="text-sm font-bold text-slate-900">
              {tripDraft.departureCity} &rarr; {tripDraft.destination}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
              Dates
            </p>
            <p className="text-sm font-bold text-slate-900">
              {fmtDate(tripDraft.checkIn)} &mdash;{" "}
              {fmtDate(tripDraft.checkOut)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
              Travelers
            </p>
            <p className="text-sm font-bold text-slate-900">
              {tripDraft.adults} adult{tripDraft.adults !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right sm:text-left">
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
              Total Price
            </p>
            <p className="text-2xl font-extrabold text-teal-700">
              {fmtMoney(grandTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        {/* ── Flights ── */}
        <section>
          <SectionHeader
            title="Flights"
            icon="&#9992;"
            gradient="bg-gradient-to-r from-blue-600 to-blue-700"
          />
          <div className="space-y-4">
            <FlightCard leg={flights.outbound} label="Outbound" />
            <FlightCard leg={flights.inbound} label="Return" />
          </div>
        </section>

        {/* ── Hotels ── */}
        {hotels.length > 0 && (
          <section>
            <SectionHeader
              title="Hotels"
              icon="&#127976;"
              gradient="bg-gradient-to-r from-purple-600 to-purple-700"
            />
            <div className="space-y-6">
              {hotels.map((hotel, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hotel.image || HOTEL_FALLBACK}
                    alt={hotel.name}
                    className="h-48 sm:h-auto sm:w-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = HOTEL_FALLBACK;
                    }}
                  />
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {hotel.name}
                      </h3>
                      {hotel.location && (
                        <p className="text-sm text-slate-500 mb-2">
                          {hotel.location}
                        </p>
                      )}
                      {hotel.stars && (
                        <div className="text-lg mb-3">
                          {stars(hotel.stars)}
                        </div>
                      )}
                      {hotel.roomType && (
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                          {hotel.roomType}
                        </p>
                      )}
                      {hotel.perks && hotel.perks.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {hotel.perks.map((perk, j) => (
                            <span
                              key={j}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700"
                            >
                              {perk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-extrabold text-slate-900">
                          {fmtMoney((parseFloat(String(hotel.price || hotel.pricePerNight || "0").replace(/[^0-9.]/g, "")) || 0))}
                        </span>
                        <span className="text-sm text-slate-400 ml-1">
                          / night
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-500">
                        {nights} night{nights !== 1 ? "s" : ""} ={" "}
                        <span className="text-slate-900">
                          {fmtMoney((parseFloat(String(hotel.price || hotel.pricePerNight || "0").replace(/[^0-9.]/g, "")) || 0) * nights)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Activities ── */}
        {activities.length > 0 && (
          <section>
            <SectionHeader
              title="Activities"
              icon="&#127947;"
              gradient="bg-gradient-to-r from-amber-500 to-amber-600"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activities.map((act, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={act.image || ACTIVITY_FALLBACK}
                    alt={act.name}
                    className="h-44 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ACTIVITY_FALLBACK;
                    }}
                  />
                  <div className="p-5">
                    <h4 className="text-base font-bold text-slate-900 mb-1">
                      {act.name}
                    </h4>
                    {act.description && (
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                        {act.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold text-slate-900">
                        {fmtMoney(act.price)}
                      </span>
                      {act.duration && (
                        <span className="text-xs font-medium text-slate-400">
                          {act.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Transfers ── */}
        {transfers.length > 0 && (
          <section>
            <SectionHeader
              title="Transfers"
              icon="&#128656;"
              gradient="bg-gradient-to-r from-emerald-600 to-emerald-700"
            />
            <div className="space-y-4">
              {transfers.map((tr, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {tr.from} &rarr; {tr.to}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {tr.type}
                      {tr.vehicle ? ` \u00b7 ${tr.vehicle}` : ""}
                    </p>
                  </div>
                  <span className="text-lg font-extrabold text-slate-900">
                    {fmtMoney(tr.price)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Pricing Breakdown ── */}
        <section>
          <SectionHeader
            title="Pricing Breakdown"
            icon="&#128176;"
            gradient="bg-gradient-to-r from-slate-700 to-slate-800"
          />
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
            {/* line items */}
            {flightTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Flights (outbound + return)
                </span>
                <span className="font-semibold text-slate-900">
                  {fmtMoney(flightTotal)}
                </span>
              </div>
            )}
            {hotelTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Hotels ({nights} night{nights !== 1 ? "s" : ""})
                </span>
                <span className="font-semibold text-slate-900">
                  {fmtMoney(hotelTotal)}
                </span>
              </div>
            )}
            {activityTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Activities</span>
                <span className="font-semibold text-slate-900">
                  {fmtMoney(activityTotal)}
                </span>
              </div>
            )}
            {transferTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Transfers</span>
                <span className="font-semibold text-slate-900">
                  {fmtMoney(transferTotal)}
                </span>
              </div>
            )}

            <hr className="border-slate-100" />

            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">
                {fmtMoney(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Service fee (6%)</span>
              <span className="font-semibold text-slate-900">
                {fmtMoney(serviceFee)}
              </span>
            </div>

            <hr className="border-slate-200" />

            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold text-slate-900">
                Grand Total
              </span>
              <span className="text-3xl font-black text-teal-700">
                {fmtMoney(grandTotal)}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Success Toast ─── */}
      {sent && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold text-sm animate-fade-in flex items-center gap-2">
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Proposal sent to {client?.email}!
        </div>
      )}

      {/* ─── Sticky Action Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={() =>
              router.push(`/agent/proposals/select/${tripId}`)
            }
            className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 transition text-sm"
          >
            &larr; Edit Proposal
          </button>

          <button
            onClick={handleSend}
            disabled={sending}
            className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 text-white font-bold shadow-md hover:shadow-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {sending ? "Sending..." : "Send to Client \u2192"}
          </button>
        </div>
      </div>
    </div>
  );
}
