import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Concierge voyage vidéo",
  description:
    "Planifiez une session vidéo avec Lina AI et les experts concierge de Zeniva Travel pour un voyage sur mesure.",
  alternates: {
    canonical: "https://zenivatravel.com/fr/call",
    languages: {
      "en-CA": "https://zenivatravel.com/call",
      "fr-CA": "https://zenivatravel.com/fr/call",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Concierge vidéo",
    description:
      "Conciergerie vidéo avec Lina AI : découverte d’intention, itinéraires intelligents, validation humaine.",
    url: "https://zenivatravel.com/fr/call",
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
    title: "Zeniva Travel AI | Concierge vidéo",
    description:
      "Conciergerie vidéo avec Lina AI : découverte d’intention, itinéraires intelligents, validation humaine.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function CallPageFr() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Zeniva Travel AI</p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black text-slate-900">
          Parlez à un concierge en vidéo
        </h1>
        <p className="mt-5 text-lg text-slate-600">
          Lina AI vous accompagne en vidéo pour définir votre projet de voyage de luxe, puis notre équipe concierge finalise.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/call" className="rounded-full bg-slate-900 px-6 py-3 text-white font-semibold">
            Lancer l’appel
          </Link>
          <Link href="/ai-travel-concierge" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 font-semibold">
            Découvrir Lina AI
          </Link>
        </div>
      </section>
    </main>
  );
}