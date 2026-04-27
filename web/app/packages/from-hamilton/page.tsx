import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Hamilton";
const AIRPORT = "YHM";
const URL_PATH = "/packages/from-hamilton";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Cuba | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Mexico, Cuba. Cheaper than Pearson — Sunwing, WestJet hub for southern Ontario travelers. CAD pricing.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Cuba`, `John C Munro Hamilton`, `cheap alternative to Pearson`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from YHM. Caribbean, Mexico, Cuba.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1597737155571-f0d3e1eccd76?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromHamiltonPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`John C Munro Hamilton (${AIRPORT}) is the cheaper, faster alternative to Pearson for southern Ontario travelers. Direct to Caribbean, Mexico, Cuba via Sunwing and WestJet.`}
      heroImage="https://images.unsplash.com/photo-1597737155571-f0d3e1eccd76?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/70 to-blue-900/60"
      badge={`✈️ Sunwing & WestJet`}
      sections={[
        { heading: `Why ${CITY} Beats Pearson for Southern Ontario`, content: `<p>John C Munro Hamilton International (${AIRPORT}) serves Hamilton, Burlington, Niagara region, and the western GTA. Free parking, faster security, less traffic — and Sunwing's Ontario hub. Direct flights to Caribbean, Mexico, Cuba at often cheaper fares than Pearson because of lower airport fees. WestJet also operates here.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> Direct from YHM via Sunwing. From CAD $999 per person for 4 nights.</p><p><strong>Cuba (Varadero, Cayo Coco):</strong> Direct from YHM. From CAD $899 per person for 5 nights.</p><p><strong>Punta Cana:</strong> Direct from YHM. From CAD $1,199 per person for 5 nights.</p><p><strong>Cabo San Lucas:</strong> Direct from YHM. From CAD $1,099 per person.</p><p><strong>Bahamas, Aruba:</strong> Direct or one-stop. From CAD $1,099 per person.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. ZeniPay accepte les paiements CAD à 0% d'intérêt.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Cheaper than YYZ`, description: `Lower airport fees + free parking = better fares than Pearson.` },
        { icon: "gift", title: "CAD Pricing", description: "All packages in Canadian dollars." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — bilingual EN/FR." },
        { icon: "map", title: "Sunwing Hub", description: "YHM is one of Sunwing's main Ontario hubs — best charter rates." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `Is Hamilton cheaper than Pearson?`, answer: `Often yes — lower airport fees mean cheaper fares on Sunwing/WestJet. Plus free parking, faster security.` },
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Cuba packages from CAD $899 per person for 5 nights including flights from YHM.` },
        { question: "Can I pay in CAD?", answer: "Yes — all packages in CAD via ZeniPay. No FX conversion fees." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Should I drive to YHM or YYZ?", answer: "From Niagara, Burlington, western GTA — YHM is closer + cheaper. From Toronto core — YYZ has more options." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "From Toronto (alt)", href: "/packages/from-toronto" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (YHM).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "ON" } } }}
    />
  );
}
