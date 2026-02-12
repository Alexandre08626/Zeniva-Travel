import type { Metadata } from "next";
import { LEGAL_BASE_URL, LEGAL_BRAND } from "./legal-constants";

type LegalMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function createLegalMetadata({
  title,
  description,
  path,
}: LegalMetadataInput): Metadata {
  const url = `${LEGAL_BASE_URL}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: LEGAL_BRAND,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
