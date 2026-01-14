"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface YcnItem {
  title?: string;
  destination?: string;
  prices?: string[];
  thumbnail?: string;
  images?: string[];
  calendar?: string;
}

export default function YachtsPage() {
  const [visible, setVisible] = useState(12);
  const [items, setItems] = useState<YcnItem[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/partners/ycn')
      .then((r) => r.json())
      .then((data: YcnItem[]) => {
        if (!active) return;
        setItems(data || []);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const mapped = items.map((p, idx) => ({
    slug: p.title ? slugify(p.title) : `ycn-${idx}`,
    title: p.title || 'Yacht Charter',
    price: (p.prices && p.prices[0]) || 'Request a quote',
    destination: p.destination || 'Worldwide',
    image: p.thumbnail || (p.images && p.images[0]) || '/branding/icon-proposals.svg',
    calendar: p.calendar,
  }));

  return (
    <main className="min-h-screen p-10 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Yacht Charters</p>
            <h1 className="text-3xl font-black mt-1">Exclusive YCN Fleet</h1>
            <p className="text-slate-600 mt-2">Browse curated yachts and contact us for tailored itineraries.</p>
          </div>
          <Link href="/chat?prompt=Plan%20a%20yacht%20charter" className="hidden md:inline-flex px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">
            Chat to plan
          </Link>
        </div>

        {mapped.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            No yachts available right now. Please check back soon.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mapped.slice(0, visible).map((p) => (
                <div key={p.slug} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                  <div className="h-44 w-full overflow-hidden rounded-lg mb-4">
                    <Image
                      src={p.image}
                      alt={p.title}
                      width={800}
                      height={520}
                      className="h-full w-full object-cover"
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                      priority={false}
                    />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{p.title}</h2>
                  <div className="text-sm text-slate-500 mb-3">{p.destination}</div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="text-lg font-black">{p.price}</div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/partners/ycn/${p.slug}`}
                        className="text-sm font-semibold underline text-slate-700"
                      >
                        View
                      </Link>
                      <Link
                        href="/payment"
                        className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white shadow hover:bg-slate-900"
                      >
                        Pay now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visible < mapped.length && (
              <div className="flex justify-center mt-8">
                <button onClick={() => setVisible((v) => v + 12)} className="px-6 py-3 rounded-full bg-white border shadow">
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
