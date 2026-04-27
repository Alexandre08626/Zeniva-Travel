import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Québec City";
const AIRPORT = "YQB";
const URL_PATH = "/packages/from-quebec-city";

export const metadata: Metadata = {
  title: `Forfaits vacances de ${CITY} (${AIRPORT}) — Caraïbes, Mexique, Cuba | Zeniva`,
  description: `Forfaits tout-inclus depuis ${CITY} (${AIRPORT}). Cuba, Caraïbes, Mexique, République Dominicaine. Vols + hôtel + transferts. Prix en CAD, service français.`,
  keywords: [`forfait vacances ${CITY}`, `vols ${AIRPORT}`, `tout-inclus ${CITY}`, `${CITY} Cuba`, `${CITY} Cancún`, `${CITY} Punta Cana`, `agence voyage ${CITY}`, `Québec voyage`],
  openGraph: { title: `Forfaits vacances de ${CITY} | Zeniva`, description: `Forfaits curated depuis YQB. Cuba, Caraïbes, Mexique. Service francophone.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Forfaits ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}`, languages: { "fr-CA": `https://www.zenivatravel.com${URL_PATH}` } },
};

export default function FromQuebecCityPage() {
  return (
    <SeoPage
      h1={`Forfaits vacances de ${CITY}`}
      subtitle={`L'aéroport Jean-Lesage (${AIRPORT}) dessert la capitale du Québec. Vols directs vers Cuba, Cancún, Punta Cana via Air Transat et Sunwing. Lina parle français.`}
      heroImage="https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-indigo-900/60"
      badge={`✈️ Direct de YQB`}
      sections={[
        { heading: `Pourquoi YQB est parfait pour les Québécois`, content: `<p>L'aéroport international Jean-Lesage (${AIRPORT}) dessert ${CITY} et toute la région de la Capitale-Nationale. Vols directs vers Cuba (Varadero, Cayo Coco), Cancún, Punta Cana, Holguín. Air Transat et Sunwing offrent les meilleurs forfaits Sud. Pour l'Europe et l'Asie, on passe par Montréal (YUL).</p>` },
        { heading: `Top destinations depuis ${CITY}`, content: `<p><strong>Cuba (Varadero, Cayo Coco, Holguín) :</strong> Direct de YQB sur Sunwing, Air Transat. La destination #1 des Québécois en hiver. À partir de CAD 899 $ par personne pour 5 nuits.</p><p><strong>Cancún & Riviera Maya :</strong> Direct de YQB. À partir de CAD 1 099 $ par personne pour 4 nuits.</p><p><strong>Punta Cana :</strong> Direct de YQB. À partir de CAD 1 199 $ par personne pour 5 nuits.</p><p><strong>Bahamas, Aruba, Caraïbes :</strong> Connexion via YUL. À partir de CAD 1 299 $ par personne.</p>` },
        { heading: "Comment réserver", content: `<p>Discute avec Lina ou appelle 24/7 au /call. ZeniPay accepte les paiements en plusieurs versements CAD à 0% d'intérêt. Lina répond en français automatiquement.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct de YQB`, description: `Cuba, Cancún, Punta Cana — direct depuis Québec.` },
        { icon: "gift", title: "Prix en CAD", description: "Tous les forfaits en dollars canadiens, aucuns frais de change." },
        { icon: "phone", title: "Lina parle français", description: "Service en français 24/7 — chat ou voix." },
        { icon: "map", title: "Spécialistes Cuba", description: "Cuba est la destination préférée des Québécois — on connaît tous les resorts." },
        { icon: "shield", title: "Support en voyage", description: "Un humain joignable de partout si quelque chose va mal." },
      ]}
      faqs={[
        { question: `Quel est le voyage le moins cher de ${CITY}?`, answer: `Cuba à partir de CAD 899 $ par personne pour 5 nuits incluant les vols depuis YQB.` },
        { question: "Air Transat ou Sunwing — lequel choisir?", answer: "Les deux dominent le marché Sud depuis YQB. Lina compare les deux et propose le meilleur prix CAD." },
        { question: "Puis-je payer en plusieurs versements?", answer: "Oui — 25% de dépôt, le solde via ZeniPay à 0% d'intérêt." },
        { question: "Lina parle-t-elle français?", answer: "Oui — Lina détecte ta langue automatiquement et répond en français." },
        { question: "Pour l'Europe, comment on fait?", answer: "Connexion par Montréal (YUL) qui a des vols directs vers Paris, Londres et autres capitales européennes." },
      ]}
      ctaText={`Voir les forfaits de ${CITY}`}
      ctaPrompt={`Je veux un forfait vacances de ${CITY}`}
      internalLinks={[
        { label: "Tous les forfaits", href: "/packages" },
        { label: "Tout-inclus", href: "/packages/all-inclusive" },
        { label: "Forfaits Cancún", href: "/packages/cancun" },
        { label: "Forfaits depuis Montréal", href: "/packages/from-montreal" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Forfaits vacances de ${CITY}`, description: `Forfaits vacances depuis ${CITY} (YQB).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "QC" } } }}
    />
  );
}
