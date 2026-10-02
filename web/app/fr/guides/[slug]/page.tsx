// Remplace web/app/fr/guides/[slug]/page.tsx.
// Seul changement : la version anglaise (hreflang en-US, lien « English version », translationOfWork)
// n'est annoncée que si un guide EN existe avec le même slug — même logique que app/guides/[slug]/page.tsx.
// Nécessaire pour les guides FR seulement (ex. cuba-mexique-ou-republique-dominicaine-depuis-quebec),
// sinon la page pointe vers /guides/<slug> qui répond 404.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuideArticle from "../../../guides/GuideArticle";
import { findGuide } from "../../../guides/guides-data";
import { GUIDES_FR, findGuideFr } from "../guides-data.fr";

const BASE_URL = "https://www.zenivatravel.com";

export function generateStaticParams() {
  return GUIDES_FR.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuideFr(slug);
  if (!guide) return { title: "Guide introuvable | Zeniva" };
  const url = `${BASE_URL}/fr/guides/${guide.slug}`;
  const hasEn = Boolean(findGuide(guide.slug));
  return {
    title: `${guide.title}`,
    description: guide.description,
    keywords: guide.tags,
    alternates: {
      canonical: url,
      ...(hasEn ? { languages: { "fr-CA": url, "en-US": `${BASE_URL}/guides/${guide.slug}` } } : {}),
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      siteName: "Zeniva Travel",
      type: "article",
      locale: "fr_CA",
      publishedTime: guide.datePublished,
      modifiedTime: guide.dateModified,
      images: [{ url: `/api/og?title=${encodeURIComponent(guide.title)}&type=guide`, width: 1200, height: 630, alt: guide.title }],
    },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
  };
}

export default async function GuidePageFr({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = findGuideFr(slug);
  if (!guide) notFound();
  const en = findGuide(guide.slug);
  return (
    <GuideArticle
      guide={guide}
      locale="fr"
      url={`${BASE_URL}/fr/guides/${guide.slug}`}
      alternateUrl={en ? `${BASE_URL}/guides/${guide.slug}` : undefined}
    />
  );
}
