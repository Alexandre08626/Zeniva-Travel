import type { Metadata } from "next";
import Link from "next/link";
import AgentRoleSection from "../../../components/careers/AgentRoleSection";
import InfluencerRoleSection from "../../../components/careers/InfluencerRoleSection";
import RoleCategory from "../../../components/careers/RoleCategory";
import RoleCard from "../../../components/careers/RoleCard";
import FAQ from "../../../components/careers/FAQ";
import CareersSignupForm from "../../../components/careers/CareersSignupForm.client";
import { AGENT_ROLE_DICT_FR } from "../../../components/careers/agentRoleDict";
import { INFLUENCER_ROLE_DICT_FR } from "../../../components/careers/influencerRoleDict";
import { buildCareersJsonLd } from "../../../src/lib/seo/careersSchema";

const PAGE_URL = "https://zenivatravel.com/fr/carrieres";
const GRADIENT_START = "#0B1B4D";
const GRADIENT_END = "#0F6CF5";
const GOLD_GRADIENT = "linear-gradient(135deg, #E6B85A, #C9941F)";

export const metadata: Metadata = {
  title: "Carrières chez Zeniva — Agents de voyage & influenceurs",
  description:
    "Construis ta carrière chez Zeniva. Deux parcours : deviens agent de voyage Zeniva (70% de commission, propulsé par l'IA) ou rejoins le programme créateur (3-5% de commission, voyages au tarif agence dès 150 clients).",
  keywords: [
    "carrières Zeniva",
    "agent de voyage à distance",
    "programme créateur voyage",
    "influenceur voyage",
    "commission voyage",
    "Lina AI",
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: {
      "en-US": "https://zenivatravel.com/carrieres",
      "en-CA": "https://zenivatravel.com/carrieres",
      "fr-CA": PAGE_URL,
      "fr-FR": PAGE_URL,
    },
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Carrières chez Zeniva — Agents de voyage & influenceurs",
    description:
      "Deux parcours chez Zeniva : agent de voyage indépendant (70% de commission) ou partenaire créateur (3-5% avec avantages Premium dès 150 clients).",
    siteName: "Zeniva",
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carrières chez Zeniva",
    description: "Agent de voyage indépendant ou partenaire créateur — choisis ton parcours.",
  },
};

