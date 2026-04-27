import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Austin"; const AIRPORT = "AUS"; const URL_PATH = "/packages/from-austin";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Mexico, Caribbean, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Mexico, Caribbean, Europe, London. Direct flights from Austin-Bergstrom, hotel and transfers.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Cabo`, `${CITY} to London`, `Austin travel`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from AUS.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Austin-Bergstrom (${AIRPORT}) is Texas's fastest-growing airport. Direct flights to Mexico, Caribbean, Europe (London, Frankfurt). Strong Southwest, JetBlue, and British Airways presence.`}
    heroImage="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1600&q=85" heroGradient="from-orange-900/70 to-purple-900/60" badge={`✈️ Direct from AUS`}
    sections={[
      { heading: `Why ${CITY} Has Exploded as a Vacation Hub`, content: `<p>Austin-Bergstrom (${AIRPORT}) has tripled in size since 2015 with rapid international route additions. Direct flights to Cancún, Cabo, Mexico City, London (British Airways), Frankfurt (Lufthansa), Amsterdam, plus all major Caribbean. Austin's tech boom drove demand and the airline competition keeps fares competitive.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 2.5-hour direct from AUS. From $899 per person for 4 nights.</p><p><strong>Cabo San Lucas:</strong> Direct from AUS year-round. From $999 per person.</p><p><strong>Mexico City:</strong> Direct from AUS. Cultural city break.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from AUS. From $1,099 per person for 5 nights.</p><p><strong>Europe (London, Frankfurt, Amsterdam):</strong> Direct from AUS on British Airways, Lufthansa, KLM.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from AUS`, description: `Mexico, Caribbean, Europe — Austin's network has exploded since 2015.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "Europe Direct", description: "London, Frankfurt, Amsterdam direct from AUS." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún or Cabo packages start around $899 per person for 4 nights including flights from AUS.` },
      { question: "Direct to London?", answer: "Yes — British Airways flies direct from AUS to London Heathrow daily." },
      { question: "Caribbean direct?", answer: "Punta Cana and Cancún direct. Other Caribbean destinations via DFW or CLT." },
      { question: "Payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay 0% interest." },
      { question: "Multi-city European trips?", answer: "Yes — open-jaw routing supported." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Mexico Destinations", href: "/destinations/mexico" }, { label: "Europe Destinations", href: "/destinations/europe" }, { label: "All-Inclusive", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (AUS).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "TX" } } }}
  />
); }
