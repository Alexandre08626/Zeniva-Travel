import type { Metadata } from "next";

const SITE = "https://www.zenivatravel.com";

export const metadata: Metadata = {
  title: "Share. Earn. Win. — Zeniva Travel",
  description:
    "Create your influencer account. Ready-to-share content, personalized links, built-in CRM and commissions on every booking. You share, we do the rest.",
  openGraph: {
    title: "Share. Earn. Win. — Zeniva Travel",
    description:
      "Create your influencer account. Ready-to-share content, personalized links, built-in CRM and commissions on every booking. You share, we do the rest.",
    url: `${SITE}/join/influencer`,
    siteName: "Zeniva Travel",
    images: [
      {
        url: `${SITE}/og-influencer`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share. Earn. Win. — Zeniva Travel",
    description:
      "Create your influencer account. Ready-to-share content, personalized links, built-in CRM and commissions on every booking.",
    images: [`${SITE}/og-influencer`],
  },
};

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
