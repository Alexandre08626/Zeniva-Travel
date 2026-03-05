"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { persistWorkflowStatePatch } from "../../../../src/lib/workflowPersistence";
import { applyHotelMarkupLabel } from "../../../../src/lib/partnerMarkup";

type DraftData = {
  selectedSearchResult?: {
    id?: string;
    hotelId?: string;
    name?: string;
    location?: string;
    room?: string;
    image?: string;
    photos?: string[];
    provider?: string;
  } | null;
  selectedRateId?: string;
  selectedRate?: {
    id?: string;
    room_type?: { name?: string };
    refundable?: boolean;
    conditions?: string;
    cancellation_timeline?: Array<{ deadline?: string; at?: string; refund_amount?: string; penalty_amount?: string }>;
  } | null;
  quote?: {
    id?: string;
    total_amount?: string;
    total_currency?: string;
    tax_amount?: string;
    taxes_total?: string;
    tax?: string;
    fee_amount?: string;
    fees_total?: string;
    fees?: string;
    due_at_property_amount?: string;
    due_at_accommodation_amount?: string;
    due_at_property?: string;
    refundable?: boolean;
  } | null;
  pendingBooking?: any;
  searchContext?: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    rooms?: string;
    budget?: string;
    summary?: { stay?: string; guestLabel?: string };
    nights?: number | null;
    proposalTripId?: string;
    proposalMode?: "agent" | "";
  };
};

const BOOKING_DRAFT_KEY = "hotel_booking_draft_v1";

