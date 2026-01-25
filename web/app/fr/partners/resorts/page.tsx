import type { Metadata } from "next";
import PartnerResortsPage from "../../../partners/resorts/page";

export const metadata: Metadata = {
  title: "Partenaires resorts",
  description:
    "Découvrez les resorts partenaires de Zeniva Travel, sélectionnés par Lina AI pour des voyages sur mesure.",
  alternates: {
    canonical: "https://zenivatravel.com/fr/partners/resorts",
    languages: {
      "en-CA": "https://zenivatravel.com/partners/resorts",
      "fr-CA": "https://zenivatravel.com/fr/partners/resorts",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | Partenaires resorts",
    description:
      "Resorts sélectionnés par Lina AI avec validation concierge.",
    url: "https://zenivatravel.com/fr/partners/resorts",
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
    title: "Zeniva Travel AI | Partenaires resorts",
    description:
      "Resorts sélectionnés par Lina AI avec validation concierge.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function PartnerResortsPageFr() {
  return <PartnerResortsPage />;
}