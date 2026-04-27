import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Las Vegas";
const AIRPORT = "LAS";
const URL_PATH = "/packages/from-las-vegas";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Hawaii, Mexico, Asia | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Hawaii, Mexico, Asia, Caribbean. Direct flights from Harry Reid International, hotel and transfers.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Hawaii`, `${CITY} to Cabo`, `${CITY} to Cancun`, `cheap vacations from ${CITY}`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from LAS. Hawaii, Mexico, Asia.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromLasVegasPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Harry Reid International (${AIRPORT}) is one of America's busiest airports. Direct flights to Hawaii, Mexico, Caribbean, and growing Asia network.`}
      heroImage="https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-purple-900/70 to-pink-900/60"
      badge={`✈️ Direct from LAS`}
      sections={[
        { heading: `Why ${CITY} Has Massive Direct Coverage`, content: `<p>Harry Reid International (${AIRPORT}) is one of America's top 10 busiest airports. Direct flights from LAS reach all major Hawaiian islands, every Mexican beach destination, the Caribbean, and a growing list of Asian and European capitals. The 24/7 vibe of ${CITY} extends to the airport — flights at any hour.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Hawaii (Maui, Honolulu, Kauai):</strong> Direct from LAS. Wailea, Kaanapali, Ko Olina. From $1,499 per person for 5 nights.</p><p><strong>Cabo & Puerto Vallarta:</strong> 2.5-hour direct. From $899 per person for 4 nights.</p><p><strong>Cancún & Riviera Maya:</strong> Direct from LAS. From $999 per person for 4 nights.</p><p><strong>Caribbean (Punta Cana, Aruba):</strong> Direct or one-stop. From $1,199 per person for 5 nights.</p><p><strong>Tokyo, Seoul:</strong> Direct from LAS on Korean Air and others. Asia gateway from the West.</p><p><strong>Europe (London, Frankfurt):</strong> Direct from LAS to major European capitals.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from LAS`, description: `One of America's top 10 busiest airports — direct everywhere.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "24/7 Departures", description: "LAS operates around the clock — flights at any hour." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cabo or Puerto Vallarta packages start around $899 per person for 4 nights including flights from LAS.` },
        { question: "Are Hawaii flights direct from LAS?", answer: "Yes — Hawaiian, Alaska, Southwest, United fly direct year-round." },
        { question: "Can I book Asia trips from LAS?", answer: "Yes — direct flights to Tokyo, Seoul, plus one-stop to most major Asian cities." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (LAS).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "NV" } } }}
    />
  );
}
