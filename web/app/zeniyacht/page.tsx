export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";
import YachtsPageClient from "../yachts/YachtsPageClient";

export const metadata: Metadata = {
  title: "ZeniYacht — Private Yacht Charters & Sailing Trips | Zeniva",
  description:
    "Book private yacht charters with ZeniYacht by Zeniva. Luxury sailing trips, mega-yacht rentals and ocean cruises worldwide — curated by Lina AI and validated by expert brokers. Serving all 50 states & Caribbean.",
  keywords: [
    "ZeniYacht",
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
    canonical: "https://www.zenivatravel.com/zeniyacht",
    languages: {
      "en-US": "https://www.zenivatravel.com/zeniyacht",
      "en-CA": "https://www.zenivatravel.com/zeniyacht",
      "fr-CA": "https://www.zenivatravel.com/fr/zeniyacht",
    },
  },
  openGraph: {
    title: "ZeniYacht — Private Yacht Charters & Sailing Trips | Zeniva",
    description:
      "Private yacht charters worldwide. Sailing trips, mega-yachts, ocean cruises — curated by Lina AI. Expert brokers validate every booking.",
    url: "https://www.zenivatravel.com/zeniyacht",
    siteName: "Zeniva",
    type: "website",
    images: [
      {
        url: "/branding/lina-avatar.png",
        width: 1200,
        height: 630,
        alt: "ZeniYacht — Private Yacht Charters & Sailing Trips",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeniYacht — Private Yacht Charters & Sailing Trips",
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

export default function ZeniYachtPage() {
  return (
    <Suspense fallback={<YachtsSkeleton />}>
      <YachtsPageClient />
    </Suspense>
  );
}
