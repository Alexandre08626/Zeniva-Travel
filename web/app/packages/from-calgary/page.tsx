import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Calgary";
const AIRPORT = "YYC";
const URL_PATH = "/packages/from-calgary";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Mexico, Caribbean, Hawaii | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Mexico, Caribbean, Hawaii, Europe. Direct flights from YYC, hotel and transfers included. CAD pricing.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Cancun`, `${CITY} to Hawaii`, `${CITY} to Cuba`,
    `${CITY} to Caribbean`, `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`,
    `Calgary travel agent`, `WestJet vacation packages`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from YYC. Mexico, Caribbean, Hawaii, Europe.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1610737241336-371badac3e07?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromCalgaryPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Calgary International (${AIRPORT}) is WestJet's main hub. Direct flights to Mexico, the Caribbean, Hawaii, and Europe. Lina AI builds your package in seconds, in CAD.`}
      heroImage="https://images.unsplash.com/photo-1610737241336-371badac3e07?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-orange-900/70 to-blue-900/60"
      badge={`✈️ Direct from YYC`}
      sections={[
        {
          heading: `Why ${CITY} Travelers Have Solid Direct Options`,
          content: `<p>Calgary International (${AIRPORT}) is WestJet's main hub and Western Canada's third-busiest airport. Direct flights from YYC reach Mexico's beach destinations, the Caribbean, Cuba, Hawaii, and major European capitals (London, Frankfurt). Calgary's brutal winters drive heavy traffic to Mexican and Caribbean all-inclusive resorts December through April.</p>
<p>Zeniva's ${CITY} packages quote in CAD and use Canadian carriers — WestJet, Air Canada, Air Transat, Sunwing. Direct flights are the default for most popular destinations.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Cancún & Riviera Maya:</strong> 5-hour direct from YYC. WestJet Vacations and Sunwing offer competitive packages. From CAD $1,099 per person for 4 nights.</p>
<p><strong>Cabo & Puerto Vallarta:</strong> Direct from YYC. From CAD $1,199 per person for 4 nights.</p>
<p><strong>Cuba (Varadero, Cayo Coco):</strong> Direct from YYC on WestJet and Sunwing. From CAD $999 per person for 5 nights.</p>
<p><strong>Punta Cana & Caribbean:</strong> Direct or one-stop from YYC. From CAD $1,299 per person for 5 nights.</p>
<p><strong>Hawaii (Maui, Honolulu):</strong> Direct from YYC year-round. From CAD $1,799 per person for 5 nights.</p>
<p><strong>Europe (London, Frankfurt):</strong> Direct flights from YYC to London (Heathrow and Gatwick) and Frankfurt. Most other European destinations require a connection in Toronto or Montreal.</p>`,
        },
        {
          heading: "Direct Flights & Connections",
          content: `<p>For most popular vacation destinations from ${CITY}, direct flights are available. For European destinations not served directly, we route through Toronto (YYZ) or Montreal (YUL) on Air Canada. Lina compares routes and quotes whichever delivers the best total CAD price and travel time.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. ZeniPay accepts payment plans in CAD at 0% interest.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from YYC`, description: `WestJet's main hub — direct to Mexico, Caraïbes, Hawaii.` },
        { icon: "gift", title: "CAD Pricing", description: "All packages quoted in Canadian dollars with no FX surprises." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Cuba & Mexico Direct", description: "Canadian charter operators (WestJet, Sunwing) own the best deals on these routes." },
        { icon: "users", title: "WestJet + Sunwing + Air Canada", description: "We compare all Canadian carriers for the best total price." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cuba packages from CAD $999 per person for 5 nights. Cancún from CAD $1,099 per person for 4 nights.` },
        { question: "Are flights from YYC direct?", answer: "For most popular destinations, yes — WestJet's main hub. For European destinations not served directly, we route through Toronto or Montreal." },
        { question: "Can I pay in CAD?", answer: "Yes — all packages quoted and charged in CAD via ZeniPay. No FX conversion fees." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest, in CAD." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported. Fly into one city, out of another." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
      ]}
      jsonLd={{
        "@context": "https://schema.org", "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (YYC).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "AB" } },
      }}
    />
  );
}
