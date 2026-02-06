"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resortPartners } from "@/src/data/partners/resorts";
import { GRADIENT_END, GRADIENT_START, LIGHT_BG, TITLE_TEXT, MUTED_TEXT } from "@/src/design/tokens";
import { useI18n } from "@/src/lib/i18n/I18nProvider";
import { formatCurrencyAmount, normalizeListingTitle, normalizePriceLabel } from "@/src/lib/format";
import { useAuthStore } from "@/src/lib/authStore";
import { normalizeRbacRole } from "@/src/lib/rbac";

type TabKey = "resorts" | "yachts" | "residences";

type Listing = {
  id: string;
  title: string;
  location: string;
  description?: string;
  image?: string;
  images?: string[];
  price?: string;
  category: string;
  link?: string;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function downloadHtml(listing: Listing) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${listing.title} | Zeniva Travel</title>
<style>
body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
.hero { display: flex; gap: 24px; align-items: flex-start; }
.hero img { width: 320px; height: 220px; object-fit: cover; border-radius: 16px; }
.badge { display: inline-block; padding: 6px 12px; background: #e2e8f0; border-radius: 999px; font-size: 12px; font-weight: 700; }
.title { font-size: 28px; font-weight: 800; margin: 6px 0; }
.subtitle { color: #64748b; font-size: 14px; }
.section { margin-top: 24px; }
</style>
</head>
<body>
  <div class="hero">
    <img src="${listing.image || "/branding/icon-proposals.svg"}" alt="${listing.title}" />
    <div>
      <span class="badge">${listing.category}</span>
      <div class="title">${listing.title}</div>
      <div class="subtitle">${listing.location}${listing.price ? " • " + listing.price : ""}</div>
    </div>
  </div>
  <div class="section">
    <h2>Overview</h2>
    <p>${listing.description || "Curated by Zeniva Travel. Contact your agent to finalize booking details."}</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugify(listing.title)}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AgentInfoPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const user = useAuthStore((s) => s.user);
  const roles = user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isYachtBroker = effectiveRole === "yacht_broker";
  const [activeTab, setActiveTab] = useState<TabKey>("resorts");
  const [yachts, setYachts] = useState<Listing[]>([]);
  const [residences, setResidences] = useState<Listing[]>([]);

  const resorts = useMemo<Listing[]>(() => {
    return resortPartners.map((resort) => {
      const cover = resort.media?.[0]?.images?.[0] || "/branding/icon-proposals.svg";
      const nightlyRate = 295;
      const price = `From ${formatCurrencyAmount(nightlyRate, "USD", locale)}/night`;
      return {
        id: resort.id,
        title: resort.name,
        location: resort.destination,
        description: resort.positioning,
        image: cover,
        images: resort.media?.flatMap((m) => m.images) || [],
        price,
        category: "Resort",
        link: "/partners/resorts",
      };
    });
  }, [locale]);

  useEffect(() => {
    let active = true;

    const loadYachts = async () => {
      try {
        const [ycnRes, partnerRes] = await Promise.all([
          fetch("/api/partners/ycn", { cache: "no-store" }),
          fetch("/api/public/listings?type=yacht", { cache: "no-store" }),
        ]);
        const ycnData = ycnRes.ok ? await ycnRes.json() : [];
        const partnerData = partnerRes.ok ? await partnerRes.json() : null;
        const partnerList = (partnerData && partnerData.data) || [];

        const ycnItems: Listing[] = (Array.isArray(ycnData) ? ycnData : []).map((item: any, idx: number) => ({
          id: item.id || `ycn-${idx}`,
          title: normalizeListingTitle(item.title || "Yacht Charter"),
          location: item.destination || "Worldwide",
          description: "Curated yacht charter with Zeniva concierge support.",
          image: item.thumbnail || (item.images && item.images[0]) || "/branding/icon-proposals.svg",
          images: item.images || [],
          price: normalizePriceLabel((item.prices && item.prices[0]) || "Request a quote", locale),
          category: "Yacht",
          link: "/yachts",
        }));

        const partnerItems: Listing[] = (partnerList || []).map((p: any, idx: number) => {
          const data = p?.data || p || {};
          const priceLabel =
            Array.isArray(data.prices) && data.prices.length
              ? data.prices[0]
              : typeof data.price === "number"
                ? `${data.currency || "USD"} ${data.price}`
                : "Request a quote";
          return {
            id: data.id || p.id || `partner-yacht-${idx}`,
            title: normalizeListingTitle(data.title || "Yacht Charter"),
            location: data.location || data.destination || "Worldwide",
            description: data.description || "Partner-published yacht listing.",
            image: data.thumbnail || (data.images && data.images[0]) || "/branding/icon-proposals.svg",
            images: data.images || [],
            price: normalizePriceLabel(priceLabel, locale),
            category: "Yacht",
            link: "/yachts",
          };
        });

        if (active) setYachts([...(ycnItems || []), ...(partnerItems || [])]);
      } catch {
        if (active) setYachts([]);
      }
    };

    const loadResidences = async () => {
      try {
        const partnerReq = fetch("/api/partners/airbnbs", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []);
        const publicReq = fetch("/api/public/listings?type=home", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .then((res) => (res && res.data) || [])
          .catch(() => []);

        const [partnerData, publicData] = await Promise.all([partnerReq, publicReq]);
        const normalizedPublic: Listing[] = (publicData || []).map((p: any, idx: number) => {
          const data = p?.data || p || {};
          return {
            id: data.id || p.id || `public-home-${idx}`,
            title: normalizeListingTitle(data.title || "Residence"),
            location: data.location || data.destination || "",
            description: data.description || "Short-term rental curated by Zeniva.",
            image: data.thumbnail || (data.images && data.images[0]) || "/branding/icon-proposals.svg",
            images: data.images || [],
            category: "Residence",
            link: "/residences",
          };
        });
        const normalizedPartner: Listing[] = (Array.isArray(partnerData) ? partnerData : []).map((item: any, idx: number) => ({
          id: item.id || `partner-home-${idx}`,
          title: normalizeListingTitle(item.title || "Residence"),
          location: item.location || "",
          description: item.description || "Short-term rental curated by Zeniva.",
          image: item.thumbnail || (item.images && item.images[0]) || "/branding/icon-proposals.svg",
          images: item.images || [],
          category: "Residence",
          link: "/residences",
        }));
        if (active) setResidences([...(normalizedPartner || []), ...(normalizedPublic || [])]);
      } catch {
        if (active) setResidences([]);
      }
    };

    loadYachts();
    loadResidences();

    return () => {
      active = false;
    };
  }, [locale]);

  const tabs = isYachtBroker
    ? [{ key: "yachts" as const, label: "Yachts" }]
    : [
        { key: "resorts" as const, label: "Hotels & Resorts" },
        { key: "yachts" as const, label: "Yachts" },
        { key: "residences" as const, label: "Short-term Rentals" },
      ];

  useEffect(() => {
    if (isYachtBroker) setActiveTab("yachts");
  }, [isYachtBroker]);

  const currentList = activeTab === "resorts" ? resorts : activeTab === "yachts" ? yachts : residences;

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <section className="mb-8 rounded-3xl px-6 py-8" style={{ background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)` }}>
        <div className="mx-auto max-w-6xl text-white">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Agent Catalog</p>
            <h1 className="text-3xl font-black">Full Travel Inventory</h1>
            <p className="text-sm text-white/90">
              Agents can access the same traveler catalog and export any listing as HTML for client sharing.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab.key ? "bg-white text-slate-900" : "bg-white/10 text-white"}`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => router.push("/agent/purchase-orders")}
              className="rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white"
            >
              Submit booking request
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {currentList.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                <img src={item.image || "/branding/icon-proposals.svg"} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.category}</div>
                <div className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{item.title}</div>
                <div className="text-sm" style={{ color: MUTED_TEXT }}>{item.location}</div>
                {item.price && <div className="text-sm font-semibold text-slate-700">{item.price}</div>}
                {item.description && <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.description}</p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.link && (
                  <Link href={item.link} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                    View traveler page
                  </Link>
                )}
                <button
                  onClick={() => downloadHtml(item)}
                  className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                >
                  Download HTML
                </button>
              </div>
            </div>
          ))}
        </div>
        {currentList.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No listings available yet.
          </div>
        )}
      </section>
    </main>
  );
}
