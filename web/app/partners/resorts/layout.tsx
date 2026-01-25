import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resort Partners",
  description:
    "Discover Zeniva Travel’s resort partners curated by Lina AI for personalized travel experiences.",
  alternates: {
    canonical: "https://www.zenivatravel.com/partners/resorts",
    languages: {
      "en-CA": "https://www.zenivatravel.com/partners/resorts",
      "fr-CA": "https://www.zenivatravel.com/fr/partners/resorts",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Resort Partners",
    description:
      "Curated resort partners with Lina AI—intelligent planning and concierge validation.",
    url: "https://www.zenivatravel.com/partners/resorts",
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
    title: "Zeniva Travel AI | Resort Partners",
    description:
      "Curated resort partners with Lina AI—intelligent planning and concierge validation.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function PartnerResortsLayout({ children }: { children: React.ReactNode }) {
  return children;
}