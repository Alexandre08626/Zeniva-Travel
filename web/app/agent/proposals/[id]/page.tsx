"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TripDraft {
  destination: string;
  departureCity: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  budget: number;
}

interface FlightSegment {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  class: string;
  price: number;
}

interface HotelSelection {
  id: string;
  name: string;
  image: string;
  stars: number;
  room: string;
  pricePerNight: number;
  totalPrice: number;
}

interface Activity {
  id: string;
  name: string;
  price: number;
}

interface Transfer {
  id: string;
  name: string;
  price: number;
}

interface Selections {
  flights?: { outbound: FlightSegment; inbound: FlightSegment };
  hotels?: HotelSelection[];
  activities?: Activity[];
  transfers?: Transfer[];
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  passportNumber: string;
  nationality: string;
  email?: string;
  phone?: string;
}

interface HotelGuest {
  firstName: string;
  lastName: string;
  email: string;
}

interface Payload {
  tripDraft: TripDraft;
  selections: Selections;
  client: Client;
  passengers?: Passenger[];
  hotelGuest?: HotelGuest;
}

interface Proposal {
  id: string;
  trip_id: string;
  owner_email: string;
  status: string;
  payload: Payload;
  destination: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(amount: number): string {
  return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function calcNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

const STATUS_COLORS: Record<string, string> = {
  Snapshot: "bg-slate-100 text-slate-700",
  Ready: "bg-blue-100 text-blue-700",
  Sent: "bg-amber-100 text-amber-700",
  "Payment Sent": "bg-violet-100 text-violet-700",
  Booked: "bg-emerald-100 text-emerald-700",
};

const STEPS = ["Build", "Preview", "Finalize", "Payment", "Booked"];

function statusToStep(status: string): number {
  switch (status) {
    case "Snapshot":
    case "Ready":
      return 2;
    case "Sent":
      return 2;
    case "Payment Sent":
      return 3;
    case "Booked":
      return 4;
    default:
      return 2;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProposalFinalizePage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params?.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Passenger form
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [passengerSaving, setPassengerSaving] = useState(false);
  const [passengerSaved, setPassengerSaved] = useState(false);

  // Hotel guest form
  const [hotelGuest, setHotelGuest] = useState<HotelGuest>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [guestSaving, setGuestSaving] = useState(false);
  const [guestSaved, setGuestSaved] = useState(false);

  // Payment link
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [sendingPayment, setSendingPayment] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // PDF
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ------ Fetch proposal ------
  useEffect(() => {
    if (!proposalId) return;
    setLoading(true);
    fetch(`/api/proposals?id=${proposalId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load proposal");
        return r.json();
      })
      .then((json) => {
        const p = json.data?.[0] as Proposal | undefined;
        if (!p) throw new Error("Proposal not found");
        setProposal(p);

        // Hydrate passengers
        const payload = p.payload;
        if (payload.passengers?.length) {
          setPassengers(payload.passengers);
        } else {
          const count = payload.tripDraft?.adults || 1;
          setPassengers(
            Array.from({ length: count }, () => ({
              firstName: "",
              lastName: "",
              dateOfBirth: "",
              gender: "",
              passportNumber: "",
              nationality: "",
              email: "",
              phone: "",
            }))
          );
        }

        // Hydrate hotel guest
        if (payload.hotelGuest) {
          setHotelGuest(payload.hotelGuest);
        }

        if (p.status === "Payment Sent") setPaymentSent(true);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [proposalId]);

  // ------ Auto-save (debounced) ------
  const autoSave = useCallback(
    (updatedPassengers?: Passenger[], updatedGuest?: HotelGuest) => {
      if (!proposal) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const updatedPayload = {
          ...proposal.payload,
          ...(updatedPassengers ? { passengers: updatedPassengers } : {}),
          ...(updatedGuest ? { hotelGuest: updatedGuest } : {}),
        };
        fetch("/api/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: proposal.id, payload: updatedPayload }),
        }).catch(() => {});
      }, 1500);
    },
    [proposal]
  );

  // ------ Passenger handlers ------
  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      autoSave(next, undefined);
      return next;
    });
    setPassengerSaved(false);
  };

  const savePassengers = async () => {
    if (!proposal) return;
    setPassengerSaving(true);
    try {
      const updatedPayload = { ...proposal.payload, passengers };
      await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposal.id, payload: updatedPayload }),
      });
      setProposal({ ...proposal, payload: updatedPayload });
      setPassengerSaved(true);
    } catch {
      /* silent */
    } finally {
      setPassengerSaving(false);
    }
  };

  // ------ Hotel guest handlers ------
  const updateGuest = (field: keyof HotelGuest, value: string) => {
    setHotelGuest((prev) => {
      const next = { ...prev, [field]: value };
      autoSave(undefined, next);
      return next;
    });
    setGuestSaved(false);
  };

  const saveGuest = async () => {
    if (!proposal) return;
    setGuestSaving(true);
    try {
      const updatedPayload = { ...proposal.payload, hotelGuest };
      await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposal.id, payload: updatedPayload }),
      });
      setProposal({ ...proposal, payload: updatedPayload });
      setGuestSaved(true);
    } catch {
      /* silent */
    } finally {
      setGuestSaving(false);
    }
  };

  // ------ Payment ------
  const sendPaymentLink = async () => {
    if (!proposal) return;
    setSendingPayment(true);
    try {
      const { tripDraft, client } = proposal.payload;
      // 1. Create ZeniPay link
      const linkRes = await fetch("/api/zenipay/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          currency: "USD",
          description: `Trip to ${tripDraft.destination}`,
        }),
      });
      const linkData = await linkRes.json();
      setPaymentLink(linkData.url);

      // 2. Send email
      await fetch("/api/proposals/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          clientEmail: client.email,
          clientName: client.name,
          destination: tripDraft.destination,
          totalPrice: grandTotal,
          proposalUrl: linkData.url,
        }),
      });

      // 3. Update status
      await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposal.id, status: "Payment Sent" }),
      });

      setProposal({ ...proposal, status: "Payment Sent" });
      setPaymentSent(true);
    } catch {
      /* silent */
    } finally {
      setSendingPayment(false);
    }
  };

  const copyLink = () => {
    if (!paymentLink) return;
    navigator.clipboard.writeText(paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadPdf = async () => {
    if (!proposal) return;
    setGeneratingPdf(true);
    try {
      const res = await fetch("/api/proposals/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal.id }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-${proposal.destination || "trip"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* silent */
    } finally {
      setGeneratingPdf(false);
    }
  };

  // ------ Derived data ------
  const payload = proposal?.payload;
  const tripDraft = payload?.tripDraft;
  const selections = payload?.selections;
  const client = payload?.client;

  const nights = tripDraft ? calcNights(tripDraft.checkIn, tripDraft.checkOut) : 0;

  const flightsTotal =
    (selections?.flights?.outbound?.price || 0) + (selections?.flights?.inbound?.price || 0);

  const hotelsTotal =
    selections?.hotels?.reduce((sum, h) => sum + (h.totalPrice || h.pricePerNight * nights), 0) || 0;

  const activitiesTotal =
    selections?.activities?.reduce((sum, a) => sum + (a.price || 0), 0) || 0;

  const transfersTotal =
    selections?.transfers?.reduce((sum, t) => sum + (t.price || 0), 0) || 0;

  const subtotal = flightsTotal + hotelsTotal + activitiesTotal + transfersTotal;
  const serviceFee = Math.round(subtotal * 0.06);
  const grandTotal = subtotal + serviceFee;

  const currentStep = proposal ? statusToStep(proposal.status) : 2;

  // ------ Render helpers ------
  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition";

  // ------ Loading / Error ------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F9FC" }}>
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
          <span className="text-slate-500 text-sm">Loading proposal...</span>
        </div>
      </div>
    );
  }

  if (error || !proposal || !payload || !tripDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F9FC" }}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md text-center">
          <p className="text-red-600 font-medium mb-4">{error || "Proposal not found"}</p>
          <button
            onClick={() => router.push("/agent/proposals")}
            className="text-blue-600 hover:underline text-sm"
          >
            Back to All Proposals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F7F9FC" }}>
      {/* ================================================================ */}
      {/* HEADER BAR */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/agent/proposals")}
              className="text-sm text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
            >
              <span>&larr;</span> All Proposals
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <h1 className="text-lg font-semibold text-slate-800">
              {tripDraft.destination}
            </h1>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[proposal.status] || "bg-slate-100 text-slate-600"}`}
            >
              {proposal.status}
            </span>
          </div>
          {client && (
            <div className="text-right text-sm">
              <span className="font-medium text-slate-700">{client.name}</span>
              <span className="text-slate-400 ml-2">{client.email}</span>
            </div>
          )}
        </div>
      </header>

      {/* ================================================================ */}
      {/* PROGRESS STEPS BAR */}
      {/* ================================================================ */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {done ? "\u2713" : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      done ? "text-emerald-600" : active ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded ${done ? "bg-emerald-400" : "bg-slate-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* TWO-COLUMN LAYOUT */}
      {/* ================================================================ */}
      <div className="max-w-6xl mx-auto px-6 pb-12 flex gap-6 items-start">
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="flex-1 space-y-6">
          {/* ---------- Trip Summary Card ---------- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Trip Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Destination</span>
                <p className="font-medium text-slate-700">{tripDraft.destination}</p>
              </div>
              <div>
                <span className="text-slate-400">Departure City</span>
                <p className="font-medium text-slate-700">{tripDraft.departureCity}</p>
              </div>
              <div>
                <span className="text-slate-400">Check-in</span>
                <p className="font-medium text-slate-700">{formatDate(tripDraft.checkIn)}</p>
              </div>
              <div>
                <span className="text-slate-400">Check-out</span>
                <p className="font-medium text-slate-700">
                  {formatDate(tripDraft.checkOut)}{" "}
                  <span className="text-slate-400 text-xs">({nights} nights)</span>
                </p>
              </div>
              <div>
                <span className="text-slate-400">Travelers</span>
                <p className="font-medium text-slate-700">
                  {tripDraft.adults} adult{tripDraft.adults > 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Budget</span>
                <p className="font-medium text-slate-700">{formatPrice(tripDraft.budget)}</p>
              </div>
            </div>
          </div>

          {/* ---------- Flight Confirmation ---------- */}
          {selections?.flights && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3">
                <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                  <span>&#9992;&#65039;</span> Flights
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {(["outbound", "inbound"] as const).map((dir) => {
                  const seg = selections.flights?.[dir];
                  if (!seg) return null;
                  return (
                    <div
                      key={dir}
                      className="flex items-center gap-4 border border-slate-100 rounded-xl p-4"
                    >
                      <img
                        src={`https://images.kiwi.com/airlines/64/${seg.airlineCode}.png`}
                        alt={seg.airline}
                        className="w-10 h-10 rounded object-contain"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          <span>{seg.airline}</span>
                          <span className="text-slate-400">{seg.flightNumber}</span>
                          <span className="ml-auto text-xs uppercase text-slate-400">
                            {dir === "outbound" ? "Outbound" : "Return"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                          <span className="font-mono">{seg.departureAirport}</span>
                          <span className="text-slate-300">&rarr;</span>
                          <span className="font-mono">{seg.arrivalAirport}</span>
                          <span className="mx-2 text-slate-300">|</span>
                          <span>{seg.departureTime} - {seg.arrivalTime}</span>
                          <span className="mx-2 text-slate-300">|</span>
                          <span>{seg.duration}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>{seg.class}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-800">
                          {formatPrice(seg.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------- Hotel Confirmation ---------- */}
          {selections?.hotels && selections.hotels.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3">
                <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                  <span>&#127976;</span> Hotels
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {selections.hotels.map((hotel, i) => (
                  <div
                    key={hotel.id || i}
                    className="flex gap-4 border border-slate-100 rounded-xl p-4"
                  >
                    {hotel.image && (
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-28 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800">{hotel.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: hotel.stars || 0 }).map((_, s) => (
                          <span key={s} className="text-amber-400 text-xs">
                            &#9733;
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{hotel.room}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-bold text-slate-800">
                        {formatPrice(hotel.totalPrice || hotel.pricePerNight * nights)}
                      </span>
                      <p className="text-xs text-slate-400">
                        {formatPrice(hotel.pricePerNight)}/night
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- Passenger Details Form ---------- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-3">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                <span>&#128100;</span> Passenger Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {passengers.map((pax, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Passenger {idx + 1}
                    {idx === 0 && (
                      <span className="text-xs font-normal text-slate-400 ml-2">(Lead)</span>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">First Name</label>
                      <input
                        className={inputClass}
                        value={pax.firstName}
                        onChange={(e) => updatePassenger(idx, "firstName", e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Last Name</label>
                      <input
                        className={inputClass}
                        value={pax.lastName}
                        onChange={(e) => updatePassenger(idx, "lastName", e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Date of Birth</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={pax.dateOfBirth}
                        onChange={(e) => updatePassenger(idx, "dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Gender</label>
                      <select
                        className={inputClass}
                        value={pax.gender}
                        onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Passport Number</label>
                      <input
                        className={inputClass}
                        value={pax.passportNumber}
                        onChange={(e) => updatePassenger(idx, "passportNumber", e.target.value)}
                        placeholder="Passport number"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Nationality</label>
                      <input
                        className={inputClass}
                        value={pax.nationality}
                        onChange={(e) => updatePassenger(idx, "nationality", e.target.value)}
                        placeholder="Nationality"
                      />
                    </div>
                    {idx === 0 && (
                      <>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Email *</label>
                          <input
                            type="email"
                            className={inputClass}
                            value={pax.email || ""}
                            onChange={(e) => updatePassenger(idx, "email", e.target.value)}
                            placeholder="Email address"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Phone *</label>
                          <input
                            type="tel"
                            className={inputClass}
                            value={pax.phone || ""}
                            onChange={(e) => updatePassenger(idx, "phone", e.target.value)}
                            placeholder="Phone number"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {idx < passengers.length - 1 && <hr className="border-slate-100 mt-4" />}
                </div>
              ))}
              <button
                onClick={savePassengers}
                disabled={passengerSaving}
                className="mt-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50"
              >
                {passengerSaving
                  ? "Saving..."
                  : passengerSaved
                    ? "Saved!"
                    : "Save Passenger Info"}
              </button>
            </div>
          </div>

          {/* ---------- Hotel Guest Form ---------- */}
          {selections?.hotels && selections.hotels.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3">
                <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                  <span>&#127976;</span> Hotel Guest Details
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-400 mb-2">
                  Required by LiteAPI for hotel booking confirmation.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">First Name</label>
                    <input
                      className={inputClass}
                      value={hotelGuest.firstName}
                      onChange={(e) => updateGuest("firstName", e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Last Name</label>
                    <input
                      className={inputClass}
                      value={hotelGuest.lastName}
                      onChange={(e) => updateGuest("lastName", e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">Email</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={hotelGuest.email}
                      onChange={(e) => updateGuest("email", e.target.value)}
                      placeholder="Guest email address"
                    />
                  </div>
                </div>
                <button
                  onClick={saveGuest}
                  disabled={guestSaving}
                  className="mt-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition disabled:opacity-50"
                >
                  {guestSaving ? "Saving..." : guestSaved ? "Saved!" : "Save Guest Info"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================== RIGHT COLUMN (SIDEBAR) ==================== */}
        <div className="w-80 flex-shrink-0 sticky top-20 space-y-6">
          {/* ---------- Pricing Breakdown ---------- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Pricing Breakdown</h2>
            <div className="space-y-2 text-sm">
              {flightsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Flights</span>
                  <span className="text-slate-700 font-medium">{formatPrice(flightsTotal)}</span>
                </div>
              )}
              {hotelsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Hotels ({nights} nights)</span>
                  <span className="text-slate-700 font-medium">{formatPrice(hotelsTotal)}</span>
                </div>
              )}
              {activitiesTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Activities</span>
                  <span className="text-slate-700 font-medium">
                    {formatPrice(activitiesTotal)}
                  </span>
                </div>
              )}
              {transfersTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Transfers</span>
                  <span className="text-slate-700 font-medium">
                    {formatPrice(transfersTotal)}
                  </span>
                </div>
              )}
              <hr className="border-slate-100 my-2" />
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700 font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Fee (6%)</span>
                <span className="text-slate-700 font-medium">{formatPrice(serviceFee)}</span>
              </div>
              <hr className="border-slate-100 my-2" />
              <div className="flex justify-between items-baseline">
                <span className="text-slate-800 font-semibold">Grand Total</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* ---------- Action Buttons ---------- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
            <button
              onClick={sendPaymentLink}
              disabled={sendingPayment || paymentSent}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-violet-600 hover:from-teal-700 hover:to-violet-700 text-white text-sm font-semibold transition disabled:opacity-50"
            >
              {sendingPayment
                ? "Sending..."
                : paymentSent
                  ? "Payment Link Sent"
                  : "\uD83D\uDCE7 Send Payment Link"}
            </button>

            {paymentLink && (
              <button
                onClick={copyLink}
                className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
              >
                {copiedLink ? "Copied!" : "\uD83D\uDD17 Copy Payment Link"}
              </button>
            )}

            <button
              onClick={downloadPdf}
              disabled={generatingPdf}
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
            >
              {generatingPdf ? "Generating..." : "\uD83D\uDCC4 Download PDF"}
            </button>
          </div>

          {/* ---------- Status History ---------- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Status History</h2>
            <div className="space-y-3">
              {[
                {
                  label: "Proposal Created",
                  date: proposal.created_at,
                  done: true,
                },
                {
                  label: "Finalization Started",
                  date: proposal.updated_at,
                  done: ["Sent", "Payment Sent", "Booked"].includes(proposal.status) || currentStep >= 2,
                },
                {
                  label: "Payment Link Sent",
                  date: paymentSent ? new Date().toISOString() : null,
                  done: ["Payment Sent", "Booked"].includes(proposal.status),
                },
                {
                  label: "Booked",
                  date: null,
                  done: proposal.status === "Booked",
                },
              ].map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="relative">
                    <div
                      className={`w-3 h-3 rounded-full mt-0.5 ${
                        event.done ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                    {i < 3 && (
                      <div
                        className={`absolute top-3.5 left-1/2 -translate-x-1/2 w-px h-6 ${
                          event.done ? "bg-emerald-300" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        event.done ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {event.label}
                    </p>
                    {event.date && (
                      <p className="text-[10px] text-slate-400">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
