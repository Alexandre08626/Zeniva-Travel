import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent de voyage IA (chat)",
  description:
    "Discutez avec Lina AI pour concevoir un voyage sur mesure, puis finalisez avec un concierge humain.",
  alternates: {
    canonical: "https://www.zenivatravel.com/fr/chat",
    languages: {
      "en-CA": "https://www.zenivatravel.com/chat",
      "fr-CA": "https://www.zenivatravel.com/fr/chat",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Chat agent de voyage IA",
    description:
      "Lina AI vous aide à définir vos dates, budget et préférences pour un voyage personnalisé.",
    url: "https://www.zenivatravel.com/fr/chat",
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
    title: "Zeniva Travel AI | Chat agent de voyage IA",
    description:
      "Lina AI vous aide à définir vos dates, budget et préférences pour un voyage personnalisé.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function ChatPageFr() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Zeniva Travel AI</p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black text-slate-900">
          Discutez avec Lina AI
        </h1>
        <p className="mt-5 text-lg text-slate-600">
          Lina AI découvre votre intention de voyage, propose des itinéraires de luxe et notre équipe concierge valide chaque détail.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/chat" className="rounded-full bg-slate-900 px-6 py-3 text-white font-semibold">
            Démarrer le chat
          </Link>
          <Link href="/ai-travel-concierge" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 font-semibold">
            En savoir plus
          </Link>
        </div>
      </section>
    </main>
  );
}