import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Portland"; const AIRPORT = "PDX"; const URL_PATH = "/packages/from-portland";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Hawaii, Mexico, Asia | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Hawaii, Mexico, Asia, Europe. Direct flights from Portland International, hotel and transfers.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Hawaii`, `${CITY} to Cabo`, `${CITY} to Tokyo`, `Oregon travel`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from PDX.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1606774634036-30dca0a32d6f?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Portland International (${AIRPORT}) is Oregon's gateway. Direct flights to Hawaii, Mexico, Tokyo, plus European service. Strong Alaska Airlines presence.`}
    heroImage="https://images.unsplash.com/photo-1606774634036-30dca0a32d6f?auto=format&fit=crop&w=1600&q=85" heroGradient="from-emerald-900/70 to-blue-900/60" badge={`✈️ Direct from PDX`}
    sections={[
      { heading: `Why ${CITY} Travelers Have Strong Pacific Coverage`, content: `<p>Portland International (${AIRPORT}) is Alaska Airlines' Oregon hub plus a Delta focus city. Direct flights to all major Hawaiian islands, Cabo, Puerto Vallarta, Tokyo, Amsterdam, Frankfurt. PDX consistently ranks as one of America's best airports for traveler experience.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Hawaii (Honolulu, Maui, Kauai, Big Island):</strong> Direct from PDX on Alaska, Hawaiian. From $1,399 per person for 5 nights.</p><p><strong>Cabo & Puerto Vallarta:</strong> Direct from PDX. From $999 per person for 4 nights.</p><p><strong>Cancún & Riviera Maya:</strong> Direct from PDX seasonally. From $1,099 per person.</p><p><strong>Tokyo:</strong> Direct from PDX on Delta. Asia gateway from the Pacific Northwest.</p><p><strong>Europe (Amsterdam, Frankfurt):</strong> Direct from PDX on Delta and partners.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from PDX`, description: `Hawaii, Mexico, Tokyo, Amsterdam — all direct from Portland.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "Asia Direct", description: "PDX to Tokyo direct on Delta." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cabo or Puerto Vallarta packages start around $999 per person for 4 nights including flights from PDX.` },
      { question: "Hawaii flights direct?", answer: "Yes — Alaska, Hawaiian fly direct from PDX to all major Hawaiian islands." },
      { question: "Asia trips?", answer: "Direct PDX-Tokyo on Delta. One-stop to other Asian cities via Tokyo or Seattle." },
      { question: "Payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay 0% interest." },
      { question: "Multi-city?", answer: "Yes — open-jaw routing supported." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Mexico Destinations", href: "/destinations/mexico" }, { label: "From Seattle (alt)", href: "/packages/from-seattle" }, { label: "All-Inclusive", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (PDX).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "OR" } } }}
  />
); }
