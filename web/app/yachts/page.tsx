"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG } from "../../src/design/tokens";
import Header from "../../src/components/Header";
import TravelSearchWidget from "../../src/components/TravelSearchWidget";
import LinaWidget from "../../src/components/LinaWidget";
import AutoTranslate from "../../src/components/AutoTranslate";
import { getImagesForDestination } from "../../src/lib/images";
import { createTrip, updateSnapshot, applyTripPatch, generateProposal, setProposalSelection } from "../../lib/store/tripsStore";

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
  const router = useRouter();
  const [visible, setVisible] = useState(12);
  const [items, setItems] = useState<YcnItem[]>([]);

  const isLoggedIn = false;
  const userEmail = "user@email.com";

  useEffect(() => {
    let active = true;
    // fetch curated YCN fleet
    const ycnReq = fetch('/api/partners/ycn').then((r) => r.json()).catch(() => []);
    // fetch partner-published yachts
    const partnerReq = fetch('/api/public/listings?type=yacht').then((r) => r.json()).then((res) => (res && res.data) || []).catch(() => []);

    Promise.all([ycnReq, partnerReq]).then(([ycnData, partnerData]) => {
      if (!active) return;
      // Normalize partner yacht shape to YcnItem
      const partnerItems: YcnItem[] = (partnerData || []).map((p: any) => ({
        title: p.title,
        destination: p.data?.location || p.data?.destination || "",
        thumbnail: p.data?.thumbnail || (p.data?.images && p.data.images[0]) || undefined,
        prices: p.data?.prices || [],
        images: p.data?.images || [],
      }));
      setItems([...(ycnData || []), ...partnerItems]);
    }).catch(() => {
      if (!active) return;
      setItems([]);
    });

    return () => {
      active = false;
    };
  }, []);

  const mapped = items.map((p, idx) => {
    const destination = p.destination || 'Worldwide';
    const fallback = getImagesForDestination(destination)[0];
    return {
      slug: p.title ? slugify(p.title) : `ycn-${idx}`,
      title: p.title || 'Yacht Charter',
      price: (p.prices && p.prices[0]) || 'Request a quote',
      destination,
      image: (p.images && p.images[0]) || p.thumbnail || fallback || '/branding/icon-proposals.svg',
      calendar: p.calendar,
      images: p.images || (p.thumbnail ? [p.thumbnail] : []),
    };
  });

  const handleAddToProposal = async (yacht: { slug: string; title: string; destination: string; price: string; image: string; images: string[] }) => {
    const tripId = createTrip({
      title: yacht.title,
      destination: yacht.destination,
      style: "Yacht charter",
    });

    updateSnapshot(tripId, {
      destination: yacht.destination,
      travelers: "2 adults",
      style: "Yacht charter",
      accommodationType: "Yacht",
      budget: yacht.price,
    });

    applyTripPatch(tripId, {
      destination: yacht.destination,
      accommodationType: "Yacht",
      style: "Yacht charter",
      budget: yacht.price,
    });

    setProposalSelection(tripId, {
      flight: null,
      activity: null,
      transfer: null,
      hotel: {
        id: yacht.slug,
        name: yacht.title,
        location: yacht.destination,
        price: yacht.price,
        room: "Yacht",
        image: yacht.image,
        images: yacht.images,
      },
    });

    await generateProposal(tripId);
    router.push("/proposals");
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      {/* Header aligned with hero left edge (full-bleed alignment) */}
      <div style={{ position: "relative", left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw", width: "100vw" }}>
        <div className="w-full px-6">
          <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-none px-6 pb-16 pt-5">
        {/* HERO SECTION (Lina Search) */}
        <section
          className="mt-4 mb-10"
          style={{
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            width: "100vw",
          }}
        >
          <div className="relative rounded-3xl overflow-hidden mx-auto" style={{ width: "100%", maxWidth: "none" }}>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)`,
                opacity: 0.98,
              }}
            />

            <div className="relative z-10 w-full mx-auto px-5 py-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-3 flex items-center justify-center md:justify-start gap-4">
                    <img
                      src="/branding/logo.png"
                      alt="Zeniva logo"
                      className="w-auto rounded-lg shadow-sm"
                      style={{ height: "clamp(2.5rem, 6.5vw, 4.25rem)" }}
                    />
                    <div>
                      <div
                        className="font-extrabold tracking-tight text-white"
                        style={{
                          fontSize: "clamp(2.5rem, 6.5vw, 4.25rem)",
                          lineHeight: 0.95,
                          background: "linear-gradient(90deg,#ffffff 60%, #E6B85A 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          textShadow: "0 8px 24px rgba(11,27,77,0.28)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Zeniva Travel AI
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-md text-white/90 max-w-xl md:max-w-2xl">
                    <AutoTranslate
                      text="Tailor-made journeys, expert recommendations, and ready-to-book itineraries."
                      className="inline"
                    />
                  </p>

                  <div className="mt-6 mx-auto md:mx-0" style={{ width: "min(820px, 100%)" }}>
                    <div className="bg-white rounded-2xl shadow-lg p-4">
                      <TravelSearchWidget />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          { id: "q1", label: "Family trip", prompt: "Family beach trip, 7 nights" },
                          { id: "q2", label: "Romantic", prompt: "Honeymoon Santorini, 5 nights" },
                          { id: "q3", label: "Budget", prompt: "Sunny destinations under $1500" },
                        ].map((q) => (
                          <Link
                            key={q.id}
                            href={`/chat?prompt=${encodeURIComponent(q.prompt)}`}
                            className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                          >
                            {q.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 hidden md:flex items-center justify-center pr-12">
                  <div className="flex flex-col items-center gap-3">
                    <span
                      className="font-extrabold tracking-tight"
                      style={{
                        fontSize: "clamp(1.25rem, 2.6vw, 1.75rem)",
                        lineHeight: 1,
                        background: "linear-gradient(90deg,#ffffff 60%, #E6B85A 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 6px 18px rgba(11,27,77,0.22)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Lina AI
                    </span>
                    <LinaWidget size={Math.min(336, Math.max(192, 21 * 16))} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToProposal(p)}
                    className="mt-3 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
                  >
                    Add to proposal
                  </button>
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
      </div>
    </main>
  );
}
