import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Propositions de voyage",
  description:
    "Consultez et finalisez vos propositions de voyage générées par Lina AI et validées par Zeniva Travel.",
  alternates: {
    canonical: "https://www.zenivatravel.com/fr/proposals",
    languages: {
      "en-CA": "https://www.zenivatravel.com/proposals",
      "fr-CA": "https://www.zenivatravel.com/fr/proposals",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Propositions de voyage",
    description:
      "Propositions de voyage créées par Lina AI et validées par des experts concierge.",
    url: "https://www.zenivatravel.com/fr/proposals",
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
    title: "Zeniva Travel AI | Propositions de voyage",
    description:
      "Propositions de voyage créées par Lina AI et validées par des experts concierge.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function ProposalsPageFr() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Zeniva Travel AI</p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black text-slate-900">
          Vos propositions de voyage
        </h1>
        <p className="mt-5 text-lg text-slate-600">
          Retrouvez vos propositions de voyage de luxe générées par Lina AI et finalisez votre réservation en quelques minutes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/proposals" className="rounded-full bg-slate-900 px-6 py-3 text-white font-semibold">
            Voir mes propositions
          </Link>
          <Link href="/chat" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 font-semibold">
            Créer un nouveau voyage
          </Link>
        </div>
      </section>
    </main>
  );
}