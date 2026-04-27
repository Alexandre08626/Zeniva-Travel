import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Orlando";
const AIRPORT = "MCO";
const URL_PATH = "/packages/from-orlando";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Bahamas, Europe. Direct flights from Orlando International, hotel and transfers included.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Caribbean`, `${CITY} to Bahamas`, `cheap vacations from ${CITY}`, `Port Canaveral cruise`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from MCO. Caribbean, Mexico, Bahamas, Europe.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromOrlandoPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Orlando International (${AIRPORT}) is Florida's busiest airport — direct flights to most Caribbean and Mexican destinations. Port Canaveral cruises 1 hour away.`}
      heroImage="https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-yellow-900/70 to-emerald-900/60"
      badge={`✈️ Direct from MCO`}
      sections={[
        { heading: `Why ${CITY} Travelers Have Massive Choice`, content: `<p>Orlando International (${AIRPORT}) is one of the busiest airports in the US thanks to Disney World traffic. Direct flights to most Caribbean islands, Cancún, Cozumel, the Bahamas, plus growing service to Latin America and Europe. Port Canaveral, Disney's cruise homeport, is 1 hour from MCO — one of the world's busiest cruise ports.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 2-hour direct from MCO. From $899 per person for 4 nights.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from MCO. From $1,099 per person for 5 nights.</p><p><strong>Bahamas:</strong> 1-hour direct. Atlantis, Baha Mar. From $999 per person.</p><p><strong>Europe (London, Frankfurt):</strong> Direct from MCO on Aer Lingus and partners.</p><p><strong>Cruises from Port Canaveral:</strong> Disney Cruise Line, Royal Caribbean, Carnival, Norwegian — all sail from Port Canaveral year-round.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from MCO`, description: `Florida's busiest airport — direct to Caribbean, Mexico, Bahamas.` },
        { icon: "anchor", title: "Port Canaveral 1h Away", description: "Disney, Royal Caribbean, Carnival, Norwegian — sail from Port Canaveral." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Bahamas long-weekends from $999 per person. All-inclusive Cancún packages from $899 per person for 4 nights.` },
        { question: "Can I book a Disney Cruise from Orlando?", answer: "Yes — Disney Cruise Line homeports at Port Canaveral, 1 hour from MCO. We book + handle pre-cruise hotel + transfers." },
        { question: "Are Caribbean flights direct?", answer: "Most major Caribbean destinations are direct from MCO including Punta Cana, Aruba, Cancún, Nassau." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I combine Disney + cruise?", answer: "Yes — popular combination. We coordinate the parks days + cruise on a single itinerary." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Cruise Planning", href: "/services/cruises" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (MCO).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "FL" } } }}
    />
  );
}
