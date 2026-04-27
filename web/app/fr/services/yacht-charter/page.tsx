import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Location de yacht privé — Caraïbes, Méditerranée, monde entier | Zeniva",
  description:
    "Affrétez un yacht privé avec Zeniva. Catamarans, motor yachts et superyachts avec équipage. Caraïbes, Méditerranée, Bahamas, Polynésie. Lina AI sourcing en 24h.",
  keywords: [
    "location yacht privé", "affrètement yacht", "yacht avec équipage", "catamaran avec équipage",
    "location yacht Caraïbes", "location yacht Méditerranée", "yacht Bahamas",
    "superyacht charter", "louer un voilier", "voyage en yacht",
  ],
  openGraph: {
    title: "Location de yacht privé | Zeniva",
    description: "Catamarans, motor yachts et superyachts avec équipage. Caraïbes, Méditerranée, Polynésie.",
    url: "https://www.zenivatravel.com/fr/services/yacht-charter",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Location yacht — Zeniva" }],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/fr/services/yacht-charter",
    languages: {
      "en-US": "https://www.zenivatravel.com/services/yacht-charter",
      "fr-CA": "https://www.zenivatravel.com/fr/services/yacht-charter",
    },
  },
};

export default function FrYachtCharterPage() {
  return (
    <SeoPage
      h1="Location de yacht privé partout dans le monde"
      subtitle="Yachts avec équipage, catamarans et superyachts dans les plus belles destinations nautiques — sourcés et réservés par Lina AI en 24h."
      heroImage="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-cyan-900/70 to-blue-900/60"
      badge="Avec ou sans équipage"
      sections={[
        {
          heading: "Comment ça fonctionne chez Zeniva",
          content: `<p>Réserver un yacht privé impliquait des semaines d'échanges avec des courtiers, des prix opaques et des décisions prises sur des informations incomplètes. Zeniva a refait l'expérience autour de la rapidité et de la clarté. Tu dis à Lina AI quand tu veux naviguer, où, et la taille de ton groupe — en 24 heures, tu reçois 3 à 5 options vérifiées avec tarification complète, biographies de l'équipage et suggestions d'itinéraires.</p>
<p>Chaque yacht de notre réseau est exploité par une compagnie d'affrètement licenciée et assurée. Nous travaillons avec des courtiers aux Îles Vierges britanniques, Bahamas, Grèce, Croatie, Turquie, Polynésie française, Thaïlande et dans toute la Caraïbe. Que tu veuilles un catamaran de 14m pour une famille de six ou un yacht à moteur de 55m avec équipage de dix, le processus est le même : décris le voyage, examine les options, réserve.</p>`,
        },
        {
          heading: "Caraïbes & Bahamas",
          content: `<p>Les Caraïbes sont notre région d'affrètement la plus forte. Nous coordonnons des voyages au départ de Tortola (BVI), Nassau (Bahamas), St. Martin, Sainte-Lucie, Antigua et Grenade. Les Îles Vierges britanniques restent le point de départ le plus populaire grâce aux courts trajets entre mouillages protégés, alizés prévisibles et chaîne de bars de plage devenus des destinations en eux-mêmes.</p>
<p>Les catamarans dominent la flotte caribéenne car ils gèrent bien les mouillages peu profonds et offrent plus d'espace de vie que les monocoques de longueur similaire. Compte entre 27 000 $ et 60 000 $ CAD par semaine pour un catamaran de 15 mètres entièrement équipé pour 8 invités, tout compris (nourriture, boissons, carburant, pourboires d'équipage).</p>`,
        },
        {
          heading: "Méditerranée",
          content: `<p>La saison méditerranéenne va d'environ mai à octobre, juillet et août étant le pic. Zeniva source des yachts en Grèce (Athènes, Mykonos, Santorin, Ionienne), Croatie (Split, Dubrovnik), Italie (Naples, Sardaigne, Amalfi), Côte d'Azur (Cannes, St-Tropez), Turquie (Bodrum, Göcek) et Baléares (Palma, Ibiza).</p>
<p>Les affrètements méditerranéens tendent vers les motor yachts plus grands car les distances entre destinations marquantes sont plus longues. Un motor yacht de 30m avec équipage de 5 coûte généralement entre 55 000 $ et 200 000 $ CAD par semaine plus l'APA standard de 30% pour le carburant, la nourriture et le quai.</p>`,
        },
        {
          heading: "Ce qui est inclus et ce qui ne l'est pas",
          content: `<p>La tarification d'affrètement avec équipage inclut généralement le yacht lui-même, l'équipage (capitaine, chef, matelots, hôtesse), et les commodités de base. L'APA — généralement 25-35% du tarif de base — couvre carburant, quai, nourriture, boissons, frais portuaires et tout approvisionnement demandé.</p>
<p>Les pourboires sont coutumiers et représentent généralement 10-20% du tarif de base, payés directement au capitaine à la fin du voyage. L'assurance voyage, les vols vers le port d'embarquement et tout séjour à l'hôtel avant/après l'affrètement ne sont pas inclus — Zeniva peut tout coordonner dans la même réservation.</p>`,
        },
      ]}
      highlights={[
        { icon: "anchor", title: "Opérateurs vérifiés", description: "Chaque compagnie d'affrètement de notre réseau est entièrement licenciée, assurée et personnellement vérifiée." },
        { icon: "star", title: "Devis en 24h", description: "Dis tes dates et destination à Lina — reçois 3 à 5 options vérifiées avec tarification complète en un jour ouvrable." },
        { icon: "users", title: "Avec équipage ou sans", description: "Avec équipage complet (capitaine, chef inclus) ou sans (tu skippe) — les deux disponibles partout." },
        { icon: "map", title: "Itinéraires personnalisés", description: "Ton capitaine planifie les mouillages quotidiens autour de la météo, tes intérêts et les meilleures plages et restaurants." },
        { icon: "shield", title: "Contrat MYBA", description: "Contrat MYBA standard, paiement en séquestre, et assurance complète — ta réservation est protégée de bout en bout." },
        { icon: "phone", title: "Concierge", description: "Listes d'approvisionnement, exigences alimentaires et demandes spéciales gérées par ton conseiller Zeniva." },
      ]}
      faqs={[
        { question: "Combien coûte la location d'un yacht?", answer: "Les affrètements de catamaran avec équipage aux Caraïbes commencent autour de 27 000 $ CAD par semaine tout compris pour 8 invités. Les motor yachts méditerranéens (18-25m) coûtent généralement entre 55 000 $ et 110 000 $ CAD par semaine de base, plus APA. Les superyachts (30m+) commencent autour de 140 000 $ CAD par semaine." },
        { question: "Faut-il une expérience en navigation?", answer: "Non pour les affrètements avec équipage — le capitaine s'occupe de tout. Pour les affrètements sans équipage, il faut une certification reconnue (ASA, RYA, IYT) et une expérience démontrée." },
        { question: "Combien de temps à l'avance réserver?", answer: "Pour les semaines de pointe (Noël/Nouvel An aux Caraïbes, juillet-août en Méditerranée), 9-12 mois à l'avance. Pour les saisons intermédiaires, 3-6 mois suffisent." },
        { question: "Pouvez-vous arranger les vols et hôtels aussi?", answer: "Oui. Zeniva réserve tes vols vers le port d'embarquement, tout séjour pré/post-affrètement et les transferts terrestres. Tout sur un seul itinéraire avec un seul point de contact." },
        { question: "Que se passe-t-il si la météo est mauvaise?", answer: "Le capitaine a l'autorité finale sur l'itinéraire et l'ajustera pour assurer la sécurité. La plupart des affrètements ont une assurance voyage qui couvre l'annulation ou les perturbations météo importantes." },
      ]}
      ctaText="Obtenir des devis de yacht"
      ctaPrompt="Je voudrais affréter un yacht privé"
      internalLinks={[
        { label: "Voyage de luxe", href: "/services/luxury-travel" },
        { label: "Collection ZeniYacht", href: "/zeniyacht" },
        { label: "Forfaits lune de miel", href: "/services/honeymoon" },
        { label: "Destinations Caraïbes", href: "/destinations/caribbean" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Location de yacht privé",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        serviceType: "Yacht Charter",
        description: "Location de yachts privés avec ou sans équipage aux Caraïbes, Méditerranée, Bahamas, et Polynésie française.",
        areaServed: "Worldwide",
      }}
    />
  );
}
