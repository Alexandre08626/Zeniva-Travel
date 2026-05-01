import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const URL_PATH = "/voyage-tout-inclus";

export const metadata: Metadata = {
  title: "Voyage tout inclus 2026 — Cuba, Mexique, République Dominicaine | Zeniva",
  description:
    "Voyage tout inclus depuis le Québec : Cuba, Cancún, Punta Cana, Varadero, Riviera Maya. Vols + hôtel + transferts inclus. Prix en CAD. Lina AI 24/7 en français. Agence enregistrée OPC.",
  keywords: [
    "voyage tout inclus",
    "voyage tout inclus pas cher",
    "tout inclus Cuba",
    "tout inclus Cancún",
    "tout inclus Punta Cana",
    "tout inclus Varadero",
    "forfait tout inclus Québec",
    "agence voyage tout inclus",
    "voyage Sud tout inclus",
    "vacances tout inclus 2026",
    "agence voyage Québec",
    "Zeniva tout inclus",
  ],
  openGraph: {
    title: "Voyage tout inclus 2026 | Zeniva",
    description:
      "Forfaits tout inclus depuis le Québec et le Canada — Cuba, Mexique, Caraïbes. Service francophone 24/7 par Lina AI.",
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    locale: "fr_CA",
    images: [
      {
        url: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "Voyage tout inclus Cancún",
      },
    ],
  },
  alternates: {
    canonical: `https://www.zenivatravel.com${URL_PATH}`,
    languages: { "fr-CA": `https://www.zenivatravel.com${URL_PATH}`, "en-US": "https://www.zenivatravel.com/packages/all-inclusive" },
  },
};

