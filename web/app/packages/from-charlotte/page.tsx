import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Charlotte";
const AIRPORT = "CLT";
const URL_PATH = "/packages/from-charlotte";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Europe, Latin America. American Airlines hub with massive direct network.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Caribbean`, `cheap vacations from ${CITY}`, `American Airlines hub`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from CLT. Caribbean, Mexico, Europe.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1545178803-4056771d60a3?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromCharlottePage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Charlotte Douglas (${AIRPORT}) is American Airlines' largest East Coast hub. Direct flights to most Caribbean islands, Mexico, Europe, and Latin America.`}
      heroImage="https://images.unsplash.com/photo-1545178803-4056771d60a3?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-amber-900/60"
      badge={`✈️ American Hub`}
      sections={[
        { heading: `Why ${CITY} Has Surprising Direct Coverage`, content: `<p>Charlotte Douglas (${AIRPORT}) is American Airlines' largest East Coast hub — bigger than Miami in some metrics. Direct flights from CLT reach virtually every Caribbean island, Cancún, Cozumel, all major European capitals, and Latin American cities. The airport is one of America's busiest by traffic.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Caribbean (Punta Cana, Aruba, Turks and Caicos, St. Lucia):</strong> Direct from CLT to most major islands. From $1,099 per person for 5 nights.</p><p><strong>Cancún & Riviera Maya:</strong> 3-hour direct from CLT. From $899 per person for 4 nights.</p><p><strong>Europe (London, Paris, Frankfurt, Rome, Madrid):</strong> Direct from CLT on American.</p><p><strong>Bahamas:</strong> Direct from CLT. Atlantis, Baha Mar. From $1,099 per person.</p><p><strong>Latin America (Cancún, Mexico City, San José):</strong> Direct from CLT.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from CLT`, description: `American Airlines' largest East Coast hub — direct everywhere.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Caribbean Specialists", description: "CLT has direct flights to almost every Caribbean island." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages from $899 per person for 4 nights including flights from CLT.` },
        { question: "Are Caribbean flights direct?", answer: "Yes — most major Caribbean destinations are direct from CLT (Punta Cana, Aruba, Turks and Caicos, St. Lucia, Antigua)." },
        { question: "Can you book European trips?", answer: "Yes — direct flights from CLT to most major European capitals on American Airlines." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (CLT).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "NC" } } }}
    />
  );
}
