import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Denver";
const AIRPORT = "DEN";
const URL_PATH = "/packages/from-denver";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Hawaii, Europe. Direct flights from DIA, hotel and transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Cancun`, `${CITY} to Cabo`, `${CITY} to Hawaii`,
    `${CITY} to Caribbean`, `DIA vacation deals`, `cheap vacations from ${CITY}`,
    `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from DIA. Caribbean, Mexico, Hawaii, Europe.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromDenverPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`From DIA, the entire continental US is within four hours. Caribbean, Mexico, Hawaii direct. Lina AI builds your package with flights, hotel, and transfers in seconds.`}
      heroImage="https://images.unsplash.com/photo-1546156929-a4c0ac411f47?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-orange-900/70 to-purple-900/60"
      badge={`✈️ Direct from DIA`}
      sections={[
        {
          heading: `Why ${CITY} Travelers Have Easy Access`,
          content: `<p>${CITY} International (${AIRPORT}, "DIA") is United Airlines' largest hub by gates and the central US's gateway to Mexico, the Caribbean, Hawaii, and Europe. Direct flights to Cancún, Cabo, Punta Cana, and most major Caribbean islands. Direct to Hawaii. Direct to London, Frankfurt, and Munich.</p>
<p>${CITY}'s long winters drive heavy travel to all-inclusive Mexico and Caribbean resorts December through April. Summer trends shift to Europe and Alaska. Zeniva's ${CITY} packages cover both seasons.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Cancún & Riviera Maya:</strong> 4-hour direct from DIA. All-inclusive packages from $899 per person for 4 nights. Iberostar, Excellence, Hard Rock, Palace.</p>
<p><strong>Cabo & Puerto Vallarta:</strong> Direct from DIA year-round. Esperanza, Excellence Playa Mujeres, Grand Velas. From $1,099 per person.</p>
<p><strong>Punta Cana, Aruba:</strong> Direct from DIA. From $1,199 per person for 5 nights.</p>
<p><strong>Hawaii (Maui, Honolulu):</strong> Direct from DIA year-round. From $1,800 per person for 5 nights.</p>
<p><strong>Europe (London, Frankfurt, Munich, Reykjavík):</strong> Direct flights from DIA. Ideal for shoulder-season trips (April–May, September–October).</p>
<p><strong>Iceland:</strong> Direct from DIA on Icelandair. Free 3–7 night stopover available on the way to mainland Europe.</p>`,
        },
        {
          heading: "Direct or Connect — Lina Decides",
          content: `<p>For most destinations, direct flights from DIA are available. For destinations DIA doesn't serve directly, we route through the shortest viable hub. Lina compares routes and quotes whichever delivers the best total price and travel time.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock the booking; balance in installments via ZeniPay at 0% interest.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from DIA`, description: `United's largest hub by gates — direct flights to Mexico, Caribbean, Hawaii, Europe.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Iceland Stopover", description: "Free 3–7 night Iceland layover on the way to Europe via Icelandair." },
        { icon: "users", title: "Family-Friendly Options", description: "Beaches, Hard Rock Family Suites, Iberostar Family." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around $899 per person for 4 nights including flights from DIA.` },
        { question: "Are flights from DIA direct?", answer: "For most popular destinations, yes — DIA is United's largest hub by gates." },
        { question: "Can I do an Iceland stopover?", answer: "Yes — Icelandair offers free stopovers in Reykjavík for 3–7 nights on the way to mainland Europe." },
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
        { label: "Europe Destinations", href: "/destinations/europe" },
      ]}
      jsonLd={{
        "@context": "https://schema.org", "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (DIA).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "CO" } },
      }}
    />
  );
}
