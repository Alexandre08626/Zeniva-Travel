import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Cleveland"; const AIRPORT = "CLE"; const URL_PATH = "/packages/from-cleveland";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Bahamas, Europe via connections. Direct flights, hotel and transfers included.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Caribbean`, `Ohio travel`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from CLE.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1568871392924-ec5af3a5cf09?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Cleveland Hopkins (${AIRPORT}) serves Northeast Ohio. Direct to Cancún, Punta Cana, Caribbean, plus easy connections to Europe via Charlotte/Atlanta/Detroit.`}
    heroImage="https://images.unsplash.com/photo-1568871392924-ec5af3a5cf09?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-red-900/60" badge={`✈️ Direct from CLE`}
    sections={[
      { heading: `Why ${CITY} Travelers Get Solid Direct Coverage`, content: `<p>Cleveland Hopkins (${AIRPORT}) serves Northeast Ohio. Direct flights from CLE reach Cancún, Punta Cana, Aruba, Cancún, plus seasonal Caribbean and Cuba service. Ohio winters drive heavy travel volume to Mexico/Caribbean December-April.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> Direct from CLE. From $999 per person for 4 nights.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from CLE. From $1,099 per person for 5 nights.</p><p><strong>Bahamas:</strong> Direct or one-stop. From $1,099 per person.</p><p><strong>Cabo San Lucas:</strong> Direct from CLE seasonal. From $1,199 per person.</p><p><strong>Europe:</strong> One-stop from CLE via Charlotte, Atlanta, or Detroit.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from CLE`, description: `Caribbean, Mexico, Bahamas — all direct from Cleveland.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      { icon: "map", title: "Easy Europe routing", description: "Connections via CLT, ATL, DTW for European destinations." },
    ]}
    faqs={[
      { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around $999 per person for 4 nights including flights from CLE.` },
      { question: "Direct flights?", answer: "Caribbean and Mexico direct. European destinations via CLT, ATL, or DTW." },
      { question: "Cruise homeport?", answer: "Not direct — but easy ground transport to Lake Erie cruise options or fly to MSY/Tampa for major cruises." },
      { question: "Payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay 0% interest." },
      { question: "Multi-city?", answer: "Yes — open-jaw routing supported." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Caribbean Destinations", href: "/destinations/caribbean" }, { label: "Mexico Destinations", href: "/destinations/mexico" }, { label: "All-Inclusive", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (CLE).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "OH" } } }}
  />
); }
