import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuideArticle from "../GuideArticle";
import { GUIDES, findGuide } from "../guides-data";
import { findGuideFr } from "../../fr/guides/guides-data.fr";

const BASE_URL = "https://www.zenivatravel.com";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return { title: "Guide not found | Zeniva" };
  const url = `${BASE_URL}/guides/${guide.slug}`;
  const hasFr = Boolean(findGuideFr(guide.slug));
  return {
    title: `${guide.title}`,
    description: guide.description,
    keywords: guide.tags,
    alternates: {
      canonical: url,
      ...(hasFr ? { languages: { "en-US": url, "fr-CA": `${BASE_URL}/fr/guides/${guide.slug}` } } : {}),
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      siteName: "Zeniva Travel",
      type: "article",
      publishedTime: guide.datePublished,
      modifiedTime: guide.dateModified,
      images: [{ url: `/api/og?title=${encodeURIComponent(guide.title)}&type=guide`, width: 1200, height: 630, alt: guide.title }],
    },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();
  const fr = findGuideFr(guide.slug);
  return (
    <GuideArticle
      guide={guide}
      locale="en"
      url={`${BASE_URL}/guides/${guide.slug}`}
      alternateUrl={fr ? `${BASE_URL}/fr/guides/${guide.slug}` : undefined}
    />
  );
}
