import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Concierge de voyage IA",
  description:
    "Zeniva Travel est une Travel Tech propulsée par l’intelligence artificielle. Lina AI découvre l’intention, propose des itinéraires intelligents, puis l’équipe concierge finalise.",
  alternates: {
    canonical: "https://www.zenivatravel.com/fr/ai-travel-concierge",
    languages: {
      "en-CA": "https://www.zenivatravel.com/ai-travel-concierge",
      "fr-CA": "https://www.zenivatravel.com/fr/ai-travel-concierge",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Concierge de voyage IA",
    description:
      "Conciergerie de voyage propulsée par Lina AI : découverte d’intention, proposition intelligente, validation humaine.",
    url: "https://www.zenivatravel.com/fr/ai-travel-concierge",
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "/branding/lina-avatar.png",
        width: 1200,
        height: 630,
        alt: "Lina AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva Travel AI | Concierge de voyage IA",
    description:
      "Conciergerie de voyage propulsée par Lina AI : découverte d’intention, proposition intelligente, validation humaine.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function AiTravelConciergePageFr() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Zeniva Travel",
        url: "https://www.zenivatravel.com",
        logo: "https://www.zenivatravel.com/branding/logo.png",
      },
      {
        "@type": "TravelAgency",
        name: "Zeniva Travel AI",
        url: "https://www.zenivatravel.com",
        image: "https://www.zenivatravel.com/branding/lina-avatar.png",
        description:
          "Zeniva Travel est une Travel Tech utilisant l’intelligence artificielle pour créer des voyages sur mesure.",
        brand: {
          "@type": "Brand",
          name: "Lina AI",
        },
      },
      {
        "@type": "Product",
        name: "Concierge de voyage Lina AI",
        description:
          "Concierge de voyage IA : découverte d’intention, proposition intelligente et finalisation humaine.",
        brand: {
          "@type": "Brand",
          name: "Zeniva Travel",
        },
        url: "https://www.zenivatravel.com/fr/ai-travel-concierge",
        image: "https://www.zenivatravel.com/branding/lina-avatar.png",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Zeniva Travel AI</p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black text-slate-900">
          Concierge de voyage IA
        </h1>
        <p className="mt-5 text-lg text-slate-600">
          Zeniva Travel est une Travel Tech qui utilise l’intelligence artificielle pour concevoir des voyages sur mesure.
          Lina AI découvre vos intentions, génère des propositions intelligentes, puis notre équipe concierge finalise chaque détail.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">Ce que fait Lina AI</h2>
            <ul className="mt-3 space-y-2 text-slate-600">
              <li>• Comprend vos préférences, votre budget et votre style.</li>
              <li>• Conçoit des itinéraires intelligents avec hôtels, villas et expériences.</li>
              <li>• Coordonne les demandes concierge avec validation humaine.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">Pourquoi Zeniva Travel</h2>
            <ul className="mt-3 space-y-2 text-slate-600">
              <li>• Plateforme Travel Tech dédiée à la conciergerie assistée par IA.</li>
              <li>• IA + expertise humaine pour des voyages personnalisés.</li>
              <li>• Réseau de partenaires au Canada et à l’international.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/chat" className="rounded-full bg-slate-900 px-6 py-3 text-white font-semibold">
            Démarrer avec Lina AI
          </Link>
          <Link href="/call" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 font-semibold">
            Parler à un concierge
          </Link>
        </div>
      </section>
    </main>
  );
}