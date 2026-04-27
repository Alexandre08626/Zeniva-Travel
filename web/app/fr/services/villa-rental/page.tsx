import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Location de villa privée — Caraïbes, Europe, Floride | Zeniva",
  description:
    "Loue une villa privée avec personnel, chef et concierge. Caraïbes, Toscane, Provence, Floride, Bali. Curated par Zeniva, réservable via Lina AI. Service bilingue.",
  keywords: [
    "location villa privée", "location villa luxe", "villa Caraïbes", "villa Toscane",
    "villa Floride", "villa Bali", "villa Provence",
    "villa avec chef", "villa avec personnel", "location vacances haut de gamme",
  ],
  openGraph: {
    title: "Location de villa privée | Zeniva",
    description: "Villas de luxe avec chef, concierge et chauffeur en option. Caraïbes, Europe, Asie, Floride.",
    url: "https://www.zenivatravel.com/fr/services/villa-rental",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Location villa — Zeniva" }],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/fr/services/villa-rental",
    languages: {
      "en-US": "https://www.zenivatravel.com/services/villa-rental",
      "fr-CA": "https://www.zenivatravel.com/fr/services/villa-rental",
    },
  },
};

export default function FrVillaRentalPage() {
  return (
    <SeoPage
      h1="Location de villas privées dans le monde entier"
      subtitle="Domaines en bord de falaise en Italie, propriétés en bord de mer aux Turks et Caicos, chalets de ski dans les Alpes — villas vérifiées et réservées de bout en bout par Zeniva."
      heroImage="https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-stone-900/60"
      badge="Avec personnel optionnel"
      sections={[
        {
          heading: "Pourquoi réserver une villa via Zeniva",
          content: `<p>Les villas privées offrent ce que les hôtels ne peuvent pas : espace, intimité et impression d'avoir un lieu plutôt qu'une chambre. Bien réserver demande plus de travail qu'un hôtel — tu choisis non seulement une propriété mais un setup, un arrangement de personnel, un quartier. La plupart des plateformes en ligne listent des milliers de propriétés avec peu d'info et zéro contrôle qualité. Zeniva curate un portefeuille plus restreint de villas que nous avons inspectées, dans des destinations que nous connaissons.</p>
<p>Pour chaque réservation, ton conseiller Zeniva gère le contrat, le paiement en séquestre, l'approvisionnement pré-arrivée, les requêtes alimentaires pour tout chef, les transferts depuis l'aéroport et un contact 24/7 pendant ton séjour. Si quelque chose doit être réglé — le WiFi tombe, tu veux ajouter une journée bateau privée, le chef devrait passer au végétarien — on s'en occupe sans que tu aies à courir après le gestionnaire.</p>`,
        },
        {
          heading: "Caraïbes & Floride",
          content: `<p>Notre portefeuille caribéen couvre Turks et Caicos, Bahamas, République Dominicaine, St. Barths, Anguilla et Jamaïque. Beaucoup de propriétés viennent avec un personnel complet — manager de maison, femme de ménage, chef, chauffeur — inclus dans le tarif. Les propriétés en bord de mer aux Turks et Caicos pour 8-12 personnes coûtent généralement entre 11 000 $ et 35 000 $ CAD par semaine avec personnel.</p>
<p>Pour les voyageurs québécois et canadiens, notre portefeuille Floride se concentre sur les Keys, Naples, Miami Beach et Palm Beach. Options pet-friendly, complexes pour familles avec piscine, retraites adultes seulement — tout disponible.</p>`,
        },
        {
          heading: "Villas européennes",
          content: `<p>La saison européenne va de fin avril à octobre. La Toscane et la Provence sont des favoris perpétuels — fermes restaurées avec piscines, vignobles et accès aux chasses à la truffe. La Côte amalfitaine et Capri offrent des propriétés dramatiques en bord de falaise. Les îles grecques (Mykonos, Paros, Crète) ont rapidement émergé comme destination villa, souvent à des prix inférieurs à l'Italie.</p>
<p>Pour les groupes plus grands ou événements (réunions multi-générationnelles, mariages destinations), nous pouvons sourcer des propriétés à l'échelle d'un domaine pour 16 à 30 personnes avec coordinateurs d'événements sur place.</p>`,
        },
        {
          heading: "Asie & océan Indien",
          content: `<p>Bali reste notre marché asiatique le plus fort — Seminyak, Canggu et Ubud offrent chacun des cadres distincts. Phuket, Koh Samui et le Sri Lanka complètent notre portefeuille Asie du Sud-Est. Les Maldives fonctionnent différemment : la plupart des "villas" sont des bungalows sur pilotis dans des resorts d'îles privées plutôt que de vraies locations privées.</p>`,
        },
      ]}
      highlights={[
        { icon: "home", title: "Propriétés vérifiées", description: "Chaque villa a été personnellement inspectée ou recommandée par des partenaires locaux de confiance." },
        { icon: "star", title: "Personnel complet optionnel", description: "Ajoute chef, femme de ménage, chauffeur ou concierge — inclus dans le tarif quotidien ou facturé séparément." },
        { icon: "phone", title: "Support 24/7", description: "Ton conseiller Zeniva est joignable pendant ton séjour pour gérer tout problème." },
        { icon: "shield", title: "Paiement protégé", description: "Tous les paiements en séquestre jusqu'au check-in — ta réservation est protégée." },
        { icon: "gift", title: "Approvisionnement pré-arrivée", description: "Envoie ta liste d'épicerie, exigences alimentaires et requêtes spéciales — tout prêt à l'arrivée." },
        { icon: "users", title: "Idéal pour groupes", description: "Arrangements pour 6 à 30 invités, expérience à coordonner voyages multi-familiaux et événements." },
      ]}
      faqs={[
        { question: "Combien coûtent les villas privées?", answer: "Ça dépend entièrement de la destination, taille et saison. Une villa caribéenne de 4 chambres avec personnel coûte généralement entre 11 000 $ et 35 000 $ CAD par semaine. Une ferme toscane pour 8 en saison intermédiaire débute autour de 7 000 $ CAD par semaine." },
        { question: "Le personnel est-il inclus?", answer: "Ça varie. Les villas caribéennes et de nombreuses propriétés asiatiques incluent le personnel complet. Les villas européennes typiquement non — le personnel peut être ajouté à un coût quotidien supplémentaire." },
        { question: "Pouvez-vous arranger un chef privé?", answer: "Oui. Que la villa en inclue un ou non, nous pouvons sourcer des chefs locaux dans la plupart des destinations." },
        { question: "Et les assurances et dépôts?", answer: "La plupart des villas exigent un dépôt de garantie remboursable (généralement 1 500 $ à 7 000 $ CAD). Nous recommandons fortement l'assurance annulation." },
        { question: "Combien de temps à l'avance réserver?", answer: "Pour Noël, Nouvel An et vacances d'été, 9-12 mois à l'avance. Pour saisons intermédiaires, 3-6 mois." },
      ]}
      ctaText="Trouver ma villa"
      ctaPrompt="Je voudrais louer une villa privée"
      internalLinks={[
        { label: "Villas Floride", href: "/florida-villas" },
        { label: "Voyage de luxe", href: "/services/luxury-travel" },
        { label: "Destinations Caraïbes", href: "/destinations/caribbean" },
        { label: "Destinations Europe", href: "/destinations/europe" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Location de villa privée",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        serviceType: "Vacation Rental",
        description: "Location de villas privées dans le monde entier avec chef, ménage et concierge optionnels.",
        areaServed: "Worldwide",
      }}
    />
  );
}
