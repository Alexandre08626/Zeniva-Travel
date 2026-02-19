"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { persistWorkflowStatePatch } from "../../../../src/lib/workflowPersistence";

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
    if (typeof value === "string" || typeof value === "number") {
      return currency ? `${value} ${currency}` : String(value);
    }
    if (typeof value === "object") {
      const amount = value.amount ?? value.value ?? value.total ?? value.total_amount;
      const cur = value.currency ?? value.currency_code ?? currency;
      if (amount !== undefined && amount !== null) {
        return cur ? `${amount} ${cur}` : String(amount);
      }
    }
    return String(value);
  };

  if (!draft || !quote) {
    return (
      <main className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">No hotel draft found</h1>
          <p className="mt-2 text-sm text-slate-600">Please select a hotel and a room rate first.</p>
          <Link href="/search/hotels" className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Back to hotels search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Review before confirmation</p>
          <h1 className="text-2xl font-black text-slate-900">Hotel booking details</h1>
          <p className="text-sm text-slate-600">{summary.stay} · {summary.guestLabel}{budget ? ` · Budget ${budget}` : ""}</p>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg">Accommodation summary</h3>
            <p><strong>Hotel:</strong> {selectedSearchResult?.name || "Selected hotel"}</p>
            <p><strong>Location:</strong> {selectedSearchResult?.location || destination}</p>
            <p><strong>Dates:</strong> {summary.stay}{nights ? ` · ${nights} night${nights === 1 ? "" : "s"}` : ""}</p>
            <p><strong>Guests:</strong> {summary.guestLabel}</p>
            <p><strong>Room:</strong> {selectedRate?.room_type?.name || selectedSearchResult?.room || "Room"}</p>
            <p><strong>Refundable:</strong> {String(Boolean(selectedRate?.refundable ?? quote?.refundable))}</p>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg">Hotel photos</h3>
            {hotelPhotos.length > 0 ? (
              <div className="space-y-3">
                {activePhoto ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={activePhoto}
                      alt={`${selectedSearchResult?.name || "Hotel"} photo preview`}
                      className="w-full max-h-[420px] object-cover"
                      loading="eager"
                    />
                  </div>
                ) : null}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {visibleHotelPhotos.map((photo, idx) => (
                    <button
                      type="button"
                      key={`${photo}-${idx}`}
                      onClick={() => setActivePhoto(photo)}
                      className={`h-28 md:h-32 overflow-hidden rounded-lg border bg-slate-100 text-left ${
                        activePhoto === photo ? "border-slate-900" : "border-slate-200"
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img
                        src={photo}
                        alt={`${selectedSearchResult?.name || "Hotel"} photo ${idx + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>

                {!showAllPhotos && hotelPhotos.length > 12 ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAllPhotos(true)}
                      className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Voir plus
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
                No photos available for this selected hotel yet.
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Price breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
              <div>Total: {formatAmount(quote?.total_amount, quote?.total_currency)}</div>
              <div>Taxes: {formatAmount(quote?.tax_amount || quote?.taxes_total || quote?.tax, quote?.total_currency)}</div>
              <div>Fees: {formatAmount(quote?.fee_amount || quote?.fees_total || quote?.fees, quote?.total_currency)}</div>
              <div>Due at accommodation: {formatAmount(quote?.due_at_property_amount || quote?.due_at_accommodation_amount || quote?.due_at_property, quote?.total_currency)}</div>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg">Policies & terms</h3>
            <div className="text-sm text-slate-700">
              <div><strong>Cancellation:</strong> {selectedRate?.cancellation_timeline ? "See timeline below" : "See rate conditions"}</div>
              {selectedRate?.cancellation_timeline && Array.isArray(selectedRate.cancellation_timeline) && (
                <ul className="mt-2 list-disc pl-5 text-xs text-slate-600">
                  {selectedRate.cancellation_timeline.map((item: any, idx: number) => (
                    <li key={`${item?.deadline || idx}`}>{item?.deadline || item?.at} · {item?.refund_amount || item?.penalty_amount || "See details"}</li>
                  ))}
                </ul>
              )}
            </div>
            {selectedRate?.conditions && <p className="text-xs text-slate-600">Rate conditions: {selectedRate.conditions}</p>}
            <div className="text-xs text-slate-600">Booking.com terms: <a className="underline" href="https://www.booking.com/content/terms.html" target="_blank" rel="noreferrer">View terms</a></div>
          </div>

          <form
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
                quote_id: quote.id,
                phone_number: phone,
                email,
                guests: [{
                  given_name: firstName,
                  family_name: lastName,
                }],
                accommodation_special_requests: formData.get("requests") as string,
              };

              const persistAndContinue = async () => {
                try {
                  await fetch("/api/auth/me", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      displayName,
                      bookingEmail: email,
                      phone,
                    }),
                  });
                } catch {
                  // Non-blocking for booking flow
                }

                const nextDraft = {
                  ...draft,
                  pendingBooking,
                };
                window.sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(nextDraft));

                if (proposalTripId) {
                  const checklistKey = `proposal_review_checklist_${proposalTripId}`;
                  let existingChecklist = {};
                  try {
                    existingChecklist = JSON.parse(window.localStorage.getItem(checklistKey) || "{}");
                  } catch {
                    existingChecklist = {};
                  }

                  window.localStorage.setItem(
                    checklistKey,
                    JSON.stringify({
                      ...existingChecklist,
                      hotelTravelerConfirmed: true,
                      hotelPoliciesConfirmed: true,
                      hotelCancellationConfirmed: true,
                    })
                  );

                  void persistWorkflowStatePatch({
                    [proposalTripId]: {
                      proposal_review_checklist: {
                        hotelTravelerConfirmed: true,
                        hotelPoliciesConfirmed: true,
                        hotelCancellationConfirmed: true,
                      },
                    },
                  });

                  const modeSuffix = proposalMode === "agent" ? "?mode=agent" : "";
                  router.push(`/proposals/${proposalTripId}/review${modeSuffix}`);
                  return;
                }

                const nextParams = new URLSearchParams({ destination, checkIn, checkOut, guests, rooms, budget, resume: "payment" });
                router.push(`/search/hotels?${nextParams.toString()}`);
              };

              void persistAndContinue();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">First Name</label>
                <input name="firstName" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last Name</label>
                <input name="lastName" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input name="email" type="email" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input name="phone" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Special Requests</label>
              <textarea name="requests" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" rows={3} />
            </div>

            <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-0.5"
                required
              />
              <span>
                I confirm that I reviewed all booking details and I accept the terms and cancellation policies.
                {" "}<a className="underline" href="https://www.booking.com/content/terms.html" target="_blank" rel="noreferrer">View terms</a>
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              <Link href={`/search/hotels?${new URLSearchParams({ destination, checkIn, checkOut, guests, rooms, budget }).toString()}`} className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Back to results
              </Link>
              <button type="submit" disabled={!acceptedTerms} className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${acceptedTerms ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-300 cursor-not-allowed"}`}>
                {proposalTripId ? "Continue to proposal review" : "Continue to payment"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
