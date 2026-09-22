import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { NEWS } from "./news-data";

const BASE_URL = "https://www.zenivatravel.com";

export const metadata: Metadata = {
  title: "News — Zeniva Travel & Zeniva Group",
  description:
    "Official announcements from Zeniva Travel and Zeniva Group: Lina, the AI travel concierge; ZeniPay; and the group founded by Alexandre Blais.",
  alternates: { canonical: `${BASE_URL}/news` },
  openGraph: {
    title: "News — Zeniva Travel",
    description: "Official announcements from Zeniva Travel and Zeniva Group.",
    url: `${BASE_URL}/news`,
    siteName: "Zeniva Travel",
    type: "website",
  },
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default function NewsIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}/news`,
    name: "Zeniva Travel News",
    isPartOf: { "@id": `${BASE_URL}/#website` },
    hasPart: NEWS.map((n) => ({
      "@type": "NewsArticle",
      "@id": `${BASE_URL}/news/${n.slug}#article`,
      headline: n.title,
      datePublished: n.datePublished,
      url: `${BASE_URL}/news/${n.slug}`,
    })),
  };
  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-white text-gray-900">
        <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">News</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Official announcements.</h1>
            <p className="mt-6 text-lg leading-relaxed text-blue-100">
              What we launch, in our own words — Zeniva Travel and the Zeniva Group companies.
            </p>
          </div>
        </section>
        <section className="px-6 py-14">
          <div className="mx-auto grid max-w-4xl gap-6">
            {NEWS.map((n) => (
              <Link key={n.slug} href={`/news/${n.slug}`} className="rounded-3xl border border-gray-200 p-7 transition hover:border-blue-400 hover:shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{n.brand} · {formatDate(n.datePublished)}</p>
                <h2 className="mt-2 text-2xl font-bold">{n.title}</h2>
                <p className="mt-3 text-lg leading-8 text-gray-600">{n.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