export default function HotelReviewClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [detailsPhotos, setDetailsPhotos] = useState<string[] | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL || "/terms";

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (!raw) return;
      const next = JSON.parse(raw);
      Promise.resolve().then(() => setDraft(next));
    } catch {
      Promise.resolve().then(() => setDraft(null));
    }
  }, []);

  const destination = params.get("destination") || draft?.searchContext?.destination || "";
  const checkIn = params.get("checkIn") || draft?.searchContext?.checkIn || "";
  const checkOut = params.get("checkOut") || draft?.searchContext?.checkOut || "";
  const guests = params.get("guests") || draft?.searchContext?.guests || "2";
  const rooms = params.get("rooms") || draft?.searchContext?.rooms || "1";
  const budget = params.get("budget") || draft?.searchContext?.budget || "";
  const nights = draft?.searchContext?.nights || null;
  const proposalTripId = params.get("proposalTripId") || draft?.searchContext?.proposalTripId || "";
  const proposalMode = params.get("mode") || draft?.searchContext?.proposalMode || "";

  const summary = useMemo(() => {
    const stay = checkIn && checkOut ? `${checkIn} → ${checkOut}` : checkIn || checkOut || "Select dates";
    const guestLabel = `${guests} guest${guests === "1" ? "" : "s"}${rooms ? ` · ${rooms} room${rooms === "1" ? "" : "s"}` : ""}`;
    return { stay, guestLabel };
  }, [checkIn, checkOut, guests, rooms]);

  const quote = draft?.quote;
  const selectedRate = draft?.selectedRate;
  const selectedSearchResult = draft?.selectedSearchResult;

  useEffect(() => {
    const provider = selectedSearchResult?.provider;
    const hotelId = (selectedSearchResult?.id || selectedSearchResult?.hotelId || "").trim();
    if (!provider || provider !== "liteapi") return;
    if (!hotelId) return;

    const abort = new AbortController();
    Promise.resolve().then(() => setDetailsPhotos(null));

    const run = async () => {
      try {
        const res = await fetch(`/api/partners/liteapi/hotels/details?hotelId=${encodeURIComponent(hotelId)}`,
          { signal: abort.signal }
        );
        const json = await res.json();
        if (!res.ok || !json?.ok) return;
        const photos = Array.isArray(json.photos)
          ? json.photos.filter((p: any): p is string => typeof p === "string" && p.trim().length > 0)
          : [];
        setDetailsPhotos(photos);
      } catch {
        // Non-blocking
      }
    };

    void run();
    return () => abort.abort();
  }, [selectedSearchResult?.provider, selectedSearchResult?.id, selectedSearchResult?.hotelId]);

  const hotelPhotos = useMemo(() => {
    const preferred = Array.isArray(detailsPhotos)
      ? detailsPhotos.filter((photo): photo is string => typeof photo === "string" && photo.trim().length > 0)
      : [];
    if (preferred.length > 0) return preferred;

    const rawPhotos = Array.isArray(selectedSearchResult?.photos)
      ? selectedSearchResult.photos.filter((photo): photo is string => typeof photo === "string" && photo.trim().length > 0)
      : [];
    if (rawPhotos.length > 0) return rawPhotos;
    if (selectedSearchResult?.image) return [selectedSearchResult.image];
    return [];
  }, [detailsPhotos, selectedSearchResult]);

  const visibleHotelPhotos = useMemo(() => {
    if (showAllPhotos) return hotelPhotos;
    return hotelPhotos.slice(0, 12);
  }, [hotelPhotos, showAllPhotos]);

  useEffect(() => {
    // Keep preview photo consistent when the photo list changes.
    if (!hotelPhotos.length) {
      Promise.resolve().then(() => setActivePhoto(null));
      return;
    }
    if (activePhoto && hotelPhotos.includes(activePhoto)) return;
    Promise.resolve().then(() => setActivePhoto(hotelPhotos[0]));
  }, [hotelPhotos, activePhoto]);

  const formatAmount = (value: any, currency?: string) => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "string") {
      const label = currency ? `${currency} ${value}` : value;
      return currency ? applyHotelMarkupLabel(label) : applyHotelMarkupLabel(value);
    }
    if (typeof value === "number") {
      const label = currency ? `${currency} ${value}` : String(value);
      return currency ? applyHotelMarkupLabel(label) : String(value);
    }
    if (typeof value === "object") {
      const amount = value.amount ?? value.value ?? value.total ?? value.total_amount;
      const cur = value.currency ?? value.currency_code ?? currency;
      if (amount !== undefined && amount !== null) {
        const label = cur ? `${cur} ${amount}` : String(amount);
        return cur ? applyHotelMarkupLabel(label) : String(amount);
      }
    }
    return String(value);
  };

  if (!draft || !quote) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🏨</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">No hotel selected</h1>
          <p className="text-slate-500 text-sm mb-6">Please search for and select a hotel first.</p>
          <Link href="/search/hotels" className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-500 transition">
            Search hotels →
          </Link>
        </div>
      </main>
    );
  }

  const hotelName = selectedSearchResult?.name || "Your hotel";
  const heroPhoto = hotelPhotos[0] || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80";
  const isRefundable = Boolean(selectedRate?.refundable ?? quote?.refundable);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative h-72 w-full overflow-hidden">
        <img src={heroPhoto} alt={hotelName} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/75" />
        <Link href={`/search/hotels?${new URLSearchParams({ destination, checkIn, checkOut, guests, rooms, budget }).toString()}`}
          className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition">
          ← Back
        </Link>
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Hotel Review</p>
          <h1 className="text-3xl font-black text-white drop-shadow">{hotelName}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {destination && <span className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">📍 {destination}</span>}
            {summary.stay && <span className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">📅 {summary.stay}</span>}
            <span className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">👥 {summary.guestLabel}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${isRefundable ? "bg-emerald-400/90 text-emerald-900" : "bg-amber-400/90 text-amber-900"}`}>
              {isRefundable ? "✓ Refundable" : "⚠ Non-refundable"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-5">
        {/* Photo gallery */}
        {hotelPhotos.length > 1 && (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3 flex items-center gap-3">
              <span className="text-lg">📷</span>
              <h2 className="font-black text-white">{hotelPhotos.length} photos</h2>
            </div>
            <div className="p-4">
              {activePhoto && (
                <div className="rounded-2xl overflow-hidden mb-3 h-72">
                  <img src={activePhoto} alt={hotelName} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {visibleHotelPhotos.map((photo, idx) => (
                  <button key={`${photo}-${idx}`} type="button" onClick={() => setActivePhoto(photo)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition ${activePhoto === photo ? "border-purple-500 shadow-md" : "border-transparent hover:border-slate-300"}`}>
                    <img src={photo} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" loading="lazy" />
                  </button>
                ))}
              </div>
              {!showAllPhotos && hotelPhotos.length > 12 && (
                <button onClick={() => setShowAllPhotos(true)} className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  + {hotelPhotos.length - 12} more photos
                </button>
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Stay details */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center gap-3">
                <span className="text-lg">🏨</span>
                <h2 className="font-black text-white">Stay details</h2>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: "📍", label: "Location", val: selectedSearchResult?.location || destination },
                  { icon: "🛏", label: "Room", val: selectedRate?.room_type?.name || selectedSearchResult?.room || "Room" },
                  { icon: "📅", label: "Check-in", val: checkIn },
                  { icon: "📅", label: "Check-out", val: checkOut },
                  { icon: "👥", label: "Guests", val: summary.guestLabel },
                  ...(nights ? [{ icon: "🌙", label: "Nights", val: `${nights} night${nights === 1 ? "" : "s"}` }] : []),
                ].map(({ icon, label, val }) => val ? (
                  <div key={label} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{icon} {label}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{val}</p>
                  </div>
                ) : null)}
              </div>
            </section>

            {/* Cancellation policy */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className={`px-5 py-4 flex items-center gap-3 ${isRefundable ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}>
                <span className="text-lg">{isRefundable ? "↩️" : "⚠️"}</span>
                <h2 className="font-black text-white">{isRefundable ? "Refundable booking" : "Non-refundable"}</h2>
              </div>
              <div className="p-5 space-y-3">
                {selectedRate?.cancellation_timeline && Array.isArray(selectedRate.cancellation_timeline) && selectedRate.cancellation_timeline.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRate.cancellation_timeline.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
                        <span className="text-lg flex-shrink-0">📅</span>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Deadline</p>
                          <p className="text-sm text-slate-800">{item?.deadline || item?.at}</p>
                          {(item?.refund_amount || item?.penalty_amount) && (
                            <p className="text-xs text-slate-500 mt-0.5">{item.refund_amount ? `Refund: ${item.refund_amount}` : `Penalty: ${item.penalty_amount}`}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">{selectedRate?.conditions || "See hotel cancellation terms."}</p>
                )}
                <p className="text-xs text-slate-400">
                  Terms: <a href={termsUrl} target="_blank" rel="noreferrer" className="underline hover:text-blue-600">View Zeniva Travel terms</a>
                </p>
              </div>
            </section>

            {/* Traveler details form */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center gap-3">
                <span className="text-lg">👤</span>
                <h2 className="font-black text-white">Traveler details</h2>
              </div>
              <form
                id="hotel-review-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!acceptedTerms) return;
                  const formData = new FormData(e.target as HTMLFormElement);
                  const firstName = String(formData.get("firstName") || "").trim();
                  const lastName = String(formData.get("lastName") || "").trim();
                  const email = String(formData.get("email") || "").trim();
                  const phone = String(formData.get("phone") || "").trim();
                  const displayName = `${firstName} ${lastName}`.trim();
                  const pendingBooking = {
                    quote_id: quote!.id,
                    phone_number: phone,
                    email,
                    guests: [{ given_name: firstName, family_name: lastName }],
                    accommodation_special_requests: formData.get("requests") as string,
                  };

                  const persistAndContinue = async () => {
                    try {
                      await fetch("/api/auth/me", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ displayName, bookingEmail: email, phone }),
                      });
                    } catch { /* Non-blocking */ }

                    const nextDraft = { ...draft, pendingBooking };
                    window.sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(nextDraft));

                    if (proposalTripId) {
                      const checklistKey = `proposal_review_checklist_${proposalTripId}`;
                      let existingChecklist = {};
                      try { existingChecklist = JSON.parse(window.localStorage.getItem(checklistKey) || "{}"); } catch { existingChecklist = {}; }
                      window.localStorage.setItem(checklistKey, JSON.stringify({ ...existingChecklist, hotelTravelerConfirmed: true, hotelPoliciesConfirmed: true, hotelCancellationConfirmed: true }));
                      void persistWorkflowStatePatch({ [proposalTripId]: { proposal_review_checklist: { hotelTravelerConfirmed: true, hotelPoliciesConfirmed: true, hotelCancellationConfirmed: true } } });
                      const modeSuffix = proposalMode === "agent" ? "?mode=agent" : "";
                      router.push(`/proposals/${proposalTripId}/review${modeSuffix}`);
                      return;
                    }

                    const nextParams = new URLSearchParams({ destination, checkIn, checkOut, guests, rooms, budget, resume: "payment" });
                    router.push(`/search/hotels?${nextParams.toString()}`);
                  };
                  void persistAndContinue();
                }}
                className="p-5 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "firstName", label: "First name", type: "text", required: true },
                    { name: "lastName", label: "Last name", type: "text", required: true },
                    { name: "email", label: "Email address", type: "email", required: true },
                    { name: "phone", label: "Phone number", type: "tel", required: true },
                  ].map(({ name, label, type, required }) => (
                    <div key={name}>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        {label} {required && <span className="text-red-500">*</span>}
                      </label>
                      <input name={name} type={type} required={required}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Special requests <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea name="requests" rows={3} placeholder="Room preferences, accessibility needs, etc."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition resize-none" />
                </div>

                <label className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4 cursor-pointer">
                  <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition ${acceptedTerms ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                    {acceptedTerms && <span className="text-white text-[10px] font-black">✓</span>}
                  </div>
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} required className="sr-only" />
                  <span className="text-sm text-slate-700">
                    I confirm I reviewed all booking details and accept the <a href={termsUrl} target="_blank" rel="noreferrer" className="underline text-blue-600">Zeniva Travel terms</a> and cancellation policies.
                  </span>
                </label>
              </form>
            </section>
          </div>

          {/* RIGHT: Summary + CTA */}
          <aside className="space-y-4 sticky top-4">
            <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Price summary</p>
                <p className="text-white font-black text-lg mt-0.5">{hotelName}</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                {[
                  { label: "Total", val: formatAmount(quote?.total_amount, quote?.total_currency), highlight: true },
                  { label: "Taxes", val: formatAmount(quote?.tax_amount || quote?.taxes_total || quote?.tax, quote?.total_currency) },
                  { label: "Fees", val: formatAmount(quote?.fee_amount || quote?.fees_total || quote?.fees, quote?.total_currency) },
                  { label: "Due at property", val: formatAmount(quote?.due_at_property_amount || quote?.due_at_accommodation_amount || quote?.due_at_property, quote?.total_currency) },
                ].map(({ label, val, highlight }) => val && val !== "N/A" ? (
                  <div key={label} className={`flex items-center justify-between ${highlight ? "border-t border-slate-600 pt-3 mt-3" : ""}`}>
                    <span className={`text-sm ${highlight ? "text-white font-black" : "text-slate-400"}`}>{label}</span>
                    <span className={`font-bold text-sm ${highlight ? "text-amber-400 text-lg" : "text-white"}`}>{val}</span>
                  </div>
                ) : null)}
              </div>

              <div className="px-5 pb-5">
                <button
                  type="submit"
                  form="hotel-review-form"
                  disabled={!acceptedTerms}
                  className="w-full rounded-2xl py-3.5 text-sm font-black tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: acceptedTerms ? "linear-gradient(135deg, #E6B85A, #d4a442)" : "#555",
                    color: acceptedTerms ? "#1a0f00" : "#aaa",
                    boxShadow: acceptedTerms ? "0 4px 15px rgba(230,184,90,0.4)" : "none",
                  }}
                >
                  {proposalTripId ? "✓ Confirm & return to proposal →" : "✓ Continue to payment →"}
                </button>
                <p className="text-center text-slate-500 text-[10px] mt-2">🔒 Secure booking · No payment now</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[["🔒", "Secure"], [isRefundable ? "↩️" : "⚠️", isRefundable ? "Refundable" : "Final"], ["💳", "Pay later"]].map(([icon, label]) => (
                  <div key={label as string}>
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-[10px] font-bold text-slate-600">{label}</p>
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
