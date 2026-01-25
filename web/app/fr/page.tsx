import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agence de voyage IA",
  description:
    "Zeniva Travel est une Travel Tech propulsée par l’IA. Lina AI crée des itinéraires sur mesure, validés par des experts concierge.",
  alternates: {
    canonical: "https://zenivatravel.com/fr",
    languages: {
      "en-CA": "https://zenivatravel.com/",
      "fr-CA": "https://zenivatravel.com/fr",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Agence de voyage IA",
    description:
      "Voyages personnalisés avec Lina AI : itinéraires intelligents validés par un concierge humain.",
    url: "https://zenivatravel.com/fr",
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
    title: "Zeniva Travel AI | Agence de voyage IA",
    description:
      "Voyages personnalisés avec Lina AI : itinéraires intelligents validés par un concierge humain.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function HomePageFr() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Zeniva Travel AI</p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black text-slate-900">
          Agence de voyage IA
        </h1>
        <p className="mt-5 text-lg text-slate-600">
          Zeniva Travel est une Travel Tech qui utilise l’intelligence artificielle pour concevoir des voyages sur mesure.
          Lina AI découvre votre intention, génère des propositions intelligentes et notre équipe concierge finalise chaque détail.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/chat" className="rounded-full bg-slate-900 px-6 py-3 text-white font-semibold">
            Démarrer avec Lina AI
          </Link>
          <Link href="/ai-travel-concierge" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 font-semibold">
            Découvrir la conciergerie IA
          </Link>
        </div>
      </section>
    </main>
  );
}