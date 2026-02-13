"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG } from "../../src/design/tokens";
import Header from "../../src/components/Header";
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
  const sanitized = cleaned
    .replace(/Airbnb host/gi, "property host")
    .replace(/Airbnb guests/gi, "guests")
    .replace(/Airbnb/gi, "short-term rental");
  return sanitized.length < 40 ? "Private stays curated by Zeniva, bookable with concierge support." : sanitized;
}

export default function AirbnbsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AirbnbItem[]>([]);
  const [visible, setVisible] = useState(12);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const isLoggedIn = false;
  const userEmail = "user@email.com";

  useEffect(() => {
    let active = true;
    const loadFallback = async () => {
      try {
        const mod = await import("../../src/data/airbnbs.json");
        const fallback = (mod as any).default || mod;
        if (active && Array.isArray(fallback)) {
          setItems(fallback);
          setLoading(false);
        }
      } catch {
        if (active) {
          setItems([]);
          setLoading(false);
        }
      }
    };
    const partnerReq = fetch("/api/partners/airbnbs", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((res) => (Array.isArray(res) ? res : []))
      .catch(() => []);
    const publicReq = fetch("/api/public/listings?type=home", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => (res && res.data) || [])
      .catch(() => []);

    Promise.all([partnerReq, publicReq])
      .then(([partnerData, publicData]) => {
        if (!active) return;
        if (!Array.isArray(partnerData) || partnerData.length === 0) {
          loadFallback();
          return;
        }
        const normalizedPublic: AirbnbItem[] = (publicData || []).map((p: any) => {
          const data = p?.data || p || {};
          return {
            id: p.id || data.id,
            title: data.title || p.title,
            location: data.location || data.destination || "",
            description: data.description || "",
            thumbnail: data.thumbnail || (data.images && data.images[0]) || "",
            images: data.images || [],
            url: p.url || data.url,
          };
        });
        setItems([...(partnerData || []), ...normalizedPublic]);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        loadFallback();
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setVisible(12);
  }, [query]);

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
    slug: p.id || slugify(p.title || `residence-${idx}`),
    title: normalizeListingTitle(p.title || "Residence"),
    location: resolvedLocation || "",
    description: cleanDescription(p.description || ""),
    image: p.thumbnail || (p.images && p.images[0]) || "/branding/icon-proposals.svg",
    images: p.images || (p.thumbnail ? [p.thumbnail] : []),
  };
  });

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? mapped.filter((p) => {
        const title = p.title.toLowerCase();
        const location = p.location.toLowerCase();
        return title.includes(normalizedQuery) || location.includes(normalizedQuery);
      })
    : mapped;

  const handleAddToProposal = async (stay: { slug: string; title: string; location: string; description: string; image: string; images: string[] }) => {
    const tripId = createTrip({
      title: stay.title,
      destination: stay.location,
      style: "Short-term rental",
    });

    updateSnapshot(tripId, {
      destination: stay.location,
      travelers: "2 adults",
      style: "Short-term rental",
      accommodationType: "Residence",
    });

    applyTripPatch(tripId, {
      destination: stay.location,
      accommodationType: "Residence",
      style: "Short-term rental",
    });

    setProposalSelection(tripId, {
      flight: null,
      activity: null,
      transfer: null,
      hotel: {
        id: stay.slug,
        name: stay.title,
        location: stay.location,
        room: "Short-term rental",
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

      <section className="mb-8 rounded-3xl px-6 py-8" style={{ background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)` }}>
        <div className="mx-auto max-w-6xl text-white">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Traveler Catalog</p>
            <h1 className="text-3xl font-black">Full Travel Inventory</h1>
            <p className="text-sm text-white/90">
              Explore the full traveler catalog and connect with Zeniva to finalize your trip.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap gap-3">
              <Link href="/partners/resorts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
                Hotels & Resorts
              </Link>
              <Link href="/yachts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
                Yachts
              </Link>
              <Link href="/residences" className="rounded-full px-4 py-2 text-sm font-semibold bg-white text-slate-900">
                Short-term Rentals
              </Link>
              <Link href="/" className="rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white">
                Flights
              </Link>
            </div>
            <div className="w-full md:max-w-sm">
              <label htmlFor="residence-search" className="sr-only">
                Search residences
              </label>
              <input
                id="residence-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by property or country"
                className="w-full rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white placeholder:text-white/70 shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/70"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-none px-6 pb-16">

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500"><AutoTranslate text="Short-term rentals" className="inline" /></p>
              <h1 className="text-3xl font-black mt-1"><AutoTranslate text="Short-term rentals" className="inline" /></h1>
              <p className="text-slate-600 mt-2"><AutoTranslate text="Private stays curated by Zeniva, bookable with concierge support." className="inline" /></p>
            </div>
            <Link href="/chat?prompt=Plan%20a%20short-term%20stay" className="hidden md:inline-flex px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">
              <AutoTranslate text="Chat to book" className="inline" />
            </Link>
          </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            <AutoTranslate text="Loading residences..." className="inline" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow">
            <AutoTranslate text="No residences match your search." className="inline" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visible).map((p) => (
                <div key={p.slug} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                  <div className="h-44 w-full overflow-hidden rounded-lg mb-4">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{p.title}</h2>
                  <div className="text-sm text-slate-500 mb-3">{p.location}</div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{p.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <Link href={`/residences/${p.slug}`} className="text-sm font-semibold underline text-slate-700">
                      View details
                    </Link>
                    <Link href="/chat?prompt=Plan%20a%20short-term%20stay" className="text-sm font-semibold text-primary-700">
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

            {visible < filtered.length && (
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
