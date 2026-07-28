export const dynamic = "force-dynamic";
import React from "react";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Travel Concierge Video Call",
  description:
    "Book a video concierge session with Lina AI and Zeniva’s travel experts.",
  alternates: {
    canonical: "https://zenivatravel.com/call",
    languages: {
      "en-CA": "https://zenivatravel.com/call",
      "fr-CA": "https://zenivatravel.com/fr/call",
    },
  },
  openGraph: {
    title: "Zeniva | Concierge Video Call",
    description:
      "Video concierge: intent discovery, smart itineraries, and human validation.",
    url: "https://zenivatravel.com/call",
    siteName: "Zeniva",
    type: "website",
    images: [
      {
        url: "/api/og?title=Concierge+Video+Call&description=Video+concierge+for+travel+planning&type=call",
        width: 1200,
        height: 630,
        alt: "Zeniva Concierge Call",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva | Concierge Video Call",
    description:
      "Video concierge: intent discovery, smart itineraries, and human validation.",
    images: ["/api/og?title=Concierge+Video+Call&description=Video+concierge+for+travel+planning&type=call"],
  },
};

export default function CallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
