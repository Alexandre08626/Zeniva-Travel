import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Paris"; const AIRPORT = "CDG"; const URL_PATH = "/packages/from-paris";
export const metadata: Metadata = {
  title: `Forfaits vacances de ${CITY} (${AIRPORT}/ORY) — Caraïbes, Asie, USA | Zeniva`,
  description: `Forfaits vacances depuis ${CITY} (Charles de Gaulle, Orly). Caraïbes, Asie, USA, Afrique. Vols directs, hôtel et transferts inclus.`,
  keywords: [`forfait vacances ${CITY}`, `vols ${AIRPORT}`, `tout-inclus ${CITY}`, `${CITY} Caraïbes`, `${CITY} Bali`, `agence voyage Paris`],
  openGraph: { title: `Forfaits vacances de ${CITY} | Zeniva`, description: `Forfaits curated depuis CDG/ORY. Caraïbes, Asie, USA, Afrique.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Forfaits ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}`, languages: { "fr-FR": `https://www.zenivatravel.com${URL_PATH}` } },
};
export default function P() { return (
  <SeoPage h1={`Forfaits vacances de ${CITY}`} subtitle={`${CITY} a deux aéroports majeurs (Charles de Gaulle ${AIRPORT} et Orly ORY). Vols directs vers les Caraïbes, l'Asie, les USA, l'Afrique. Air France, Air Caraïbes, Corsair, low-cost.`}
    heroImage="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-rose-900/60" badge={`✈️ CDG + Orly`}
    sections={[
      { heading: `Pourquoi ${CITY} a un réseau mondial exceptionnel`, content: `<p>${CITY} possède deux aéroports majeurs et un réseau international parmi les plus larges au monde. Charles de Gaulle (${AIRPORT}) est le hub d'Air France et de SkyTeam — vols directs vers 250+ destinations. Orly (ORY) sert principalement les Caraïbes françaises (Guadeloupe, Martinique, Réunion) et le bassin méditerranéen.</p>` },
      { heading: `Top destinations depuis ${CITY}`, content: `<p><strong>Caraïbes françaises (Guadeloupe, Martinique, Saint-Martin) :</strong> Direct d'Orly. À partir de 800€/personne pour 7 nuits.</p><p><strong>République Dominicaine, Cancún :</strong> Direct de CDG. À partir de 1 200€/personne tout-inclus.</p><p><strong>Maldives, Maurice, Seychelles, Réunion :</strong> Direct de CDG. À partir de 2 500€/personne pour 7 nuits.</p><p><strong>Asie (Bangkok, Tokyo, Bali, Hong Kong) :</strong> Direct de CDG sur Air France et partenaires. À partir de 1 800€/personne.</p><p><strong>USA (NYC, Miami, LA, San Francisco) :</strong> Direct de CDG. À partir de 800€/personne pour les vols.</p><p><strong>Afrique (Maroc, Sénégal, Côte d'Ivoire, Afrique du Sud) :</strong> Direct de CDG, réseau Air France particulièrement fort.</p>` },
      { heading: "Comment réserver", content: `<p>Discute avec Lina ou appelle 24/7 au /call. Prix en EUR via ZeniPay. 25% d'acompte, solde en versements à 0% d'intérêt. Lina parle français nativement.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct de CDG/Orly`, description: `Hub Air France — réseau mondial parmi les plus larges.` },
      { icon: "gift", title: "Vols + Hôtel + Transferts", description: "Forfait avec prix transparent." },
      { icon: "phone", title: "Lina parle français", description: "Service français 24/7 — chat ou voix." },
      { icon: "map", title: "Caraïbes françaises", description: "Guadeloupe, Martinique, Réunion — direct d'Orly." },
      { icon: "shield", title: "Support 24/7 en voyage", description: "Un humain joignable de partout." },
    ]}
    faqs={[
      { question: `Quel est le voyage le moins cher de ${CITY}?`, answer: `Méditerranée (Maroc, Tunisie, Grèce, Espagne) à partir de 400€/personne pour 7 nuits. Caraïbes françaises à partir de 800€/personne.` },
      { question: "CDG ou Orly?", answer: "CDG pour la longue distance international. Orly pour Caraïbes françaises + Méditerranée + budget. Lina compare." },
      { question: "Devise?", answer: "EUR via ZeniPay. Plans de paiement à 0% d'intérêt." },
      { question: "Lina parle français?", answer: "Oui, Lina détecte le français automatiquement. Service entièrement en français." },
      { question: "Voyages multi-villes?", answer: "Oui — TGV vers Bruxelles/Amsterdam/Londres supporté avec les vols." },
    ]}
    ctaText={`Voir les forfaits de ${CITY}`} ctaPrompt={`Je veux un forfait vacances de ${CITY}`}
    internalLinks={[ { label: "Tous les forfaits", href: "/packages" }, { label: "Tout-inclus", href: "/packages/all-inclusive" }, { label: "Destinations Caraïbes", href: "/destinations/caribbean" }, { label: "Forfaits Cancún", href: "/packages/cancun" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Forfaits vacances de ${CITY}`, description: `Forfaits vacances depuis ${CITY} (CDG/Orly).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "FR" } } }}
  />
); }
