export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxury Short-Term Rentals & Villas — Airbnbs USA & Worldwide | Zeniva",
  description:
    "Book luxury ZeniStays, private villas, and premium Airbnbs worldwide through Zeniva. Curated homes and apartments in top destinations — planned by Lina AI.",
  keywords: [
    "luxury ZeniStays USA",
    "private villas vacation rental",
    "luxury Airbnb USA",
    "vacation homes worldwide",
    "villa rental Caribbean",
    "luxury apartments rental",
    "best vacation rentals 2025",
    "private homes USA",
    "Zeniva rentals",
  ],
  alternates: {
    canonical: "https://www.zenivatravel.com/residences",
  },
  openGraph: {
    title: "Luxury Short-Term Rentals & Villas | Zeniva USA",
    description: "Premium vacation homes, private villas & luxury Airbnbs worldwide. Curated by Lina AI.",
    url: "https://www.zenivatravel.com/residences",
    siteName: "Zeniva",
    type: "website",
    images: [{ url: "/api/og?title=Luxury+Villas+%26+Rentals&description=Premium+vacation+homes+%26+private+villas+worldwide&type=zenistay", width: 1200, height: 630, alt: "Zeniva Luxury Rentals" }],
  },
};

export default function ResidencesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
