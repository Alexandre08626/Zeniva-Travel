import type { Metadata } from "next";
import { Suspense } from "react";
import YachtsPageClient from "../../yachts/YachtsPageClient";

export const metadata: Metadata = {
  title: "Conciergerie yacht",
  description:
    "Zeniva Travel propose une conciergerie yacht propulsée par Lina AI. Charters sur mesure, itinéraires intelligents et validation humaine.",
  alternates: {
    canonical: "https://www.zenivatravel.com/fr/yachts",
    languages: {
      "en-CA": "https://www.zenivatravel.com/yachts",
      "fr-CA": "https://www.zenivatravel.com/fr/yachts",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Conciergerie yacht",
    description:
      "Charters de yachts avec Lina AI : conception intelligente et finalisation par un concierge.",
    url: "https://www.zenivatravel.com/fr/yachts",
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
    title: "Zeniva Travel AI | Conciergerie yacht",
    description:
      "Charters de yachts avec Lina AI : conception intelligente et finalisation par un concierge.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function YachtsPageFr() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <YachtsPageClient />
    </Suspense>
  );
}