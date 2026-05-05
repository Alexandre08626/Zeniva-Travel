export function parseMoney(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const numeric = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return Number.isNaN(numeric) ? null : Math.round(numeric * 100) / 100;
}

function parseTravelers(raw: unknown): number {
  if (typeof raw === "number" && raw > 0) return Math.round(raw);
  if (typeof raw === "string") {
    const match = raw.match(/(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n) && n > 0) return n;
    }
  }
  return 2;
}

function parseDate(value: string): Date | null {
  const ts = Date.parse(value.trim());
  return Number.isNaN(ts) ? null : new Date(ts);
}

function parseNights(raw: unknown): number {
  const fallback = 5;
  if (typeof raw !== "string") return fallback;

  const nightsMatch = raw.match(/(\d+)\s*nights?/i);
  if (nightsMatch) {
    const n = parseInt(nightsMatch[1], 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }

  const isoMatch = raw.match(/(\d{4}-\d{2}-\d{2})\s*(?:→|–|—|-)\s*(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    const start = parseDate(isoMatch[1]);
    const end = parseDate(isoMatch[2]);
    if (start && end) {
      const diffMs = end.getTime() - start.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) return diffDays;
    }
  }

  const parts = raw.split(/\s+(?:→|–|—|-|to)\s+/i);
  if (parts.length >= 2) {
    const start = parseDate(parts[0]);
    const end = parseDate(parts[1]);
    if (start && end) {
      const diffMs = end.getTime() - start.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) return diffDays;
    }
  }

  return fallback;
}

function isNightly(label?: string) {
  if (!label) return false;
  return /night|nightly|per night|nuit/i.test(label);
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `$${rounded.toLocaleString()}`;
}

// Single source-of-truth hotel pricing extractor. Hotels reach the proposal
// payload from many sources (LiteAPI search → agent select → preview, traveler
// flow, ZeniStay villas, Duffel Stays test). Each source labels the price
// slightly differently — sometimes per-night, sometimes total, sometimes a
// numeric `priceTotal` is set explicitly. This helper normalizes all of them
// so downstream code never has to guess.
export function extractHotelPricing(
  h: any,
  nights: number,
): { totalPrice: number; perNight: number; source: "explicit-total" | "explicit-per-night" | "string-per-night" | "string-total" | "none" } {
  const n = Number.isFinite(nights) && nights > 0 ? nights : 1;
  const num = (v: unknown) => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const parsed = parseFloat(v.replace(/[^0-9.]/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  // 1) Explicit numeric fields on the hotel object win (LiteAPI v3 + select).
  const explicitTotal = num(h?.priceTotal) ?? num(h?.totalPrice);
  const explicitPerNight = num(h?.pricePerNight) ?? num(h?.nightlyPrice);
  if (explicitTotal != null && explicitPerNight != null) {
    return { totalPrice: explicitTotal, perNight: explicitPerNight, source: "explicit-total" };
  }
  if (explicitTotal != null) {
    return {
      totalPrice: explicitTotal,
      perNight: Math.round(explicitTotal / n),
      source: "explicit-total",
    };
  }
  if (explicitPerNight != null) {
    return {
      totalPrice: Math.round(explicitPerNight * n),
      perNight: explicitPerNight,
      source: "explicit-per-night",
    };
  }

  // 2) Fall back to parsing the legacy `price` string.
  const raw = h?.price;
  const amount = num(raw);
  if (amount == null) {
    return { totalPrice: 0, perNight: 0, source: "none" };
  }
  if (typeof raw === "string" && isNightly(raw)) {
    return { totalPrice: Math.round(amount * n), perNight: amount, source: "string-per-night" };
  }
  // Numeric price or string without "/night" → treat as TOTAL across the stay.
  return {
    totalPrice: amount,
    perNight: n > 0 ? Math.round(amount / n) : amount,
    source: "string-total",
  };
}

export function computePrice(selection: any, tripDraft: any, options?: { strict?: boolean }) {
  const strict = options?.strict ?? true;
  const serviceFeePct = 0.06;
  const travelers = parseTravelers(tripDraft?.adults ?? tripDraft?.travelers ?? tripDraft?.guests);
  const nights = parseNights(
    tripDraft?.dates || (tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} - ${tripDraft.checkOut}` : undefined)
  );

  const flightBaseParsed = parseMoney(selection?.flight?.price);
  const flightBase = flightBaseParsed ?? (strict ? 0 : 1850);

  const hotelItems = [selection?.hotel, ...(tripDraft?.extraHotels || [])].filter(Boolean);
  const hotelTotal = hotelItems.reduce((sum: number, item: any) => {
    return sum + extractHotelPricing(item, nights).totalPrice;
  }, 0);

  const activityItems = [selection?.activity, ...(tripDraft?.extraActivities || [])].filter(Boolean);
  const transferItems = [selection?.transfer, ...(tripDraft?.extraTransfers || [])].filter(Boolean);

  const activityTotal = activityItems.reduce((sum: number, item: any) => sum + (parseMoney(item?.price) ?? 0), 0);
  const transferTotal = transferItems.reduce((sum: number, item: any) => sum + (parseMoney(item?.price) ?? 0), 0);

  const hasFlightPrice = flightBaseParsed !== null;
  const hasHotelPrice = hotelItems.some(
    (item: any) =>
      parseMoney(item?.priceTotal) !== null ||
      parseMoney(item?.pricePerNight) !== null ||
      parseMoney(item?.price) !== null,
  );
  const hasActivityPrice = activityItems.some((item: any) => parseMoney(item?.price) !== null);
  const hasTransferPrice = transferItems.some((item: any) => parseMoney(item?.price) !== null);
  const hasAnyPrice = hasFlightPrice || hasHotelPrice || hasActivityPrice || hasTransferPrice;

  const flightTotal = flightBase * travelers;
  const subtotal = flightTotal + hotelTotal + activityTotal + transferTotal;
  const fees = hasAnyPrice || !strict ? Math.round(subtotal * serviceFeePct * 100) / 100 : 0;
  const total = subtotal + fees;

  return {
    travelers,
    nights,
    flightBase,
    hotelNightly: selection?.hotel
      ? extractHotelPricing(selection.hotel, nights).perNight
      : (strict ? 0 : 420),
    flightTotal,
    hotelTotal,
    activityTotal,
    transferTotal,
    subtotal,
    fees,
    serviceFeePct,
    total,
    hasFlightPrice,
    hasHotelPrice,
    hasActivityPrice,
    hasTransferPrice,
    hasAnyPrice,
  };
}
