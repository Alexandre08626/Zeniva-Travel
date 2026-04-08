import type { Metadata } from "next";

const SITE = "https://www.zenivatravel.com";

export const metadata: Metadata = {
  title: "Join Zeniva Travel — Agent, Influencer or Partner",
  description:
    "Create your Zeniva Travel account. Become an agent, influencer, or partner and access an AI-powered luxury travel ecosystem.",
  openGraph: {
    title: "Become a Zeniva Agent. — Zeniva Travel",
    description:
      "AI-powered CRM, automatic proposals, and commissions on every booking. Lina does the work, you collect.",
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
      "AI-powered CRM, automatic proposals, and commissions on every booking.",
    images: [`${SITE}/og-agent`],
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
