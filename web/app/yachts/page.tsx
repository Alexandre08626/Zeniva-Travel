export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";
import YachtsPageClient from "./YachtsPageClient";

export const metadata: Metadata = {
  title: "Luxury Yacht Charters USA — Private Yacht Rentals & Sailing Trips",
  description:
    "Book private yacht charters with Zeniva Travel. Luxury sailing trips, mega-yacht rentals and ocean cruises worldwide — curated by Lina AI and validated by expert brokers. Serving all 50 states & Caribbean.",
  keywords: [
    "luxury yacht charter USA",
    "private yacht rental",
    "yacht charter Caribbean",
    "sailing trips USA",
    "mega yacht rental",
    "luxury boat charter",
    "yacht vacation USA",
    "private sailing trip",
    "Zeniva yacht",
    "best yacht charter 2025",
    "yacht broker USA",
    "yacht travel concierge",
  ],
  alternates: {
    canonical: "https://www.zenivatravel.com/yachts",
    languages: {
      "en-US": "https://www.zenivatravel.com/yachts",
      "en-CA": "https://www.zenivatravel.com/yachts",
      "fr-CA": "https://www.zenivatravel.com/fr/yachts",
    },
  },
  openGraph: {
    title: "Luxury Yacht Charters USA — Private Yacht Rentals",
    description:
      "Private yacht charters worldwide. Sailing trips, mega-yachts, ocean cruises — curated by Lina AI. Expert brokers validate every booking.",
    url: "https://www.zenivatravel.com/yachts",
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "/branding/lina-avatar.png",
        width: 1200,
        height: 630,
        alt: "Zeniva Travel — Luxury Yacht Charters",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Yacht Charters USA",
    description:
      "Private yacht charters & sailing trips worldwide. Curated by Lina AI, validated by expert brokers.",
    images: ["/branding/lina-avatar.png"],
  },
};

function YachtsSkeleton() {
  return (
    <div className="min-h-screen p-4 space-y-4">
      <div className="h-12 bg-slate-200 rounded-2xl w-1/2 animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="rounded-2xl bg-slate-200 animate-pulse" style={{height:280}} />
        ))}
      </div>
    </div>
  );
}

export default function YachtsPage() {
  return (
    <Suspense fallback={<YachtsSkeleton />}>
      <YachtsPageClient />
    </Suspense>
  );
}
