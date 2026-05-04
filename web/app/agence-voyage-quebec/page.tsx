import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const URL_PATH = "/agence-voyage-quebec";

export const metadata: Metadata = {
  title: "Plateforme de voyage IA — Québec, Lina AI 24/7 en français | Zeniva",
  description:
    "Zeniva, plateforme technologique de voyage propulsée par l'IA pour le Québec. Forfaits tout inclus, croisières, voyages sur mesure offerts par des fournisseurs tiers. Service en français 24/7 par Lina AI. Vols directs depuis Montréal (YUL) et Québec (YQB).",
  keywords: [
    "plateforme voyage Québec",
    "plateforme de voyage IA Québec",
    "AI voyage Montréal",
    "AI voyage Lac Beauport",
    "meilleure plateforme voyage Québec",
    "concierge voyage Québec",
    "voyage Québec Cuba",
    "voyage Québec Mexique",
    "voyage Québec Caraïbes",
    "Zeniva Québec",
    "Lina AI Québec",
  ],
  openGraph: {
    title: "Plateforme de voyage IA Québec | Zeniva",
    description: "Forfaits tout inclus, croisières, vols et hôtels — service francophone 24/7 partout au Québec, fournis par des partenaires tiers via la plateforme Zeniva.",
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    locale: "fr_CA",
  },
  alternates: {
    canonical: `https://www.zenivatravel.com${URL_PATH}`,
    languages: { "fr-CA": `https://www.zenivatravel.com${URL_PATH}` },
  },
};

