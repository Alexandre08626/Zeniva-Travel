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
  return /night|nightly|per night/i.test(label);
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `$${rounded.toLocaleString()}`;
}

export function computePrice(selection: any, tripDraft: any, options?: { strict?: boolean }) {
  const strict = options?.strict ?? true;
  const travelers = parseTravelers(tripDraft?.adults ?? tripDraft?.travelers ?? tripDraft?.guests);
  const nights = parseNights(
    tripDraft?.dates || (tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} - ${tripDraft.checkOut}` : undefined)
  );

  const flightBaseParsed = parseMoney(selection?.flight?.price);
  const flightBase = flightBaseParsed ?? (strict ? 0 : 1850);

  const hotelItems = [selection?.hotel, ...(tripDraft?.extraHotels || [])].filter(Boolean);
  const hotelTotal = hotelItems.reduce((sum: number, item: any) => {
    const amountParsed = parseMoney(item?.price);
    const amount = amountParsed ?? 0;
    if (isNightly(item?.price)) {
      return sum + amount * nights;
    }
    return sum + amount;
  }, 0);

  const activityItems = [selection?.activity, ...(tripDraft?.extraActivities || [])].filter(Boolean);
  const transferItems = [selection?.transfer, ...(tripDraft?.extraTransfers || [])].filter(Boolean);

  const activityTotal = activityItems.reduce((sum: number, item: any) => sum + (parseMoney(item?.price) ?? 0), 0);
  const transferTotal = transferItems.reduce((sum: number, item: any) => sum + (parseMoney(item?.price) ?? 0), 0);

  const hasFlightPrice = flightBaseParsed !== null;
  const hasHotelPrice = hotelItems.some((item: any) => parseMoney(item?.price) !== null);
  const hasActivityPrice = activityItems.some((item: any) => parseMoney(item?.price) !== null);
  const hasTransferPrice = transferItems.some((item: any) => parseMoney(item?.price) !== null);
  const hasAnyPrice = hasFlightPrice || hasHotelPrice || hasActivityPrice || hasTransferPrice;

  const flightTotal = flightBase * travelers;
  const fees = hasAnyPrice || !strict ? 180 : 0;
  const total = flightTotal + hotelTotal + activityTotal + transferTotal + fees;

  return {
    travelers,
    nights,
    flightBase,
    hotelNightly: parseMoney(selection?.hotel?.price) ?? (strict ? 0 : 420),
    flightTotal,
    hotelTotal,
    activityTotal,
    transferTotal,
    fees,
    total,
    hasFlightPrice,
    hasHotelPrice,
    hasActivityPrice,
    hasTransferPrice,
    hasAnyPrice,
  };
}
