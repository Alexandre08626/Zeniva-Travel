"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type YachtItem = {
  id?: string;
  title?: string;
  destination?: string;
  prices?: string[];
  thumbnail?: string;
  specs?: string;
};

const SOUTH_FL = new Set([
  "Miami",
  "Miami Beach",
  "Miami River",
  "Fort Lauderdale",
  "Key West",
  "Key Biscayne",
  "Coconut Grove",
  "Bayside",
  "Haulover",
  "Island Gardens",
  "N. Bay Village",
]);

function shortPrice(prices?: string[]): string {
  if (!prices || !prices.length) return "Quote on request";
  const first = prices[0] || "";
  const m = first.match(/\$[\d,]+/);
  return m ? `From ${m[0]}` : first;
}

export default function SouthFloridaYachtsTeaser({
  title = "South Florida yacht charters",
  subtitle = "Real boats moored in Miami, Miami Beach, Fort Lauderdale and the Keys — book one as a half-day, full-day or weekly charter.",
  limit = 8,
  badge,
}: {
  title?: string;
  subtitle?: string;
  limit?: number;
  badge?: string;
}) {
  const [items, setItems] = useState<YachtItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/partners/ycn", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: YachtItem[]) => {
        if (!alive) return;
        const fl = (Array.isArray(data) ? data : []).filter((y) => y?.destination && SOUTH_FL.has(y.destination));
        setItems(fl);
      })
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            {badge ? (
              <div className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                {badge}
              </div>
            ) : null}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">🛥️ {title}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p>
          </div>
          <Link
            href="/zeniyacht"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            View full fleet ({loading ? "…" : items.length})
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, limit).map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading our South Florida fleet — check back in a moment, or chat with Lina to get matched right away.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.slice(0, limit).map((y, idx) => (
              <Link
                key={(y.id || y.title || idx) + ""}
                href="/zeniyacht"
                className="group block rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  {y.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={y.thumbnail}
                      alt={y.title || "Yacht"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🛥️</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{y.destination}</div>
                  <div className="mt-0.5 line-clamp-2 text-sm font-bold text-slate-900">{y.title || "Yacht charter"}</div>
                  {y.specs ? <div className="mt-1 text-[11px] text-slate-500 line-clamp-1">{y.specs}</div> : null}
                  <div className="mt-2 text-xs font-bold text-emerald-700">{shortPrice(y.prices)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-white px-3 py-1 border border-slate-200">📍 Miami</span>
          <span className="rounded-full bg-white px-3 py-1 border border-slate-200">📍 Miami Beach</span>
          <span className="rounded-full bg-white px-3 py-1 border border-slate-200">📍 Fort Lauderdale</span>
          <span className="rounded-full bg-white px-3 py-1 border border-slate-200">📍 Key Biscayne</span>
          <span className="rounded-full bg-white px-3 py-1 border border-slate-200">📍 Key West</span>
          <span className="rounded-full bg-white px-3 py-1 border border-slate-200">📍 Coconut Grove</span>
          <span className="rounded-full bg-white px-3 py-1 border border-slate-200">📍 Haulover</span>
          <span className="rounded-full bg-white px-3 py-1 border border-slate-200">📍 Palm Beach (charter from Fort Lauderdale)</span>
        </div>
      </div>
    </section>
  );
}
