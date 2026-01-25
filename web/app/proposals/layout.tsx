import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Trip Proposals",
  description:
    "Review and finalize your AI travel proposals from Lina AI and Zeniva Travel’s concierge team.",
  alternates: {
    canonical: "https://zenivatravel.com/proposals",
    languages: {
      "en-CA": "https://zenivatravel.com/proposals",
      "fr-CA": "https://zenivatravel.com/fr/proposals",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Trip Proposals",
    description:
      "AI travel proposals created by Lina AI and validated by human concierge experts.",
    url: "https://zenivatravel.com/proposals",
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
    title: "Zeniva Travel AI | Trip Proposals",
    description:
      "AI travel proposals created by Lina AI and validated by human concierge experts.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function ProposalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}