"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StayItem = {
  id?: string;
  title?: string;
  location?: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  price_per_night?: number;
};

const REGIONS: Record<string, { label: string; tokens: string[] }> = {
  florida: { label: "Florida", tokens: ["florida", "miami", "naples", "orlando", "tampa", "fort lauderdale", "key west"] },
  mexico: { label: "Mexico", tokens: ["mexico", "mexique", "tulum", "cancun", "cancún", "playa del carmen", "cabo", "cozumel", "puerto vallarta", "riviera maya"] },
  quebec: { label: "Québec", tokens: ["quebec", "québec", "lac beauport", "charlevoix", "mont-tremblant", "montreal", "montréal"] },
  polynesia: { label: "French Polynesia", tokens: ["bora bora", "tahiti", "tikehau", "taha", "moorea", "polynesia", "polynesie", "polynésie"] },
  rockies: { label: "Rockies", tokens: ["banff", "whistler", "lake louise", "jasper"] },
  all: { label: "Worldwide", tokens: [] },
};

function priceLabel(p?: number): string {
  if (!p || p <= 0) return "Quote on request";
  return `From $${p.toLocaleString()}/night`;
}

export default function ZeniStayTeaser({
  region = "all",
  title,
  subtitle,
  badge,
  limit = 8,
  ctaHref,
}: {
  region?: keyof typeof REGIONS;
  title?: string;
  subtitle?: string;
  badge?: string;
  limit?: number;
  ctaHref?: string;
}) {
  const [items, setItems] = useState<StayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/partners/airbnbs", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: StayItem[]) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        const conf = REGIONS[region] || REGIONS.all;
        const filtered = !conf.tokens.length
          ? list
          : list.filter((s) => {
              const hay = `${s.location || ""} ${s.title || ""} ${s.description || ""}`.toLowerCase();
              return conf.tokens.some((t) => hay.includes(t));
            });
        setItems(filtered);
      })
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [region]);

  const conf = REGIONS[region] || REGIONS.all;
  const resolvedTitle = title || `🏠 ZeniStay — ${conf.label} chalets, villas & condos`;
  const resolvedSubtitle =
    subtitle ||
    `Real properties from the Zeniva curated catalog. Chalets, villas, beachfront condos, cabins — book direct with 24/7 Lina AI concierge support.`;
  const resolvedCta = ctaHref || `/zenistay${region !== "all" ? `?region=${region}` : ""}`;

  return (
    <section className="bg-gradient-to-b from-amber-50/40 to-white py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            {badge ? (
              <div className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                {badge}
              </div>
            ) : null}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">{resolvedTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{resolvedSubtitle}</p>
          </div>
          <Link
            href={resolvedCta}
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600"
          >
            View ZeniStay catalog ({loading ? "…" : items.length})
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
            No curated ZeniStay listings for {conf.label} yet — chat with Lina to source one from our partner network.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.slice(0, limit).map((s, idx) => {
              const photo = s.thumbnail || (s.images && s.images[0]) || "";
              const slug = s.id || idx;
              return (
                <Link
                  key={String(slug)}
                  href={`/zenistay/${slug}`}
                  className="group block rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={s.title || "Property"} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🏠</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">ZeniStay</div>
                    <div className="mt-0.5 line-clamp-2 text-sm font-bold text-slate-900">{s.title || "Property"}</div>
                    <div className="mt-2 text-xs font-bold text-emerald-700">{priceLabel(s.price_per_night)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
