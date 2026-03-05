"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../../src/lib/authStore";
import { useTripsStore, createTrip } from "../../../lib/store/tripsStore";
import { upsertDocuments, getDocumentsForUser, DocumentRecord } from "../../../src/lib/documentsStore";
import BookingConfirmation from "../../../src/components/stays/BookingConfirmation";
import { applyHotelMarkupLabel } from "../../../src/lib/partnerMarkup";

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
  photos?: string[];
  provider?: string;
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
  const BOOKING_DRAFT_KEY = "hotel_booking_draft_v1";
  const USE_AMADEUS_ONLY = false;
  const ENABLE_AMADEUS = false;


  const destination = params.get("destination") || "";
  const rawCheckIn = params.get("checkIn") || "";
  const rawCheckOut = params.get("checkOut") || "";
  const guests = params.get("guests") || "2";
  const rooms = params.get("rooms") || "1";
  const budget = params.get("budget") || "";
  const resume = params.get("resume") || "";
  const proposalTripId = params.get("proposalTripId") || "";
  const proposalMode = params.get("mode") === "agent" ? "agent" : "";

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
  const [liteApiOptions, setLiteApiOptions] = useState<StayOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [amadeusLoading, setAmadeusLoading] = useState(false);
  const [liteApiLoading, setLiteApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amadeusError, setAmadeusError] = useState<string | null>(null);
  const [liteApiError, setLiteApiError] = useState<string | null>(null);

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
    support_email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "info@zenivatravel.com",
    support_phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
    terms_url: process.env.NEXT_PUBLIC_TERMS_URL || "https://zenivatravel.com/terms",
  }), []);

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

  const parsePriceAmount = (rawPrice?: string): { amount: number | null; hasPrice: boolean } => {
    if (!rawPrice) return { amount: null, hasPrice: false };
    const trimmed = String(rawPrice || "").trim();
    if (!trimmed) return { amount: null, hasPrice: false };
    if (/price\s+on\s+request/i.test(trimmed)) return { amount: null, hasPrice: false };
    const match = trimmed.match(/^([A-Z]{3})\s*([0-9,.]+)/i);
    const amount = match?.[2] ? Number(match[2].replace(/,/g, "")) : NaN;
    if (Number.isFinite(amount)) return { amount, hasPrice: true };
    return { amount: null, hasPrice: true };
  };

  const mergedOptions = useMemo(() => {
    const all: StayOption[] = [];

    for (const item of liteApiOptions || []) {
      all.push({
        ...(item as any),
        perks: Array.isArray((item as any)?.perks) ? (item as any).perks : [],
        photos: Array.isArray((item as any)?.photos) ? (item as any).photos : [],
        provider: (item as any)?.provider || "liteapi",
      });
    }

    if (ENABLE_AMADEUS) {
      for (const item of amadeusOptions || []) {
        all.push({
          ...(item as any),
          perks: Array.isArray((item as any)?.perks)
            ? (item as any).perks
            : (Array.isArray((item as any)?.amenities) ? (item as any).amenities : []),
          photos: Array.isArray((item as any)?.photos) ? (item as any).photos : [],
          provider: (item as any)?.provider || "amadeus",
        });
      }
    }

    for (const item of options || []) {
      all.push({
        ...(item as any),
        perks: Array.isArray((item as any)?.perks) ? (item as any).perks : [],
        photos: Array.isArray((item as any)?.photos) ? (item as any).photos : [],
        provider: (item as any)?.provider || "duffel",
      });
    }

    // De-dupe by id, keep the first occurrence.
    const byId = new Map<string, StayOption>();
    for (const item of all) {
      if (!item?.id) continue;
      if (!byId.has(item.id)) byId.set(item.id, item);
    }

    const list = Array.from(byId.values());
    // Prefer options with real prices; then sort by amount when parseable.
    list.sort((a, b) => {
      const pa = parsePriceAmount(a.price);
      const pb = parsePriceAmount(b.price);
      if (pa.hasPrice !== pb.hasPrice) return pa.hasPrice ? -1 : 1;
      if (pa.amount !== null && pb.amount !== null) return pa.amount - pb.amount;
      return 0;
    });

    return list;
  }, [liteApiOptions, amadeusOptions, options, ENABLE_AMADEUS]);

  const anySearchLoading = bookingStep === "search" && (loading || (ENABLE_AMADEUS ? amadeusLoading : false) || liteApiLoading);
  const anySearchError =
    bookingStep === "search" &&
    Boolean(error || (ENABLE_AMADEUS ? amadeusError : null) || liteApiError);

  const handleSelectPartnerAccommodation = (option: StayOption) => {
    const provider = (option as any)?.provider;
    if (provider === "liteapi") {
      handleSelectLiteApiAccommodation(option);
      return;
    }
    if (provider === "amadeus") {
      handleSelectAmadeusAccommodation(option);
      return;
    }
    // Default to Duffel flow when we have a searchResultId.
    handleSelectAccommodation(option);
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
      if (typeof window !== "undefined") {
        const draft = {
          selectedSearchResult,
          selectedRateId: rateId,
          selectedRate: rates.find((rate) => rate.id === rateId) || null,
          quote: json.quote,
          searchContext: {
            destination,
            checkIn,
            checkOut,
            guests,
            rooms,
            budget,
            summary,
            nights,
            proposalTripId,
            proposalMode,
          },
        };
        window.sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
      }

      const reviewParams = new URLSearchParams({
        destination,
        checkIn,
        checkOut,
        guests,
        rooms,
        budget,
      });
      if (proposalTripId) {
        reviewParams.set("proposalTripId", proposalTripId);
      }
      if (proposalMode) {
        reviewParams.set("mode", proposalMode);
      }
      router.push(`/booking/hotels/review?${reviewParams.toString()}`);
    } catch (e: any) {
      setError(e?.message || "Failed to create quote");
    } finally {
      setLoading(false);
    }
  };

  const buildAmadeusQuote = (option: StayOption) => {
    const rawPrice = String(option.price || "").trim();
    const match = rawPrice.match(/^([A-Z]{3})\s*([0-9,.]+)(?:\s*\/\s*night)?/i);
    const currency = match?.[1]?.toUpperCase() || "USD";
    const amount = match?.[2] ? Number(match[2].replace(/,/g, "")) : 0;
    const hasNight = /night/i.test(rawPrice);
    const totalAmount = hasNight && nights ? (amount * nights).toFixed(2) : (Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : "0.00");

    return {
      id: `amadeus-quote-${option.id}-${Date.now()}`,
      total_amount: totalAmount,
      total_currency: currency,
      refundable: false,
      provider: "amadeus",
    };
  };

  const buildLiteApiQuote = (option: StayOption) => {
    const rawPrice = String(option.price || "").trim();
    const match = rawPrice.match(/^([A-Z]{3})\s*([0-9,.]+)(?:\s*\/\s*night)?/i);
    const currency = match?.[1]?.toUpperCase() || "USD";
    const amount = match?.[2] ? Number(match[2].replace(/,/g, "")) : 0;
    const hasNight = /night/i.test(rawPrice);
    const totalAmount = hasNight && nights ? (amount * nights).toFixed(2) : (Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : "0.00");

    return {
      id: `liteapi-quote-${option.id}-${Date.now()}`,
      total_amount: totalAmount,
      total_currency: currency,
      refundable: false,
      provider: "liteapi",
    };
  };

  const handleSelectLiteApiAccommodation = (option: StayOption) => {
    const syntheticQuote = buildLiteApiQuote(option);
    const syntheticRate = {
      id: `liteapi-rate-${option.id}`,
      room_type: { name: option.room || "Room" },
      refundable: false,
      conditions: "LiteAPI sourced offer. Final supplier conditions apply at confirmation.",
      cancellation_timeline: [],
      total_amount: syntheticQuote.total_amount,
      total_currency: syntheticQuote.total_currency,
      provider: "liteapi",
    };

    setSelectedId(option.id);
    setSelectedSearchResult(option);
    setQuote(syntheticQuote);
    setRates([syntheticRate]);
    setSelectedRateId(syntheticRate.id);

    if (typeof window !== "undefined") {
      const draft = {
        selectedSearchResult: { ...option, provider: "liteapi" },
        selectedRateId: syntheticRate.id,
        selectedRate: syntheticRate,
        quote: syntheticQuote,
        searchContext: {
          destination,
          checkIn,
          checkOut,
          guests,
          rooms,
          budget,
          summary,
          nights,
          provider: "liteapi",
          proposalTripId,
          proposalMode,
        },
      };
      window.sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
    }

    const reviewParams = new URLSearchParams({
      destination,
      checkIn,
      checkOut,
      guests,
      rooms,
      budget,
    });
    if (proposalTripId) {
      reviewParams.set("proposalTripId", proposalTripId);
    }
    if (proposalMode) {
      reviewParams.set("mode", proposalMode);
    }
    router.push(`/booking/hotels/review?${reviewParams.toString()}`);
  };

  const handleSelectAmadeusAccommodation = (option: StayOption) => {
    const syntheticQuote = buildAmadeusQuote(option);
    const syntheticRate = {
      id: `amadeus-rate-${option.id}`,
      room_type: { name: option.room || "Room" },
      refundable: false,
      conditions: "Amadeus sourced offer. Final supplier conditions apply at confirmation.",
      cancellation_timeline: [],
      total_amount: syntheticQuote.total_amount,
      total_currency: syntheticQuote.total_currency,
      provider: "amadeus",
    };

    setSelectedId(option.id);
    setSelectedSearchResult(option);
    setQuote(syntheticQuote);
    setRates([syntheticRate]);
    setSelectedRateId(syntheticRate.id);

    if (typeof window !== "undefined") {
      const draft = {
        selectedSearchResult: option,
        selectedRateId: syntheticRate.id,
        selectedRate: syntheticRate,
        quote: syntheticQuote,
        searchContext: {
          destination,
          checkIn,
          checkOut,
          guests,
          rooms,
          budget,
          summary,
          nights,
          provider: "amadeus",
          proposalTripId,
          proposalMode,
        },
      };
      window.sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
    }

    const reviewParams = new URLSearchParams({
      destination,
      checkIn,
      checkOut,
      guests,
      rooms,
      budget,
    });
    if (proposalTripId) {
      reviewParams.set("proposalTripId", proposalTripId);
    }
    if (proposalMode) {
      reviewParams.set("mode", proposalMode);
    }
    router.push(`/booking/hotels/review?${reviewParams.toString()}`);
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

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(BOOKING_DRAFT_KEY);
      }

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
      setLiteApiOptions([]);
      setSelectedId("");
      setError(null);
      setAmadeusError(null);
      setLiteApiError(null);
      return;
    }

    if (!ENABLE_AMADEUS) {
      setAmadeusOptions([]);
      setAmadeusError(null);
    }

    // Load Duffel Stays (disabled in Amadeus-only mode)
    const loadDuffelStays = async () => {
      if (USE_AMADEUS_ONLY) {
        setOptions([]);
        setError(null);
        return;
      }

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
        setOptions(list.map((x: any) => ({ ...x, provider: x?.provider || "duffel" })));
      } catch (e: any) {
        setOptions([]);
        console.error("Hotel partner load failed:", e);
        setError("Failed to load some hotel results");
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
        const list: StayOption[] = (json?.offers || []).map((x: any) => ({
          ...x,
          perks: Array.isArray(x?.perks) ? x.perks : (Array.isArray(x?.amenities) ? x.amenities : []),
          photos: Array.isArray(x?.photos) ? x.photos : [],
          provider: x?.provider || "amadeus",
        }));
        setAmadeusOptions(list);
      } catch (e: any) {
        setAmadeusOptions([]);
        console.error("Hotel partner load failed:", e);
        setAmadeusError("Failed to load some hotel results");
      } finally {
        setAmadeusLoading(false);
      }
    };

    // Load LiteAPI hotels search
    const loadLiteApi = async () => {
      setLiteApiLoading(true);
      setLiteApiError(null);
      try {
        const qs = new URLSearchParams({ destination: dest, checkIn, checkOut, guests, rooms }).toString();
        const res = await fetch(`/api/partners/liteapi/hotels/search?${qs}`);
        const json = await res.json().catch(() => null as any);
        if (!res.ok || !json?.ok) {
          const status = (json && (json.status || json.upstreamStatus)) || res.status;
          const attempts = Array.isArray(json?.attempts) ? json.attempts : null;
          const attemptsLabel = attempts ? ` (tried: ${attempts.map((a: any) => `${a.path}:${a.status}`).join(", ")})` : "";
          throw new Error((json?.error || `LiteAPI request failed (HTTP ${status || res.status})`) + attemptsLabel);
        }
        const list: StayOption[] = (json?.offers || []).map((x: any) => ({
          ...x,
          perks: Array.isArray(x?.perks) ? x.perks : [],
          photos: Array.isArray(x?.photos) ? x.photos : [],
          provider: x?.provider || "liteapi",
        }));
        setLiteApiOptions(list);
      } catch (e: any) {
        setLiteApiOptions([]);
        console.error("Hotel partner load failed:", e);
        setLiteApiError("Failed to load some hotel results");
      } finally {
        setLiteApiLoading(false);
      }
    };

    loadDuffelStays();
    if (ENABLE_AMADEUS) {
      loadAmadeus();
    }
    loadLiteApi();
  }, [destination, checkIn, checkOut, guests, rooms, budget, ENABLE_AMADEUS]);

  React.useEffect(() => {
    if (bookingStep !== "search") return;
    if (selectedId) return;
    const first = mergedOptions[0];
    if (!first?.id) return;
    setSelectedId(first.id);
  }, [bookingStep, mergedOptions, selectedId]);

  React.useEffect(() => {
    if (resume !== "payment") return;
    if (typeof window === "undefined") return;

    try {
      const rawDraft = window.sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (!rawDraft) return;
      const draft = JSON.parse(rawDraft);
      if (!draft?.quote) return;

      setSelectedSearchResult(draft.selectedSearchResult || null);
      const selectedRate = draft.selectedRate || null;
      setRates(selectedRate ? [selectedRate] : []);
      setSelectedRateId(draft.selectedRateId || selectedRate?.id || "");
      setQuote(draft.quote);
      setPendingBooking(draft.pendingBooking || null);
      setBookingStep("payment");
    } catch {
      // ignore invalid draft payload
    }
  }, [resume]);

    const STEPS = [
    { key: "search", icon: "🔍", label: "Search" },
    { key: "rates", icon: "🛏", label: "Choose room" },
    { key: "quote", icon: "📋", label: "Review" },
    { key: "payment", icon: "💳", label: "Payment" },
    { key: "booking", icon: "✅", label: "Confirmed" },
  ];
  const stepIdx = STEPS.findIndex(s => s.key === bookingStep);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%)" }} className="px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200 mb-1">🏨 Zeniva Travel · Hotels</p>
              <h1 className="text-3xl font-black">
                {bookingStep === "search" && (destination || "Find your hotel")}
                {bookingStep === "rates" && (selectedSearchResult?.name || "Choose your room")}
                {bookingStep === "quote" && "Review your booking"}
                {bookingStep === "payment" && "Secure payment"}
                {bookingStep === "booking" && "🎉 Booking confirmed!"}
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">{summary.stay} · {summary.guestLabel}{budget ? ` · Budget ${budget}` : ""}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {bookingStep !== "search" && (
                <button onClick={resetBookingFlow} className="rounded-2xl bg-white/15 border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 transition">
                  ← Back
                </button>
              )}
              {bookingStep === "search" && (
                <span className="rounded-2xl bg-emerald-400/20 border border-emerald-400/40 px-3 py-2 text-xs font-bold text-emerald-300">
                  {mergedOptions.length} hotels found
                </span>
              )}
            </div>
          </div>
          {/* Stepper */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${i === stepIdx ? "bg-white text-blue-700" : i < stepIdx ? "bg-white/20 text-white" : "bg-white/10 text-white/50"}`}>
                  <span>{s.icon}</span><span>{s.label}</span>{i < stepIdx && <span>✓</span>}
                </div>
                {i < STEPS.length - 1 && <div className={`w-5 h-px ${i < stepIdx ? "bg-white/60" : "bg-white/20"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-5">
        {bookingStep === "search" && (
          <section>
            {anySearchLoading && (
              <div className="rounded-2xl bg-blue-50 border border-blue-200 px-5 py-4 flex items-center gap-3 mb-4">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full flex-shrink-0" />
                <span className="text-sm font-semibold text-blue-800">Loading hotel results…</span>
              </div>
            )}
            {anySearchError && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-4">
                Some results could not be loaded. Showing what&apos;s available.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mergedOptions.map((h) => {
                const price = getPriceDisplay(h.price);
                return (
                  <button
                    key={h.id}
                    onClick={() => handleSelectPartnerAccommodation(h)}
                    className={`group rounded-3xl overflow-hidden border-2 text-left shadow-sm transition hover:shadow-xl hover:-translate-y-0.5 bg-white ${selectedId === h.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img src={h.image} alt={h.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      {/* Price badge */}
                      <div className="absolute bottom-3 left-3 rounded-xl px-3 py-1.5 text-sm font-black text-white shadow-lg" style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)" }}>
                        {price.primary}
                      </div>
                      {h.badge && (
                        <div className="absolute top-3 right-3 rounded-xl bg-emerald-500 px-2 py-1 text-[10px] font-black text-white shadow">{h.badge}</div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-black text-slate-900 text-base leading-tight">{h.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">📍 {h.location}</p>
                      {h.room && <p className="text-xs text-slate-500 mt-1">🛏 {h.room}</p>}
                      {price.secondary && <p className="text-xs text-blue-600 font-semibold mt-1">{price.secondary}</p>}
                      {(h.perks || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(h.perks || []).slice(0, 3).map((p: any, idx: number) => {
                            const label = typeof p === "string" ? p : (p && (p.label || p.name)) || "";
                            return label ? <span key={`${label}-${idx}`} className="rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5">{label}</span> : null;
                          })}
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-slate-400">{summary.stay}{nights ? ` · ${nights} nights` : ""}</span>
                        <span className="text-xs font-black text-blue-600">View rooms →</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {!anySearchLoading && mergedOptions.length === 0 && !anySearchError && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <div className="text-5xl mb-3">🏨</div>
                <p className="font-black text-slate-900">No hotels found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your dates or destination.</p>
              </div>
            )}
          </section>
        )}

        {bookingStep === "rates" && selectedSearchResult && (
          <section className="space-y-4">
            {loading && <div className="rounded-2xl bg-blue-50 border border-blue-200 px-5 py-4 text-sm font-semibold text-blue-800 flex items-center gap-3"><div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" /> Loading rates…</div>}
            {error && <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">{error}</div>}

            {/* Hotel hero */}
            <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              {selectedSearchResult.image && (
                <div className="relative h-56 w-full overflow-hidden">
                  <img src={selectedSearchResult.image} alt={selectedSearchResult.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h2 className="text-2xl font-black text-white">{selectedSearchResult.name}</h2>
                    <p className="text-white/80 text-sm">📍 {selectedSearchResult.location}</p>
                  </div>
                </div>
              )}
              <div className="p-4 flex flex-wrap gap-4 text-sm text-slate-600 border-t border-slate-100">
                <span>📅 {summary.stay}</span>
                <span>👥 {summary.guestLabel}</span>
                {nights && <span>🌙 {nights} nights</span>}
                {selectedSearchResult.room && <span>🛏 {selectedSearchResult.room}</span>}
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-900">Available rooms</h2>
            <div className="space-y-3">
              {rates.map((rate: any) => (
                <button
                  key={rate.id}
                  onClick={() => handleSelectRate(rate.id)}
                  className={`w-full rounded-2xl border-2 p-5 text-left transition-all ${selectedRateId === rate.id ? "border-blue-500 bg-blue-50 shadow-md" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-black text-slate-900 text-base">{rate.room_type?.name || "Room"}</p>
                      {rate.conditions && <p className="text-xs text-slate-500 mt-0.5">{rate.conditions}</p>}
                      {rate.refundable && <span className="inline-block mt-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5">✓ Free cancellation</span>}
                      {rate.cancellation_timeline && Array.isArray(rate.cancellation_timeline) && rate.cancellation_timeline.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1">Cancellation: {rate.cancellation_timeline.length} policy steps</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black text-slate-900">{rate.total_amount} <span className="text-sm font-semibold">{rate.total_currency}</span></p>
                      {selectedRateId === rate.id && <p className="text-xs text-blue-600 font-bold mt-1">✓ Selected</p>}
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
