import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mariages à destination — Caraïbes, Mexique, Italie, Grèce | Zeniva",
  description:
    "Planifie ton mariage à destination avec Zeniva. Caraïbes, Mexique, Italie, Grèce, Bali. Sélection de salle, vols de groupe, blocs de chambres, fournisseurs et sacs de bienvenue.",
  keywords: [
    "mariage destination", "wedding planner destination", "mariage Caraïbes",
    "mariage Mexique", "mariage Italie", "mariage Grèce",
    "resort tout-inclus mariage", "voyage de groupe mariage", "bloc de chambres mariage",
    "wedding planner Québec", "élopement à l'étranger",
  ],
  openGraph: {
    title: "Mariages à destination dans le monde entier | Zeniva",
    description: "Salles, vols groupes, blocs chambres, fournisseurs. Caraïbes, Mexique, Italie, Grèce.",
    url: "https://www.zenivatravel.com/fr/services/destination-weddings",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Mariages destination — Zeniva" }],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/fr/services/destination-weddings",
    languages: {
      "en-US": "https://www.zenivatravel.com/services/destination-weddings",
      "fr-CA": "https://www.zenivatravel.com/fr/services/destination-weddings",
    },
  },
};

export default function FrDestinationWeddingsPage() {
  return (
    <SeoPage
      h1="Mariages à destination dans le monde entier"
      subtitle="Sélection de salle, vols de groupe, blocs de chambres, coordination de fournisseurs, sacs de bienvenue et excursions pour vos invités — Zeniva gère le côté voyage."
      heroImage="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-rose-900/70 to-amber-900/60"
      badge="Spécialistes voyages de groupe"
      sections={[
        {
          heading: "Ce que Zeniva gère pour les mariages destinations",
          content: `<p>Un mariage destination, c'est deux événements empilés : le mariage lui-même et un voyage de plusieurs jours pour 20 à 200 invités. La plupart des wedding planners gèrent la journée. Peu gèrent le voyage — blocs de vols groupés, tarifs chambres, transferts, sacs de bienvenue, excursions de groupe, arrivées tardives, et les changements inévitables quand un vol est annulé.</p>
<p>Zeniva se spécialise dans le côté voyage. Une fois la salle et la date choisies, notre équipe mariages négocie un bloc de chambres au resort ou aux hôtels partenaires, source des tarifs aériens groupes pour ta liste d'invités, construit un site RSVP personnalisé, gère les paiements, coordonne les excursions pré/post et organise les sacs de bienvenue.</p>`,
        },
        {
          heading: "Top destinations pour mariages",
          content: `<p><strong>Mexique :</strong> Riviera Maya, Cancún, Playa del Carmen, Tulum, Los Cabos. Les mariages tout-inclus dominent ici — Excellence, Iberostar, Karisma, Hard Rock, Palace Resorts. La plupart des forfaits incluent les frais de cérémonie, la décoration de base et un bloc de chambres réduit.</p>
<p><strong>Caraïbes :</strong> Jamaïque (Sandals, Couples), République Dominicaine (Punta Cana, Cap Cana), Turks et Caicos, Sainte-Lucie, Bahamas. Sandals et Couples se spécialisent dans les mariages adultes seulement.</p>
<p><strong>Italie & Grèce :</strong> Côte amalfitaine, Lac de Côme, Toscane, Capri, Santorin, Mykonos, Crète. Les mariages en villa sont populaires pour les groupes plus petits (20-80 invités).</p>
<p><strong>Bali, Thaïlande, Maldives :</strong> Choix solides pour couples aventureux. Les villas balinaises et resorts de Phuket gèrent des mariages de 30 à 150.</p>`,
        },
        {
          heading: "Vols de groupe & blocs de chambres",
          content: `<p>Pour les mariages avec 20+ invités, les tarifs aériens de groupe peuvent économiser 100 $ à 400 $ CAD par billet comparativement à la réservation individuelle, et ils verrouillent les prix pour tes invités des mois à l'avance. Zeniva travaille avec les compagnies aériennes sur les contrats tarifs groupes (typiquement 10+ voyageurs depuis la même ville d'origine).</p>
<p>Les blocs de chambres au resort donnent à tes invités un tarif réduit (typiquement 15-30% sous le tarif publié) et permettent à tout le monde de séjourner au même endroit. Nous négocions le bloc, mettons en place un lien de réservation dédié et gérons la liste de chambres.</p>`,
        },
        {
          heading: "Sacs de bienvenue, excursions & logistique",
          content: `<p>Les petites attentions transforment un voyage de mariage en expérience mémorable. Nous coordonnons les sacs de bienvenue livrés à la chambre de chaque invité à l'arrivée (eau, collations, kit anti-gueule de bois, carte personnalisée, horaire). Nous arrangeons les excursions de groupe — catamaran, tour de cénote, dégustation de vin, golf — à tarifs groupes.</p>
<p>Pour le souper de répétition et les après-événements, nous réservons restaurants, setups de plage ou traiteurs de villa. Pour les invités âgés ou à mobilité limitée, nous arrangeons les emplacements de chambres spécifiques et l'assistance aux transferts. Arrivées tardives, correspondances manquées et bagages perdus pendant la semaine de mariage — nous avons un contact 24/7 pendant le voyage.</p>`,
        },
      ]}
      highlights={[
        { icon: "users", title: "Contrats aériens groupes", description: "10+ voyageurs depuis la même origine? Nous pouvons verrouiller les tarifs groupes 12 mois à l'avance." },
        { icon: "home", title: "Blocs de chambres négociés", description: "15-30% sous les tarifs publiés plus avantages gratuits pour le couple dans la plupart des grands resorts." },
        { icon: "gift", title: "Sacs de bienvenue & touches", description: "Sacs personnalisés, horaires, cartes et soins livrés à la chambre de chaque invité à l'arrivée." },
        { icon: "map", title: "Excursions de groupe", description: "Catamarans, golf, spa, tours de vin — réservés à tarifs groupes et coordonnés autour de ton horaire." },
        { icon: "phone", title: "Concierge 24/7 semaine de mariage", description: "Contact Zeniva dédié pendant le voyage pour gérer les vols ratés, changements de cabine et urgences." },
        { icon: "shield", title: "Gestion RSVP & paiement", description: "Site de réservation personnalisé, suivi RSVP, plans de paiement et liste de chambres — ton planificateur voit un seul tableau de bord." },
      ]}
      faqs={[
        { question: "Ai-je besoin d'un wedding planner si je réserve via Zeniva?", answer: "Oui. Zeniva gère le côté voyage — vols, hôtels, transferts, excursions, logistique de groupe. Tu as toujours besoin d'un wedding planner pour gérer la cérémonie, la réception, les fournisseurs et le décor." },
        { question: "Combien coûte un mariage destination?", answer: "Les mariages tout-inclus au Mexique ou aux Caraïbes coûtent entre 7 000 $ et 22 000 $ CAD pour la cérémonie et la réception de base. Les mariages en villa en Italie ou Grèce commencent à 45 000 $ CAD pour la salle seulement." },
        { question: "Les invités peuvent-ils payer individuellement?", answer: "Oui. Nous mettons en place un site de réservation personnalisé où chaque invité réserve et paye sa propre chambre et son vol au tarif de groupe négocié." },
        { question: "Et la paperasse de mariage à l'étranger?", answer: "Chaque pays a des exigences différentes. Le Mexique et la plupart des destinations caribéennes le rendent relativement facile. L'Italie et la Grèce ont des exigences plus strictes." },
        { question: "Combien de temps à l'avance réserver?", answer: "12 à 18 mois pour la haute saison. Prévoir 9-12 mois minimum pour que les invités planifient et budgétisent." },
      ]}
      ctaText="Planifier notre mariage"
      ctaPrompt="Nous planifions un mariage destination"
      internalLinks={[
        { label: "Forfaits lune de miel", href: "/services/honeymoon" },
        { label: "Voyages de groupe", href: "/services/group-travel" },
        { label: "Destinations Caraïbes", href: "/destinations/caribbean" },
        { label: "Destinations Mexique", href: "/destinations/mexico" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Planification de voyage pour mariage destination",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        serviceType: "Destination Wedding",
        description: "Coordination de voyage de groupe pour mariages destination — sélection de salle, vols groupes, blocs de chambres, coordination de fournisseurs, sacs de bienvenue.",
        areaServed: "Worldwide",
      }}
    />
  );
}
