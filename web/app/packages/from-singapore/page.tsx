import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Singapore"; const AIRPORT = "SIN"; const URL_PATH = "/packages/from-singapore";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Asia, Bali, Europe | Zeniva`,
  description: `Vacation deals from ${CITY} (${AIRPORT}). Bali, Thailand, Japan, Europe, Australia. Direct flights from Changi, hotel and transfers included.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `Singapore to Bali`, `Singapore to Tokyo`, `Singapore to Europe`, `Changi vacation deals`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from Changi. Asia, Europe, Australia.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Singapore Changi (${AIRPORT}) is consistently ranked the world's best airport. Singapore Airlines hub with direct flights to virtually every global destination.`}
    heroImage="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-cyan-900/60" badge={`✈️ World's Best Airport`}
    sections={[
      { heading: `Why ${CITY} Has Unmatched Connectivity`, content: `<p>Changi Airport (${AIRPORT}) is the world's best airport (Skytrax ranking) and Singapore Airlines' main hub. Direct flights from SIN reach virtually every global destination — Asia (any city), Europe (every major capital), USA (LA, NYC, SF), Australia, Africa, South America.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Bali (Denpasar):</strong> 2.5-hour direct from SIN. Most popular regional escape. From SGD 800/person for 4 nights.</p><p><strong>Maldives, Thailand, Japan:</strong> Direct from SIN. Premium beach + culture. From SGD 1,500/person.</p><p><strong>Europe (London, Paris, Rome, Frankfurt, Athens):</strong> Direct from SIN on Singapore Airlines (one of world's best). From SGD 2,500/person.</p><p><strong>USA (LA, San Francisco, NYC):</strong> Direct from SIN. SQ Suites are world-famous. From SGD 2,500/person.</p><p><strong>Australia (Sydney, Melbourne, Perth):</strong> Direct from SIN. Common weekend escape for Singaporeans.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pricing in SGD or USD via ZeniPay. 25% deposit, balance 0% installments.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from SIN`, description: `World's best airport — Singapore Airlines + 100+ international carriers.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "SQ Suites + First", description: "Singapore Airlines Suites are world's best premium product." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the most popular SG holiday?`, answer: `Bali (2.5-hour direct, regional weekend escape) and Tokyo (8-hour direct, food + culture).` },
      { question: "Singapore Airlines vs Scoot?", answer: "SQ for premium + long-haul. Scoot (SQ low-cost subsidiary) for budget regional. Lina compares." },
      { question: "Currency?", answer: "SGD or USD via ZeniPay. Payment plans 0% interest." },
      { question: "Cruise from Singapore?", answer: "Yes — Royal Caribbean, Princess, Costa, MSC sail from Singapore for Southeast Asia + Japan itineraries." },
      { question: "Best premium-cabin?", answer: "Singapore Airlines Suites (SIN-NYC, SIN-LAX, SIN-Frankfurt) — frequently ranked world's best first class." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Cruise Planning", href: "/services/cruises" }, { label: "Luxury Travel", href: "/services/luxury-travel" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (SIN/Changi).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "SG" } } }}
  />
); }
