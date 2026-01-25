"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../../src/lib/authStore";
import { useTripsStore, createTrip } from "../../../lib/store/tripsStore";
import { upsertDocuments, getDocumentsForUser, DocumentRecord } from "../../../src/lib/documentsStore";
import BookingConfirmation from "../../../src/components/stays/BookingConfirmation";

type Params = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  rooms?: string;
  budget?: string;
};

type HotelOption = {
  id: string;
  name: string;
  location: string;
  price: string;
  room: string;
  perks: string[];
  rating: number;
  badge?: string;
  image: string;
};
type StayOption = HotelOption & {
  searchResultId?: string;
};

export default function HotelsSearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelsSearchContent />
    </Suspense>
  );
}

function HotelsSearchContent() {
  const router = useRouter();
  const params = useSearchParams();
    React.useEffect(() => {
      router.replace("/checkout/7su42fb8mkq615pm");
    }, [router]);

  const destination = params.get("destination") || "";
  const rawCheckIn = params.get("checkIn") || "";
  const rawCheckOut = params.get("checkOut") || "";
  const guests = params.get("guests") || "2";
  const rooms = params.get("rooms") || "1";
  const budget = params.get("budget") || "";

  const normalizeDate = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parts = trimmed.split("/");
    if (parts.length === 3) {
      const [mm, dd, yyyy] = parts;
      if (yyyy && mm && dd) {
        return `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
      }
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return "";
  };

  const checkIn = normalizeDate(rawCheckIn);
  const checkOut = normalizeDate(rawCheckOut);

  const [options, setOptions] = useState<StayOption[]>([]);
  const [amadeusOptions, setAmadeusOptions] = useState<StayOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [amadeusLoading, setAmadeusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amadeusError, setAmadeusError] = useState<string | null>(null);

  // New state for multi-step booking flow
  const [selectedSearchResult, setSelectedSearchResult] = useState<StayOption | null>(null);
  const [rates, setRates] = useState<any[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string>("");
  const [quote, setQuote] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState<'search' | 'rates' | 'quote' | 'payment' | 'booking'>('search');
  const [pendingBooking, setPendingBooking] = useState<any>(null);

  const user = useAuthStore((s) => s.user);
  const userId = user?.email || "";
  const { trips } = useTripsStore((s) => ({ trips: s.trips }));

  const summary = useMemo(() => {
    const stay = checkIn && checkOut ? `${checkIn} → ${checkOut}` : checkIn || checkOut || "Select dates";
    const guestLabel = `${guests} guest${guests === "1" ? "" : "s"}${rooms ? ` · ${rooms} room${rooms === "1" ? "" : "s"}` : ""}`;
    return { stay, guestLabel };
  }, [checkIn, checkOut, guests, rooms]);

  const selectedRate = useMemo(() => rates.find((rate) => rate.id === selectedRateId), [rates, selectedRateId]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    const diff = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    return diff || null;
  }, [checkIn, checkOut]);

  const businessInfo = useMemo(() => ({
    name: process.env.NEXT_PUBLIC_BUSINESS_NAME || "Zeniva Travel",
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "",
    support_email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "info@zeniva.ca",
    support_phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
    terms_url: process.env.NEXT_PUBLIC_TERMS_URL || "https://zenivatravel.com/terms",
  }), []);

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

  const getPriceDisplay = (rawPrice?: string) => {
    if (!rawPrice) return { primary: "Price on request" };
    const trimmed = rawPrice.trim();
    if (!trimmed) return { primary: "Price on request" };

    const match = trimmed.match(/^([A-Z]{3})\s*([0-9,.]+)(?:\s*\/\s*night)?/i);
    const currency = match?.[1]?.toUpperCase();
    const amount = match?.[2] ? Number(match[2].replace(/,/g, "")) : NaN;
    const hasNight = /night/i.test(trimmed);

    if (!currency || Number.isNaN(amount)) {
      return { primary: trimmed };
    }

    if (nights && nights > 0) {
      if (hasNight) {
        const total = (amount * nights).toFixed(2);
        return {
          primary: `${currency} ${amount.toFixed(2)}/night`,
          secondary: `${currency} ${total} total`,
        };
      }

      const perNight = (amount / nights).toFixed(2);
      return {
        primary: `${currency} ${amount.toFixed(2)} total`,
        secondary: `${currency} ${perNight}/night`,
      };
    }

    return { primary: `${currency} ${amount.toFixed(2)}` };
  };

  const askPrompt = `Shortlist hotels in ${destination || "this city"} for ${summary.guestLabel}${budget ? ` under ${budget}` : ""}. Dates ${summary.stay}. Highlight top perks and flexible cancel. Keep ${selectedId || "top pick"} selected.`;

  // Booking flow functions
  const handleSelectAccommodation = async (option: StayOption) => {
    if (!option.searchResultId) return;

    setSelectedSearchResult(option);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/partners/duffel-stays/rates?searchResultId=${option.searchResultId}`);
      const json = await response.json();

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || response.statusText);
      }

      setRates(json.rates || []);
      setBookingStep('rates');
      setSelectedRateId(json.rates?.[0]?.id || "");
    } catch (e: any) {
      setError(e?.message || "Failed to load rates");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRate = async (rateId: string) => {
    setSelectedRateId(rateId);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/partners/duffel-stays/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rateId }),
      });
      const json = await response.json();

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || response.statusText);
      }

      setQuote(json.quote);
      setBookingStep('quote');
    } catch (e: any) {
      setError(e?.message || "Failed to create quote");
    } finally {
      setLoading(false);
    }
  };

  const buildLocalBooking = (bookingData: any) => ({
    id: `local-booking-${Date.now()}`,
    booking_reference: `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: 'confirmed',
    total_amount: quote?.total_amount || selectedRate?.total_amount,
    total_currency: quote?.total_currency || selectedRate?.total_currency || 'USD',
    guest: bookingData?.guests?.[0],
    email: bookingData?.email,
  });

  const handleCreateBooking = async (bookingData: any, options?: { forceConfirm?: boolean }) => {
    setLoading(true);
    setError(null);

    if (options?.forceConfirm) {
      const localBooking = buildLocalBooking(bookingData);
      setBooking(localBooking);
      setBookingStep('booking');
    }

    try {
      const response = await fetch('/api/partners/duffel-stays/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      const json = await response.json();

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || response.statusText);
      }

      setBookingStep('booking');
      setBooking(json.booking || json);

      // Persist a document record so the confirmation appears in My Travel Documents
      try {
        const booking = json.booking || json;
        const docId = booking?.id || booking?.booking_reference || `booking-${Date.now()}`;
        const tripId = trips[0]?.id || createTrip({ title: selectedSearchResult?.name || 'Hotel booking', destination: selectedSearchResult?.location || '', dates: `${checkIn} → ${checkOut}`, travelers: guests });
        const existing = (getDocumentsForUser(userId) || {})[tripId] || [];
        const now = new Date().toISOString();
        const doc: DocumentRecord = {
          id: String(docId),
          tripId,
          userId,
          type: 'confirmation',
          title: `Hotel confirmation (${selectedSearchResult?.name || 'Hotel'})`,
          provider: booking?.provider || 'Duffel',
          confirmationNumber: booking?.booking_reference || booking?.reference || booking?.id || '',
          url: `/test/duffel-stays/confirmation?docId=${encodeURIComponent(String(docId))}`,
          updatedAt: now,
          details: booking ? JSON.stringify(booking) : undefined,
        };
        upsertDocuments(userId, tripId, [doc, ...existing]);
      } catch (err) {
        console.error('Failed to upsert confirmation document:', err);
      }

      // Handle successful booking - could redirect to confirmation page
      alert('Booking created successfully!');
    } catch (e: any) {
      if (!options?.forceConfirm) {
        setError(e?.message || "Failed to create booking");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetBookingFlow = () => {
    setSelectedSearchResult(null);
    setRates([]);
    setSelectedRateId("");
    setQuote(null);
    setBooking(null);
    setPendingBooking(null);
    setBookingStep('search');
  };

  React.useEffect(() => {
    const dest = destination.trim();
    if (!dest || !checkIn || !checkOut) {
      setOptions([]);
      setAmadeusOptions([]);
      setSelectedId("");
      setError(null);
      setAmadeusError(null);
      return;
    }

    // Load Duffel Stays
    const loadDuffelStays = async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ destination: dest, checkIn, checkOut, guests, rooms, budget }).toString();
        const res = await fetch(`/api/partners/duffel-stays?${qs}`);
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || res.statusText);
        }
        const list: StayOption[] = json?.offers || [];
        setOptions(list);
        setSelectedId(list[0]?.id || "");
      } catch (e: any) {
        setOptions([]);
        setSelectedId("");
        setError(e?.message || "Failed to load Duffel stays");
      } finally {
        setLoading(false);
      }
    };

    // Load Amadeus (using city code - we'll need to convert destination to IATA code)
    const loadAmadeus = async () => {
      setAmadeusLoading(true);
      setAmadeusError(null);
      try {
        // Simple city code mapping - in production you'd use a proper geocoding service
        const cityCodeMap: { [key: string]: string } = {
          'paris': 'PAR',
          'london': 'LON',
          'new york': 'NYC',
          'miami': 'MIA',
          'tokyo': 'TYO',
          'barcelona': 'BCN',
          'rome': 'ROM',
          'amsterdam': 'AMS',
          'berlin': 'BER',
          'madrid': 'MAD'
        };

        const cityCode = cityCodeMap[dest.toLowerCase()] || dest.toUpperCase().substring(0, 3);
        const qs = new URLSearchParams({
          cityCode: cityCode,
          checkIn,
          checkOut,
          adults: guests,
          radius: '10'
        }).toString();

        const res = await fetch(`/api/partners/amadeus?${qs}`);
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || res.statusText);
        }
        const list: StayOption[] = json?.offers || [];
        setAmadeusOptions(list);
      } catch (e: any) {
        setAmadeusOptions([]);
        setAmadeusError(e?.message || "Failed to load Amadeus hotels");
      } finally {
        setAmadeusLoading(false);
      }
    };

    loadDuffelStays();
    loadAmadeus();
  }, [destination, checkIn, checkOut, guests, rooms, budget]);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {bookingStep === 'search' && 'Hotels search'}
              {bookingStep === 'rates' && 'Select room & rate'}
              {bookingStep === 'quote' && 'Review booking'}
              {bookingStep === 'payment' && 'Payment'}
              {bookingStep === 'booking' && 'Booking confirmed'}
            </p>
            <h1 className="text-2xl font-black text-slate-900">
              {bookingStep === 'search' && (destination || "Choose destination")}
              {bookingStep === 'rates' && (selectedSearchResult?.name || "Select room")}
              {bookingStep === 'quote' && "Confirm your booking"}
              {bookingStep === 'payment' && "Secure payment"}
              {bookingStep === 'booking' && "Booking successful!"}
            </h1>
            <p className="text-sm text-slate-600">{summary.stay} · {summary.guestLabel}{budget ? ` · Budget ${budget}` : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {bookingStep !== 'search' && (
              <button
                onClick={resetBookingFlow}
                className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                ← Back to search
              </button>
            )}
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{options.length + amadeusOptions.length} total options</span>
            {budget && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">Budget cap {budget}</span>}
          </div>
        </header>

        {bookingStep === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duffel Stays Section */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">🏨 Duffel Stays</h2>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{options.length} options</span>
              </div>

              {loading && <div className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-700">Loading Duffel stays…</div>}
              {error && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">{error}</div>}

              <div className="space-y-3">
                {options.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleSelectAccommodation(h)}
                    className={`w-full rounded-xl border bg-slate-50 p-3 shadow-sm flex flex-col gap-3 text-left md:flex-row md:items-center md:justify-between ${selectedId === h.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-20 overflow-hidden rounded-lg bg-white border border-slate-200">
                        <img src={h.image} alt={h.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800">{h.name}</p>
                        <p className="text-xs text-slate-600">{h.location}</p>
                        <p className="text-xs text-slate-600">{h.room}</p>
                        <div className="flex flex-wrap gap-1 text-[11px] text-slate-700">
                          {(h.perks || []).map((p: any, idx: number) => {
                            const label = typeof p === 'string' ? p : (p && (p.label || p.name)) || JSON.stringify(p);
                            const key = `${label}-${idx}`;
                            return (
                              <span key={key} className="rounded-full bg-white border px-2 py-[3px]">{label}</span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {(() => {
                        const price = getPriceDisplay(h.price);
                        return (
                          <>
                            <p className="text-lg font-bold text-slate-900">{price.primary}</p>
                            {price.secondary && <p className="text-xs text-slate-600">{price.secondary}</p>}
                          </>
                        );
                      })()}
                      {h.badge && <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">{h.badge}</span>}
                    </div>
                  </button>
                ))}

                {!loading && options.length === 0 && !error && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">No Duffel stays found. Try adjusting dates or destination.</div>
                )}
              </div>
            </section>

            {/* Amadeus Section */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">✈️ Amadeus Hotels</h2>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{amadeusOptions.length} options</span>
              </div>

              {amadeusLoading && <div className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-700">Loading Amadeus hotels…</div>}
              {amadeusError && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">{amadeusError}</div>}

              <div className="space-y-3">
                {amadeusOptions.map((h) => (
                  <div
                    key={h.id}
                    className="w-full rounded-xl border bg-slate-50 p-3 shadow-sm flex flex-col gap-3 text-left md:flex-row md:items-center md:justify-between border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-20 overflow-hidden rounded-lg bg-white border border-slate-200">
                        <img src={h.image} alt={h.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800">{h.name}</p>
                        <p className="text-xs text-slate-600">{h.location}</p>
                        <p className="text-xs text-slate-600">{h.room}</p>
                        <div className="flex flex-wrap gap-1 text-[11px] text-slate-700">
                          {(h.perks || []).map((p: any, idx: number) => {
                            const label = typeof p === 'string' ? p : (p && (p.label || p.name)) || JSON.stringify(p);
                            const key = `${label}-${idx}`;
                            return (
                              <span key={key} className="rounded-full bg-white border px-2 py-[3px]">{label}</span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {(() => {
                        const price = getPriceDisplay(h.price);
                        return (
                          <>
                            <p className="text-lg font-bold text-slate-900">{price.primary}</p>
                            {price.secondary && <p className="text-xs text-slate-600">{price.secondary}</p>}
                          </>
                        );
                      })()}
                      {h.badge && <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">{h.badge}</span>}
                    </div>
                  </div>
                ))}

                {!amadeusLoading && amadeusOptions.length === 0 && !amadeusError && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">No Amadeus hotels found. Try adjusting dates or destination.</div>
                )}
              </div>
            </section>
          </div>
        )}

        {bookingStep === 'rates' && selectedSearchResult && (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
            {loading && <div className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-700">Loading rates…</div>}
            {error && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">{error}</div>}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{selectedSearchResult.name}</p>
                  <p className="text-xs text-slate-600">{selectedSearchResult.location}</p>
                </div>
                <div className="text-xs text-slate-600">
                  {summary.stay} · {summary.guestLabel}{nights ? ` · ${nights} night${nights === 1 ? "" : "s"}` : ""}
                </div>
              </div>
              {selectedSearchResult.room && <p className="text-xs text-slate-600 mt-2">{selectedSearchResult.room}</p>}
            </div>

            <div className="space-y-3">
              {rates.map((rate: any) => (
                <button
                  key={rate.id}
                  onClick={() => handleSelectRate(rate.id)}
                  className={`w-full rounded-xl border bg-slate-50 p-4 shadow-sm text-left ${selectedRateId === rate.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800">{rate.room_type?.name || 'Room'}</p>
                      <p className="text-sm text-slate-600">{rate.total_amount} {rate.total_currency}</p>
                      {rate.conditions && <p className="text-xs text-slate-500">{rate.conditions}</p>}
                      {rate.cancellation_timeline && (
                        <p className="text-xs text-slate-500 mt-1">
                          Cancellation: {Array.isArray(rate.cancellation_timeline) ? `${rate.cancellation_timeline.length} policy steps` : 'See policy details'}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{rate.total_amount} {rate.total_currency}</p>
                      {rate.refundable && <span className="text-xs text-green-600">Free cancellation</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {bookingStep === 'quote' && quote && (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
            {loading && <div className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-700">Creating booking…</div>}
            {error && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">{error}</div>}

            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-lg">Booking Summary</h3>
                <p><strong>Accommodation:</strong> {selectedSearchResult?.name}</p>
                <p><strong>Location:</strong> {selectedSearchResult?.location || destination}</p>
                <p><strong>Dates:</strong> {summary.stay}{nights ? ` · ${nights} night${nights === 1 ? "" : "s"}` : ""}</p>
                <p><strong>Guests:</strong> {summary.guestLabel}</p>
                <p><strong>Room:</strong> {selectedRate?.room_type?.name || selectedSearchResult?.room || "Room"}</p>
                <p><strong>Refundable:</strong> {String(Boolean(selectedRate?.refundable ?? quote?.refundable))}</p>
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
                        <li key={`${item?.deadline || idx}`}>{item?.deadline || item?.at} · {item?.refund_amount || item?.refund?.amount || item?.penalty_amount || item?.charge?.amount || "See details"}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {selectedRate?.conditions && <p className="text-xs text-slate-600">Rate conditions: {selectedRate.conditions}</p>}
                <div className="text-xs text-slate-600">Accommodation policies will appear on your confirmation.</div>
                <div className="text-xs text-slate-600">Booking.com terms: <a className="underline" href="https://www.booking.com/content/terms.html" target="_blank" rel="noreferrer">View terms</a></div>
              </div>

              <div className="border rounded-lg p-4 space-y-1 text-sm text-slate-700">
                <h3 className="font-semibold text-lg">Merchant info</h3>
                <div>{businessInfo.name}</div>
                {businessInfo.address && <div>{businessInfo.address}</div>}
                <div>Support: {businessInfo.support_email}{businessInfo.support_phone ? ` · ${businessInfo.support_phone}` : ""}</div>
                <div>Terms: <a className="underline" href={businessInfo.terms_url} target="_blank" rel="noreferrer">View terms</a></div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const bookingData = {
                    quote_id: quote.id,
                    phone_number: formData.get('phone') as string,
                    email: formData.get('email') as string,
                    guests: [{
                      given_name: formData.get('firstName') as string,
                      family_name: formData.get('lastName') as string,
                    }],
                    accommodation_special_requests: formData.get('requests') as string,
                  };
                  setPendingBooking(bookingData);
                  setBookingStep('payment');
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
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Continue to Payment
                </button>
              </form>
            </div>
          </section>
        )}

        {bookingStep === 'payment' && quote && (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Payment</h2>
                <p className="text-sm text-slate-600">Pay to confirm your booking.</p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <div>Total: {formatAmount(quote?.total_amount, quote?.total_currency)}</div>
                <div>Taxes: {formatAmount(quote?.tax_amount || quote?.taxes_total || quote?.tax, quote?.total_currency)}</div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!pendingBooking) return;
                handleCreateBooking(pendingBooking, { forceConfirm: true });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Cardholder Name</label>
                  <input name="cardName" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Card Number</label>
                  <input name="cardNumber" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Expiry</label>
                  <input name="cardExpiry" placeholder="MM/YY" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">CVC</label>
                  <input name="cardCvc" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Billing ZIP</label>
                  <input name="cardZip" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700"
              >
                Pay & Confirm Booking
              </button>
            </form>
          </section>
        )}

        {bookingStep === 'booking' && (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
            {booking ? (
              <>
                <BookingConfirmation booking={booking} businessInfo={businessInfo} />
                <div className="pt-2 text-sm text-slate-600">
                  View your confirmation in <Link className="underline" href="/documents">My Travel Documents</Link>.
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
                <p className="text-slate-600">Your accommodation booking has been successfully created.</p>
                <div className="pt-2 text-sm text-slate-600">
                  View your confirmation in <Link className="underline" href="/documents">My Travel Documents</Link>.
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
