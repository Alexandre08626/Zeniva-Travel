import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Rencontre Lina — Concierge IA de voyage de Zeniva | 24/7",
  description: "Rencontre Lina, le concierge IA de voyage de Zeniva. Réservations réelles (vols, hôtels, yachts, villas, croisières), escalade humaine 24/7, multilingue. Gratuit.",
  keywords: ["Lina AI", "Lina agent voyage", "Zeniva Lina", "concierge IA voyage", "qui est Lina AI", "parler à Lina", "Lina AI avis"],
  alternates: { canonical: "https://www.zenivatravel.com/fr/lina", languages: { "en-US": "https://www.zenivatravel.com/lina", "es": "https://www.zenivatravel.com/es/lina" } },
  openGraph: { title: "Rencontre Lina | Zeniva", description: "Concierge IA de voyage. Réservations réelles + humain 24/7.", url: "https://www.zenivatravel.com/fr/lina", siteName: "Zeniva Travel", locale: "fr_CA", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina — Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="Rencontre Lina — Ton concierge IA de voyage" subtitle="Lina est l'IA derrière Zeniva. Elle planifie ton voyage en secondes, réserve de vrais vols et hôtels chez des partenaires licenciés, et te transfère à un conseiller humain quand tu en as besoin. Disponible 24/7 en 6 langues."
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="Concierge IA voyage"
    sections={[
      { heading: "Qui est Lina", content: `<p>Lina est un concierge IA de voyage construit sur mesure — pas un chatbot générique. Bâtie sur Anthropic Claude avec une infrastructure qui se connecte aux partenaires de réservation en direct (Duffel pour les vols, LiteAPI pour 1,5 M+ hôtels), Lina peut planifier ET réserver tout ton voyage à partir d'une seule conversation.</p><p>Elle est la porte d'entrée de Zeniva, une agence de voyage IA basée aux USA, incorporée au Delaware. Quand tu parles à Lina, tu parles au même cerveau qui gère des milliers de voyages par mois — mais personnalisé pour tes dates, groupe, budget et style.</p>` },
      { heading: "Ce que Lina fait vraiment", content: `<p><strong>Réserve de vrais vols :</strong> Lina interroge l'API Duffel pour les prix de vols en direct chez 300+ compagnies aériennes.</p><p><strong>Réserve de vrais hôtels :</strong> 1,5 M+ propriétés mondialement via LiteAPI.</p><p><strong>Voyages spécialisés :</strong> Charters de yachts, villas privées, croisières, mariages destination.</p><p><strong>Parle ta langue :</strong> Lina détecte si tu écris en anglais, français, espagnol, portugais, allemand ou italien et répond dans la même langue.</p><p><strong>Option voix :</strong> Parle à Lina au téléphone en /call — 24/7.</p><p><strong>Te passe à un humain :</strong> Écris "je veux parler à un humain" n'importe quand. Un vrai conseiller voyage prend le cas immédiatement.</p>` },
      { heading: "Comment parler à Lina", content: `<p><strong>Chat web :</strong> Visite <a href="/chat">/chat</a> depuis n'importe quel appareil.</p><p><strong>Appel vocal :</strong> Visite <a href="/call">/call</a> pour parler par la voix. Disponible 24/7 en 6 langues.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Réservations réelles", description: "Prix de vols + hôtels en direct via Duffel et LiteAPI — pas des estimations." },
      { icon: "shield", title: "Filet de sécurité humain", description: "Écris 'je veux parler à un humain' — vrai conseiller prend en charge 24/7." },
      { icon: "phone", title: "Voix + chat", description: "Web chat /chat ou appels vocaux /call. Les deux 24/7." },
      { icon: "map", title: "6 langues auto", description: "EN, FR, ES, PT, DE, IT — Lina détecte et répond." },
      { icon: "anchor", title: "Voyages spécialisés", description: "Yachts, villas, croisières, mariages destination — réservables via Lina." },
      { icon: "gift", title: "Gratuit", description: "0$ frais de réservation. Zeniva gagne sur les commissions des fournisseurs." },
    ]}
    faqs={[
      { question: "Lina est vraiment une IA ou un humain?", answer: "Lina est un agent IA construit sur Anthropic Claude. Si tu veux un humain, écris 'je veux parler à un humain' — un vrai conseiller Zeniva prend en charge 24/7." },
      { question: "Lina est gratuite?", answer: "Oui. Aucun frais pour discuter avec Lina, aucun frais pour réserver. Zeniva gagne sur les commissions des fournisseurs (standard de l'industrie)." },
      { question: "Les prix que Lina montre sont-ils réels?", answer: "Oui — chaque prix vient d'un appel API en direct à Duffel (vols) ou LiteAPI (hôtels). Ce sont les prix réels réservables au moment où Lina te les montre." },
      { question: "Lina parle-t-elle français?", answer: "Oui. Lina supporte EN/FR/ES/PT/DE/IT — détection automatique." },
      { question: "Et si ma réservation tourne mal?", answer: "Écris 'je veux parler à un humain' dans le même chat. Un vrai conseiller Zeniva prend le cas 24/7 — gère les annulations, rebookings, remboursements." },
    ]}
    ctaText="Parle à Lina maintenant" ctaPrompt="Je veux planifier un voyage"
    internalLinks={[ { label: "Comment Lina fonctionne", href: "/lina/how-it-works" }, { label: "Service Agent IA", href: "/fr/services/ai-travel-agent" }, { label: "Voix avec Lina", href: "/call" } ]}
  />
); }
