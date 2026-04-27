import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Winnipeg";
const AIRPORT = "YWG";
const URL_PATH = "/packages/from-winnipeg";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Mexico, Caribbean, Cuba | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Mexico, Caribbean, Cuba, Bahamas. Direct flights from Richardson International, hotel and transfers. CAD pricing.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Cuba`, `${CITY} to Punta Cana`, `cheap vacations from ${CITY}`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from YWG. Mexico, Caribbean, Cuba.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1611144489226-bbcf12c4ef0d?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromWinnipegPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Winnipeg Richardson International (${AIRPORT}) is Manitoba's gateway. Direct to Mexico, Caribbean, Cuba via WestJet, Sunwing, Air Transat, Air Canada. CAD pricing.`}
      heroImage="https://images.unsplash.com/photo-1611144489226-bbcf12c4ef0d?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-cyan-900/70 to-amber-900/60"
      badge={`✈️ Direct from YWG`}
      sections={[
        { heading: `Why ${CITY} Travelers Get Solid Direct Coverage`, content: `<p>Winnipeg Richardson International (${AIRPORT}) is Manitoba's main international airport. Direct flights from YWG reach Mexico (Cancún, Cabo, Puerto Vallarta), Caribbean (Punta Cana, Aruba), Cuba (Varadero, Cayo Coco), and Bahamas. Manitoba's brutal winters drive heavy escape volume.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 4.5-hour direct from YWG. From CAD $1,099 per person for 4 nights.</p><p><strong>Cabo & Puerto Vallarta:</strong> Direct from YWG. From CAD $1,199 per person.</p><p><strong>Cuba (Varadero, Cayo Coco):</strong> Direct from YWG. From CAD $999 per person for 5 nights.</p><p><strong>Punta Cana:</strong> Direct from YWG. From CAD $1,299 per person for 5 nights.</p><p><strong>Bahamas:</strong> Direct or one-stop from YWG. From CAD $1,099 per person.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. ZeniPay accepte les paiements CAD à 0% d'intérêt.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from YWG`, description: `Mexique, Caraïbes, Cuba — direct depuis Winnipeg.` },
        { icon: "gift", title: "CAD Pricing", description: "All packages in Canadian dollars." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — bilingual EN/FR." },
        { icon: "map", title: "Cuba Direct", description: "WestJet, Sunwing fly direct from YWG to Cuba." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Cuba packages from CAD $999 per person for 5 nights including flights from YWG.` },
        { question: "Are flights to Mexico direct?", answer: "Yes — Cancún, Cabo, Puerto Vallarta all direct from YWG." },
        { question: "Can I pay in CAD?", answer: "Yes — all packages in CAD via ZeniPay. No FX conversion fees." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "WestJet or Sunwing?", answer: "Lina compares all carriers (WestJet, Sunwing, Air Transat, Air Canada) for best CAD price." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (YWG).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "MB" } } }}
    />
  );
}
