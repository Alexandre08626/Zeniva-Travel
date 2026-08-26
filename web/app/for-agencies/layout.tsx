import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Lina for Travel Agencies — assiste vos clients 24/7 | Zeniva",
  description:
    "Transform your travel agency with AI. Lina AI concierge assists your clients on your agents' sites. Starting at $399 + $295/mo.",
  openGraph: {
    title: "AI for Travel Agencies — Lina AI 24/7 | Zeniva",
    description:
      "AI Lina assists your clients on your agents' sites, 24/7. Starting at $399 + $295/mo.",
    url: "https://www.zenivatravel.com/for-agencies",
    siteName: "Zeniva",
    type: "website",
    images: [
      {
        url: "https://www.zenivatravel.com/api/og?title=AI+for+Travel+Agencies&description=Lina+AI+24/7+for+Your+Agency&type=agencies",
        width: 1200,
        height: 630,
        alt: "Zeniva — AI for Travel Agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI for Travel Agencies — Lina AI | Zeniva",
    description:
      "Lina AI for your travel agency. Assistance client 24/7. Starting at $399 + $295/mo.",
    images: [
      "https://www.zenivatravel.com/api/og?title=AI+for+Travel+Agencies&description=Lina+AI+24/7+for+Your+Agency&type=agencies",
    ],
  },
};

export default function ForAgenciesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
