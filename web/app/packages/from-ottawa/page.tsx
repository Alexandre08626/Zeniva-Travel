import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Ottawa";
const AIRPORT = "YOW";
const URL_PATH = "/packages/from-ottawa";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Cuba | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Cuba, Mexico, Bahamas. Direct flights from MacDonald-Cartier, hotel and transfers. CAD pricing.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Cuba`, `${CITY} to Punta Cana`, `forfait vacances ${CITY}`, `${CITY} travel agent`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from YOW. Cuba, Caribbean, Mexico.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromOttawaPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Ottawa MacDonald-Cartier (${AIRPORT}) is the capital's gateway. Direct to Cuba, Caribbean, Mexico via Air Canada, Air Transat, Sunwing, WestJet. CAD pricing.`}
      heroImage="https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-red-900/70 to-blue-900/60"
      badge={`✈️ Direct from YOW`}
      sections={[
        { heading: `Why ${CITY} Travelers Have Solid Direct Coverage`, content: `<p>Ottawa MacDonald-Cartier (${AIRPORT}) serves Canada's capital region. Direct flights from YOW reach Cuba (Varadero, Cayo Coco), Cancún, Punta Cana, Aruba, plus most Caribbean destinations. Air Transat and Sunwing dominate the Sud market with charter packages; Air Canada handles scheduled flights.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cuba (Varadero, Cayo Coco):</strong> Direct from YOW on Sunwing, Air Transat. Cuba is Ottawa's #1 winter escape. From CAD $899 per person for 5 nights.</p><p><strong>Cancún & Riviera Maya:</strong> Direct from YOW. From CAD $1,099 per person for 4 nights.</p><p><strong>Punta Cana, Caribbean:</strong> Direct from YOW. From CAD $1,199 per person for 5 nights.</p><p><strong>Bahamas:</strong> Direct or one-stop from YOW. From CAD $1,099 per person.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. ZeniPay accepte les paiements CAD à 0% d'intérêt. Lina parle français.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from YOW`, description: `Cuba, Caribbean, Mexique direct depuis Ottawa.` },
        { icon: "gift", title: "CAD Pricing", description: "All packages quoted in Canadian dollars with no FX surprises." },
        { icon: "phone", title: "Lina AI 24/7 — Bilingue", description: "Chat ou voix — service en français OU anglais." },
        { icon: "map", title: "Cuba Specialists", description: "Cuba est la destination #1 des Ottavians l'hiver." },
        { icon: "shield", title: "Support 24/7 en voyage", description: "Un humain joignable depuis n'importe où." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Cuba à partir de CAD $899 par personne pour 5 nuits incluant les vols depuis YOW.` },
        { question: "Can I pay in CAD?", answer: "Oui — tous les forfaits en CAD via ZeniPay. Aucuns frais de conversion." },
        { question: "Lina parle-t-elle français?", answer: "Oui. Lina répond en français automatiquement. Service bilingue FR/EN." },
        { question: "Do you offer payment plans?", answer: "Oui — 25% de dépôt, le solde via ZeniPay à 0% d'intérêt en CAD." },
        { question: "Air Transat or Air Canada?", answer: "Lina compare tous les transporteurs (Air Transat, Sunwing, WestJet, Air Canada) et propose le meilleur prix CAD." },
      ]}
      ctaText={`Voir les forfaits de ${CITY}`}
      ctaPrompt={`Je veux un forfait vacances de ${CITY}`}
      internalLinks={[
        { label: "Tous les forfaits", href: "/packages" },
        { label: "Tout-inclus", href: "/packages/all-inclusive" },
        { label: "Forfaits Cancún", href: "/packages/cancun" },
        { label: "Destinations Caraïbes", href: "/destinations/caribbean" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (YOW).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "ON" } } }}
    />
  );
}
