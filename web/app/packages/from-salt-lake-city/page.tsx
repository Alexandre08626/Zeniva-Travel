import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Salt Lake City"; const AIRPORT = "SLC"; const URL_PATH = "/packages/from-salt-lake-city";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Mexico, Caribbean, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Mexico, Caribbean, Hawaii, Europe. Delta hub with direct flights to most major destinations.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Cabo`, `Utah travel`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from SLC.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1577196806850-bb6c44567f2c?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Salt Lake City International (${AIRPORT}) is Delta's mountain hub. Direct flights to Mexico, Caribbean, Europe, plus the new SLC terminal makes it one of America's easiest airports.`}
    heroImage="https://images.unsplash.com/photo-1577196806850-bb6c44567f2c?auto=format&fit=crop&w=1600&q=85" heroGradient="from-slate-900/70 to-cyan-900/60" badge={`✈️ Delta Hub`}
    sections={[
      { heading: `Why ${CITY} Has Strong Direct Coverage`, content: `<p>Salt Lake City International (${AIRPORT}) is one of Delta's largest hubs. Direct flights from SLC reach Cancún, Cabo, Punta Cana, plus Paris, Amsterdam, London. The new SLC terminal (opened 2020-2024 phases) is one of the most modern airports in the US — fast security, easy transfers.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> Direct from SLC. From $999 per person for 4 nights.</p><p><strong>Cabo & Puerto Vallarta:</strong> Direct from SLC. From $1,099 per person.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from SLC. From $1,199 per person for 5 nights.</p><p><strong>Hawaii (Maui, Honolulu):</strong> Direct from SLC. From $1,599 per person for 5 nights.</p><p><strong>Europe (Paris, Amsterdam, London):</strong> Direct from SLC on Delta and partners.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from SLC`, description: `Delta hub — direct to Mexico, Caribbean, Hawaii, Europe.` },
      { icon: "gift", title: "Modern airport", description: "New SLC terminal opened 2020-2024 — fast security, easy transfers." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "Europe Direct", description: "Paris, Amsterdam, London direct from SLC." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around $999 per person for 4 nights including flights from SLC.` },
      { question: "Direct to Europe?", answer: "Yes — Paris, Amsterdam, London direct from SLC on Delta and partners." },
      { question: "Hawaii flights?", answer: "Direct from SLC year-round on Delta." },
      { question: "Payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay 0% interest." },
      { question: "Multi-city?", answer: "Yes — open-jaw routing supported." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Mexico Destinations", href: "/destinations/mexico" }, { label: "Europe Destinations", href: "/destinations/europe" }, { label: "All-Inclusive", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (SLC).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "UT" } } }}
  />
); }
