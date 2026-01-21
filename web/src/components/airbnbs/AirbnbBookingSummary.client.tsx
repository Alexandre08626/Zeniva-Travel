"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

type Props = {
  pricePerNight: number;
  storageKey: string;
  propertyName: string;
  sourcePath: string;
  beforeBook?: ReactNode;
};

type DatesState = {
  start: string | null;
  end: string | null;
};

const CLEANING_FEE = 285;
const CONCIERGE_FEE = 120;
const TAX_RATE = 0.12;

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nightsBetween(start: Date | null, end: Date | null) {
  if (!start || !end) return 7;
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function AirbnbBookingSummary({ pricePerNight, storageKey, propertyName, sourcePath, beforeBook }: Props) {
  const [dates, setDates] = useState<DatesState>(() => {
    if (typeof window === "undefined") return { start: null, end: null };
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return { start: null, end: null };
    try {
      const parsed = JSON.parse(stored) as DatesState;
      return { start: parsed.start || null, end: parsed.end || null };
    } catch {
      return { start: null, end: null };
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; start: string | null; end: string | null }>).detail;
      if (!detail || detail.key !== storageKey) return;
      setDates({ start: detail.start, end: detail.end });
    };

    window.addEventListener("airbnb:dates", handler as EventListener);
    return () => window.removeEventListener("airbnb:dates", handler as EventListener);
  }, [storageKey]);

  const startDate = useMemo(() => parseDate(dates.start), [dates.start]);
  const endDate = useMemo(() => parseDate(dates.end), [dates.end]);
  const nights = useMemo(() => nightsBetween(startDate, endDate), [startDate, endDate]);

  const subtotal = nights * pricePerNight;
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + CLEANING_FEE + CONCIERGE_FEE + taxes;

  return (
    <aside className="space-y-4">
      <div className="sticky top-24 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-black text-slate-900">{formatMoney(pricePerNight)}</p>
            <p className="text-xs text-blue-700">per night · taxes included</p>
          </div>
          <div className="text-xs text-blue-700 font-semibold">4.94 · 87</div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>{nights} night{nights > 1 ? "s" : ""} x {formatMoney(pricePerNight)}</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>Cleaning fee</span>
            <span>{formatMoney(CLEANING_FEE)}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>Zeniva concierge</span>
            <span>{formatMoney(CONCIERGE_FEE)}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>Taxes (12%)</span>
            <span>{formatMoney(taxes)}</span>
          </div>
          <div className="border-t border-blue-200 pt-3 flex items-center justify-between text-sm font-bold text-slate-900">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-blue-200 bg-white p-3 text-xs text-blue-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Secure payment</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Stripe verified</span>
          </div>
          <p>All payments are encrypted and processed by Stripe. Your card details are never stored on Zeniva servers.</p>
          <div className="flex items-center gap-2 text-[10px] font-semibold">
            <span className="rounded-md border border-blue-200 bg-white px-2 py-1">VISA</span>
            <span className="rounded-md border border-blue-200 bg-white px-2 py-1">Mastercard</span>
            <span className="rounded-md border border-blue-200 bg-white px-2 py-1">Amex</span>
            <span className="rounded-md border border-blue-200 bg-white px-2 py-1">Apple Pay</span>
          </div>
        </div>

        {beforeBook && <div className="mt-4">{beforeBook}</div>}
        <Link href={`/payment?airbnb=${encodeURIComponent(propertyName)}`} className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 text-white py-3.5 text-sm font-semibold shadow-lg shadow-blue-200/60 hover:bg-blue-800 transition">
          Book
        </Link>
        <a
          href={`/chat/agent?channel=${encodeURIComponent("agent-alexandre")}&listing=${encodeURIComponent(propertyName)}&source=${encodeURIComponent(sourcePath)}`}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 text-blue-700 py-3 text-sm font-semibold hover:bg-blue-50 transition"
        >
          Message agent
        </a>
        <p className="mt-3 text-center text-xs text-blue-700">You won’t be charged yet</p>
      </div>
    </aside>
  );
}
