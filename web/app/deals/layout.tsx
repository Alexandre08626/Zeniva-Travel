export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Deals 2025 — Cheap Flights, Hotel Discounts & Last-Minute Vacations | Zeniva",
  description:
    "Find the best travel deals of 2025. Cheap flights, discounted hotels, last-minute vacation packages and all-inclusive deals — curated by Lina AI for travelers in the USA and Canada.",
  keywords: [
    "travel deals 2025",
    "cheap flights USA",
    "best hotel deals 2025",
    "last-minute vacation deals",
    "all-inclusive deals USA",
    "flight deals from New York",
    "travel discounts Canada",
    "vacation deals AI",
    "Zeniva deals",
    "luxury travel deals 2025",
  ],
  alternates: {
    canonical: "https://www.zenivatravel.com/deals",
  },
  openGraph: {
    title: "Travel Deals 2025 — Cheap Flights & Vacation Packages | Zeniva",
    description: "Best travel deals curated by Lina AI — flights, hotels, all-inclusive packages. Updated daily.",
    url: "https://www.zenivatravel.com/deals",
    siteName: "Zeniva",
    type: "website",
    images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630 }],
  },
};


export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
