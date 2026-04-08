import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zeniva Creator Program — Earn Money Sharing Luxury Travel",
  description:
    "Join Zeniva Travel's Creator Program. Share your unique link, generate travel leads, and earn 5% commission on every booking. Lina AI handles the rest.",
  openGraph: {
    title: "Zeniva Creator Program — Share. Earn. Get Paid.",
    description:
      "Earn 5% commission on every luxury travel booking. Share videos, generate leads with your unique link, and let Lina AI close the sale automatically.",
    siteName: "Zeniva Travel",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva Creator Program — Share. Earn. Get Paid.",
    description:
      "Earn 5% commission on every luxury travel booking. Share videos, generate leads with your unique link.",
  },
};

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
