import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Sacramento"; const AIRPORT = "SMF"; const URL_PATH = "/packages/from-sacramento";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Hawaii, Mexico, Caribbean | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Hawaii, Mexico, Caribbean. Direct flights from Sacramento International, hotel and transfers.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Hawaii`, `${CITY} to Mexico`, `Sacto vacation deals`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from SMF.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1551806235-6692e2d59d49?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Sacramento International (${AIRPORT}) is California's capital airport. Direct flights to Hawaii, Mexico, plus growing service. Cheaper than SFO for many destinations.`}
    heroImage="https://images.unsplash.com/photo-1551806235-6692e2d59d49?auto=format&fit=crop&w=1600&q=85" heroGradient="from-amber-900/70 to-emerald-900/60" badge={`✈️ Direct from SMF`}
    sections={[
      { heading: `Why ${CITY} Often Beats SFO on Price`, content: `<p>Sacramento International (${AIRPORT}) serves Northern California's capital region. Lower airport fees + Southwest's strong presence often mean cheaper fares than SFO for Mexico and Hawaii routes. Direct to Honolulu, Maui, Cabo, Puerto Vallarta, Cancún.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Hawaii (Honolulu, Maui):</strong> Direct from SMF on Hawaiian, Southwest, Alaska. From $1,499 per person for 5 nights.</p><p><strong>Cabo & Puerto Vallarta:</strong> Direct from SMF. From $899 per person for 4 nights.</p><p><strong>Cancún:</strong> Direct from SMF. From $999 per person for 4 nights.</p><p><strong>Caribbean:</strong> One-stop via LAX or DEN. From $1,299 per person for 5 nights.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from SMF`, description: `Hawaii, Mexico — direct from Sacramento.` },
      { icon: "gift", title: "Often cheaper than SFO", description: "Lower airport fees + Southwest competition." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "Same time zone Mexico", description: "Pacific Mexico no jet lag." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cabo or Puerto Vallarta packages start around $899 per person for 4 nights including flights from SMF.` },
      { question: "Cheaper than SFO?", answer: "Often yes — lower airport fees + Southwest competition tend to win on Mexico/Hawaii fares." },
      { question: "Hawaii flights direct?", answer: "Yes — Hawaiian, Southwest, Alaska direct from SMF year-round." },
      { question: "Payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay 0% interest." },
      { question: "Multi-city?", answer: "Yes — open-jaw routing supported." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Mexico Destinations", href: "/destinations/mexico" }, { label: "From SF (alt)", href: "/packages/from-san-francisco" }, { label: "All-Inclusive", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (SMF).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "CA" } } }}
  />
); }
