import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Edmonton";
const AIRPORT = "YEG";
const URL_PATH = "/packages/from-edmonton";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Mexico, Caribbean, Hawaii | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Mexico, Caribbean, Cuba, Hawaii. WestJet hub with direct flights. CAD pricing.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Cuba`, `${CITY} to Hawaii`, `cheap vacations from ${CITY}`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from YEG.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1601928478875-7b6db1c80987?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromEdmontonPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Edmonton International (${AIRPORT}) is a major WestJet hub. Direct flights to Mexico, Caribbean, Cuba, Hawaii. Alberta winters drive heavy escape volume.`}
      heroImage="https://images.unsplash.com/photo-1601928478875-7b6db1c80987?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/70 to-blue-900/60"
      badge={`✈️ Direct from YEG`}
      sections={[
        { heading: `Why ${CITY} Travelers Get Direct Service`, content: `<p>Edmonton International (${AIRPORT}) is one of WestJet's main hubs. Direct flights from YEG reach Mexico's beach destinations, Caribbean, Cuba, and Hawaii. Alberta's brutal winters drive massive volume to all-inclusive resorts December through April.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 5-hour direct from YEG. From CAD $1,099 per person for 4 nights.</p><p><strong>Cabo & Puerto Vallarta:</strong> Direct from YEG. From CAD $1,199 per person.</p><p><strong>Cuba (Varadero, Cayo Coco):</strong> Direct from YEG. From CAD $999 per person for 5 nights.</p><p><strong>Hawaii (Maui, Honolulu):</strong> Direct from YEG. From CAD $1,799 per person for 5 nights.</p><p><strong>Punta Cana:</strong> Direct from YEG. From CAD $1,299 per person for 5 nights.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. ZeniPay accepte les paiements CAD à 0% d'intérêt.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from YEG`, description: `WestJet hub — direct to Mexico, Caraïbes, Cuba, Hawaii.` },
        { icon: "gift", title: "CAD Pricing", description: "All packages in Canadian dollars." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — bilingual EN/FR." },
        { icon: "map", title: "Hawaii Direct", description: "WestJet flies direct from YEG to Honolulu and Maui." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Cuba packages from CAD $999 per person for 5 nights including flights from YEG.` },
        { question: "Can I pay in CAD?", answer: "Yes — all packages in CAD via ZeniPay. No FX conversion fees." },
        { question: "Are Hawaii flights direct?", answer: "Yes — WestJet flies direct from YEG to Honolulu and Maui." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "WestJet or Air Canada?", answer: "Lina compares all Canadian carriers (WestJet, Air Canada, Sunwing, Air Transat)." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (YEG).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "AB" } } }}
    />
  );
}
