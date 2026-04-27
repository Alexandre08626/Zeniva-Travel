import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Minneapolis";
const AIRPORT = "MSP";
const URL_PATH = "/packages/from-minneapolis";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Europe, Asia. Delta hub with direct flights to most major destinations.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Caribbean`, `cheap vacations from ${CITY}`, `Twin Cities vacation`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from MSP.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1601389004500-aa9c0b6cdf25?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromMinneapolisPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Minneapolis-Saint Paul (${AIRPORT}) is one of Delta's largest hubs. Direct to Caribbean, Mexico, Europe, Asia — Twin Cities winters drive heavy escape volume.`}
      heroImage="https://images.unsplash.com/photo-1601389004500-aa9c0b6cdf25?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-cyan-900/60"
      badge={`✈️ Delta Hub`}
      sections={[
        { heading: `Why MSP Travelers Have It Easy`, content: `<p>${AIRPORT} is Delta's third-largest hub. Direct flights from MSP reach most Caribbean destinations, Cancún, every major European capital, Tokyo, Seoul. Minnesota's brutal winters drive massive travel volume to Mexico and Caribbean December through April.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 4-hour direct from MSP. From $899 per person for 4 nights.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from MSP. From $1,099 per person for 5 nights.</p><p><strong>Cabo San Lucas:</strong> Direct from MSP year-round. From $1,099 per person.</p><p><strong>Europe (London, Paris, Amsterdam, Reykjavík):</strong> Direct from MSP on Delta and Icelandair.</p><p><strong>Tokyo, Seoul:</strong> Direct from MSP on Delta.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from MSP`, description: `Delta's third-largest hub — direct to Caribbean, Mexico, Europe, Asia.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Iceland Direct", description: "MSP has direct flights to Reykjavík via Icelandair." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around $899 per person for 4 nights including flights from MSP.` },
        { question: "Are flights from MSP direct?", answer: "For most popular destinations, yes — MSP is Delta's third-largest hub." },
        { question: "Can I do an Iceland stopover?", answer: "Yes — Icelandair offers free stopovers in Reykjavík for 3-7 nights on the way to Europe." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Europe Destinations", href: "/destinations/europe" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (MSP).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "MN" } } }}
    />
  );
}
