"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Supported display currencies. USD is the platform reference — all package
// prices, hotel quotes and Duffel offers are normalized to USD on the way in,
// then converted to the user's chosen display currency on the way out.
export const currencies = ["USD", "CAD", "EUR", "GBP", "MXN", "AUD", "CHF", "JPY"] as const;
export type Currency = (typeof currencies)[number];

export const currencyLabels: Record<Currency, string> = {
  USD: "USD $",
  CAD: "CAD $",
  EUR: "EUR €",
  GBP: "GBP £",
  MXN: "MXN $",
  AUD: "AUD $",
  CHF: "CHF",
  JPY: "JPY ¥",
};

// Static FX baseline. We don't fetch live FX on the client — these are good
// to ~1-2% which is plenty for displaying ballpark prices. Live FX would
// require a server-side worker; not worth the complexity for now.
const FX_FROM_USD: Record<Currency, number> = {
  USD: 1.0,
  CAD: 1.36,
  EUR: 0.92,
  GBP: 0.79,
  MXN: 17.5,
  AUD: 1.51,
  CHF: 0.88,
  JPY: 150,
};

const STORAGE_KEY = "zeniva_currency";
const defaultCurrency: Currency = "USD";

function getInitialCurrency(): Currency {
  if (typeof window === "undefined") return defaultCurrency;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && (currencies as readonly string[]).includes(saved)) return saved as Currency;
  return defaultCurrency;
}

const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  // Convert a USD amount to the active display currency.
  fromUSD: (usd: number) => number;
  // Format a USD amount as a localized currency string in the active display currency.
  formatUSD: (usd: number) => string;
} | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    setCurrencyState(getInitialCurrency());
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    if (!(currencies as readonly string[]).includes(c)) return;
    setCurrencyState(c);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, c);
      } catch {
        // ignore quota / private-mode failures
      }
    }
  }, []);

  const fromUSD = useCallback(
    (usd: number) => {
      if (!Number.isFinite(usd)) return 0;
      const rate = FX_FROM_USD[currency] ?? 1;
      return usd * rate;
    },
    [currency],
  );

  const formatUSD = useCallback(
    (usd: number) => {
      const value = fromUSD(usd);
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(value);
      } catch {
        return `${currency} ${Math.round(value).toLocaleString()}`;
      }
    },
    [fromUSD, currency],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, fromUSD, formatUSD }),
    [currency, setCurrency, fromUSD, formatUSD],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Soft fallback so legacy code that calls useCurrency without the provider
    // doesn't crash — returns USD identity.
    return {
      currency: "USD" as Currency,
      setCurrency: () => undefined,
      fromUSD: (usd: number) => usd,
      formatUSD: (usd: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usd),
    };
  }
  return ctx;
}