export default function VoyageToutInclusPage() {
  return (
    <SeoPage
      h1="Voyage tout inclus — Cuba, Mexique, Punta Cana"
      subtitle="Forfaits tout inclus pour les Québécois. Vols directs depuis Montréal (YUL) et Québec (YQB), hôtels 4★ et 5★, transferts inclus, prix en CAD. Lina AI te trouve le meilleur tout inclus en quelques secondes — service en français 24/7."
      heroImage="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-teal-900/60 to-blue-900/40"
      badge="✈️ Service francophone · CAD"
      sections={[
        {
          heading: "Les meilleures destinations tout inclus depuis le Québec",
          content: `<p><strong>Cuba (Varadero, Cayo Coco, Holguín, Cayo Santa María) :</strong> destination #1 des Québécois en hiver. À partir de CAD 899 $ par personne pour 7 nuits, vols Air Transat ou Sunwing inclus. Iberostar, Meliá, Paradisus, Royalton — Lina connaît tous les resorts.</p>
<p><strong>Cancún & Riviera Maya (Mexique) :</strong> tout inclus 5★ à partir de CAD 1 099 $ par personne pour 5 nuits. Hard Rock, Iberostar Grand, Excellence, Palace Resorts, Secrets, Le Blanc.</p>
<p><strong>Punta Cana (République Dominicaine) :</strong> Hard Rock, Bahia Principe, Sanctuary Cap Cana. À partir de CAD 1 199 $ par personne, vols directs YUL et YQB.</p>
<p><strong>Jamaïque (Montego Bay, Negril, Ocho Rios) :</strong> Sandals, Couples Resorts, Iberostar. Idéal pour couples et lunes de miel.</p>
<p><strong>Aruba, Bahamas, Turks & Caicos :</strong> tout inclus haut de gamme — Beaches Turks & Caicos, Bucuti & Tara Beach Resort, Sandals Royal Bahamian.</p>`,
        },
        {
          heading: "Pourquoi réserver son tout inclus avec Zeniva",
          content: `<p><strong>1. Comparaison instantanée :</strong> Lina AI compare en temps réel Air Transat, Sunwing, Air Canada Vacations, WestJet Vacations — pour tous les hôtels tout inclus de chaque destination.</p>
<p><strong>2. Aucuns frais cachés :</strong> aucuns frais de réservation (0 $), prix en CAD tout compris (taxes, transferts, bagages).</p>
<p><strong>3. ZeniPay :</strong> paiement en plusieurs versements à 0% d'intérêt — 25% de dépôt et le solde réparti jusqu'au départ.</p>
<p><strong>4. Lina parle français 24/7 :</strong> tu écris ou tu parles en français — Lina détecte automatiquement et répond en français. Si tu veux un humain, écris « parler à un humain » et un vrai agent voyage te répond.</p>
<p><strong>5. Support en voyage :</strong> un humain joignable de partout si l'avion est annulé, la chambre est mauvaise, ou n'importe quel pépin.</p>`,
        },
        {
          heading: "Comment fonctionne la réservation tout inclus avec Lina",
          content: `<p>Étape 1 : Tu chattes avec Lina ou tu l'appelles 24/7. Tu lui dis « Je veux un tout inclus à Cancún en mars pour 2 adultes, budget 3000 $ ».</p>
<p>Étape 2 : Lina cherche en direct dans toutes les bases (Air Transat, Sunwing, Hotelbeds, LiteAPI) et te propose les 3 meilleurs forfaits en quelques secondes.</p>
<p>Étape 3 : Tu choisis. Paiement carte ou ZeniPay en versements. Confirmation immédiate par courriel + tableau de bord <a href="/documents">/documents</a> avec tous les billets et bons d'hôtel.</p>`,
        },
        {
          heading: "Périodes recommandées",
          content: `<p><strong>Décembre à avril :</strong> haute saison Sud — neige au Québec, chaleur garantie. Réserver 2-3 mois à l'avance pour les meilleurs prix.</p>
<p><strong>Mai à juin :</strong> shoulder season, prix bas, météo encore excellente.</p>
<p><strong>Juillet-août :</strong> idéal en famille (vacances scolaires), prix plus élevés.</p>
<p><strong>Septembre-octobre :</strong> saison des ouragans aux Caraïbes — prix bas mais météo variable. On recommande des destinations hors-zone (Aruba, Curaçao).</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: "Vols directs Québec", description: "YUL et YQB — Cuba, Cancún, Punta Cana en direct." },
        { icon: "gift", title: "Prix tout en CAD", description: "Aucuns frais de change, aucuns frais cachés." },
        { icon: "phone", title: "Lina AI en français 24/7", description: "Chat ou voix — disponible jour et nuit." },
        { icon: "shield", title: "Support en voyage", description: "Vrai humain joignable de partout." },
        { icon: "map", title: "Spécialistes Cuba", description: "On connaît tous les resorts cubains." },
        { icon: "users", title: "ZeniPay 0%", description: "Paiement en plusieurs versements à 0% d'intérêt." },
      ]}
      faqs={[
        { question: "Quel est le tout inclus le moins cher depuis le Québec?", answer: "Cuba (Varadero ou Cayo Coco) à partir de CAD 899 $ par personne pour 7 nuits incluant vols depuis YUL ou YQB." },
        { question: "Air Transat, Sunwing ou Air Canada Vacations?", answer: "Lina compare les trois en direct. Sunwing et Air Transat dominent le tout-inclus, Air Canada Vacations a souvent les meilleurs prix vers les Caraïbes anglophones." },
        { question: "Puis-je payer en plusieurs versements?", answer: "Oui — 25% de dépôt et le solde via ZeniPay à 0% d'intérêt jusqu'au départ." },
        { question: "Les transferts sont-ils inclus?", answer: "Oui, tous nos forfaits tout inclus comprennent les transferts aéroport-hôtel-aéroport." },
        { question: "Lina AI parle-t-elle français?", answer: "Oui — détection automatique. Tu peux aussi écrire « parler à un humain » à tout moment pour parler à un vrai agent voyage québécois." },
        { question: "Que se passe-t-il si mon vol est annulé?", answer: "Notre équipe support est joignable 24/7. On te trouve un autre vol et on s'occupe de tout en quelques minutes." },
        { question: "Zeniva est-elle une vraie agence de voyage?", answer: "Oui — Zeniva LLC est enregistrée au Delaware (USA) et opère au Canada en partenariat avec des fournisseurs autorisés. Tous les paiements sont protégés." },
      ]}
      ctaText="Trouver mon tout inclus"
      ctaPrompt="Je veux un voyage tout inclus dans le Sud"
      internalLinks={[
        { label: "Forfaits depuis Québec", href: "/packages/from-quebec-city" },
        { label: "Forfaits depuis Montréal", href: "/packages/from-montreal" },
        { label: "Forfaits Cancún", href: "/destinations/cancun" },
        { label: "Forfaits Punta Cana", href: "/destinations/punta-cana" },
        { label: "Tous les forfaits", href: "/packages" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        name: "Zeniva Travel — Voyages tout inclus",
        description: "Forfaits tout inclus pour les Québécois — Cuba, Mexique, Caraïbes, République Dominicaine.",
        url: `https://www.zenivatravel.com${URL_PATH}`,
        areaServed: [
          { "@type": "Country", name: "Canada" },
          { "@type": "AdministrativeArea", name: "Québec" },
        ],
        priceRange: "$$-$$$$",
        currenciesAccepted: "CAD, USD",
        inLanguage: "fr-CA",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
      }}
    />
  );
}
