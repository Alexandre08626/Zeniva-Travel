import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Dallas";
const AIRPORT = "DFW";
const URL_PATH = "/packages/from-dallas";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Mexico, Caribbean, Europe | Zeniva`,
  description: `All-inclusive vacation deals departing from ${CITY} (${AIRPORT}/Love Field). Mexico, Caribbean, Europe, Hawaii. Flights + hotel + transfers, planned by Lina AI.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Cancun`, `${CITY} to Punta Cana`, `${CITY} to Cabo`,
    `${CITY} to Hawaii`, `Love Field vacation deals`, `cheap vacations from ${CITY}`,
    `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from DFW and Love Field. Mexico, Caribbean, Europe, Hawaii.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromDallasPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Direct flights from DFW and Love Field reach Mexico, the Caribbean, Hawaii, and most of Europe. Lina AI builds your package with flights, hotel, and transfers in seconds.`}
      heroImage="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-red-900/70 to-amber-900/60"
      badge={`✈️ DFW & Love Field`}
      sections={[
        {
          heading: `Why ${CITY} Is a Powerhouse Departure City`,
          content: `<p>Dallas-Fort Worth (${AIRPORT}) is American Airlines' largest hub and one of the busiest airports in the world. From DFW, direct flights reach almost every major Mexican beach destination, the Caribbean, Hawaii, every European capital, Tokyo, Seoul, and dozens more. Love Field (DAL) handles Southwest's discount routes to Cancún, Punta Cana, Cabo, and the major Caribbean islands.</p>
<p>Zeniva's ${CITY} packages compare both airports for every booking — whichever delivers the best total price wins. Texas weather and short flight times mean ${CITY} travelers can escape to Cancún or Cabo on a long weekend just as easily as a full week.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Cancún & Riviera Maya:</strong> 3-hour direct from DFW. All-inclusive packages from $899 per person for 4 nights. Iberostar, Excellence, Hard Rock, Palace.</p>
<p><strong>Cabo San Lucas & Puerto Vallarta:</strong> Direct from DFW year-round. Excellence Playa Mujeres, Esperanza Resort. From $999 per person for 4 nights.</p>
<p><strong>Punta Cana, Aruba, Turks and Caicos:</strong> Direct flights to Punta Cana and Aruba; one-stop to Turks. From $1,099 per person for 5 nights.</p>
<p><strong>Hawaii (Maui, Honolulu):</strong> Direct from DFW year-round. 7-hour flight to Maui. From $1,800 per person for 5 nights.</p>
<p><strong>Europe (London, Paris, Madrid, Rome, Frankfurt):</strong> Direct flights from DFW to most major European capitals. Best for spring (April–May) and fall (September–October).</p>
<p><strong>Tokyo & Asia:</strong> Direct flights from DFW to Tokyo, Seoul, Hong Kong. ${CITY} to Asia is faster than from most US cities.</p>`,
        },
        {
          heading: "DFW vs Love Field — Which to Use",
          content: `<p>DFW (American hub) wins for choice and international destinations. Love Field (Southwest hub) tends to be cheaper for Cancún, Cabo, Punta Cana, and major Caribbean. Lina compares both and quotes whichever delivers the best total price.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock the booking; balance in installments via ZeniPay at 0% interest.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `DFW or Love Field`, description: `Packages quote whichever ${CITY} airport gives the best total price.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Massive Direct Network", description: "DFW has more direct international flights than almost any other US airport." },
        { icon: "users", title: "Family-Friendly Options", description: "Beaches, Hard Rock Family Suites, Iberostar Family." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún or Punta Cana packages start around $899 per person for 4 nights including flights from DFW or Love Field.` },
        { question: "DFW or Love Field — which is cheaper?", answer: "Love Field/Southwest tends to win for Cancún, Cabo, Punta Cana. DFW/American wins on most other destinations and any premium-cabin booking." },
        { question: "Are direct flights guaranteed?", answer: `For most ${CITY} departures we use direct flights only.` },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
      ]}
      jsonLd={{
        "@context": "https://schema.org", "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (DFW and Love Field).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "TX" } },
      }}
    />
  );
}
