import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Pittsburgh"; const AIRPORT = "PIT"; const URL_PATH = "/packages/from-pittsburgh";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Bahamas, Europe. Direct flights, hotel and transfers included.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Caribbean`, `cheap vacations from ${CITY}`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from PIT.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1576388057bbeb8a8e9be7?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Pittsburgh International (${AIRPORT}) has direct flights to most Caribbean and Mexican destinations plus growing European service.`}
    heroImage="https://images.unsplash.com/photo-1576388057bbeb8a8e9be7?auto=format&fit=crop&w=1600&q=85" heroGradient="from-yellow-900/70 to-slate-900/60" badge={`✈️ Direct from PIT`}
    sections={[
      { heading: `Why ${CITY} Travelers Have Solid Direct Coverage`, content: `<p>Pittsburgh International (${AIRPORT}) serves Western Pennsylvania and the Steel City metro. Direct flights to Cancún, Punta Cana, Cancún, Aruba, plus seasonal European service. Pennsylvania winters drive heavy travel volume to all-inclusive resorts December through April.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> Direct from PIT. From $999 per person for 4 nights.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from PIT seasonally. From $1,099 per person for 5 nights.</p><p><strong>Bahamas:</strong> Direct or one-stop from PIT. From $1,099 per person.</p><p><strong>Cabo San Lucas:</strong> One-stop from PIT. From $1,199 per person.</p><p><strong>Europe (London):</strong> Direct from PIT seasonally on British Airways.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from PIT`, description: `Caribbean, Mexico, Bahamas, seasonal London — all direct from Pittsburgh.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      { icon: "map", title: "Multi-city options", description: "Open-jaw Europe routing supported." },
    ]}
    faqs={[
      { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around $999 per person for 4 nights including flights from PIT.` },
      { question: "Are flights direct?", answer: "Most popular Caribbean and Mexico destinations are direct from PIT. Some Caribbean and European destinations require a connection through Charlotte or Philadelphia." },
      { question: "Can you book European trips?", answer: "Yes — direct seasonal flight to London plus connections via PHL or CLT to other European capitals." },
      { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
      { question: "Multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Caribbean Destinations", href: "/destinations/caribbean" }, { label: "Mexico Destinations", href: "/destinations/mexico" }, { label: "All-Inclusive Deals", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (PIT).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "PA" } } }}
  />
); }
