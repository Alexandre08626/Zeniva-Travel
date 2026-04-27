import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Montreal";
const AIRPORT = "YUL";
const URL_PATH = "/packages/from-montreal";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Europe, Mexico | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Caribbean, Cuba, Mexico, Europe. Direct flights from Trudeau, hotel and transfers included. CAD pricing, French support.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Cancun`, `${CITY} to Cuba`, `${CITY} to Punta Cana`,
    `${CITY} to Paris`, `agence voyage Montréal`, `forfait vacances ${CITY}`,
    `Montréal travel agent`, `Air Transat Montréal`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from Trudeau. Caribbean, Cuba, Mexico, Europe. Bilingual FR/EN.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1519178614-68673b201f36?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: {
    canonical: `https://www.zenivatravel.com${URL_PATH}`,
    languages: { "fr-CA": `https://www.zenivatravel.com/fr/packages/from-montreal` },
  },
};

export default function FromMontrealPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Trudeau (YUL) is Quebec's main international airport and Air Transat's hub. Direct flights to the Caribbean, Cuba, Mexico, and most of Europe. Lina parle français — service bilingue.`}
      heroImage="https://images.unsplash.com/photo-1519178614-68673b201f36?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-red-900/60"
      badge={`✈️ Direct from YUL`}
      sections={[
        {
          heading: `Why ${CITY} Is Quebec's Travel Hub`,
          content: `<p>Montreal-Trudeau (${AIRPORT}) is Air Transat's main hub and a major Air Canada hub. Direct flights from Trudeau reach the Caribbean, Cuba, Mexico's beach destinations, every major European capital (especially France), and a growing list of African destinations. ${CITY}'s long winters drive heavy traffic to Caribbean and Mexican all-inclusive resorts December through April.</p>
<p>Zeniva's ${CITY} packages quote in CAD, support French, and use Quebec-friendly partners — Air Transat, Sunwing, Air Canada Vacations, WestJet Vacations. Lina answers in French automatically when you write in French.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Cuba (Varadero, Cayo Coco, Holguín):</strong> Direct from YUL on Air Transat and Sunwing. Cuba is Montreal's #1 winter escape — high quality resort scene at Quebec-friendly prices. From CAD $899 per person for 5 nights.</p>
<p><strong>Cancún & Riviera Maya:</strong> 4-hour direct from YUL. From CAD $1,099 per person for 4 nights.</p>
<p><strong>Punta Cana, Dominican Republic:</strong> Direct from YUL. From CAD $1,199 per person for 5 nights.</p>
<p><strong>Jamaica, Bahamas, Aruba:</strong> Direct or one-stop. From CAD $1,299 per person for 5 nights.</p>
<p><strong>Paris, Nice, Lyon, Marseille:</strong> Direct flights from YUL on Air Canada and Air Transat — particularly strong network to France. Best in spring (April–May) and fall (September–October).</p>
<p><strong>Other Europe (London, Rome, Madrid, Athens, Reykjavík):</strong> Direct flights from YUL to most major European capitals.</p>`,
        },
        {
          heading: "Air Transat, Sunwing, Air Canada — Quel Choisir",
          content: `<p>Pour le Sud (Cuba, Mexique, République Dominicaine), Air Transat et Sunwing dominent — meilleurs prix pour les forfaits tout-inclus. Pour l'Europe et l'Asie, Air Canada et ses partenaires gagnent. Pour la France en particulier, Air Transat est souvent moins cher qu'Air Canada. Lina compare tous les transporteurs et propose le meilleur prix total en CAD.</p>`,
        },
        {
          heading: "Comment réserver",
          content: `<p>Discute avec Lina ou appelle 24/7 au /call. Chaque forfait personnalisable. ZeniPay accepte les paiements en plusieurs versements en CAD à 0% d'intérêt. Lina parle français — écris en français et elle répondra en français automatiquement.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from YUL`, description: `Air Transat hub — direct to Cuba, Mexique, Caraïbes, France.` },
        { icon: "gift", title: "CAD Pricing", description: "Tous les forfaits en dollars canadiens, sans frais de change." },
        { icon: "phone", title: "Lina AI 24/7 — Bilingue", description: "Chat ou voix — service en français OU anglais. Lina détecte la langue automatiquement." },
        { icon: "map", title: "Cuba Specialists", description: "Cuba est la destination #1 des Montréalais l'hiver. Air Transat + Sunwing direct." },
        { icon: "users", title: "Air Transat + Sunwing + Air Canada", description: "On compare tous les transporteurs québécois et canadiens." },
        { icon: "shield", title: "Support 24/7 en voyage", description: "Un humain joignable depuis n'importe où si quelque chose va mal pendant ton voyage." },
      ]}
      faqs={[
        { question: `Quel est le voyage le moins cher de ${CITY}?`, answer: `Cuba à partir de CAD $899 par personne pour 5 nuits incluant les vols depuis YUL. Cancún à partir de CAD $1,099 par personne pour 4 nuits.` },
        { question: "Air Transat ou Air Canada — lequel choisir?", answer: "Air Transat gagne souvent pour le Sud (Cuba, Mexique, Dominicaine) et la France. Air Canada gagne pour l'Asie et les voyages en classe affaires. Lina compare." },
        { question: "Puis-je payer en CAD?", answer: "Oui — tous les forfaits sont cotés et facturés en CAD via ZeniPay. Aucuns frais de conversion." },
        { question: "Lina parle-t-elle français?", answer: "Oui. Lina répond en français automatiquement quand tu écris en français. Tout le service client est bilingue FR/EN." },
        { question: "Offrez-vous des plans de paiement?", answer: "Oui — 25% de dépôt, le solde en versements via ZeniPay à 0% d'intérêt, en CAD." },
      ]}
      ctaText={`Voir les forfaits de ${CITY}`}
      ctaPrompt={`Je veux un forfait vacances de ${CITY}`}
      internalLinks={[
        { label: "Tous les forfaits", href: "/packages" },
        { label: "Tout-inclus", href: "/packages/all-inclusive" },
        { label: "Forfaits Cancún", href: "/packages/cancun" },
        { label: "Destinations Caraïbes", href: "/destinations/caribbean" },
        { label: "Destinations Mexique", href: "/destinations/mexico" },
      ]}
      jsonLd={{
        "@context": "https://schema.org", "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (Trudeau).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "QC" } },
      }}
    />
  );
}
