import type { Metadata } from "next";
import { Suspense } from "react";
import YachtsPageClient from "./YachtsPageClient";

export const metadata: Metadata = {
  title: "Yacht Travel Concierge",
  description:
    "Zeniva Travel offers yacht travel concierge services powered by Lina AI. Discover curated yacht charters with intelligent itineraries and human validation.",
  alternates: {
    canonical: "https://zenivatravel.com/yachts",
    languages: {
      "en-CA": "https://zenivatravel.com/yachts",
      "fr-CA": "https://zenivatravel.com/fr/yachts",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Yacht Travel Concierge",
    description:
      "Curated yacht charters with Lina AI—intelligent trip design and concierge finalization.",
    url: "https://zenivatravel.com/yachts",
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
    title: "Zeniva Travel AI | Yacht Travel Concierge",
    description:
      "Curated yacht charters with Lina AI—intelligent trip design and concierge finalization.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function YachtsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <YachtsPageClient />
    </Suspense>
  );
}
