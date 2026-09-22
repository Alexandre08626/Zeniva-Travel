import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import { NEWS, findNews } from "../news-data";

const BASE_URL = "https://www.zenivatravel.com";
const AUTHOR_ID = `${BASE_URL}/alexandre-blais#person`;
const GROUP_ID = "https://www.zeniva.ca/#group";

export function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = findNews(slug);
  if (!item) return { title: "Not found | Zeniva" };
  const url = `${BASE_URL}/news/${item.slug}`;
  return {
    title: `${item.title} | Zeniva Travel`,
    description: item.summary,
    alternates: { canonical: url },
    openGraph: { title: item.title, description: item.summary, url, siteName: "Zeniva Travel", type: "article", publishedTime: item.datePublished },
    twitter: { card: "summary_large_image", title: item.title, description: item.summary },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findNews(slug);
  if (!item) notFound();
  const url = `${BASE_URL}/news/${item.slug}`;

  // NewsArticle authored by the founder, published by the group, about the brand entity.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${url}#article`,
        headline: item.title,
        description: item.summary,
        inLanguage: "en-US",
        datePublished: item.datePublished,
        dateModified: item.datePublished,
        author: { "@id": AUTHOR_ID },
        publisher: { "@id": GROUP_ID },
        about: { "@id": item.aboutId },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        articleBody: item.paragraphs.join("\n\n"),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Zeniva Travel", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "News", item: `${BASE_URL}/news` },
          { "@type": "ListItem", position: 3, name: item.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-white text-gray-900">
        <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">
              <Link href="/news" className="hover:underline">News</Link> · {item.brand}
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">{item.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-blue-100">{item.summary}</p>
            <p className="mt-6 text-sm text-blue-200">
              {item.dateline} · <time dateTime={item.datePublished}>{formatDate(item.datePublished)}</time>
            </p>
          </div>
        </section>

        <article className="px-6 py-14">
          <div className="mx-auto max-w-4xl">
            {item.paragraphs.map((p, i) => (
              <p key={i} className="mt-5 text-lg leading-8 text-gray-700 first:mt-0">{p}</p>
            ))}
            {item.quote && (
              <blockquote className="mt-10 border-l-4 border-blue-600 pl-6">
                <p className="text-xl leading-relaxed text-gray-900">“{item.quote}”</p>
                <footer className="mt-3 text-sm text-gray-500">
                  — <Link href="/alexandre-blais" className="underline">Alexandre Blais</Link>, founder and president
                </footer>
              </blockquote>
            )}
            <section className="mt-12 border-t border-gray-200 pt-8">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">About</h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{item.boilerplate}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {item.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-blue-700 underline">{l.label}</a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-gray-500">Media contact: info@zeniva.ca</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
