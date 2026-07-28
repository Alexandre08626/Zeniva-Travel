export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";
import YachtsPageClient from "../../yachts/YachtsPageClient";

export const metadata: Metadata = {
  title: "Conciergerie yacht",
  description:
    "Zeniva propose une conciergerie yacht avec intelligence artificielle. Charters sur mesure, itinéraires intelligents et validation humaine.",
  alternates: {
    canonical: "https://zenivatravel.com/fr/yachts",
    languages: {
      "en-CA": "https://zenivatravel.com/yachts",
      "fr-CA": "https://zenivatravel.com/fr/yachts",
    },
  },
  openGraph: {
    title: "Zeniva | Conciergerie yacht",
    description:
      "Charters de yachts avec intelligence artificielle : conception intelligente et finalisation par un concierge.",
    url: "https://zenivatravel.com/fr/yachts",
    siteName: "Zeniva",
    type: "website",
    images: [
      {
        url: "/api/og?title=Yacht+Conciergerie&description=Charters+de+yachts+de+luxe&type=yacht",
        width: 1200,
        height: 630,
        alt: "Zeniva Conciergerie yacht",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva | Conciergerie yacht",
    description:
      "Charters de yachts avec intelligence artificielle : conception intelligente et finalisation par un concierge.",
    images: ["/api/og?title=Yacht+Conciergerie&description=Charters+de+yachts+de+luxe&type=yacht"],
  },
};

export default function YachtsPageFr() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <YachtsPageClient />
    </Suspense>
  );
}
