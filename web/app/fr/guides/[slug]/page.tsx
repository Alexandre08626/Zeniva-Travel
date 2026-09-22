import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuideArticle from "../../../guides/GuideArticle";
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
  return {
    title: `${guide.title} | Zeniva Travel`,
    description: guide.description,
    keywords: guide.tags,
    alternates: {
      canonical: url,
      languages: { "fr-CA": url, "en-US": `${BASE_URL}/guides/${guide.slug}` },
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
  return <GuideArticle guide={guide} locale="fr" url={`${BASE_URL}/fr/guides/${guide.slug}`} alternateUrl={`${BASE_URL}/guides/${guide.slug}`} />;
}
