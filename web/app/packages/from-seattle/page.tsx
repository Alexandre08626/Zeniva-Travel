import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Seattle";
const AIRPORT = "SEA";
const URL_PATH = "/packages/from-seattle";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Hawaii, Asia, Mexico | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Hawaii, Asia, Mexico, Alaska cruises. Direct flights from Sea-Tac, hotel and transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Hawaii`, `${CITY} to Tokyo`, `${CITY} to Cabo`,
    `${CITY} to Alaska cruise`, `Sea-Tac vacation deals`, `cheap vacations from ${CITY}`,
    `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from Sea-Tac. Hawaii, Asia, Mexico, Alaska cruises.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1502175353174-a7a44e84da10?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromSeattlePage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Sea-Tac is the West Coast's gateway to Asia and Alaska. Direct flights to Hawaii, Tokyo, Seoul, Mexico, and the Alaska cruise season. Built by Lina AI.`}
      heroImage="https://images.unsplash.com/photo-1502175353174-a7a44e84da10?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-blue-900/60"
      badge={`✈️ Direct from Sea-Tac`}
      sections={[
        {
          heading: `Why ${CITY} Is a Pacific Travel Hub`,
          content: `<p>Sea-Tac International (${AIRPORT}) is Delta and Alaska Airlines' Pacific hub. From ${CITY}, direct flights reach Hawaii (5 hours), Tokyo (10 hours), Seoul (11 hours), and most of Mexico's Pacific coast. ${CITY} is also the primary US homeport for Alaska cruises — most ships sail from May through September.</p>
<p>Zeniva's ${CITY} packages take advantage of all of this. Hawaii in winter, Alaska cruises in summer, Asia anytime. Direct flights are the default; connections only when destinations don't serve ${CITY} directly.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Hawaii (Maui, Oahu, Big Island, Kauai):</strong> ${CITY}'s closest beach destination. 5-hour direct flights from SEA to all major Hawaiian islands. Wailea, Kaanapali, Ko Olina, Waikiki. From $1,400 per person for 5 nights.</p>
<p><strong>Alaska Cruises (homeport from ${CITY}):</strong> May through September. Princess, Holland America, Norwegian, Royal Caribbean all sail from Sea-Tac. 7-night Inside Passage from $899 per person.</p>
<p><strong>Mexico (Cabo, Puerto Vallarta, Cancún):</strong> Direct from SEA to Cabo and Puerto Vallarta. From $999 per person for 4 nights.</p>
<p><strong>Tokyo, Seoul, Tokyo:</strong> Direct from SEA to Tokyo (Narita and Haneda) and Seoul. ${CITY} is one of the fastest US-to-Asia routes.</p>
<p><strong>Tahiti & Bora Bora:</strong> One-stop from SEA via Honolulu. Honeymoon-ready year-round.</p>
<p><strong>Europe (London, Paris, Amsterdam, Frankfurt):</strong> Direct flights from SEA to major European capitals via Delta and partner carriers.</p>`,
        },
        {
          heading: "Alaska Cruises from Seattle",
          content: `<p>${CITY} is the primary US homeport for Alaska cruises. Most 7-night sailings depart from the Bell Street Cruise Terminal and visit Juneau, Skagway, and Ketchikan with a glacier day at Hubbard or Tracy Arm. Princess, Holland America, Norwegian, and Royal Caribbean all sail from SEA. Zeniva books pre-cruise hotels and transfers from Sea-Tac to the port.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock the booking; balance in installments via ZeniPay at 0% interest.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from Sea-Tac`, description: `Hawaii in 5 hours, Tokyo in 10. Asia is closer from ${CITY} than any East Coast city.` },
        { icon: "anchor", title: "Alaska Cruises May–Sept", description: "Princess, Holland America, Norwegian, Royal Caribbean — all sail from Sea-Tac." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Asia Specialists", description: `${CITY} is North America's fastest jumping-off point to Asia.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `7-night Alaska cruises from Sea-Tac start around $899 per person. All-inclusive Cabo packages from $999 per person for 4 nights.` },
        { question: "Are Alaska cruises booked through Zeniva?", answer: "Yes. We book every major cruise line sailing from Sea-Tac, including pre-cruise hotels and transfers from the airport to the cruise terminal." },
        { question: "What's the fastest US-to-Asia route?", answer: `${CITY} to Tokyo is one of the shortest US-Asia direct flights — about 10 hours.` },
        { question: "Are Hawaii flights direct from SEA?", answer: "Yes — Hawaiian, Delta, Alaska, United all fly direct from Sea-Tac to all major Hawaiian islands." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Cruise Planning", href: "/services/cruises" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Bora Bora", href: "/destinations/bora-bora" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
      ]}
      jsonLd={{
        "@context": "https://schema.org", "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (Sea-Tac).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "WA" } },
      }}
    />
  );
}
