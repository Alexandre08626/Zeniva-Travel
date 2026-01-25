"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG } from "../../src/design/tokens";
import Header from "../../src/components/Header";
import TravelSearchWidget from "../../src/components/TravelSearchWidget";
import LinaWidget from "../../src/components/LinaWidget";
import AutoTranslate from "../../src/components/AutoTranslate";
import { createTrip, updateSnapshot, applyTripPatch, generateProposal, setProposalSelection } from "../../lib/store/tripsStore";
import { normalizeListingTitle, normalizePetFriendly } from "../../src/lib/format";

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

function extractField(description: string | undefined, label: string) {
  if (!description) return null;
  const re = new RegExp(`${label}\s*\n+\s*([^\n]+)`, "i");
  const match = description.match(re);
  return match?.[1]?.trim() || null;
}

function cleanDescription(description: string) {
  if (!description) return "";
  const withoutHeader = description.replace(/Property Description\s*/i, "");
  const beforeContact = withoutHeader.split("Contact Agent")[0];
  const beforeDetails = beforeContact.split("Property Details")[0];
  const cleaned = normalizePetFriendly(beforeDetails.replace(/\n{3,}/g, "\n\n").trim());
  return cleaned.length < 40 ? "Curated stay with Zeniva concierge support." : cleaned;
}

export default function AirbnbsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AirbnbItem[]>([]);
  const [visible, setVisible] = useState(12);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = false;
  const userEmail = "user@email.com";

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

  const resolveLocation = (item: AirbnbItem) => {
    const fallback = item.location || "";
    if (!fallback || fallback.toLowerCase().includes("property description")) {
      return extractField(item.description, "Property Location") || fallback;
    }
    return fallback;
  };

  const mapped = items.map((p, idx) => {
    const resolvedLocation = resolveLocation(p);
    return {
    slug: p.id || slugify(p.title || `airbnb-${idx}`),
    title: normalizeListingTitle(p.title || "Residence"),
    location: resolvedLocation || "",
    description: cleanDescription(p.description || ""),
    image: p.thumbnail || (p.images && p.images[0]) || "/branding/icon-proposals.svg",
    images: p.images || (p.thumbnail ? [p.thumbnail] : []),
  };
  });

  const handleAddToProposal = async (stay: { slug: string; title: string; location: string; description: string; image: string; images: string[] }) => {
    const tripId = createTrip({
      title: stay.title,
      destination: stay.location,
      style: "Private residence",
    });

    updateSnapshot(tripId, {
      destination: stay.location,
      travelers: "2 adults",
      style: "Private residence",
      accommodationType: "Airbnb",
    });

    applyTripPatch(tripId, {
      destination: stay.location,
      accommodationType: "Airbnb",
      style: "Private residence",
    });

    setProposalSelection(tripId, {
      flight: null,
      activity: null,
      transfer: null,
      hotel: {
        id: stay.slug,
        name: stay.title,
        location: stay.location,
        room: "Residence",
        image: stay.image,
        images: stay.images,
        description: stay.description,
      },
    });

    await generateProposal(tripId);
    router.push("/proposals");
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="w-screen left-1/2 right-1/2 -translate-x-1/2 relative">
        <div className="mx-auto w-full px-6 pt-5">
          <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
        </div>
      </div>

      {/* HERO SECTION (Lina Search) */}
      <section className="hidden sm:block mt-4 mb-8 sm:mt-8 sm:mb-12">
        <div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2">
          <div className="relative rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)`,
                opacity: 0.98,
              }}
            />

            <div className="relative z-10 w-full mx-auto px-6 py-8 sm:py-12">
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
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
        </div>
      </section>

      <div className="mx-auto w-full max-w-none px-6 pb-16">

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500"><AutoTranslate text="Airbnbs" className="inline" /></p>
              <h1 className="text-3xl font-black mt-1"><AutoTranslate text="Residences curated by Zeniva" className="inline" /></h1>
              <p className="text-slate-600 mt-2"><AutoTranslate text="Browse stays and message us to book." className="inline" /></p>
            </div>
            <Link href="/chat?prompt=Plan%20an%20Airbnb%20stay" className="hidden md:inline-flex px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">
              <AutoTranslate text="Chat to book" className="inline" />
            </Link>
          </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            <AutoTranslate text="Loading residences..." className="inline" />
          </div>
        ) : mapped.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            <AutoTranslate text="No residences available right now. Please check back soon." className="inline" />
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
