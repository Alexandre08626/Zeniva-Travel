import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { GUIDES } from "./guides-data";

const BASE_URL = "https://www.zenivatravel.com";

export const metadata: Metadata = {
  title: "Travel Guides — Real Prices, Straight Answers | Zeniva Travel",
  description:
    "Zeniva Travel's guides answer the questions travelers ask before they book: what a yacht charter really costs, how an AI travel agent works, what is included and what is not. Real 2026 numbers, named sources.",
  alternates: { canonical: `${BASE_URL}/guides` },
  openGraph: {
    title: "Travel Guides — Real Prices, Straight Answers | Zeniva Travel",
    description: "What a yacht charter really costs, how an AI travel agent works, and more — with real 2026 numbers and named sources.",
    url: `${BASE_URL}/guides`,
    siteName: "Zeniva Travel",
    type: "website",
  },
};

export default function GuidesIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}/guides`,
    name: "Zeniva Travel Guides",
    isPartOf: { "@id": `${BASE_URL}/#website` },
    hasPart: GUIDES.map((g) => ({ "@type": "Article", "@id": `${BASE_URL}/guides/${g.slug}#article`, headline: g.title, url: `${BASE_URL}/guides/${g.slug}` })),
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-white text-gray-900">
        <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Guides</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Real prices. Straight answers.</h1>
            <p className="mt-6 text-lg leading-relaxed text-blue-100">
              The questions travelers ask before they book, answered with 2026 numbers and named sources.
            </p>
          </div>
        </section>
        <section className="px-6 py-14">
          <div className="mx-auto grid max-w-4xl gap-6">
            {GUIDES.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="rounded-3xl border border-gray-200 p-7 transition hover:border-blue-400 hover:shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{g.readingMinutes} min read</p>
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
