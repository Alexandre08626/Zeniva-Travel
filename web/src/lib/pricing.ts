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

  const parts = raw.split(/→|–|-/);
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

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `$${rounded.toLocaleString()}`;
}

export function computePrice(selection: any, tripDraft: any) {
  const travelers = tripDraft?.adults || 2;
  const nights = tripDraft?.checkIn && tripDraft?.checkOut ? Math.max(1, Math.round((new Date(tripDraft.checkOut).getTime() - new Date(tripDraft.checkIn).getTime()) / (1000 * 60 * 60 * 24))) : 5;

  const flightBase = parseMoney(selection?.flight?.price) ?? 1850;
  const hotelNightly = parseMoney(selection?.hotel?.price) ?? 420;
  const activityTotal = parseMoney(selection?.activity?.price) ?? 0;
  const transferTotal = parseMoney(selection?.transfer?.price) ?? 0;

  const flightTotal = flightBase * travelers;
  const hotelTotal = hotelNightly * nights;
  const fees = 180;
  const total = flightTotal + hotelTotal + activityTotal + transferTotal + fees;

  return {
    travelers,
    nights,
    flightBase,
    hotelNightly,
    flightTotal,
    hotelTotal,
    activityTotal,
    transferTotal,
    fees,
    total,
  };
}
