export const dynamic = "force-dynamic";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Travel Agent Chat",
  description:
    "Chat with Lina AI, the travel concierge for intelligent itineraries. Discover destinations, budgets, and personalized experiences.",
  alternates: {
    canonical: "https://zenivatravel.com/chat",
    languages: {
      "en-CA": "https://zenivatravel.com/chat",
      "fr-CA": "https://zenivatravel.com/fr/chat",
    },
  },
  openGraph: {
    title: "Zeniva | AI Travel Agent Chat",
    description:
      "Chat with Lina AI to design a trip, then finalize with Zeniva’s concierge team.",
    url: "https://zenivatravel.com/chat",
    siteName: "Zeniva",
    type: "website",
    images: [
      {
        url: "/api/og?title=Chat+with+Lina+AI&description=Design+your+dream+trip+with+our+AI+travel+concierge&type=chat",
        width: 1200,
        height: 630,
        alt: "Zeniva AI Chat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva | AI Travel Agent Chat",
    description:
      "Chat with Lina AI to design a trip, then finalize with Zeniva’s concierge team.",
    images: ["/api/og?title=Chat+with+Lina+AI&description=Design+your+dream+trip+with+our+AI+travel+concierge&type=chat"],
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
