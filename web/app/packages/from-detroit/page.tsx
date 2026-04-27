import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Detroit";
const AIRPORT = "DTW";
const URL_PATH = "/packages/from-detroit";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Europe, Asia. Delta hub with direct flights to most major destinations.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Punta Cana`, `cheap vacations from ${CITY}`, `Delta hub`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from DTW.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1559587733-19a8e0d1cba3?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromDetroitPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Detroit Metro (${AIRPORT}) is Delta's major Midwest hub. Direct flights to Caribbean, Mexico, Europe, and Asia. Long winters drive heavy travel volume.`}
      heroImage="https://images.unsplash.com/photo-1559587733-19a8e0d1cba3?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-slate-900/60"
      badge={`✈️ Delta Hub`}
      sections={[
        { heading: `Why ${CITY} Has Solid Direct Coverage`, content: `<p>Detroit Metro (${AIRPORT}) is one of Delta's largest hubs. Direct flights from DTW reach most Caribbean islands, Cancún, every major European capital, Tokyo, Seoul, and Beijing. Michigan winters drive heavy travel to Caribbean and Mexico December through April.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 4-hour direct from DTW. From $899 per person for 4 nights.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from DTW. From $1,099 per person for 5 nights.</p><p><strong>Cabo San Lucas:</strong> Direct from DTW year-round. From $1,099 per person.</p><p><strong>Europe (London, Paris, Amsterdam, Frankfurt, Rome):</strong> Direct from DTW on Delta and partners.</p><p><strong>Tokyo, Seoul:</strong> Direct from DTW. Delta's Asian gateway.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from DTW`, description: `Delta's Midwest hub — direct to Caribbean, Mexico, Europe, Asia.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Asia Direct", description: "DTW has direct flights to Tokyo, Seoul, Beijing." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around $899 per person for 4 nights including flights from DTW.` },
        { question: "Are flights from DTW direct?", answer: "For most popular destinations, yes — DTW is one of Delta's largest hubs." },
        { question: "Can you book Asia trips?", answer: "Yes — DTW has direct flights to Tokyo, Seoul, Beijing on Delta." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (DTW).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "MI" } } }}
    />
  );
}