export default function AgenceVoyageQuebecPage() {
  return (
    <SeoPage
      h1="Plateforme de voyage IA Québec — service AI 24/7 en français"
      subtitle="Zeniva est la plateforme technologique de voyage IA conçue pour les Québécois. Lina AI parle français, prix en CAD, vols directs depuis Montréal et Québec, support humain 24/7. Aucuns frais de plateforme — les services de voyage sont fournis par des fournisseurs tiers identifiés au moment du paiement."
      heroImage="https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-indigo-900/60"
      badge="🇨🇦 Québec · CAD · français"
      sections={[
        {
          heading: "Pourquoi Zeniva est la plateforme idéale au Québec",
          content: `<p>Zeniva combine la rapidité de l'AI avec l'expertise des concierges de voyage québécois. Lina AI te trouve le meilleur tout-inclus, le meilleur vol ou la meilleure croisière en quelques secondes — puis un humain expert coordonne la réservation avec le fournisseur. Service entièrement en français, prix en dollars canadiens, support 24/7.</p>
<p><strong>Vols directs depuis :</strong> Montréal (YUL), Québec (YQB), Mont-Tremblant (YTM), Saguenay (YBG), Sept-Îles (YZV).</p>`,
        },
        {
          heading: "Ce que la plateforme Zeniva offre aux Québécois",
          content: `<p><strong>Tout-inclus Sud :</strong> Cuba, Cancún, Punta Cana, Varadero, Riviera Maya — vols directs depuis YUL et YQB. <a href="/voyage-tout-inclus">Voir les forfaits tout inclus</a>.</p>
<p><strong>Croisières :</strong> Royal Caribbean, MSC, Carnival, Norwegian — départs Floride avec vols depuis le Québec.</p>
<p><strong>Voyages Europe :</strong> Paris, Rome, Londres, Lisbonne, Athènes — vols Air Transat et Air Canada depuis YUL.</p>
<p><strong>Voyages sur mesure :</strong> noces, anniversaires, voyages d'affaires, voyages de groupe.</p>
<p><strong>Chalets et locations vacances Québec :</strong> Lac Beauport, Charlevoix, Mont-Tremblant via <a href="/zenistay">ZeniStay</a>.</p>`,
        },
        {
          heading: "Comment ça marche",
          content: `<p>Étape 1 : Discute avec Lina sur <a href="/chat">/chat</a> ou appelle-la au <a href="/call">/call</a> 24/7.</p>
<p>Étape 2 : Lina te propose 3 options en moins de 30 secondes — fournies par des partenaires fournisseurs identifiés.</p>
<p>Étape 3 : Tu choisis, tu payes (carte ou ZeniPay 0% intérêt en versements). La confirmation du fournisseur est accessible immédiatement sur ton tableau de bord <a href="/documents">/documents</a>.</p>`,
        },
        {
          heading: "Conformité et protection",
          content: `<p>Zeniva LLC est enregistrée au Delaware (USA). <strong>Zeniva Travel agit uniquement comme intermédiaire technologique</strong> et opère au Québec en facilitant les réservations chez des fournisseurs autorisés (Air Transat, Sunwing, Air Canada Vacations, Royal Caribbean, MSC, etc.). Tous les paiements sont sécurisés via Stripe et ZeniPay.</p>
<p>Les billets, confirmations et services de voyage sont fournis et émis directement par les fournisseurs tiers (compagnie aérienne, hôtel, croisiériste) identifiés au paiement.</p>`,
        },
      ]}
      highlights={[
        { icon: "phone", title: "Lina AI en français 24/7", description: "Chat, voix, courriel — toujours en français." },
        { icon: "star", title: "Vols directs YUL et YQB", description: "Cuba, Cancún, Punta Cana en direct depuis Québec." },
        { icon: "gift", title: "Aucuns frais de plateforme", description: "Tout en CAD, taxes et transferts inclus." },
        { icon: "shield", title: "Support en voyage 24/7", description: "Un humain joignable de partout en cas de pépin." },
        { icon: "users", title: "ZeniPay 0% intérêt", description: "Paiement en versements jusqu'au départ." },
        { icon: "map", title: "Spécialistes Cuba et Caraïbes", description: "Les destinations préférées des Québécois." },
      ]}
      faqs={[
        { question: "Zeniva est-elle une agence de voyage?", answer: "Non. Zeniva est une plateforme technologique de voyage IA. Les services de voyage (vols, hôtels, croisières) sont fournis par des fournisseurs tiers indépendants identifiés au moment du paiement. Zeniva agit uniquement comme intermédiaire technologique." },
        { question: "Lina AI parle-t-elle vraiment français?", answer: "Oui — Lina détecte automatiquement le français (chat ou voix) et répond en français. C'est la même Lina pour tous les clients, mais elle change de langue selon toi." },
        { question: "Puis-je parler à un vrai humain?", answer: "Oui, à tout moment. Écris « parler à un humain » dans le chat et un vrai concierge prend la relève en quelques minutes, 24/7." },
        { question: "Comment paye-t-on?", answer: "Carte de crédit (Stripe) ou ZeniPay (versements à 0% d'intérêt avec 25% de dépôt initial). Toutes devises supportées (CAD, USD, EUR)." },
        { question: "Quels sont vos prix?", answer: "Aucuns frais de plateforme — Zeniva gagne via les commissions des fournisseurs. Les prix affichés sont les prix finaux du fournisseur." },
      ]}
      ctaText="Parler à Lina maintenant"
      ctaPrompt="Bonjour Lina, je suis au Québec et je cherche un voyage"
      internalLinks={[
        { label: "Voyage tout inclus", href: "/voyage-tout-inclus" },
        { label: "Forfaits depuis Québec", href: "/packages/from-quebec-city" },
        { label: "Forfaits depuis Montréal", href: "/packages/from-montreal" },
        { label: "Chalets ZeniStay", href: "/zenistay" },
        { label: "Page d'accueil française", href: "/fr" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Zeniva Travel Québec",
        description: "Plateforme technologique de voyage IA au Québec — Lina AI 24/7 en français. Les services de voyage sont fournis par des fournisseurs tiers.",
        url: `https://www.zenivatravel.com${URL_PATH}`,
        areaServed: [
          { "@type": "AdministrativeArea", name: "Québec" },
          { "@type": "City", name: "Montréal" },
          { "@type": "City", name: "Québec" },
          { "@type": "City", name: "Lac Beauport" },
        ],
        priceRange: "$$-$$$$",
        currenciesAccepted: "CAD, USD",
        inLanguage: "fr-CA",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
      }}
    />
  );
}
