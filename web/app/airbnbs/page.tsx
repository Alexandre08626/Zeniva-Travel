"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface AirbnbItem {
  id: string;
  title: string;
  location?: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  url?: string;
}

export default function AirbnbsPage() {
  const [items, setItems] = useState<AirbnbItem[]>([]);
  const [visible, setVisible] = useState(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const partnerReq = fetch("/api/partners/airbnbs")
      .then((r) => r.json())
      .then((res) => (Array.isArray(res) ? res : []))
      .catch(() => []);
    const publicReq = fetch("/api/public/listings?type=home")
      .then((r) => r.json())
      .then((res) => (res && res.data) || [])
      .catch(() => []);

    Promise.all([partnerReq, publicReq])
      .then(([partnerData, publicData]) => {
        if (!active) return;
        const normalizedPublic: AirbnbItem[] = (publicData || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          location: p.data?.location || p.data?.destination || "",
          description: p.data?.description || "",
          thumbnail: p.data?.thumbnail || (p.data?.images && p.data.images[0]) || "",
          images: p.data?.images || [],
          url: p.url,
        }));
        setItems([...(partnerData || []), ...normalizedPublic]);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const mapped = items.map((p, idx) => ({
    slug: p.id || slugify(p.title || `airbnb-${idx}`),
    title: p.title || "Residence",
    location: p.location || "",
    description: p.description || "",
    image: p.thumbnail || (p.images && p.images[0]) || "/branding/icon-proposals.svg",
  }));

  return (
    <main className="min-h-screen p-10 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Airbnbs</p>
            <h1 className="text-3xl font-black mt-1">Residences curated by Zeniva</h1>
            <p className="text-slate-600 mt-2">Browse stays and message us to book.</p>
          </div>
          <Link href="/chat?prompt=Plan%20an%20Airbnb%20stay" className="hidden md:inline-flex px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">
            Chat to book
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            Loading residences...
          </div>
        ) : mapped.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            No residences available right now. Please check back soon.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mapped.slice(0, visible).map((p) => (
                <div key={p.slug} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                  <div className="h-44 w-full overflow-hidden rounded-lg mb-4">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{p.title}</h2>
                  <div className="text-sm text-slate-500 mb-3">{p.location}</div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{p.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <Link href={`/airbnbs/${p.slug}`} className="text-sm font-semibold underline text-slate-700">
                      View details
                    </Link>
                    <Link href="/chat?prompt=Plan%20an%20Airbnb%20stay" className="text-sm font-semibold text-primary-700">
                      Chat
                    </Link>
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
