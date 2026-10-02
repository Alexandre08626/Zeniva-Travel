"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ZeniPayButton from "../../../src/components/ZeniPayButton.client";
import { useTripsStore } from "../../../lib/store/tripsStore";
import { useAuthStore } from "../../../src/lib/authStore";
import { getImagesForDestination, getPartnerHotelImages } from "../../../src/lib/images";
import { computePrice, computeTripTotal, formatCurrency } from "../../../src/lib/pricing";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, TITLE_TEXT } from "../../../src/design/tokens";
import SelectedSummary from "../../../src/components/SelectedSummary";


import React from "react";

class CheckoutErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#f8fafc"}}>
          <div style={{textAlign:"center",maxWidth:400,padding:32}}>
            <div style={{fontSize:48,marginBottom:16}}>✈️</div>
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:8}}>Trip not available</h2>
            <p style={{color:"#64748b",marginBottom:24}}>This checkout session has expired. Please go back to chat and regenerate your proposal.</p>
            <a href="/chat" style={{display:"inline-block",padding:"12px 24px",borderRadius:12,background:"linear-gradient(135deg,#2DBE60,#15B8C9)",color:"#fff",fontWeight:700,textDecoration:"none"}}>Back to Chat</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function CheckoutPageInner() {
  const params = useParams();
  const router = useRouter();
  const proposalId = Array.isArray(params.proposalId) ? params.proposalId[0] : params.proposalId;
  const storeData = useTripsStore((s) => ({
    selection: s.selections[proposalId] || { flight: null, hotel: null, activity: null, transfer: null, villa: null, shortterm: null, car: null },
    tripDraft: s.tripDrafts[proposalId] || {},
    trips: s.trips || [],
  }));
  const [dbData, setDbData] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);

  // Load from Supabase if localStorage is empty
  useEffect(() => {
    const hasLocal = storeData.tripDraft?.destination || storeData.selection?.flight || storeData.selection?.hotel;
    if (hasLocal) { setDbLoading(false); return; }
    fetch("/api/proposals?id=" + proposalId)
      .then(r => r.json())
      .then(d => {
        const found = (d.data || []).find(p => p.trip_id === proposalId || p.id === proposalId);
        if (found?.payload) setDbData(found.payload);
      })
      .catch(() => {})
      .finally(() => setDbLoading(false));
  }, [proposalId, storeData.tripDraft?.destination, storeData.selection?.flight, storeData.selection?.hotel]);

  const selection = dbData?.selections || storeData.selection;
  const tripDraft = (dbData?.tripDraft && Object.keys(dbData.tripDraft).length > 0) ? dbData.tripDraft : storeData.tripDraft;
  const trips = storeData.trips;
  const user = useAuthStore((s) => s.user);
  const userId = user?.email || "";
  const [travelerForm, setTravelerForm] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || tripDraft?.clientEmail || "",
    phone: "",
    country: "",
    loyaltyNumber: "",
    requests: "",
  });

  // One entry per traveler when a flight is booked (Duffel needs name, date of birth, gender).
  const flightSelected = Boolean(selection?.flight);
  const travelerCount = Math.max(1, (Number(tripDraft?.adults) || 1) + (Number(tripDraft?.children) || 0));
  const [extraPassengers, setExtraPassengers] = useState([]);
  const [leadDetails, setLeadDetails] = useState({ dob: "", gender: "" });
  useEffect(() => {
    setExtraPassengers((prev) => Array.from({ length: travelerCount - 1 }, (_, i) => prev[i] || { firstName: "", lastName: "", dob: "", gender: "" }));
  }, [travelerCount]);
  const passengers = [
    { firstName: travelerForm.firstName.trim(), lastName: travelerForm.lastName.trim(), dob: leadDetails.dob, gender: leadDetails.gender, email: travelerForm.email.trim(), phone: travelerForm.phone.trim() },
    ...extraPassengers.map((p) => ({ ...p, firstName: p.firstName.trim(), lastName: p.lastName.trim(), email: travelerForm.email.trim(), phone: travelerForm.phone.trim() })),
  ];
  const passengersReady = !flightSelected || passengers.every((p) => p.firstName && p.lastName && /^\d{4}-\d{2}-\d{2}$/.test(p.dob) && p.gender);
  const phoneE164 = /^\+\d{8,15}$/.test(travelerForm.phone.replace(/[\s().-]/g, ""));

  // Saved on the proposal so the paid-booking pipeline (ZeniPay webhook → execute) can book.
  useEffect(() => {
    if (!proposalId || !travelerForm.email.includes("@") || !travelerForm.firstName.trim()) return;
    const t = setTimeout(() => {
      const clean = passengers.map((p) => ({ ...p, phone: p.phone.replace(/[\s().-]/g, "") }));
      fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: proposalId,
          ownerEmail: travelerForm.email.trim(),
          merge: true,
          payload: { passengers: clean, hotelGuests: clean.slice(0, 1), contact: { email: travelerForm.email.trim(), phone: clean[0].phone, name: `${clean[0].firstName} ${clean[0].lastName}`.trim() } },
        }),
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId, JSON.stringify(passengers)]);

  const hero = useMemo(() => { if (!tripDraft?.destination && !selection?.hotel) return "https://images.unsplash.com/photo-1502920917128-1aa500764b5d?auto=format&fit=crop&w=900&q=80";
    // Use selected accommodation image if available, otherwise fallback to destination images
    if (selection?.hotel?.image) {
      return selection.hotel.image;
    }
    const dest = tripDraft?.destination || "destination";
    return getImagesForDestination(dest)[0];
  }, [tripDraft, selection]);

  const extraHotels = tripDraft?.extraHotels || [];
  const extraActivities = tripDraft?.extraActivities || [];
  const extraTransfers = tripDraft?.extraTransfers || [];

  const flightSelection = selection?.flight;
  const flightOutbound = flightSelection?.outbound || flightSelection;
  const flightInbound = flightSelection?.inbound || null;
  const flight = flightOutbound || null;
  const flightRouteLabel = flight ? (flightInbound?.route ? `${flight.route} / ${flightInbound.route}` : flight.route) : "";
  const flightTimesLabel = flight ? (flightInbound?.times ? `${flight.times} / ${flightInbound.times}` : flight.times) : "";
  const hotel = selection?.hotel || extraHotels[0] || null;
  const activity = selection?.activity || null;
  const transfer = selection?.transfer || null;

  const pricing = computePrice({ flight: selection?.flight || null, hotel: selection?.hotel || null, activity: activity || null, transfer: transfer || null }, {
    ...tripDraft,
    extraHotels,
    extraActivities,
    extraTransfers,
  });

  // Amount charged = the review page's Total (hotel ×nights only when priced per night,
  // flight = offer total for all passengers). 0 → price on request, no payment button.
  const trueTotal = useMemo(() => computeTripTotal(selection, tripDraft), [selection, tripDraft]);

  if (!proposalId) return null;

  const travelerReady =
    Boolean(travelerForm.firstName.trim()) &&
    Boolean(travelerForm.lastName.trim()) &&
    /\S+@\S+\.\S+/.test(travelerForm.email.trim()) &&
    Boolean(travelerForm.phone.trim()) &&
    (!flightSelected || phoneE164) &&
    passengersReady;
  const payDescription = `Zeniva Travel - ${tripDraft?.destination || "Trip"}${tripDraft?.checkIn && tripDraft?.checkOut ? ` (${tripDraft.checkIn} to ${tripDraft.checkOut})` : ""}`;

  if (dbLoading) {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#f8fafc"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:16}}>✈️</div>
          <p style={{color:"#64748b"}}>Loading your trip...</p>
        </div>
      </div>
    );
  }

    if (!tripDraft?.destination && !selection?.flight && !selection?.hotel) {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#f8fafc"}}>
        <div style={{textAlign:"center",maxWidth:400,padding:32}}>
          <div style={{fontSize:48,marginBottom:16}}>✈️</div>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:8}}>Trip not found</h2>
          <p style={{color:"#64748b",marginBottom:24}}>This trip is not available. Go back to chat to regenerate.</p>
          <a href="/chat" style={{display:"inline-block",padding:"12px 24px",borderRadius:12,background:"linear-gradient(135deg,#2DBE60,#15B8C9)",color:"#fff",fontWeight:700,textDecoration:"none"}}>Back to Chat</a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: MUTED_TEXT }}>
              Secure checkout
            </div>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>
              Finalize your trip
            </h1>
            <p className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
              Traveler details, payment, and a clear summary before you confirm.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/proposals/${proposalId}/review`)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm"
              style={{ color: BRAND_BLUE }}
            >
              Back to review
            </button>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Step 2 of 2</span>
          </div>
        </header>

        <div className="relative h-48 w-full overflow-hidden rounded-2xl shadow-sm">
          <img src={hero} alt="Destination" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/38 to-black/5" />
          <div className="absolute left-6 bottom-6 text-white space-y-1">
            <div className="text-sm font-semibold">{tripDraft?.destination || "Your trip"}</div>
            <div className="text-2xl font-extrabold">Secure payment</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr,1fr] items-start">
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>Traveler details</div>
                <span className="text-[11px] font-bold text-slate-500">Primary contact</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["First name", "Last name", "Email", "Phone"].map((label) => (
                  <label key={label} className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                    {label}
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder={label}
                      type={label === "Email" ? "email" : label === "Phone" ? "tel" : "text"}
                      inputMode={label === "Email" ? "email" : label === "Phone" ? "tel" : "text"}
                      autoComplete={label === "First name" ? "given-name" : label === "Last name" ? "family-name" : label === "Email" ? "email" : "tel"}
                      value={
                        label === "First name"
                          ? travelerForm.firstName
                          : label === "Last name"
                          ? travelerForm.lastName
                          : label === "Email"
                          ? travelerForm.email
                          : travelerForm.phone
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        setTravelerForm((prev) =>
                          label === "First name"
                            ? { ...prev, firstName: value }
                            : label === "Last name"
                            ? { ...prev, lastName: value }
                            : label === "Email"
                            ? { ...prev, email: value }
                            : { ...prev, phone: value }
                        );
                      }}
                    />
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {["Country", "Loyalty number (optional)", "Special requests"].map((label) => (
                  <label key={label} className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                    {label}
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder={label}
                      value={
                        label === "Country"
                          ? travelerForm.country
                          : label === "Loyalty number (optional)"
                          ? travelerForm.loyaltyNumber
                          : travelerForm.requests
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        setTravelerForm((prev) =>
                          label === "Country"
                            ? { ...prev, country: value }
                            : label === "Loyalty number (optional)"
                            ? { ...prev, loyaltyNumber: value }
                            : { ...prev, requests: value }
                        );
                      }}
                    />
                  </label>
                ))}
              </div>
              {flightSelected && (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="text-xs font-semibold" style={{ color: TITLE_TEXT }}>
                    Passengers (as on passport) — the airline needs these to issue tickets
                  </div>
                  {!phoneE164 && travelerForm.phone.trim() && (
                    <div className="text-[11px] text-amber-700">Phone must include the country code, e.g. +1 514 555 0123.</div>
                  )}
                  {[0, ...extraPassengers.map((_, i) => i + 1)].map((idx) => {
                    const p = idx === 0 ? { firstName: travelerForm.firstName, lastName: travelerForm.lastName, ...leadDetails } : extraPassengers[idx - 1];
                    const set = (field, value) => {
                      if (idx === 0) {
                        if (field === "dob" || field === "gender") setLeadDetails((prev) => ({ ...prev, [field]: value }));
                        else setTravelerForm((prev) => ({ ...prev, [field]: value }));
                      } else {
                        setExtraPassengers((prev) => prev.map((x, k) => (k === idx - 1 ? { ...x, [field]: value } : x)));
                      }
                    };
                    return (
                      <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder={`Passenger ${idx + 1} first name`} value={p.firstName} onChange={(e) => set("firstName", e.target.value)} disabled={idx === 0} />
                        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Last name" value={p.lastName} onChange={(e) => set("lastName", e.target.value)} disabled={idx === 0} />
                        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" aria-label="Date of birth" value={p.dob} onChange={(e) => set("dob", e.target.value)} />
                        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" aria-label="Gender" value={p.gender} onChange={(e) => set("gender", e.target.value)}>
                          <option value="">Gender</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>Payment</div>
                <span className="text-[11px] font-bold text-emerald-600">🔒 Secure payment</span>
              </div>
              <p className="text-sm text-slate-600">
                Fill in your traveler details above, then click the payment button to continue on our secure ZeniPay page.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span>✅ Visa</span><span>✅ Mastercard</span><span>✅ Amex</span><span>✅ Apple Pay</span>
              </div>
            </section>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-4">
            <SelectedSummary
              flight={selection?.flight}
              hotel={selection?.hotel}
              villa={selection?.villa}
              shortterm={selection?.shortterm}
              activity={selection?.activity}
              transfer={selection?.transfer}
              car={selection?.car}
              tripDraft={tripDraft}
            />

            {flight && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
                <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Flight</div>
                <div className="text-sm" style={{ color: TITLE_TEXT }}>{flight.airline} • {flightRouteLabel}</div>
                <div className="text-xs" style={{ color: MUTED_TEXT }}>{[flightTimesLabel, flight.fare, flight.bags].filter(Boolean).join(" • ")}</div>
              </div>
            )}

            {hotel && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>{tripDraft?.accommodationType === 'Hotel' ? 'Hotel' : tripDraft?.accommodationType === 'Yacht' ? 'Yacht' : (tripDraft?.accommodationType === 'ZeniStay' || tripDraft?.accommodationType === 'Residence') ? 'ZeniStay' : 'Accommodation'}</div>
              <div className="text-sm" style={{ color: TITLE_TEXT }}>{[hotel.name, hotel.location].filter(Boolean).join(" • ")}</div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>
                {tripDraft?.accommodationType === 'Yacht' ? (hotel.specs || "") : [hotel.room ? `Room: ${hotel.room}` : "", hotel.rating ? `Rating: ${hotel.rating}` : ""].filter(Boolean).join(" • ")}
              </div>
              <div className="flex gap-2 overflow-x-auto pt-2">
                {(hotel.image ? [hotel.image] : getPartnerHotelImages(tripDraft?.destination || hotel.location || hotel.name).slice(0,2)).map((src, i) => (
                  <div key={i} className="h-20 w-28 overflow-hidden rounded-lg">
                    <img src={src} alt="Hotel" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            )}

            {(activity || extraActivities.length > 0) && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
                <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Activities</div>
                <div className="text-sm" style={{ color: TITLE_TEXT }}>{activity?.name || extraActivities[0]?.name || "Selected activities"}</div>
                <div className="text-xs" style={{ color: MUTED_TEXT }}>Total: {formatCurrency(pricing.activityTotal)}</div>
              </div>
            )}

            {(transfer || extraTransfers.length > 0) && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
                <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Transfers</div>
                <div className="text-sm" style={{ color: TITLE_TEXT }}>{transfer?.name || extraTransfers[0]?.name || "Selected transfers"}</div>
                <div className="text-xs" style={{ color: MUTED_TEXT }}>Total: {formatCurrency(pricing.transferTotal)}</div>
              </div>
            )}

            {!(trueTotal > 0) && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 mb-3">
                💡 <strong>Price on request</strong> — Our team will confirm exact pricing within 24h and send you a payment link.
              </div>
            )}
            {trueTotal > 0 && (
              <ZeniPayButton
                amount={trueTotal}
                currency="USD"
                description={payDescription}
                customerName={`${travelerForm.firstName} ${travelerForm.lastName}`.trim()}
                customerEmail={travelerForm.email.trim()}
                customerPhone={travelerForm.phone.trim()}
                proposalId={proposalId}
                disabled={!travelerReady}
                disabledLabel={flightSelected ? "Fill in every passenger (date of birth, gender) and a phone with country code" : "Fill in your traveler details first"}
              />
            )}
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs" style={{ color: MUTED_TEXT }}>
              After payment, your Zeniva advisor confirms availability with our partners and emails your confirmation and e-tickets.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <CheckoutErrorBoundary><CheckoutPageInner /></CheckoutErrorBoundary>;
}