export default function CarrieresPageFr() {
  const jsonLd = buildCareersJsonLd({ locale: "fr", pageUrl: PAGE_URL });
  const agentDict = { ...AGENT_ROLE_DICT_FR, applyHref: "#apply" };
  const influencerDict = { ...INFLUENCER_ROLE_DICT_FR, applyHref: "#apply", fullProgramHref: "/join/influencer" };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%)` }}
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=60')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white mb-6">
              <span>🚀</span> Construis ta carrière chez Zeniva
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              Deux parcours. Une mission. <br className="hidden sm:block" />
              <span className="text-amber-300">Le futur du voyage.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">
              Que tu veuilles lancer ta propre agence de voyage ou transformer ton influence en revenus — Zeniva te donne la plateforme propulsée par l'IA pour réussir.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="#agent"
                className="inline-block rounded-2xl px-7 py-4 text-base font-black shadow-2xl transition hover:scale-105"
                style={{ background: GOLD_GRADIENT, color: GRADIENT_START }}
              >
                💼 Parcours Agent
              </Link>
              <Link
                href="#influencer"
                className="inline-block rounded-2xl border-2 border-white/30 bg-white/5 px-7 py-4 text-base font-bold text-white shadow-xl transition hover:bg-white/10"
              >
                ✨ Parcours Créateur
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RoleCategory
        badge="Choisis ton parcours"
        title="Quel rôle Zeniva te correspond ?"
        subtitle="Les deux parcours incluent Lina AI, des analytics en temps réel, et la solidité d'une plateforme incorporée au Delaware."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <RoleCard
            icon="💼"
            title="Agent de voyage"
            desc="Lance ta propre agence avec une stack tech complète. Gagne 70% de commission sur chaque réservation. Frais d'installation + abonnement mensuel, aucune expérience requise."
            href="#agent"
            cta="Voir le programme agent"
            highlight
          />
          <RoleCard
            icon="✨"
            title="Créateur / Influenceur"
            desc="Partage Zeniva avec ta communauté et gagne 3-5% sur chaque réservation. Inscription gratuite, aucun frais mensuel. Atteins 150 clients pour débloquer les voyages au tarif agence."
            href="#influencer"
            cta="Voir le programme créateur"
          />
        </div>
      </RoleCategory>

      <div id="agent" className="border-t border-slate-100">
        <AgentRoleSection dict={agentDict} hideHero hideFinalCta />
      </div>

      <div id="influencer" className="border-t border-slate-100">
        <InfluencerRoleSection dict={influencerDict} />
      </div>

      <div className="border-t border-slate-100 bg-slate-50">
        <FAQ
          title="Questions fréquentes"
          items={[
            {
              q: "Faut-il avoir de l'expérience dans le voyage ?",
              a: "Non. Le parcours Agent inclut une formation complète — systèmes de réservation, relations fournisseurs, gestion client, tout le workflow. Le parcours Créateur ne demande aucune expertise voyage : tu partages, Lina AI gère chaque conversation de réservation.",
            },
            {
              q: "Puis-je faire les deux — agent ET influenceur ?",
              a: "Oui. Beaucoup de nos agents ont commencé comme influenceurs, ont atteint le statut Premium, puis sont passés à la licence agent complète. Les deux parcours ne sont pas exclusifs — choisis par où tu commences, ajoute l'autre quand ça a du sens.",
            },
            {
              q: "Comment se déroule la candidature ?",
              a: "Soumets le formulaire ci-dessous avec ton nom, email et le parcours qui t'intéresse. On revoit chaque candidature sous 48 heures et on t'envoie les instructions d'onboarding pour le parcours choisi. Les agents règlent les 299 $ d'installation à ce stade ; les influenceurs rejoignent gratuitement.",
            },
            {
              q: "Que fait concrètement Lina AI ?",
              a: "Lina est ton concierge IA voyage. Pour les agents, elle gère les questions clients 24/7, génère les devis, suit les réservations et tient ton CRM à jour. Pour les influenceurs, elle conclut la vente sur chaque lead que tes abonnés envoient — tu n'as pas besoin de parler à qui que ce soit si tu ne le souhaites pas.",
            },
            {
              q: "Où Zeniva est-elle basée ?",
              a: "Zeniva LLC est une plateforme technologique incorporée au Delaware (USA), au service des 50 États américains et du Canada. Les services de voyage sont fournis par des fournisseurs tiers ; Zeniva agit comme la couche technologique et concierge.",
            },
          ]}
        />
      </div>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <CareersSignupForm
          defaultRole="travel_agent"
          copy={{
            title: "Postuler maintenant",
            subtitle: "Dis-nous qui tu es et quel parcours t'intéresse. On te répond sous 48 heures.",
            nameLabel: "Nom complet",
            namePlaceholder: "Jordan Rivera",
            emailLabel: "Courriel",
            emailPlaceholder: "toi@email.com",
            roleLabel: "Quel parcours ?",
            roleAgent: "Agent de voyage",
            roleInfluencer: "Créateur / Influenceur",
            noteLabel: "Quelque chose à nous dire ? (optionnel)",
            notePlaceholder: "Taille d'audience, niche actuelle, pourquoi ça t'intéresse…",
            submit: "Envoyer ma candidature",
            submitting: "Envoi en cours…",
            successTitle: "Bien reçu — candidature enregistrée",
            successDesc: "On revoit ta soumission et on t'écrit sous 48 heures avec les prochaines étapes.",
            duplicatePending: "Une candidature avec ce courriel est déjà en cours de revue. On te recontacte rapidement.",
            duplicateApproved: "Bonne nouvelle — ta candidature est déjà approuvée. Vérifie ta boîte mail pour le lien d'accès.",
            error: "Une erreur est survenue. Réessaye ou écris à careers@zeniva.ca.",
          }}
        />
      </section>
    </main>
  );
}
