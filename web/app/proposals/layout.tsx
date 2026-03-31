export const dynamic = "force-dynamic";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Trip Proposals",
  description:
    "Review and finalize your AI travel proposals from Lina AI and Zeniva’s concierge team.",
  alternates: {
    canonical: "https://zenivatravel.com/proposals",
    languages: {
      "en-CA": "https://zenivatravel.com/proposals",
      "fr-CA": "https://zenivatravel.com/fr/proposals",
    },
  },
  openGraph: {
    title: "Zeniva | Trip Proposals",
    description:
      "AI travel proposals created by Lina AI and validated by human concierge experts.",
    url: "https://zenivatravel.com/proposals",
    siteName: "Zeniva",
    type: "website",
    images: [
      {
        url: "/api/og?title=Your+Trip+Proposal&description=AI+travel+proposals+by+Lina+AI%2C+validated+by+experts&type=proposal",
        width: 1200,
        height: 630,
        alt: "Zeniva Trip Proposal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva | Trip Proposals",
    description:
      "AI travel proposals created by Lina AI and validated by human concierge experts.",
    images: ["/api/og?title=Your+Trip+Proposal&description=AI+travel+proposals+by+Lina+AI%2C+validated+by+experts&type=proposal"],
  },
};

export default function ProposalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
