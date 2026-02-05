"use client";

import { useEffect, useState } from "react";
import type { Locale } from "../lib/i18n/config";
import { useI18n, useTranslate } from "../lib/i18n/I18nProvider";

/**
 * Client helper to translate a text string when the user switches locale.
 * Falls back to the source text if translation fails.
 */
export default function AutoTranslate({
  text,
  source = "en",
  className,
}: {
  text: string;
  source?: Locale | "auto";
  className?: string;
}) {
  const { locale } = useI18n();
  const translate = useTranslate();
  const [value, setValue] = useState<string>(text);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fallbackMap: Record<string, Record<string, string>> = {
    fr: {
      "Powered by Lina AI": "Propulsé par Lina AI",
      "Partner Resorts": "Resorts partenaires",
      "Group Trips": "Voyages de groupe",
      "Short-term rentals": "Résidences sélectionnées",
      "Private stays curated by Zeniva, bookable with concierge support.": "Séjours privés choisis par Zeniva, réservables avec assistance.",
      "My Travel Documents": "Mes documents de voyage",
      "Partner": "Partenaire",
      "Switch to agent workspace": "Passer à l’espace agent",
      "Sign up": "S’inscrire",
      "Log in": "Se connecter",
      "Web UI v1": "Interface web v1",
      "Partner with us": "Devenez partenaire",
      "Talk to Lina": "Parler à Lina",
      "Chat Lina": "Discuter avec Lina",
      "Start a conversation": "Démarrer une conversation",
      "Call Lina": "Appeler Lina",
      "Speak with concierge": "Parler au concierge",
      "Proposals": "Propositions",
      "View curated proposals": "Voir les propositions",
      "Collection & Themes": "Collections et thèmes",
      "Browse curated travel collections tailored by Lina.": "Parcourez des collections de voyage sélectionnées par Lina.",
      "Featured Trips by Lina": "Voyages vedettes par Lina",
      "Hand-picked proposals ready to book.": "Propositions sélectionnées prêtes à réserver.",
      "Lina AI, Your Travel Genius": "Lina AI, votre génie du voyage",
      "Powered by Zeniva Intelligence": "Propulsé par Zeniva Intelligence",
      "Lina asks clarifying questions about your preferences, budget, and dates — then generates hand-picked proposals combining flights, hotels, and experiences. No cookie-cutter packages. Just travel tailored to you.": "Lina pose des questions sur vos préférences, budget et dates — puis génère des propositions sélectionnées combinant vols, hôtels et expériences. Pas de forfaits standardisés. Un voyage sur mesure.",
      "She Asks": "Elle questionne",
      "Departure city, dates, budget & vibe": "Ville de départ, dates, budget et ambiance",
      "She Curates": "Elle sélectionne",
      "Optimized flight + hotel combos": "Combos vols + hôtels optimisés",
      "You Book": "Vous réservez",
      "Ready-to-checkout itineraries": "Itinéraires prêts à réserver",
      "Start Planning Now →": "Commencer maintenant →",
      "Residences": "Résidences",
      "Residences curated by Zeniva": "Résidences sélectionnées par Zeniva",
      "Browse stays and message us to book.": "Parcourez les séjours et contactez‑nous pour réserver.",
      "Chat to book": "Discuter pour réserver",
      "Loading residences...": "Chargement des résidences...",
      "No residences available right now. Please check back soon.": "Aucune résidence disponible pour le moment. Revenez bientôt.",
      "Yacht Charters": "Charters de yachts",
      "Exclusive YCN Fleet": "Flotte exclusive YCN",
      "Browse curated yachts and contact us for tailored itineraries.": "Parcourez des yachts sélectionnés et contactez‑nous pour des itinéraires sur mesure.",
      "Chat to plan": "Discuter pour planifier",
      "Filter by country": "Filtrer par pays",
      "No yachts available right now. Please check back soon.": "Aucun yacht disponible pour le moment. Revenez bientôt.",
      "Zeniva Partner Resorts": "Resorts partenaires Zeniva",
      "Luxury partner hotels, curated like Booking": "Hôtels partenaires de luxe, sélectionnés comme Booking",
      "Verified inventory only. Premium contracts, priority perks, and trusted media for proposals.": "Inventaire vérifié uniquement. Contrats premium, avantages prioritaires et médias fiables pour les propositions.",
    },
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (locale === source) {
        setValue(text);
        return;
      }

      const fallback = fallbackMap[locale]?.[text];
      if (fallback) {
        setValue(fallback);
        return;
      }

      setIsLoading(true);
      try {
        const result = await translate(text, source);
        if (!cancelled) setValue(result);
      } catch {
        if (!cancelled) setValue(text);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [locale, source, text, translate]);

  return <span className={className}>{isLoading ? text : value}</span>;
}
