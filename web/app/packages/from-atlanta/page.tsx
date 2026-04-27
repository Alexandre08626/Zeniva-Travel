import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Atlanta";
const AIRPORT = "ATL";
const URL_PATH = "/packages/from-atlanta";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Europe, Africa, Asia. Direct flights from the world's busiest airport, hotel and transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Caribbean`, `${CITY} to Cancun`, `${CITY} to Punta Cana`,
    `${CITY} to Europe`, `Hartsfield-Jackson vacation deals`, `cheap vacations from ${CITY}`,
    `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from ATL. Caribbean, Mexico, Europe, Africa, Asia.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1575408264798-b50b252663e6?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromAtlantaPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`${AIRPORT} is the world's busiest airport and Delta's largest hub. Direct flights reach 150+ destinations. Lina AI builds your package with flights, hotel, and transfers in seconds.`}
      heroImage="https://images.unsplash.com/photo-1575408264798-b50b252663e6?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-red-900/70 to-purple-900/60"
      badge={`✈️ World's Busiest Airport`}
      sections={[
        {
          heading: `Why ${CITY} Is the Best Hub on the East Coast`,
          content: `<p>Hartsfield-Jackson Atlanta International (${AIRPORT}) is the world's busiest airport. Delta's largest hub. From ${CITY}, you can fly direct to nearly every major Caribbean island, Mexico, every European capital, multiple African cities, Tokyo, Seoul, Sydney, and Buenos Aires. There is hardly a vacation destination on the planet that ${CITY} doesn't reach directly.</p>
<p>Zeniva's ${CITY} packages take advantage of Delta's extensive direct network. Most packages avoid connections entirely. ${CITY}'s warm climate and southern location mean year-round access to Caribbean and Latin American beaches with relatively short flights.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Caribbean (Punta Cana, Aruba, Turks and Caicos, St. Lucia):</strong> Direct from ATL to most major Caribbean islands. From $1,099 per person for 5 nights.</p>
<p><strong>Cancún, Cozumel, Riviera Maya:</strong> 2.5-hour direct from ATL. All-inclusive from $899 per person for 4 nights.</p>
<p><strong>Cabo, Puerto Vallarta:</strong> Direct from ATL year-round. From $1,099 per person.</p>
<p><strong>Bahamas:</strong> 2-hour direct from ATL. Atlantis Paradise Island, Baha Mar, Harbour Island. From $1,099 per person for 4 nights.</p>
<p><strong>Europe (London, Paris, Amsterdam, Rome, Madrid, Frankfurt):</strong> Direct flights to almost every major European capital.</p>
<p><strong>Africa (Johannesburg, Cape Town, Lagos):</strong> Direct from ATL — one of the few US cities with regular service to sub-Saharan Africa. Safari packages bookable from here.</p>`,
        },
        {
          heading: "Direct Flights Are the Default",
          content: `<p>Because ATL is Delta's largest hub, direct flights are the default for almost every destination ${CITY} travelers want to reach. We avoid connections wherever possible. If a destination requires a connection, we'll route through the shortest viable hub.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock the booking; balance in installments via ZeniPay at 0% interest.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from ${AIRPORT}`, description: `World's busiest airport — direct flights to 150+ destinations.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Africa & Latin America", description: "ATL is one of the few US hubs with regular service to Africa." },
        { icon: "users", title: "Group-Friendly", description: "Multi-cabin family bookings, milestone trips, corporate groups." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Bahamas long-weekends from $1,099 per person. All-inclusive Cancún packages from $899 per person for 4 nights.` },
        { question: "Are flights from ATL direct?", answer: "For almost every popular destination, yes — ATL is Delta's largest hub. Direct flights are the default." },
        { question: "Can you book safaris from ATL?", answer: "Yes. ATL is one of the few US cities with direct flights to sub-Saharan Africa. We book combined safari + city + beach itineraries." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
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
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (ATL).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "GA" } },
      }}
    />
  );
}
