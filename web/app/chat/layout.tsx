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
    title: "Zeniva Travel AI | AI Travel Agent Chat",
    description:
      "Chat with Lina AI to design a trip, then finalize with Zeniva Travel’s concierge team.",
    url: "https://zenivatravel.com/chat",
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
    title: "Zeniva Travel AI | AI Travel Agent Chat",
    description:
      "Chat with Lina AI to design a trip, then finalize with Zeniva Travel’s concierge team.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}