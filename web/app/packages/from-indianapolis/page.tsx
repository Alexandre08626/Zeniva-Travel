import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Indianapolis"; const AIRPORT = "IND"; const URL_PATH = "/packages/from-indianapolis";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Bahamas. Direct flights, hotel and transfers included.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Caribbean`, `cheap vacations from ${CITY}`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from IND.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Indianapolis International (${AIRPORT}) has direct flights to most Caribbean and Mexican destinations plus connections to Europe via Delta hub Detroit.`}
    heroImage="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-amber-900/60" badge={`✈️ Direct from IND`}
    sections={[
      { heading: `Why ${CITY} Travelers Have Direct Service`, content: `<p>Indianapolis International (${AIRPORT}) is Indiana's main international airport. Direct flights to Cancún, Punta Cana, Aruba, Cancún plus seasonal Caribbean service. Indiana winters drive heavy volume to all-inclusive resorts December-April.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> Direct from IND. From $999 per person for 4 nights.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from IND. From $1,099 per person for 5 nights.</p><p><strong>Cabo San Lucas:</strong> Direct from IND. From $1,099 per person.</p><p><strong>Bahamas:</strong> Direct from IND. From $1,099 per person.</p><p><strong>Europe:</strong> One-stop from IND via Detroit (DTW) or Atlanta (ATL).</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from IND`, description: `Caribbean, Mexico, Bahamas — all direct from Indianapolis.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      { icon: "map", title: "Easy DTW connections", description: "Europe routing via Detroit's Delta hub." },
    ]}
    faqs={[
      { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around $999 per person for 4 nights including flights from IND.` },
      { question: "Are flights direct?", answer: "Most popular Caribbean and Mexico destinations direct from IND." },
      { question: "European trips?", answer: "One-stop via Detroit or Atlanta on Delta." },
      { question: "Payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay 0% interest." },
      { question: "Multi-city?", answer: "Yes — open-jaw routing supported." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Caribbean", href: "/destinations/caribbean" }, { label: "Mexico", href: "/destinations/mexico" }, { label: "All-Inclusive", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (IND).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "IN" } } }}
  />
); }
