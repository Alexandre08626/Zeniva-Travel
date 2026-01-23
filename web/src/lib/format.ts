import type { Locale } from "./i18n/config";

const MONTH_ABBREV_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  sept: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const SMALL_WORDS = new Set(["and", "or", "with", "of", "the", "in", "at", "to", "for", "a", "an"]);

function getLocaleTag(locale?: Locale) {
  return locale === "fr" ? "fr-CA" : "en-US";
}

export function formatNumber(value: number, locale?: Locale) {
  if (!Number.isFinite(value)) return String(value);
  return new Intl.NumberFormat(getLocaleTag(locale), { maximumFractionDigits: 0 }).format(value);
}

export function formatCurrencyAmount(value: number, currency: string, locale?: Locale) {
  const formatted = formatNumber(value, locale);
  return `${formatted} ${currency}`.trim();
}

export function normalizePriceLabel(label: string, locale?: Locale) {
  if (!label) return "";
  const cleaned = label.replace(/\s+/g, " ").trim();
  const currencyMatch = cleaned.match(/\b(USD|CAD|EUR|GBP)\b/i);
  const hasDollar = /\$/.test(cleaned);
  const numberMatch = cleaned.match(/(\d[\d\s,\.]*\d|\d)/);
  if (!numberMatch) return cleaned;

  const rawNumber = numberMatch[1];
  const parsed = Number(rawNumber.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed)) return cleaned;

  const currency = currencyMatch ? currencyMatch[1].toUpperCase() : hasDollar ? "USD" : "";
  const formattedAmount = currency ? formatCurrencyAmount(parsed, currency, locale) : formatNumber(parsed, locale);

  const before = cleaned.slice(0, numberMatch.index).replace(/\s*(USD|CAD|EUR|GBP|\$)\s*/gi, " ").trim();
  const after = cleaned.slice((numberMatch.index ?? 0) + rawNumber.length).replace(/\s*(USD|CAD|EUR|GBP|\$)\s*/gi, " ").trim();

  return [before, formattedAmount, after].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function formatTripDateRange(label: string, locale?: Locale) {
  if (!label) return "";
  const match = label.match(/([A-Za-z]+)\s+(\d{1,2})-(\d{1,2}),\s*(\d{4})/);
  if (!match) return label;
  const [, monthName, dayStart, dayEnd, yearStr] = match;
  const refDate = new Date(`${monthName} 1, ${yearStr}`);
  if (Number.isNaN(refDate.getTime())) return label;
  const month = new Intl.DateTimeFormat(getLocaleTag(locale), { month: "long" }).format(refDate);
  return `${month} ${dayStart}–${dayEnd}, ${yearStr}`;
}

export function expandMonthAbbrev(label: string, locale?: Locale) {
  if (!label) return "";
  return label.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/gi, (match) => {
    const key = match.toLowerCase();
    const monthIndex = MONTH_ABBREV_MAP[key];
    if (monthIndex === undefined) return match;
    const refDate = new Date(2026, monthIndex, 1);
    return new Intl.DateTimeFormat(getLocaleTag(locale), { month: "long" }).format(refDate);
  });
}

export function normalizeListingTitle(title: string) {
  if (!title) return "";
  const cleaned = title.replace(/\s+/g, " ").trim().replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
  const words = cleaned.split(" ");
  return words
    .map((word, idx) => {
      const prefixMatch = word.match(/^[\(\[\{\"']+/);
      const suffixMatch = word.match(/[\)\]\}\"']+$/);
      const prefix = prefixMatch ? prefixMatch[0] : "";
      const suffix = suffixMatch ? suffixMatch[0] : "";
      const core = word.slice(prefix.length, word.length - suffix.length);
      if (!core) return word;
      if (/^[A-Z]{2,4}$/.test(core)) return `${prefix}${core}${suffix}`;
      const lower = core.toLowerCase();
      const next = idx > 0 && SMALL_WORDS.has(lower) ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
      return `${prefix}${next}${suffix}`;
    })
    .join(" ")
    .trim();
}

export function normalizePetFriendly(text: string) {
  if (!text) return "";
  return text.replace(/pet\s*friendly|petfriendly/gi, "pet‑friendly");
}