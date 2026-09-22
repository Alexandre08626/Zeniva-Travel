import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import { GUIDES_FR } from "./guides-data.fr";

const BASE_URL = "https://www.zenivatravel.com";

export const metadata: Metadata = {
  title: "Guides voyage — prix réels, réponses directes | Zeniva Travel",
  description:
    "Les guides de Zeniva Travel répondent aux questions qu'on se pose avant de réserver : ce que coûte vraiment un charter de yacht, une semaine tout-inclus à Cancún en famille, comment fonctionne un agent de voyage IA. Chiffres 2026 réels, sources nommées.",
  alternates: { canonical: `${BASE_URL}/fr/guides`, languages: { "fr-CA": `${BASE_URL}/fr/guides`, "en-US": `${BASE_URL}/guides` } },
  openGraph: { title: "Guides voyage — Zeniva Travel", description: "Prix réels 2026, sources nommées.", url: `${BASE_URL}/fr/guides`, siteName: "Zeniva Travel", type: "website", locale: "fr_CA" },
};

export default function GuidesIndexFr() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}/fr/guides`,
    name: "Guides voyage Zeniva Travel",
    inLanguage: "fr-CA",
    isPartOf: { "@id": `${BASE_URL}/#website` },
    hasPart: GUIDES_FR.map((g) => ({ "@type": "Article", "@id": `${BASE_URL}/fr/guides/${g.slug}#article`, headline: g.title, url: `${BASE_URL}/fr/guides/${g.slug}` })),
  };
  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-white text-gray-900" lang="fr-CA">
        <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Guides</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Des prix réels. Des réponses directes.</h1>
            <p className="mt-6 text-lg leading-relaxed text-blue-100">
              Les questions qu'on se pose avant de réserver, avec les chiffres 2026 et les sources. <a href="/guides" className="underline" hrefLang="en-US">English version</a>
            </p>
          </div>
        </section>
        <section className="px-6 py-14">
          <div className="mx-auto grid max-w-4xl gap-6">
            {GUIDES_FR.map((g) => (
              <Link key={g.slug} href={`/fr/guides/${g.slug}`} className="rounded-3xl border border-gray-200 p-7 transition hover:border-blue-400 hover:shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{g.readingMinutes} min de lecture</p>
                <h2 className="mt-2 text-2xl font-bold">{g.title}</h2>
                <p className="mt-3 text-lg leading-8 text-gray-600">{g.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
