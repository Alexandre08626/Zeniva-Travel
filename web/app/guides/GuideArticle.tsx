import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import type { GuideData } from "./guides-data";

const BASE_URL = "https://www.zenivatravel.com";
const ORG_ID = `${BASE_URL}/#organization`;
const AUTHOR_ID = `${BASE_URL}/alexandre-blais#person`;

export type GuideLocale = "en" | "fr";

const LABELS = {
  en: {
    guides: "Guides",
    minRead: "min read",
    by: "By",
    founder: "founder of Zeniva Travel",
    updated: "Updated",
    shortAnswer: "Short answer",
    keyTakeaways: "Key takeaways",
    faq: "Frequently asked questions",
    ctaTitle: "Ready to price your trip?",
    ctaText: "Describe it to Lina — a real proposal with real numbers, validated by a human before you pay.",
    sources: "Sources",
    disclaimer: (d: string) =>
      `Price ranges are market figures compiled from the sources above on ${d} and are not a Zeniva quote. Every ZeniYacht and Zeniva Travel proposal is priced individually.`,
    dateLocale: "en-US",
    lang: "en-US",
    guidesPath: "/guides",
    siteName: "Zeniva Travel",
  },
  fr: {
    guides: "Guides",
    minRead: "min de lecture",
    by: "Par",
    founder: "fondateur de Zeniva Travel",
    updated: "Mis à jour le",
    shortAnswer: "Réponse courte",
    keyTakeaways: "À retenir",
    faq: "Questions fréquentes",
    ctaTitle: "Prêt à chiffrer votre voyage ?",
    ctaText: "Décrivez-le à Lina — une vraie proposition avec de vrais chiffres, validée par un humain avant que vous payiez.",
    sources: "Sources",
    disclaimer: (d: string) =>
      `Les fourchettes sont des prix de marché compilés à partir des sources ci-dessus le ${d} ; elles ne constituent pas une soumission Zeniva. Chaque proposition ZeniYacht et Zeniva Travel est chiffrée individuellement.`,
    dateLocale: "fr-CA",
    lang: "fr-CA",
    guidesPath: "/fr/guides",
    siteName: "Zeniva Travel",
  },
} as const;

function formatDate(iso: string, locale: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/**
 * Shared renderer for EN (/guides) and FR (/fr/guides) guides. Emits Article + FAQPage +
 * Breadcrumb JSON-LD, authored by the founder Person @id and published by the site entity;
 * `alternateUrl` links the translation both in JSON-LD (translationOfWork/workTranslation).
 */
export default function GuideArticle({ guide, locale, url, alternateUrl }: { guide: GuideData; locale: GuideLocale; url: string; alternateUrl?: string }) {
  const t = LABELS[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: guide.title,
        description: guide.description,
        inLanguage: t.lang,
        datePublished: guide.datePublished,
        dateModified: guide.dateModified,
        author: { "@id": AUTHOR_ID },
        publisher: { "@id": ORG_ID },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        keywords: guide.tags.join(", "),
        ...(guide.aboutId ? { about: { "@id": guide.aboutId } } : {}),
        ...(alternateUrl
          ? locale === "fr"
            ? { translationOfWork: { "@id": `${alternateUrl}#article` } }
            : { workTranslation: { "@id": `${alternateUrl}#article` } }
          : {}),
        citation: guide.sources.map((s) => ({ "@type": "CreativeWork", name: s.name, url: s.url })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: t.lang,
        mainEntity: guide.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.siteName, item: BASE_URL },
          { "@type": "ListItem", position: 2, name: t.guides, item: `${BASE_URL}${t.guidesPath}` },
          { "@type": "ListItem", position: 3, name: guide.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-white text-gray-900" lang={t.lang}>
        <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">
              <Link href={t.guidesPath} className="hover:underline">{t.guides}</Link> · {guide.readingMinutes} {t.minRead}
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">{guide.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-blue-100">{guide.description}</p>
            <p className="mt-6 text-sm text-blue-200">
              {t.by} <Link href="/alexandre-blais" className="underline">Alexandre Blais</Link>, {t.founder} · {t.updated}{" "}
              <time dateTime={guide.dateModified}>{formatDate(guide.dateModified, t.dateLocale)}</time>
              {alternateUrl && (
                <>
                  {" · "}
                  <a href={alternateUrl} className="underline" hrefLang={locale === "fr" ? "en-US" : "fr-CA"}>
                    {locale === "fr" ? "English version" : "Version française"}
                  </a>
                </>
              )}
            </p>
          </div>
        </section>

        <article className="px-6 py-14">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-7">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">{t.shortAnswer}</h2>
              <p className="mt-3 text-lg leading-8 text-gray-800">{guide.shortAnswer}</p>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{t.keyTakeaways}</h2>
              <ul className="mt-4 space-y-3 text-lg leading-8 text-gray-700">
                {guide.keyTakeaways.map((k) => (
                  <li key={k} className="flex gap-3">
                    <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>

            {guide.sections.map((s) => (
              <section key={s.h} className="mt-12">
                <h2 className="text-3xl font-bold">{s.h}</h2>
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="mt-5 text-lg leading-8 text-gray-600">{p}</p>
                ))}
                {s.table && (
                  <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="w-full text-left text-sm">
                      <caption className="px-4 py-3 text-left text-sm font-semibold text-gray-900">{s.table.caption}</caption>
                      <thead className="bg-gray-50 text-gray-900">
                        <tr>
                          {s.table.columns.map((c) => (
                            <th key={c} scope="col" className="px-4 py-3 font-semibold">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        {s.table.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-4 py-3 align-top">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            <section className="mt-14">
              <h2 className="text-3xl font-bold">{t.faq}</h2>
              <dl className="mt-6 divide-y divide-gray-200">
                {guide.faq.map((f) => (
                  <div key={f.q} className="py-5">
                    <dt className="text-lg font-semibold text-gray-900">{f.q}</dt>
                    <dd className="mt-2 text-lg leading-8 text-gray-600">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-12 rounded-3xl bg-slate-950 p-8 text-white">
              <h2 className="text-2xl font-bold">{t.ctaTitle}</h2>
              <p className="mt-3 text-blue-100">{t.ctaText}</p>
              <Link href={guide.cta.href} className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-bold text-slate-950 hover:bg-blue-100">
                {guide.cta.label}
              </Link>
            </section>

            <section className="mt-12">
              <h2 className="text-xl font-bold">{t.sources}</h2>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {guide.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{s.name}</a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-gray-500">{t.disclaimer(formatDate(guide.dateModified, t.dateLocale))}</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
