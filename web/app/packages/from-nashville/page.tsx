import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Nashville";
const AIRPORT = "BNA";
const URL_PATH = "/packages/from-nashville";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Bahamas, Europe. Direct flights from Nashville International, hotel and transfers.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Caribbean`, `cheap vacations from ${CITY}`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from BNA.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1539522110ab-e8907ed9c476?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromNashvillePage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Nashville International (${AIRPORT}) has grown massively — now direct to most Caribbean, Mexico, Bahamas, and major European capitals. Lina builds your package in seconds.`}
      heroImage="https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/70 to-orange-900/60"
      badge={`✈️ Direct from BNA`}
      sections={[
        { heading: `Why ${CITY} Has Become a Major Vacation Hub`, content: `<p>${CITY}'s explosive growth has transformed BNA into one of the fastest-growing US airports. Direct flights now reach most Caribbean destinations, Cancún, Cozumel, the Bahamas, plus London and a few European routes. Southwest and American both compete heavily on Mexico/Caribbean fares from BNA.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 3-hour direct from BNA. From $899 per person for 4 nights.</p><p><strong>Caribbean (Punta Cana, Aruba):</strong> Direct from BNA. From $1,099 per person for 5 nights.</p><p><strong>Bahamas:</strong> Direct from BNA. From $999 per person.</p><p><strong>Cabo San Lucas:</strong> Direct from BNA. From $999 per person.</p><p><strong>London:</strong> Direct from BNA on British Airways.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from BNA`, description: `Caribbean, Mexico, Bahamas, London all direct from Nashville.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Growing Network", description: "BNA adds new international routes regularly." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún or Cabo packages start around $899 per person for 4 nights including flights from BNA.` },
        { question: "Are Caribbean flights direct?", answer: "Most major Caribbean destinations are direct from BNA including Punta Cana, Aruba, Cancún." },
        { question: "Can I fly direct to London?", answer: "Yes — British Airways flies direct from BNA to London Heathrow." },
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
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (BNA).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "TN" } } }}
    />
  );
}
