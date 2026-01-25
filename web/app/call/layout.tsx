import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Concierge Video Call",
  description:
    "Book a video concierge session with Lina AI and Zeniva Travel’s travel experts.",
  alternates: {
    canonical: "https://zenivatravel.com/call",
    languages: {
      "en-CA": "https://zenivatravel.com/call",
      "fr-CA": "https://zenivatravel.com/fr/call",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Concierge Video Call",
    description:
      "Video concierge with Lina AI: intent discovery, smart itineraries, and human validation.",
    url: "https://zenivatravel.com/call",
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
    title: "Zeniva Travel AI | Concierge Video Call",
    description:
      "Video concierge with Lina AI: intent discovery, smart itineraries, and human validation.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function CallLayout({ children }: { children: React.ReactNode }) {
  return children;
}