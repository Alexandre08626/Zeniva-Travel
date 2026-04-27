import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Croisières — Caraïbes, Méditerranée, Alaska, Europe | Zeniva",
  description:
    "Réserve ta croisière avec Zeniva. Caraïbes, Méditerranée, Alaska, Europe du Nord, Asie. Toutes les grandes lignes de croisière, croisières fluviales et expéditions de luxe.",
  keywords: [
    "réservation croisière", "croisière Caraïbes", "croisière Méditerranée",
    "croisière Alaska", "croisière fluviale Europe", "croisière de luxe",
    "Royal Caribbean", "Norwegian", "Celebrity", "Viking", "Disney Croisière",
  ],
  openGraph: {
    title: "Croisières dans le monde entier | Zeniva",
    description: "Caraïbes, Méditerranée, Alaska, fluviales, expéditions. Toutes les grandes lignes.",
    url: "https://www.zenivatravel.com/fr/services/cruises",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Croisières — Zeniva" }],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/fr/services/cruises",
    languages: {
      "en-US": "https://www.zenivatravel.com/services/cruises",
      "fr-CA": "https://www.zenivatravel.com/fr/services/cruises",
    },
  },
};

export default function FrCruisesPage() {
  return (
    <SeoPage
      h1="Planification de croisières dans le monde entier"
      subtitle="Des croisières caribéennes de 7 nuits aux tours du monde d'un mois — Zeniva réserve toutes les grandes lignes plus les croisières petits navires de luxe et expéditions."
      heroImage="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-cyan-900/60"
      badge="Toutes les lignes + petits navires luxe"
      sections={[
        {
          heading: "Pourquoi réserver ta croisière via Zeniva",
          content: `<p>La tarification des croisières est opaque, les promotions changent quotidiennement, et la différence entre une excellente cabine et une bruyante peut être quelques mètres. L'équipe croisière de Zeniva réserve sur toutes les grandes lignes — Royal Caribbean, Carnival, Norwegian, Disney, MSC, Celebrity, Princess, Holland America — plus les opérateurs de luxe et expéditions (Viking, Seabourn, Silversea, Regent, Ponant, Lindblad).</p>
<p>Parce que nous réservons en volume, nous recevons des tarifs de groupe, crédits à bord, surclassements gratuits et avantages additionnels (forfaits boissons, restauration, pourboires prépayés) qui ne sont pas toujours disponibles en réservation directe.</p>`,
        },
        {
          heading: "Croisières caribéennes",
          content: `<p>Les Caraïbes sont le plus grand marché mondial de croisières. Depuis les ports de Floride (Miami, Port Canaveral, Fort Lauderdale, Tampa), on peut voguer vers les Bahamas, les Caraïbes orientales, occidentales ou méridionales. Les départs sont à l'année avec saison de pointe décembre à avril.</p>
<p>Pour les familles, Disney Cruise Line et les navires Oasis-class de Royal Caribbean offrent le plus d'activités à bord. Les couples préfèrent souvent Celebrity, Princess ou Holland America. Norwegian's freestyle dining convient aux voyageurs détestant les horaires fixes.</p>`,
        },
        {
          heading: "Méditerranée & Europe",
          content: `<p>La saison européenne va d'avril à octobre. Les itinéraires méditerranéens depuis Rome, Barcelone, Venise ou Athènes touchent les points forts comme la Côte amalfitaine, la Côte d'Azur, les îles grecques, la Croatie. Les croisières d'Europe du Nord lancent depuis Copenhague, Stockholm, Hambourg et Southampton.</p>
<p>Les croisières fluviales européennes — Viking, AmaWaterways, Avalon, Uniworld — opèrent sur le Rhin, Danube, Rhône, Douro. Les prix par nuit sont plus élevés mais typiquement tout-inclus (boissons, excursions, pourboires).</p>`,
        },
        {
          heading: "Alaska, expéditions, tours du monde",
          content: `<p>Les croisières Alaska vont de mai à septembre depuis Vancouver et Seattle. Les itinéraires populaires incluent Glacier Bay, le Hubbard Glacier, l'Inside Passage et les escales à Juneau, Skagway et Ketchikan. Princess et Holland America ont la plus forte présence en Alaska.</p>
<p>Pour les croisières d'expédition — Galápagos, Antarctique, Arctique, Amazone — les petits navires sont essentiels. Zeniva réserve Lindblad/National Geographic, Ponant, Silversea Expeditions, Hurtigruten.</p>`,
        },
      ]}
      highlights={[
        { icon: "anchor", title: "Toutes les grandes lignes", description: "Royal Caribbean, Norwegian, Carnival, Disney, Princess, Holland America, MSC, Celebrity — plus tous les opérateurs de luxe." },
        { icon: "gift", title: "Tarifs de groupe & avantages", description: "Crédits à bord, forfaits boissons gratuits, pourboires prépayés et surclassements depuis nos réservations groupes." },
        { icon: "map", title: "Matchage d'itinéraire", description: "Lina compare lignes, navires et dates contre tes priorités — pas seulement ce qui paie la plus haute commission." },
        { icon: "shield", title: "Sélection de cabine", description: "Nous savons quelles cabines sur quels navires ont du bruit, vibrations ou vues obstruées — et lesquelles sont silencieusement les meilleures à bord." },
        { icon: "phone", title: "Hôtels pré et post", description: "Hôtels d'embarquement, transferts vers le port et toute extension pré/post-croisière gérés sur le même itinéraire." },
        { icon: "users", title: "Réservations groupes", description: "Réservations multi-cabines familiales, anniversaires marquants et groupes corporatifs — coordonnés de bout en bout." },
      ]}
      faqs={[
        { question: "Combien coûte une croisière?", answer: "Les croisières caribéennes commencent sous 700 $ CAD par personne pour une cabine intérieure sur une ligne économique. Un balcon sur Royal Caribbean ou Norwegian coûte typiquement 1 200 $ à 2 000 $ CAD par personne pour 7 nuits." },
        { question: "Les pourboires et boissons sont-ils inclus?", answer: "Sur les lignes grand public, non — les pourboires sont ajoutés quotidiennement (~22 $ CAD par personne par jour) et les boissons sont à la carte sauf si tu achètes un forfait. Sur les lignes de luxe et la plupart des croisières fluviales, les boissons et pourboires sont typiquement inclus." },
        { question: "Pouvez-vous réserver les excursions à terre via Zeniva?", answer: "Oui. Nous réservons via la ligne de croisière (plus cher mais retour au navire garanti) ou via des opérateurs indépendants de confiance dans chaque port (souvent moitié prix pour la même excursion)." },
        { question: "Et l'assurance voyage?", answer: "Fortement recommandée pour les croisières. Nous chiffrons et réservons l'assurance couvrant annulation, médical et bagages perdus." },
        { question: "Quand réserver une croisière?", answer: "12-18 mois à l'avance pour les semaines de pointe (Noël/Nouvel An Caraïbes, été Méditerranée, Alaska été)." },
      ]}
      ctaText="Trouver ma croisière"
      ctaPrompt="Je voudrais planifier une croisière"
      internalLinks={[
        { label: "Destinations Caraïbes", href: "/destinations/caribbean" },
        { label: "Destinations Europe", href: "/destinations/europe" },
        { label: "Location de yacht", href: "/services/yacht-charter" },
        { label: "Voyages de groupe", href: "/services/group-travel" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Service de croisières",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        serviceType: "Cruise Booking",
        description: "Réservation de croisières sur toutes les grandes lignes océaniques, fluviales et d'expédition.",
        areaServed: "Worldwide",
      }}
    />
  );
}
