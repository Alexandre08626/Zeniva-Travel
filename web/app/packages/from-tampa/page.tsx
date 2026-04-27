import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Tampa";
const AIRPORT = "TPA";
const URL_PATH = "/packages/from-tampa";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Bahamas, Europe. Direct flights from Tampa International, hotel and transfers included.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Punta Cana`, `${CITY} to Caribbean`, `cheap vacations from ${CITY}`, `cruise from ${CITY}`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from TPA. Caribbean, Mexico, Bahamas, Europe.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1582654454409-778f6619ddc6?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromTampaPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Tampa International (${AIRPORT}) is one of Florida's busiest airports — direct to most Caribbean and Mexican destinations. Also a major cruise homeport.`}
      heroImage="https://images.unsplash.com/photo-1582654454409-778f6619ddc6?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-cyan-900/70 to-emerald-900/60"
      badge={`✈️ Direct from TPA`}
      sections={[
        { heading: `Why ${CITY} Punches Above Its Weight`, content: `<p>${CITY} sits on the Gulf Coast and benefits from Florida's geography — the Caribbean and Mexico are short hops. TPA has direct flights to most major Caribbean islands, Cancún, Cozumel, the Bahamas, and Latin America. Tampa is also a major cruise homeport for Royal Caribbean, Norwegian, and Carnival.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 2.5-hour direct from TPA. From $899 per person for 4 nights.</p><p><strong>Punta Cana, Aruba, Caribbean:</strong> Direct from TPA. From $1,099 per person for 5 nights.</p><p><strong>Bahamas:</strong> 1.5-hour direct. Atlantis, Baha Mar. From $999 per person.</p><p><strong>Cabo San Lucas:</strong> Direct from TPA. From $1,099 per person.</p><p><strong>Cuba (Havana):</strong> Direct from TPA on Southwest and American. From $999 per person.</p><p><strong>Cruises from TPA:</strong> Royal Caribbean, Norwegian, Carnival sail from Port Tampa Bay year-round to Western Caribbean and Mexico.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from TPA`, description: `Caribbean, Mexico, Bahamas, Cuba — all direct from Tampa.` },
        { icon: "anchor", title: "Cruise Homeport", description: "Royal Caribbean, Norwegian, Carnival sail from Port Tampa Bay." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Bahamas long-weekends from $999 per person. All-inclusive Cancún packages from $899 per person for 4 nights.` },
        { question: "Can I book a cruise from Tampa?", answer: "Yes — Zeniva books every major cruise line sailing from Port Tampa Bay including pre-cruise hotels and transfers from TPA." },
        { question: "Are Cuba flights direct?", answer: "Yes — Southwest and American fly direct from TPA to Havana." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Cruise Planning", href: "/services/cruises" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (TPA).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "FL" } } }}
    />
  );
}
