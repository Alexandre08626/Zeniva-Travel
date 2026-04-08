import type { Metadata } from "next";

const SITE = "https://www.zenivatravel.com";

export const metadata: Metadata = {
  title: "Rejoins Zeniva Travel — Agent, Influenceur ou Partenaire",
  description:
    "Crée ton compte Zeniva Travel. Deviens agent, influenceur ou partenaire et accède à un écosystème de voyage de luxe propulsé par l'IA.",
  openGraph: {
    title: "Become a Zeniva Agent. — Zeniva Travel",
    description:
      "Accède à un CRM propulsé par IA, des propositions automatiques, et gagne des commissions sur chaque réservation. Lina fait le travail, tu récoltes.",
    url: `${SITE}/signup`,
    siteName: "Zeniva Travel",
    images: [
      {
        url: `${SITE}/og-agent`,
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
    title: "Become a Zeniva Agent. — Zeniva Travel",
    description:
      "CRM propulsé par IA, propositions automatiques et commissions sur chaque réservation.",
    images: [`${SITE}/og-agent`],
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
