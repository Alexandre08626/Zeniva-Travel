const HOTEL_MARKUP = 0.12;
const FLIGHT_MARKUP = 0.05;

type ParsedLabel = {
  currency: string;
  amount: number;
  tail: string;
};

function parseCurrencyLabel(raw: string): ParsedLabel | null {
  const s = String(raw || "").trim();
  if (!s) return null;

  // e.g. "USD 123.45", "USD 123.45/night"
  const m = s.match(/^([A-Z]{3})\s*([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/i);
  if (!m) return null;

  const currency = m[1].toUpperCase();
  const amount = Number(String(m[2]).replace(/,/g, ""));
  if (!Number.isFinite(amount)) return null;

  return { currency, amount, tail: m[3] || "" };
}

function formatCurrencyLabel(parsed: ParsedLabel): string {
  const tail = parsed.tail || "";
  const amount = Math.round(parsed.amount * 100) / 100;
  return `${parsed.currency} ${amount.toFixed(2)}${tail}`;
}

export function applyMarkupToAmount(amount: number, percent: number): number {
  if (!Number.isFinite(amount)) return amount;
  return amount * (1 + percent);
}

export function applyMarkupToPriceLabel(raw: string, percent: number): string {
  const parsed = parseCurrencyLabel(raw);
  if (!parsed) return raw;
  const next = {
    ...parsed,
    amount: applyMarkupToAmount(parsed.amount, percent),
  };
  return formatCurrencyLabel(next);
}

export function applyHotelMarkupLabel(raw: string): string {
  return applyMarkupToPriceLabel(raw, HOTEL_MARKUP);
}

export function applyFlightMarkupLabel(raw: string): string {
  return applyMarkupToPriceLabel(raw, FLIGHT_MARKUP);
}

export const PARTNER_MARKUP = {
  hotel: HOTEL_MARKUP,
  flight: FLIGHT_MARKUP,
};
