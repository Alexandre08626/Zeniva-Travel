"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "../../../src/lib/authStore";
import { useTripsStore, createTrip } from "../../../lib/store/tripsStore";
import { upsertDocuments, getDocumentsForUser, DocumentRecord } from "../../../src/lib/documentsStore";

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
  const params = useSearchParams();
  const destination = params.get("destination") || "";
  const checkIn = params.get("checkIn") || "";
  const checkOut = params.get("checkOut") || "";
  const guests = params.get("guests") || "2";
  const rooms = params.get("rooms") || "1";
  const budget = params.get("budget") || "";

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
  const [bookingStep, setBookingStep] = useState<'search' | 'rates' | 'quote' | 'booking'>('search');

  const user = useAuthStore((s) => s.user);
  const userId = user?.email || "";
  const { trips } = useTripsStore((s) => ({ trips: s.trips }));

  const summary = useMemo(() => {
    const stay = checkIn && checkOut ? `${checkIn} → ${checkOut}` : checkIn || checkOut || "Select dates";
    const guestLabel = `${guests} guest${guests === "1" ? "" : "s"}${rooms ? ` · ${rooms} room${rooms === "1" ? "" : "s"}` : ""}`;
    return { stay, guestLabel };
  }, [checkIn, checkOut, guests, rooms]);

  const askPrompt = `Shortlist hotels in ${destination || "this city"} for ${summary.guestLabel}${budget ? ` under ${budget}` : ""}. Dates ${summary.stay}. Highlight VIP perks and flexible cancel. Keep ${selectedId || "top pick"} selected.`;

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

  const handleCreateBooking = async (bookingData: any) => {
    setLoading(true);
    setError(null);

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
      setError(e?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const resetBookingFlow = () => {
    setSelectedSearchResult(null);
    setRates([]);
    setSelectedRateId("");
    setQuote(null);
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
              {bookingStep === 'booking' && 'Booking confirmed'}
            </p>
            <h1 className="text-2xl font-black text-slate-900">
              {bookingStep === 'search' && (destination || "Choose destination")}
              {bookingStep === 'rates' && (selectedSearchResult?.name || "Select room")}
              {bookingStep === 'quote' && "Confirm your booking"}
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
                      <p className="text-lg font-bold text-slate-900">{h.price}</p>
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
                      <p className="text-lg font-bold text-slate-900">{h.price}</p>
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
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Booking Summary</h3>
                <p><strong>Hotel:</strong> {selectedSearchResult?.name}</p>
                <p><strong>Total:</strong> {quote.total_amount} {quote.total_currency}</p>
                <p><strong>Check-in:</strong> {checkIn}</p>
                <p><strong>Check-out:</strong> {checkOut}</p>
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
                      born_on: formData.get('birthDate') as string,
                    }],
                    accommodation_special_requests: formData.get('requests') as string,
                  };
                  handleCreateBooking(bookingData);
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Birth Date</label>
                    <input name="birthDate" type="date" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
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
                  Complete Booking
                </button>
              </form>
            </div>
          </section>
        )}

        {bookingStep === 'booking' && (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
              <p className="text-slate-600">Your accommodation booking has been successfully created.</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
