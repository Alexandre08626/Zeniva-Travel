import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Philadelphia";
const AIRPORT = "PHL";
const URL_PATH = "/packages/from-philadelphia";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Europe, Mexico | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Europe, Hawaii. Direct flights from PHL, hotel and transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Caribbean`, `${CITY} to Cancun`, `${CITY} to Punta Cana`,
    `${CITY} to Europe`, `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from PHL. Caribbean, Mexico, Europe, Hawaii.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1559564484-0a8a7d2e5d04?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromPhiladelphiaPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`PHL is American Airlines' East Coast international hub. Direct flights to the Caribbean, most of Europe, and Latin America. Built by Lina AI.`}
      heroImage="https://images.unsplash.com/photo-1559564484-0a8a7d2e5d04?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-emerald-900/60"
      badge={`✈️ Direct from PHL`}
      sections={[
        {
          heading: `Why ${CITY} Travelers Have Direct Options`,
          content: `<p>${CITY} International (${AIRPORT}) is American Airlines' second-largest hub and a major international gateway. From PHL, direct flights reach most of the Caribbean, Mexico's beach destinations, every major European capital, and many Latin American cities. ${CITY}'s position on the East Coast makes Europe, Africa, and the Caribbean particularly accessible.</p>
<p>Zeniva's ${CITY} packages skip the JFK or Newark layover most ${CITY} travelers default to. Direct flights from PHL on American and partner carriers cover most popular vacation destinations.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Cancún & Riviera Maya:</strong> 4-hour direct from PHL. All-inclusive packages from $999 per person for 4 nights.</p>
<p><strong>Punta Cana & Caribbean:</strong> Direct from PHL to Punta Cana, Aruba, Cancún, Nassau. From $1,099 per person for 5 nights.</p>
<p><strong>Cabo San Lucas:</strong> Direct from PHL year-round on American. From $1,099 per person for 4 nights.</p>
<p><strong>Hawaii (Maui, Honolulu):</strong> Long flight (10+ hours) — typically routes through DFW, ORD, or LAX. Best for 7+ night trips.</p>
<p><strong>Europe (London, Paris, Madrid, Rome, Frankfurt, Athens):</strong> Direct flights from PHL on American and partner carriers. Strongest network outside of JFK on the US East Coast.</p>
<p><strong>Latin America:</strong> Direct from PHL to Lima, Bogotá, San José, and others. Good gateway for South American trips.</p>`,
        },
        {
          heading: "Direct or Connect via Charlotte",
          content: `<p>For destinations PHL doesn't serve directly, we typically route through Charlotte (CLT) or Miami (MIA) — both are American Airlines hubs with extensive Caribbean and Latin American networks. Lina compares routes and picks whichever delivers the best total price and travel time.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock the booking; balance in installments via ZeniPay at 0% interest.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from PHL`, description: `American Airlines' second-largest hub — direct flights to Caribbean, Europe, Latin America.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Skip the JFK Connection", description: "Most popular vacation destinations are direct from PHL — no JFK or EWR layover needed." },
        { icon: "users", title: "Family or Couples", description: "Adults-only, family resorts, multigenerational villas — all bookable." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around $999 per person for 4 nights including flights from PHL. Punta Cana from $1,099 per person for 5 nights.` },
        { question: "Are flights to the Caribbean direct?", answer: "Yes — most major Caribbean destinations are direct from PHL. For destinations not served directly, we route through CLT or MIA." },
        { question: "Can I do European multi-city trips?", answer: "Yes — open-jaw routing supported. Fly into one European city and out of another." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can you book South American trips?", answer: "Yes — PHL has direct flights to Lima, Bogotá, San José. Combinable with Galápagos or Patagonia extensions." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Europe Destinations", href: "/destinations/europe" },
      ]}
      jsonLd={{
        "@context": "https://schema.org", "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (PHL).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "PA" } },
      }}
    />
  );
}
