import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Halifax";
const AIRPORT = "YHZ";
const URL_PATH = "/packages/from-halifax";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Cuba, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Cuba, Mexico, Europe. Direct flights from Stanfield International, hotel and transfers. CAD pricing.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cuba`, `${CITY} to Caribbean`, `Maritimes vacation`, `cheap vacations from ${CITY}`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from YHZ. Caribbean, Cuba, Europe.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1620742820748-87c3076b6b88?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromHalifaxPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Halifax Stanfield (${AIRPORT}) is the Maritimes' main international gateway. Direct flights to Caribbean, Cuba, and growing European network. CAD pricing.`}
      heroImage="https://images.unsplash.com/photo-1620742820748-87c3076b6b88?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-emerald-900/60"
      badge={`✈️ Direct from YHZ`}
      sections={[
        { heading: `Why ${CITY} Travelers Have It Easier Than They Think`, content: `<p>Halifax Stanfield (${AIRPORT}) serves the Maritimes (Nova Scotia, New Brunswick, PEI, Newfoundland). Direct flights from YHZ reach Cuba, Caribbean (Punta Cana, Cancún), and a few European capitals (London, Reykjavík). Air Canada, WestJet, Sunwing, Air Transat all serve the airport.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cuba (Varadero, Cayo Coco):</strong> Direct from YHZ. From CAD $999 per person for 5 nights.</p><p><strong>Cancún & Riviera Maya:</strong> Direct from YHZ. From CAD $1,099 per person for 4 nights.</p><p><strong>Punta Cana:</strong> Direct from YHZ. From CAD $1,199 per person for 5 nights.</p><p><strong>London:</strong> Direct from YHZ on Air Canada and WestJet. Halifax is North America's closest port to Europe.</p><p><strong>Reykjavík (Iceland):</strong> Direct from YHZ on Icelandair seasonally.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. ZeniPay accepte les paiements CAD à 0% d'intérêt.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from YHZ`, description: `Caribbean, Cuba, Europe direct from Halifax.` },
        { icon: "gift", title: "CAD Pricing", description: "All packages in Canadian dollars." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — bilingual EN/FR." },
        { icon: "map", title: "Closest to Europe", description: "Halifax is North America's closest port to Europe — direct to London." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Cuba packages from CAD $999 per person for 5 nights including flights from YHZ.` },
        { question: "Can I fly direct to London?", answer: "Yes — Air Canada and WestJet fly direct from YHZ to London Heathrow." },
        { question: "Can I pay in CAD?", answer: "Yes — all packages in CAD via ZeniPay. No FX conversion fees." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Air Canada or charter?", answer: "Lina compares all carriers (Air Canada, WestJet, Sunwing, Air Transat) for best CAD price." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Europe Destinations", href: "/destinations/europe" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (YHZ).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "NS" } } }}
    />
  );
}
