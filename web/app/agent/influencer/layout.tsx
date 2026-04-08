import type { Metadata } from "next";

const SITE = "https://www.zenivatravel.com";

export const metadata: Metadata = {
  title: "Share. Earn. Win. — Zeniva Travel",
  description:
    "Crée ton compte influenceur. Contenu prêt à partager, liens personnalisés, CRM intégré et commissions sur chaque réservation. Tu partages, on fait le reste.",
  openGraph: {
    title: "Share. Earn. Win. — Zeniva Travel",
    description:
      "Crée ton compte influenceur. Contenu prêt à partager, liens personnalisés, CRM intégré et commissions sur chaque réservation. Tu partages, on fait le reste.",
    url: `${SITE}/agent/influencer`,
    siteName: "Zeniva Travel",
    images: [
      {
        url: `${SITE}/og-influencer`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
    locale: "fr_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share. Earn. Win. — Zeniva Travel",
    description:
      "Crée ton compte influenceur. Contenu prêt à partager, liens personnalisés, CRM intégré et commissions sur chaque réservation.",
    images: [`${SITE}/og-influencer`],
  },
};

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
