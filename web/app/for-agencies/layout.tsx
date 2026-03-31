import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI for Travel Agencies — 8 AI Agents Working 24/7 | Zeniva",
  description:
    "Transform your travel agency with 8 AI agents. Lina AI concierge, CRM, proposals, invoicing, commissions — zero commission on bookings. Starting at $1,999.",
  openGraph: {
    title: "AI for Travel Agencies — 8 AI Agents Working 24/7",
    description:
      "Transform your travel agency with 8 AI agents working 24/7. CRM, proposals, invoicing, commissions — 0% commission on bookings. Starting at $1,999.",
    url: "https://www.zenivatravel.com/for-agencies",
    siteName: "Zeniva",
    type: "website",
    images: [
      {
        url: "https://www.zenivatravel.com/api/og?title=AI+for+Travel+Agencies&description=8+AI+Agents+Working+24/7+for+Your+Agency&type=agencies",
        width: 1200,
        height: 630,
        alt: "Zeniva — AI for Travel Agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI for Travel Agencies — 8 AI Agents | Zeniva",
    description:
      "8 AI agents for your travel agency. CRM, proposals, invoicing — 0% commission. Starting at $1,999.",
    images: [
      "https://www.zenivatravel.com/api/og?title=AI+for+Travel+Agencies&description=8+AI+Agents+Working+24/7+for+Your+Agency&type=agencies",
    ],
  },
};

export default function ForAgenciesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
