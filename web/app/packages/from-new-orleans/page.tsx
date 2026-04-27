import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "New Orleans"; const AIRPORT = "MSY"; const URL_PATH = "/packages/from-new-orleans";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Cuba | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Cuba, Bahamas. Direct flights from Louis Armstrong International, hotel and transfers.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Caribbean`, `NOLA vacation`, `cruise from New Orleans`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from MSY.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1571893544028-06b07af6dade?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Louis Armstrong International (${AIRPORT}) is Louisiana's gateway. Direct to Caribbean, Mexico, plus a major cruise homeport (Royal Caribbean, Norwegian, Carnival, Disney).`}
    heroImage="https://images.unsplash.com/photo-1571893544028-06b07af6dade?auto=format&fit=crop&w=1600&q=85" heroGradient="from-purple-900/70 to-amber-900/60" badge={`✈️ MSY + Cruise Port`}
    sections={[
      { heading: `Why ${CITY} Punches Above Its Weight`, content: `<p>Louis Armstrong International (${AIRPORT}) sits on the Gulf Coast — close to Mexico, Caribbean, Latin America. Direct flights to Cancún, Cabo, Punta Cana, Aruba, Cuba. The Port of New Orleans is also a major cruise homeport with Royal Caribbean, Norwegian, Carnival, and Disney sailings.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 2.5-hour direct from MSY. From $899 per person for 4 nights.</p><p><strong>Cabo & Puerto Vallarta:</strong> Direct from MSY. From $1,099 per person.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from MSY. From $1,099 per person for 5 nights.</p><p><strong>Cuba (Havana):</strong> Direct from MSY on Southwest seasonal.</p><p><strong>Cruises from Port of New Orleans:</strong> Royal Caribbean, Norwegian, Carnival, Disney sail year-round to Western Caribbean and Mexico.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from MSY`, description: `Caribbean, Mexico, Cuba — direct from New Orleans.` },
      { icon: "anchor", title: "Cruise Homeport", description: "Royal Caribbean, Norwegian, Carnival, Disney all sail from Port of New Orleans." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around $899 per person for 4 nights including flights from MSY.` },
      { question: "Cruises from New Orleans?", answer: "Yes — Royal Caribbean, Norwegian, Carnival, Disney all homeport at Port of New Orleans. We book + handle pre-cruise hotels." },
      { question: "Cuba flights?", answer: "Direct seasonal on Southwest from MSY to Havana." },
      { question: "Payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay 0% interest." },
      { question: "Multi-city?", answer: "Yes — open-jaw routing supported." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Cruise Planning", href: "/services/cruises" }, { label: "Caribbean Destinations", href: "/destinations/caribbean" }, { label: "Mexico Destinations", href: "/destinations/mexico" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (MSY).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "LA" } } }}
  />
); }
